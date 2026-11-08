import {auth, db, $, esc, money} from "./firebase.js";
import {GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {collection, getDocs, doc, getDoc, setDoc, addDoc, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const WA = "94768083806"; // WhatsApp number that receives order messages
export const DISTRICTS = ["Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle","Gampaha","Hambantota","Jaffna","Kalutara","Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar","Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya","Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya"];
export const S = {products: [], brands: [], cats: [], user: null, profile: null, loaded: false};
export const stockOf = p => p.stock ?? (p.status === "out" ? 0 : 99);
export const off = p => p.originalPrice > p.discountPrice ? Math.round(100 * (1 - p.discountPrice / p.originalPrice)) : 0;
export const brandName = id => S.brands.find(b => b.id === id)?.name || "";
export const catName = id => S.cats.find(c => c.id === id)?.name || "";

// ----- customer detail form (used by checkout and the profile page) -----
const KEYS = ["name", "phone", "phone2", "address", "city", "district"];
export const fillForm = (f, d) => KEYS.forEach(k => { if (d && d[k] != null) f.elements[k].value = d[k]; });
export const readForm = f => Object.fromEntries(KEYS.map(k => [k, f.elements[k].value.trim()]));
export const fieldsHTML = () => `<label>Full name<input name="name" required autocomplete="name"></label>
  <label>Phone (WhatsApp)<input name="phone" type="tel" required placeholder="0771234567" autocomplete="tel"></label>
  <label>Alternative phone<input name="phone2" type="tel"></label>
  <label>Address<input name="address" required autocomplete="street-address"></label>
  <label>City<input name="city" required autocomplete="address-level2"></label>
  <label>District<select name="district">${DISTRICTS.map(d => `<option${d === "Matale" ? " selected" : ""}>${d}</option>`).join("")}</select></label>`;

// ----- data -----
const ls = async n => (await getDocs(collection(db, n))).docs.map(d => ({id: d.id, ...d.data()}));
export async function load() {
  const [p, b, c] = await Promise.all([ls("products"), ls("brands").catch(() => []), ls("categories").catch(() => [])]);
  S.products = p.filter(x => (x.visibility || "active") === "active");   // products without the field still show
  S.brands = b; S.cats = c; S.loaded = true;
}
export async function saveProfile(d) {
  await setDoc(doc(db, "customers", S.user.uid), {...d, email: S.user.email, updatedAt: serverTimestamp()});
  S.profile = d;
}

// ----- product card -----
export function card(p) {
  const n = stockOf(p), d = off(p), id = esc(p.id);
  return `<article class="card"><a class="pic" href="product.html?id=${id}"><img src="${esc((p.images || [])[0] || "")}" alt="${esc(p.title)}" width="320" height="320" loading="lazy">
    ${d ? `<span class="badge">-${d}%</span>` : ""}${n <= 0 ? `<span class="badge out">Sold out</span>` : ""}</a>
    <div class="body"><small>${esc(brandName(p.brandId))}</small><h3><a href="product.html?id=${id}">${esc(p.title)}</a></h3>
    <div class="price"><b>${money(p.discountPrice)}</b>${d ? `<s>${money(p.originalPrice)}</s>` : ""}</div>
    <button class="btn ghost wide" data-add="${id}"${n <= 0 ? " disabled" : ""}>Add to cart</button></div></article>`;
}

// ----- cart (saved in this browser) -----
let cart = []; try { cart = JSON.parse(localStorage.getItem("nc_cart") || "[]"); } catch (e) {}
const saveCart = () => { try { localStorage.setItem("nc_cart", JSON.stringify(cart)); } catch (e) {} const c = $("cartCount"); if (c) c.textContent = cart.reduce((s, i) => s + i.qty, 0); };
export function add(id, qty = 1) {
  const p = S.products.find(x => x.id === id); if (!p) return;
  const i = cart.find(x => x.id === id), max = stockOf(p);
  if (i) i.qty = Math.min(i.qty + qty, max); else cart.push({id, qty: Math.min(qty, max)});
  saveCart();
}
function drawCart() {
  const rows = cart.map(i => ({i, p: S.products.find(x => x.id === i.id)})).filter(r => r.p);
  if (S.loaded) cart = rows.map(r => r.i);   // drop items that are no longer on sale
  const total = rows.reduce((s, r) => s + Number(r.p.discountPrice || 0) * r.i.qty, 0);
  $("cartRows").innerHTML = rows.map(({i, p}) => `<div class="crow"><span>${esc(p.title)}</span><span>${money(p.discountPrice)} x ${i.qty}</span>
    <button class="sm" data-c="minus" data-id="${esc(p.id)}">-</button><button class="sm" data-c="plus" data-id="${esc(p.id)}">+</button><button class="sm red" data-c="del" data-id="${esc(p.id)}">x</button></div>`).join("")
    || `<p class="note">${S.loaded ? "Your cart is empty." : "Loading..."}</p>`;
  $("total").textContent = money(total); saveCart();
  return {rows, total};
}
export function openCart() {
  drawCart();
  const f = $("orderForm");
  if (!f.elements.name.value) fillForm(f, S.profile || {name: S.user?.displayName});   // auto-fill from profile
  $("saveWrap").hidden = !S.user;
  $("cartModal").hidden = false;
}

let popup = false;
export async function signInUser() {
  if (popup) return; popup = true;
  try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (e) {} popup = false;
}

// ----- header, cart window, footer -----
export function mount(active) {
  const on = k => active === k ? ' class="on"' : "";
  document.body.insertAdjacentHTML("afterbegin", `<header class="top"><a class="brand" href="index.html"><img src="logo.jpg" alt="" width="38" height="38"><span>NEXUS CHOICE</span></a>
    <nav><a href="index.html"${on("home")}>Shop</a><a href="account.html"${on("account")}>My profile</a></nav>
    <button id="cartBtn" class="btn ghost">Cart <span id="cartCount" class="pill">0</span></button><button id="authBtn" class="btn">Sign in</button></header>`);
  document.body.insertAdjacentHTML("beforeend", `<div class="modal" id="cartModal" hidden><div class="panel"><h2>Your cart</h2><div id="cartRows"></div><p class="total">Total <b id="total">Rs. 0</b></p>
    <form id="orderForm">${fieldsHTML()}<label>Payment<select name="payment"><option>Cash on delivery</option><option>Bank transfer</option></select></label>
    <label class="chk" id="saveWrap" hidden><input type="checkbox" id="saveP" checked> Save these details to my profile</label>
    <button id="placeBtn" class="btn wide">Place order and confirm on WhatsApp</button></form>
    <button id="closeCart" class="btn ghost wide" type="button">Keep shopping</button></div></div>
    <footer><img src="logo.jpg" alt="" width="56" height="56"><p>Your ultimate choice for quality and style.</p><small>&copy; 2026 Nexus Choice</small></footer>`);
  saveCart();
  $("cartBtn").onclick = openCart;
  $("closeCart").onclick = () => $("cartModal").hidden = true;
  $("cartModal").onclick = e => { if (e.target.id === "cartModal") $("cartModal").hidden = true; };
  $("authBtn").onclick = () => S.user ? signOut(auth) : signInUser();
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-add]"); if (!b) return;
    add(b.dataset.add); const old = b.textContent; b.textContent = "Added"; setTimeout(() => b.textContent = old, 900);
  });
  $("cartRows").onclick = e => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    const i = cart.find(x => x.id === b.dataset.id), p = S.products.find(x => x.id === b.dataset.id);
    if (b.dataset.c === "plus") i.qty = Math.min(i.qty + 1, stockOf(p));
    if (b.dataset.c === "minus") i.qty = Math.max(i.qty - 1, 1);
    if (b.dataset.c === "del") cart = cart.filter(x => x !== i);
    drawCart();
  };
  $("orderForm").onsubmit = placeOrder;
  onAuthStateChanged(auth, async u => {
    S.user = u; S.profile = null;
    $("authBtn").textContent = u ? "Sign out" : "Sign in";
    if (u) { try { const s = await getDoc(doc(db, "customers", u.uid)); if (s.exists()) S.profile = s.data(); } catch (e) {} }
    document.dispatchEvent(new Event("authchange"));
  });
}

async function placeOrder(e) {
  e.preventDefault();
  const {rows, total} = drawCart();
  if (!rows.length) return alert("Your cart is empty.");
  const f = e.target, c = readForm(f); c.phone = c.phone.replace(/[\s-]/g, "");
  if (!/^0\d{9}$/.test(c.phone)) return alert("Enter a valid phone number, like 0771234567.");
  const order = {status: "new", createdAt: serverTimestamp(), payment: f.elements.payment.value, subtotal: total, total,
    items: rows.map(({i, p}) => ({id: p.id, sku: p.sku || "", title: p.title, price: Number(p.discountPrice), qty: i.qty})),
    customer: {...c, email: S.user?.email || ""}, ...(S.user ? {uid: S.user.uid} : {})};
  const btn = $("placeBtn"); btn.disabled = true;
  try {
    const ref = await addDoc(collection(db, "orders"), order);
    if (S.user && $("saveP").checked) await saveProfile(c).catch(() => {});
    const msg = ["New order - Nexus Choice", `Order ID: ${ref.id}`, ...order.items.map(x => `${x.title} x${x.qty} = ${money(x.price * x.qty)}`),
      `Total: ${money(total)} (${order.payment})`, `Name: ${c.name}`, `Phone: ${c.phone}`, `Address: ${c.address}, ${c.city}, ${c.district}`].join("\n");
    cart = []; saveCart();
    location.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  } catch (x) { btn.disabled = false; alert("Could not place the order. Please try again, or message us on WhatsApp."); }
}

// ----- intro splash: once per visit -----
export function intro() {
  try { if (sessionStorage.getItem("nc_intro") || matchMedia("(prefers-reduced-motion: reduce)").matches) return; sessionStorage.setItem("nc_intro", "1"); } catch (e) {}
  document.body.insertAdjacentHTML("afterbegin", `<div id="intro"><img src="logo.jpg" alt="Nexus Choice" width="260" height="260"></div>`);
  const go = () => { const i = $("intro"); if (i) { i.classList.add("bye"); setTimeout(() => i.remove(), 600); } };
  $("intro").onclick = go; setTimeout(go, 1800);
}
