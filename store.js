import {auth, db, $, esc, money} from "./firebase.js";
import {GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {collection, getDocs, addDoc, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const WA = "94768083806"; // WhatsApp number that receives order messages
const DISTRICTS = ["Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle","Gampaha","Hambantota","Jaffna","Kalutara","Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar","Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya","Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya"];
let products = [], brands = [], cats = [], user = null, cart = [];
try { cart = JSON.parse(localStorage.getItem("nc_cart") || "[]"); } catch (e) {}

const ls = async n => (await getDocs(collection(db, n))).docs.map(d => ({id: d.id, ...d.data()}));
const stockOf = p => p.stock ?? (p.status === "out" ? 0 : 99);
const saveCart = () => { try { localStorage.setItem("nc_cart", JSON.stringify(cart)); } catch (e) {} $("cartCount").textContent = cart.reduce((s, i) => s + i.qty, 0); };
const options = (list, first) => `<option value="">${first}</option>` + list.map(x => `<option value="${esc(x.id)}">${esc(x.name)}</option>`).join("");

async function init() {
  $("district").innerHTML = DISTRICTS.map(d => `<option${d === "Matale" ? " selected" : ""}>${d}</option>`).join("");
  try {
    [products, brands, cats] = await Promise.all([ls("products"), ls("brands").catch(() => []), ls("categories").catch(() => [])]);
    products = products.filter(p => (p.visibility || "active") === "active");   // products without the field still show
    $("fBrand").innerHTML = options(brands, "All brands");
    $("fCat").innerHTML = options(cats, "All categories");
    draw(); addSeoData();
  } catch (e) { $("grid").innerHTML = `<p class="note">Could not load products. Please refresh the page.</p>`; }
  saveCart();
}

function draw() {
  const q = $("q").value.trim().toLowerCase(), b = $("fBrand").value, c = $("fCat").value;
  const list = products.filter(p => (!q || (p.title || "").toLowerCase().includes(q)) && (!b || p.brandId === b) && (!c || p.categoryId === c));
  $("grid").innerHTML = list.map(card).join("") || `<p class="note">No products found.</p>`;
}

function card(p) {
  const n = stockOf(p), out = n <= 0, imgs = p.images || [], id = esc(p.id);
  return `<article class="card"><span class="tag ${out ? "out" : "in"}">${out ? "Out of stock" : n <= 5 ? "Only " + n + " left" : "In stock"}</span>
  <img id="m-${id}" class="main" src="${esc(imgs[0] || "")}" alt="${esc(p.title)}" width="300" height="220" loading="lazy">
  ${imgs.length > 1 ? `<div class="thumbs">${imgs.map(u => `<img src="${esc(u)}" alt="" width="38" height="38" loading="lazy" data-for="m-${id}">`).join("")}</div>` : ""}
  <div class="body"><h3>${esc(p.title)}</h3>${p.description ? `<p class="desc">${esc(p.description)}</p>` : ""}
    <div class="price"><b>${money(p.discountPrice)}</b>${p.originalPrice ? `<s>${money(p.originalPrice)}</s>` : ""}</div>
    <div class="acts"><button class="btn" data-a="buy" data-id="${id}"${out ? " disabled" : ""}>Buy now</button><button class="btn ghost" data-a="add" data-id="${id}"${out ? " disabled" : ""}>Add to cart</button></div>
  </div></article>`;
}

function add(id) {
  const p = products.find(x => x.id === id); if (!p) return;
  const i = cart.find(x => x.id === id);
  if (i) i.qty = Math.min(i.qty + 1, stockOf(p)); else cart.push({id, qty: 1});
  saveCart();
}

function drawCart() {
  const rows = cart.map(i => ({i, p: products.find(x => x.id === i.id)})).filter(r => r.p);
  cart = rows.map(r => r.i);   // drops items that are no longer on sale
  const total = rows.reduce((s, r) => s + Number(r.p.discountPrice || 0) * r.i.qty, 0);
  $("cartRows").innerHTML = rows.map(({i, p}) => `<div class="crow"><span>${esc(p.title)}</span><span>${money(p.discountPrice)} x ${i.qty}</span>
    <button class="sm" data-c="minus" data-id="${esc(p.id)}">-</button><button class="sm" data-c="plus" data-id="${esc(p.id)}">+</button><button class="sm red" data-c="del" data-id="${esc(p.id)}">x</button></div>`).join("") || `<p class="note">Your cart is empty.</p>`;
  $("total").textContent = money(total); saveCart();
  return {rows, total};
}
const openCart = () => { drawCart(); $("cartModal").hidden = false; };

$("grid").onclick = e => {
  const t = e.target;
  if (t.dataset.for) { $(t.dataset.for).src = t.src; return; }
  const b = t.closest("[data-a]"); if (!b) return;
  add(b.dataset.id);
  if (b.dataset.a === "buy") openCart();
  else { const old = b.textContent; b.textContent = "Added"; setTimeout(() => b.textContent = old, 900); }
};
$("cartRows").onclick = e => {
  const b = e.target.closest("[data-c]"); if (!b) return;
  const i = cart.find(x => x.id === b.dataset.id), p = products.find(x => x.id === b.dataset.id);
  if (b.dataset.c === "plus") i.qty = Math.min(i.qty + 1, stockOf(p));
  if (b.dataset.c === "minus") i.qty = Math.max(i.qty - 1, 1);
  if (b.dataset.c === "del") cart = cart.filter(x => x !== i);
  drawCart();
};
$("cartBtn").onclick = openCart;
$("closeCart").onclick = () => $("cartModal").hidden = true;
["q", "fBrand", "fCat"].forEach(k => $(k).addEventListener("input", draw));

$("orderForm").onsubmit = async e => {
  e.preventDefault();
  const {rows, total} = drawCart();
  if (!rows.length) return alert("Your cart is empty.");
  const f = e.target.elements, v = k => f[k].value.trim();
  const phone = v("phone").replace(/[\s-]/g, "");
  if (!/^0\d{9}$/.test(phone)) return alert("Enter a valid phone number, like 0771234567.");
  const order = {status: "new", createdAt: serverTimestamp(), payment: v("payment"), subtotal: total, total,
    items: rows.map(({i, p}) => ({id: p.id, sku: p.sku || "", title: p.title, price: Number(p.discountPrice), qty: i.qty})),
    customer: {name: v("name"), phone, phone2: v("phone2"), address: v("address"), city: v("city"), district: v("district"), email: user?.email || ""}};
  const btn = $("placeBtn"); btn.disabled = true;
  try {
    const ref = await addDoc(collection(db, "orders"), order);
    const msg = [`New order - Nexus Choice`, `Order ID: ${ref.id}`, ...order.items.map(x => `${x.title} x${x.qty} = ${money(x.price * x.qty)}`),
      `Total: ${money(total)} (${order.payment})`, `Name: ${order.customer.name}`, `Phone: ${phone}`,
      `Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.district}`].join("\n");
    cart = []; saveCart();
    location.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  } catch (x) { btn.disabled = false; alert("Could not place the order. Please try again, or message us on WhatsApp."); }
};

let popup = false;
$("authBtn").onclick = async () => {
  if (user) return signOut(auth);
  if (popup) return; popup = true;
  try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (e) {} popup = false;
};
onAuthStateChanged(auth, u => {
  user = u;
  $("authBtn").textContent = u ? "Sign out (" + (u.displayName || "").split(" ")[0] + ")" : "Sign in with Google";
  if (u && !$("cName").value) $("cName").value = u.displayName || "";
});

function addSeoData() {   // Product structured data for Google
  const s = document.createElement("script"); s.type = "application/ld+json";
  s.textContent = JSON.stringify({"@context": "https://schema.org", "@graph": products.slice(0, 50).map(p => ({
    "@type": "Product", name: p.title, image: p.images || [], description: p.description || p.title, sku: p.sku || p.id,
    brand: {"@type": "Brand", name: brands.find(b => b.id === p.brandId)?.name || "Nexus Choice"},
    offers: {"@type": "Offer", priceCurrency: "LKR", price: p.discountPrice, url: location.origin + location.pathname,
      availability: stockOf(p) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"}}))});
  document.head.appendChild(s);
}
init();
