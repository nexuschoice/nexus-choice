import {auth, db, OWNER, $, esc} from "./firebase.js";
import {GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {doc, getDoc, collection, getDocs, addDoc, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {views} from "./admin-views.js";

// [view, label, roles allowed]
const MENU = [
  ["dashboard", "Dashboard", "*"],
  ["products", "Products", "admin product_manager inventory_manager"],
  ["orders", "Orders", "admin order_manager support"],
  ["catalog", "Brands and categories", "admin"],
  ["staff", "Staff", "admin"]
];
const show = on => { $("gate").hidden = on; $("app").hidden = !on; if (on) document.body.classList.add("admin-ready"); };

$("signIn").onclick = () => signInWithPopup(auth, new GoogleAuthProvider()).catch(e => $("gateMsg").textContent = e.message);
$("signOut").onclick = () => signOut(auth);

onAuthStateChanged(auth, async u => {
  if (!u) return show(false);
  const email = (u.email || "").toLowerCase();
  let role = email === OWNER ? "admin" : null;
  if (!role) { try { const s = await getDoc(doc(db, "staff", email)); if (s.exists()) role = s.data().role; } catch (e) {} }
  if (email !== OWNER && role === "admin") role = null; // only the configured owner receives administrator privileges
  if (!role || !u.emailVerified) { $("gateMsg").textContent = "No access for " + email + ". Ask the owner to add you under Staff."; return signOut(auth); }
  window.ME = {email, role};
  $("who").textContent = email + " (" + role + ")";
  const items = MENU.filter(m => m[2] === "*" || m[2].split(" ").includes(role));
  $("nav").innerHTML = items.map(m => `<button data-v="${m[0]}">${m[1]}</button>`).join("");
  $("nav").onclick = e => { const v = e.target.dataset.v; if (v) go(v); };
  show(true); go("dashboard");
});

function go(v) {
  const m = $("main");
  document.querySelectorAll("#nav button").forEach(b => b.classList.toggle("on", b.dataset.v === v));
  m.onclick = m.onchange = m.onsubmit = null;
  m.textContent = "Loading...";
  views[v](m).catch(e => m.innerHTML = `<p class="err">${esc(e.message)}</p>`);
}

// Excel / CSV bulk import. Uses the same product document shape as the manual editor.
const textValue = value => String(value ?? "").trim();
const numberValue = value => value === "" || value == null ? null : Number(value);
const normalizeHeader = value => String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
const firstValue = (row, ...keys) => {
  const normalized = new Map(Object.entries(row).map(([k, v]) => [normalizeHeader(k), v]));
  for (const key of keys) {
    const value = normalized.get(normalizeHeader(key));
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return "";
};
const imageList = row => {
  const raw = firstValue(row, "images", "imageUrls", "imageLinks");
  const values = raw ? String(raw).split(/[|\n;]/).map(x => x.trim()).filter(Boolean) : [];
  for (let i = 1; i <= 8; i++) {
    const value = firstValue(row, `img${i}`, `image${i}`);
    if (value) values.push(String(value).trim());
  }
  return [...new Set(values)].slice(0, 8);
};

window.handleExcelUpload = async event => {
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;
  if (!window.XLSX) { alert("Excel reader could not be loaded. Refresh the page and try again."); input.value = ""; return; }
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, {type: "array"});
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("The selected file has no worksheet.");
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {defval: ""});
    if (!rows.length) throw new Error("No product rows were found in the first worksheet.");

    const [brandSnap, categorySnap, productSnap] = await Promise.all([
      getDocs(collection(db, "brands")), getDocs(collection(db, "categories")), getDocs(collection(db, "products"))
    ]);
    const brands = brandSnap.docs.map(d => ({id: d.id, name: d.data().name || ""}));
    const categories = categorySnap.docs.map(d => ({id: d.id, name: d.data().name || ""}));
    const usedSkus = new Set(productSnap.docs.map(d => textValue(d.data().sku).toLowerCase()).filter(Boolean));
    const lookupId = (row, idKey, nameKey, list) => {
      const directId = textValue(firstValue(row, idKey));
      if (directId) return directId;
      const name = textValue(firstValue(row, nameKey)).toLowerCase();
      return name ? (list.find(x => x.name.toLowerCase() === name)?.id || "") : "";
    };

    const prepared = [];
    const errors = [];
    rows.forEach((row, index) => {
      const line = index + 2;
      const title = textValue(firstValue(row, "title", "productName", "name"));
      const price = numberValue(firstValue(row, "discountPrice", "sellingPrice", "price"));
      const stockRaw = firstValue(row, "stock", "quantity", "stockQuantity");
      const stock = stockRaw === "" ? 0 : Number(stockRaw);
      const originalRaw = firstValue(row, "originalPrice", "mrp");
      const costRaw = firstValue(row, "costPrice", "buyingPrice");
      const deliveryTypeRaw = textValue(firstValue(row, "deliveryType")).toLowerCase();
      const deliveryType = deliveryTypeRaw === "paid" ? "paid" : "free";
      const deliveryFee = Number(firstValue(row, "deliveryFee", "deliveryCharge")) || 0;
      const images = imageList(row);
      if (!title) errors.push(`Row ${line}: missing product title.`);
      if (!Number.isFinite(price) || price <= 0) errors.push(`Row ${line}: discountPrice/sellingPrice must be above zero.`);
      if (!Number.isFinite(stock) || stock < 0) errors.push(`Row ${line}: stock must be zero or more.`);
      if (!images.length || images.some(url => !/^https:\/\//i.test(url))) errors.push(`Row ${line}: add at least one valid https image URL.`);
      if (deliveryType === "paid" && deliveryFee <= 0) errors.push(`Row ${line}: paid delivery requires a deliveryFee above zero.`);
      if (originalRaw !== "" && (!Number.isFinite(Number(originalRaw)) || Number(originalRaw) < 0)) errors.push(`Row ${line}: originalPrice must be a valid non-negative number.`);
      if (costRaw !== "" && (!Number.isFinite(Number(costRaw)) || Number(costRaw) < 0)) errors.push(`Row ${line}: costPrice must be a valid non-negative number.`);
      if (errors.some(message => message.startsWith(`Row ${line}:`))) return;
      const sku = textValue(firstValue(row, "sku", "productCode")) || `NC-${Date.now()}-${index + 1}`;
      if (usedSkus.has(sku.toLowerCase())) { errors.push(`Row ${line}: SKU "${sku}" is already used. Provide a unique SKU.`); return; }
      usedSkus.add(sku.toLowerCase());
      prepared.push({
        title, sku, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        brandId: lookupId(row, "brandId", "brand", brands),
        categoryId: lookupId(row, "categoryId", "category", categories),
        costPrice: costRaw === "" ? null : Number(costRaw),
        originalPrice: originalRaw === "" ? null : Number(originalRaw),
        discountPrice: price, stock: Math.floor(stock),
        visibility: ["active", "draft", "inactive"].includes(textValue(firstValue(row, "visibility")).toLowerCase()) ? textValue(firstValue(row, "visibility")).toLowerCase() : "active",
        featured: [true, 1, "1", "true", "yes", "y"].includes(typeof firstValue(row, "featured") === "string" ? textValue(firstValue(row, "featured")).toLowerCase() : firstValue(row, "featured")),
        images, videoUrl: textValue(firstValue(row, "videoUrl", "video")),
        description: textValue(firstValue(row, "description", "details")),
        status: stock > 0 ? "in" : "out", deliveryType,
        deliveryFee: deliveryType === "paid" ? Math.round(deliveryFee) : 0
      });
    });
    if (errors.length) {
      const preview = errors.slice(0, 8).join("\n");
      throw new Error(`${errors.length} row validation issue(s):\n${preview}${errors.length > 8 ? `\n...and ${errors.length - 8} more.` : ""}\nNo products were imported.`);
    }
    if (!prepared.length) throw new Error("No valid product rows were found.");
    if (!confirm(`Found ${prepared.length} valid product(s). Import them as new products?`)) return;

    const button = input;
    button.disabled = true;
    let imported = 0;
    try {
      for (const product of prepared) {
        await addDoc(collection(db, "products"), {...product, createdAt: serverTimestamp()});
        imported++;
      }
    } catch (error) {
      throw new Error(`${imported} product(s) imported before an error occurred: ${error.message}. Please review the Products list before retrying to avoid duplicates.`);
    }
    alert(`${imported} product(s) imported successfully.`);
    go("products");
  } catch (error) {
    console.error("Bulk product import failed:", error);
    alert(error.message || "Could not import this file. Check its format and try again.");
  } finally {
    input.disabled = false;
    input.value = "";
  }
};
