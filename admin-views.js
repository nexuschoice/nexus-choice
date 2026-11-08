import {db, esc, money} from "./firebase.js";
import {collection, getDocs, addDoc, setDoc, updateDoc, deleteDoc, doc, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const ls = async n => (await getDocs(collection(db, n))).docs.map(d => ({id: d.id, ...d.data()}));
const safe = n => ls(n).catch(() => null);          // null = this role may not read it
const log = a => addDoc(collection(db, "logs"), {by: window.ME.email, action: a, at: serverTimestamp()}).catch(() => {});
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const STATUS = ["new", "confirmed", "processing", "ready", "shipped", "delivered", "cancelled", "return_requested", "refunded"];
const ROLES = ["order_manager", "product_manager", "inventory_manager", "support"];
const opts = (arr, sel, f = x => [x, x]) => arr.map(x => { const [v, t] = f(x); return `<option value="${esc(v)}"${v === sel ? " selected" : ""}>${esc(t)}</option>`; }).join("");
const cell = x => x && x.h !== undefined ? x.h : esc(x);   // {h: html} = trusted markup
const tbl = (h, r) => `<div class="tw"><table><tr>${h.map(x => `<th>${x}</th>`).join("")}</tr>${r.map(c => `<tr>${c.map(x => `<td>${cell(x)}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${h.length}">Nothing here yet.</td></tr>`}</table></div>`;
const card = (t, v) => `<div class="card"><small>${t}</small><b>${esc(v)}</b></div>`;
const when = t => t && t.toDate ? t.toDate().toLocaleString() : "";
const byNew = (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
export const views = {};

views.dashboard = async m => {
  const [p, o] = await Promise.all([safe("products"), safe("orders")]);
  const rev = o ? o.filter(x => x.status === "delivered").reduce((s, x) => s + Number(x.total || 0), 0) : null;
  const low = (p || []).filter(x => Number(x.stock ?? 99) <= 5);
  const recent = (o || []).sort(byNew).slice(0, 8);
  m.innerHTML = `<h2>Dashboard</h2><div class="cards">
    ${card("Products", p ? p.length : "-")}${card("Orders", o ? o.length : "-")}
    ${card("New orders", o ? o.filter(x => x.status === "new").length : "-")}${card("Revenue (delivered)", o ? money(rev) : "-")}</div>
    <h3>Low stock (5 or fewer)</h3>${tbl(["SKU", "Product", "Stock"], low.map(x => [x.sku, x.title, x.stock]))}
    <h3>Recent orders</h3>${tbl(["Date", "Customer", "Total", "Status"], recent.map(x => [when(x.createdAt), x.customer?.name, money(x.total), x.status]))}`;
};

views.products = async m => {
  const [P, B, C] = await Promise.all([ls("products"), safe("brands"), safe("categories")]);
  const bl = B || [], cl = C || [], nm = (a, id) => a.find(x => x.id === id)?.name || "";
  m.innerHTML = `<h2>Products</h2>
  <form id="pf" class="grid"><input type="hidden" name="pid">
    <label>Product name<input name="title" required></label>
    <label>SKU<input name="sku" required></label>
    <label>Brand<select name="brandId">${opts(bl, "", b => [b.id, b.name])}</select></label>
    <label>Category<select name="categoryId">${opts(cl, "", c => [c.id, c.name])}</select></label>
    <label>Cost price<input name="costPrice" type="number" min="0"></label>
    <label>Original price<input name="originalPrice" type="number" min="0"></label>
    <label>Selling price (final)<input name="discountPrice" type="number" min="0" required></label>
    <label>Stock quantity<input name="stock" type="number" min="0" required value="0"></label>
    <label>Visibility<select name="visibility">${opts(["active", "draft", "inactive"])}</select></label>
    <label class="chk"><input name="featured" type="checkbox"> Featured product</label>
    <label class="full">Description<textarea name="description" rows="3"></textarea></label>
    <label class="full">Image links, one per line (max 8, https only)<textarea name="images" rows="4" required></textarea></label>
    <div class="full"><button class="btn">Save product</button> <button type="button" class="btn gray" data-a="reset">Clear form</button></div>
  </form>
  ${tbl(["Image", "Name", "SKU", "Brand", "Price", "Stock", "Visibility", ""], P.map(p => [
    {h: p.images?.[0] ? `<img src="${esc(p.images[0])}" width="40" height="40" alt="">` : ""},
    p.title, p.sku, nm(bl, p.brandId), money(p.discountPrice), p.stock, p.visibility,
    {h: `<button class="sm" data-a="edit" data-id="${esc(p.id)}">Edit</button> <button class="sm red" data-a="del" data-id="${esc(p.id)}">Delete</button>`}]))}`;
  const f = document.getElementById("pf"), el = f.elements;
  m.onclick = async e => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const a = b.dataset.a, id = b.dataset.id;
    if (a === "reset") { f.reset(); el.pid.value = ""; }
    if (a === "edit") {
      const p = P.find(x => x.id === id);
      ["title", "sku", "brandId", "categoryId", "costPrice", "originalPrice", "discountPrice", "description"].forEach(k => el[k].value = p[k] ?? "");
      el.stock.value = p.stock ?? (p.status === "out" ? 0 : 1);
      el.visibility.value = p.visibility || "active";
      el.featured.checked = !!p.featured;
      el.images.value = (p.images || []).join("\n");
      el.pid.value = id; scrollTo(0, 0);
    }
    if (a === "del" && confirm("Delete this product?")) {
      try { await deleteDoc(doc(db, "products", id)); log("delete product " + id); views.products(m); } catch (x) { alert(x.message); }
    }
  };
  f.onsubmit = async e => {
    e.preventDefault();
    const n = k => Number(el[k].value);
    const imgs = el.images.value.split("\n").map(s => s.trim()).filter(Boolean).slice(0, 8);
    if (!imgs.length || imgs.some(u => !u.startsWith("https://"))) return alert("Image links must start with https://");
    if (n("discountPrice") < 0 || n("stock") < 0) return alert("Price and stock cannot be negative.");
    const sku = el.sku.value.trim();
    if (P.some(p => p.sku === sku && p.id !== el.pid.value)) return alert("That SKU is already used.");
    const d = {title: el.title.value.trim(), sku, slug: slug(el.title.value), brandId: el.brandId.value, categoryId: el.categoryId.value,
      description: el.description.value.trim(), costPrice: n("costPrice") || null, originalPrice: n("originalPrice") || null,
      discountPrice: n("discountPrice"), stock: Math.floor(n("stock")), visibility: el.visibility.value, featured: el.featured.checked,
      images: imgs, status: n("stock") > 0 ? "in" : "out"};   // "status" keeps the current storefront working
    try {
      if (el.pid.value) await updateDoc(doc(db, "products", el.pid.value), d);
      else await addDoc(collection(db, "products"), {...d, createdAt: serverTimestamp()});
      log("save product " + sku); views.products(m);
    } catch (x) { alert(x.message); }
  };
};

views.orders = async m => {
  const O = (await ls("orders")).sort(byNew);
  m.innerHTML = `<h2>Orders</h2>${tbl(["Date", "Customer", "Items", "Total", "Payment", "Status"], O.map(o => [
    when(o.createdAt), `${o.customer?.name || ""} ${o.customer?.phone || ""}`,
    (o.items || []).map(i => `${i.title} x${i.qty || 1}`).join(", "), money(o.total), o.payment,
    {h: `<select class="status-select" aria-label="Order status" data-id="${esc(o.id)}">${opts(STATUS, o.status)}</select>`}]))}`;
  m.onchange = async e => {
    const s = e.target.closest("select[data-id]"); if (!s) return;
    try { await updateDoc(doc(db, "orders", s.dataset.id), {status: s.value}); log("order " + s.dataset.id + " -> " + s.value); } catch (x) { alert(x.message); }
  };
};

views.catalog = async m => {
  const [B, C] = await Promise.all([ls("brands"), ls("categories")]);
  const part = (n, t, L) => `<h3>${t}s</h3><form class="row" data-n="${n}"><input placeholder="${t} name" required><button class="btn">Add ${t.toLowerCase()}</button></form>
    ${tbl(["Name", ""], L.map(x => [x.name, {h: `<button class="sm red" data-n="${n}" data-id="${esc(x.id)}">Delete</button>`}]))}`;
  m.innerHTML = `<h2>Brands and categories</h2><p>Add Nexus Blooms here first, then any future brand.</p>${part("brands", "Brand", B)}${part("categories", "Category", C)}`;
  m.onsubmit = async e => {
    e.preventDefault(); const f = e.target;
    try { await addDoc(collection(db, f.dataset.n), {name: f.querySelector("input").value.trim()}); views.catalog(m); } catch (x) { alert(x.message); }
  };
  m.onclick = async e => {
    const b = e.target.closest("button[data-id]"); if (!b || !confirm("Delete this entry?")) return;
    try { await deleteDoc(doc(db, b.dataset.n, b.dataset.id)); views.catalog(m); } catch (x) { alert(x.message); }
  };
};

views.staff = async m => {
  const S = await ls("staff");
  m.innerHTML = `<h2>Staff</h2><p>The owner account always has full access. Add your partner here as admin.</p>
    <form class="row"><input type="email" placeholder="Gmail address" required><select>${opts(ROLES)}</select><button class="btn">Save access</button></form>
    ${tbl(["Email", "Role", ""], S.map(s => [s.id, s.role, {h: `<button class="sm red" data-id="${esc(s.id)}">Remove</button>`}]))}`;
  m.onsubmit = async e => {
    e.preventDefault();
    const i = e.target.querySelector("input"), r = e.target.querySelector("select");
    try { await setDoc(doc(db, "staff", i.value.trim().toLowerCase()), {role: r.value}); log("staff " + i.value); views.staff(m); } catch (x) { alert(x.message); }
  };
  m.onclick = async e => {
    const b = e.target.closest("button[data-id]"); if (!b || !confirm("Remove this person's access?")) return;
    try { await deleteDoc(doc(db, "staff", b.dataset.id)); views.staff(m); } catch (x) { alert(x.message); }
  };
};
