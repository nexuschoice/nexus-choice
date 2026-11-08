import {auth, db, $, esc, money} from "./firebase.js";
import {GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {collection, getDocs, doc, getDoc, setDoc, addDoc, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const WA = "94768083806"; // Business WhatsApp number; update here if it changes.
export const DISTRICTS = ["Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle","Gampaha","Hambantota","Jaffna","Kalutara","Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar","Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya","Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya"];
export const S = {products: [], brands: [], cats: [], user: null, profile: null, loaded: false};
export const stockOf = p => Math.max(0, Number(p.stock ?? (p.status === "out" ? 0 : 99)) || 0);
export const off = p => Number(p.originalPrice) > Number(p.discountPrice) && Number(p.originalPrice) > 0 ? Math.round(100 * (1 - Number(p.discountPrice) / Number(p.originalPrice))) : 0;
export const brandName = id => S.brands.find(b => b.id === id)?.name || "";
export const catName = id => S.cats.find(c => c.id === id)?.name || "";

const KEYS = ["name", "phone", "phone2", "address", "city", "district"];
export const fillForm = (f, d) => KEYS.forEach(k => { if (d && d[k] != null && f.elements[k]) f.elements[k].value = d[k]; });
export const readForm = f => Object.fromEntries(KEYS.map(k => [k, String(f.elements[k]?.value || "").trim()]));
export const fieldsHTML = () => `<label>Full name<input name="name" required maxlength="100" autocomplete="name"></label>
  <label>Phone (WhatsApp)<input name="phone" type="tel" required inputmode="tel" maxlength="15" placeholder="0771234567" autocomplete="tel"></label>
  <label>Alternative phone<input name="phone2" type="tel" inputmode="tel" maxlength="15"></label>
  <label>Address<input name="address" required maxlength="220" autocomplete="street-address"></label>
  <label>City<input name="city" required maxlength="80" autocomplete="address-level2"></label>
  <label>District<select name="district" required>${DISTRICTS.map(d => `<option${d === "Matale" ? " selected" : ""}>${d}</option>`).join("")}</select></label>`;

const ls = async n => (await getDocs(collection(db, n))).docs.map(d => ({id: d.id, ...d.data()}));
export async function load() {
  S.loaded = false;
  const [p, b, c] = await Promise.all([ls("products"), ls("brands").catch(() => []), ls("categories").catch(() => [])]);
  S.products = p.filter(x => (x.visibility || "active") === "active");
  S.brands = b; S.cats = c; S.loaded = true;
  cleanCart(); updateCartCount();
}
export async function saveProfile(d) {
  if (!S.user) throw new Error("Please sign in before saving your profile.");
  await setDoc(doc(db, "customers", S.user.uid), {...d, email: S.user.email || "", updatedAt: serverTimestamp()});
  S.profile = d;
}

export function card(p) {
  const n = stockOf(p), d = off(p), id = esc(p.id), image = esc((p.images || [])[0] || "");
  return `<article class="card"><a class="pic" href="product.html?id=${encodeURIComponent(p.id)}"><img src="${image}" alt="${esc(p.title)}" width="320" height="320" loading="lazy" decoding="async">
    ${d ? `<span class="badge">-${d}%</span>` : ""}${n <= 0 ? `<span class="badge out">Sold out</span>` : ""}</a>
    <div class="body"><small>${esc(brandName(p.brandId))}</small><h3><a href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.title)}</a></h3>
    <div class="price"><b>${money(p.discountPrice)}</b>${d ? `<s>${money(p.originalPrice)}</s>` : ""}</div>
    <button class="btn ghost wide" data-add="${id}"${n <= 0 ? " disabled" : ""}>${n <= 0 ? "Out of stock" : "Add to cart"}</button></div></article>`;
}

let cart = [];
try { const parsed = JSON.parse(localStorage.getItem("nc_cart") || "[]"); cart = Array.isArray(parsed) ? parsed : []; } catch { cart = []; }
function cleanCart() {
  if (!S.loaded) return;
  cart = cart.filter(i => i && typeof i.id === "string" && Number.isInteger(Number(i.qty)) && Number(i.qty) > 0)
    .map(i => ({id: i.id, qty: Math.max(1, Math.min(Number(i.qty), stockOf(S.products.find(p => p.id === i.id) || {stock: 0})))}))
    .filter(i => S.products.some(p => p.id === i.id && stockOf(p) > 0));
}
const updateCartCount = () => { const c = $("cartCount"); if (c) c.textContent = cart.reduce((s, i) => s + i.qty, 0); };
const saveCart = () => { cleanCart(); try { localStorage.setItem("nc_cart", JSON.stringify(cart)); } catch {} updateCartCount(); };
export function add(id, qty = 1) {
  const p = S.products.find(x => x.id === id); if (!p || stockOf(p) <= 0) return false;
  const amount = Math.max(1, Math.floor(Number(qty) || 1)), i = cart.find(x => x.id === id), max = stockOf(p);
  if (i) i.qty = Math.min(i.qty + amount, max); else cart.push({id, qty: Math.min(amount, max)});
  saveCart(); return true;
}
function drawCart() {
  const rows = cart.map(i => ({i, p: S.products.find(x => x.id === i.id)})).filter(r => r.p);
  if (S.loaded) cart = rows.map(r => r.i);
  const total = rows.reduce((s, r) => s + Number(r.p.discountPrice || 0) * r.i.qty, 0);
  $("cartRows").innerHTML = rows.map(({i, p}) => `<div class="crow"><span>${esc(p.title)}</span><span>${money(p.discountPrice)} × ${i.qty}</span>
    <button class="sm" type="button" aria-label="Decrease quantity" data-c="minus" data-id="${esc(p.id)}">−</button><button class="sm" type="button" aria-label="Increase quantity" data-c="plus" data-id="${esc(p.id)}">+</button><button class="sm red" type="button" aria-label="Remove item" data-c="del" data-id="${esc(p.id)}">×</button></div>`).join("")
    || `<p class="note">${S.loaded ? "Your cart is empty." : "Loading cart..."}</p>`;
  $("total").textContent = money(total); saveCart();
  return {rows, total};
}
export function openCart() {
  drawCart();
  const f = $("orderForm");
  if (!f.elements.name.value) fillForm(f, S.profile || {name: S.user?.displayName || ""});
  const saveWrap = $("saveWrap"); if (saveWrap) saveWrap.hidden = !S.user;
  $("cartModal").hidden = false;
  setTimeout(() => f.elements.name?.focus(), 30);
}

let popup = false;
export async function signInUser() {
  if (popup) return; popup = true;
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch (e) { if (e.code !== "auth/popup-closed-by-user") alert("Sign-in could not be completed. Please try again."); }
  finally { popup = false; }
}

export function mount(active) {
  const on = k => active === k ? ' class="on"' : "";
  document.body.insertAdjacentHTML("afterbegin", `<header class="top"><a class="brand" href="index.html"><img src="logo.jpg" alt="" width="38" height="38"><span>NEXUS <b>CHOICE</b></span></a>
    <nav aria-label="Main navigation"><a href="index.html"${on("home")}>Shop</a><a href="account.html"${on("account")}>My profile</a></nav>
    <div class="head-actions"><button id="cartBtn" class="btn ghost" type="button">Cart <span id="cartCount" class="pill">0</span></button><button id="authBtn" class="btn" type="button">Sign in</button></div></header>`);
  document.body.insertAdjacentHTML("beforeend", `<div class="modal" id="cartModal" hidden><div class="panel" role="dialog" aria-modal="true" aria-labelledby="cartTitle"><h2 id="cartTitle">Your cart</h2><div id="cartRows"></div><p class="total"><span>Total</span><b id="total">Rs. 0</b></p>
    <form id="orderForm">${fieldsHTML()}<label>Payment<select name="payment" required><option>Cash on delivery</option><option>Bank transfer</option></select></label>
    <label class="chk" id="saveWrap" hidden><input type="checkbox" id="saveP" checked> Save these details to my profile</label>
    <button id="placeBtn" class="btn wide" type="submit">Place order and confirm on WhatsApp</button></form>
    <button id="closeCart" class="btn ghost wide" type="button">Keep shopping</button></div></div>
    <footer class="footer"><div class="wrap footer-inner"><a class="brand" href="index.html"><img src="logo.jpg" alt="" width="48" height="48"><span>NEXUS <b>CHOICE</b></span></a><p>Everyday discoveries. Better choices.</p><small>© 2026 Nexus Choice</small></div></footer>`);
  saveCart();
  document.body.classList.add("page-enter");
  // Slim reading-progress indicator and a back-to-top control.
  if (!$("readingProgress")) document.body.insertAdjacentHTML("afterbegin", '<div id="readingProgress" aria-hidden="true"><i></i></div>');
  if (!$("backTop")) document.body.insertAdjacentHTML("beforeend", '<button id="backTop" type="button" aria-label="Back to top" title="Back to top">↑</button>');
  const progress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    const bar = $("readingProgress"); if (bar) bar.firstElementChild.style.width = `${value}%`;
    const top = $("backTop"); if (top) top.classList.toggle("visible", window.scrollY > 420);
  };
  window.addEventListener("scroll", progress, {passive:true}); progress();
  $("backTop").onclick = () => window.scrollTo({top:0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
  $("cartBtn").onclick = openCart;
  $("closeCart").onclick = () => $("cartModal").hidden = true;
  $("cartModal").onclick = e => { if (e.target.id === "cartModal") $("cartModal").hidden = true; };
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("cartModal").hidden) $("cartModal").hidden = true; });
  $("authBtn").onclick = () => S.user ? signOut(auth) : signInUser();
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-add]"); if (!b) return;
    if (!add(b.dataset.add)) return;
    const old = b.textContent; b.textContent = "Added ✓"; b.classList.add("added");
    showToast("Added to your cart", "success");
    setTimeout(() => { if (b.isConnected) { b.textContent = old; b.classList.remove("added"); } }, 1100);
  });
  $("cartRows").onclick = e => {
    const b = e.target.closest("[data-c]"); if (!b) return;
    const i = cart.find(x => x.id === b.dataset.id), p = S.products.find(x => x.id === b.dataset.id); if (!i || !p) return;
    if (b.dataset.c === "plus") i.qty = Math.min(i.qty + 1, stockOf(p));
    if (b.dataset.c === "minus") i.qty = Math.max(i.qty - 1, 1);
    if (b.dataset.c === "del") cart = cart.filter(x => x !== i);
    drawCart();
  };
  $("orderForm").onsubmit = placeOrder;
  onAuthStateChanged(auth, async u => {
    S.user = u; S.profile = null;
    $("authBtn").textContent = u ? "Sign out" : "Sign in";
    if (u) { try { const s = await getDoc(doc(db, "customers", u.uid)); if (s.exists()) S.profile = s.data(); } catch {} }
    document.dispatchEvent(new Event("authchange"));
  });
}

async function placeOrder(e) {
  e.preventDefault();
  const {rows} = drawCart();
  if (!rows.length) return alert("Your cart is empty.");
  const f = e.target, c = readForm(f); c.phone = c.phone.replace(/[\s()-]/g, ""); c.phone2 = c.phone2.replace(/[\s()-]/g, "");
  if (!/^0\d{9}$/.test(c.phone)) return alert("Enter a valid Sri Lankan phone number, like 0771234567.");
  if (c.phone2 && !/^0\d{9}$/.test(c.phone2)) return alert("Check the alternative phone number.");
  const btn = $("placeBtn"); btn.disabled = true; btn.textContent = "Checking stock...";
  try {
    // Re-check live stock and prices before accepting an order. This is a client-side safeguard;
    // production-grade inventory reservation should additionally be implemented in a trusted backend.
    const latest = await Promise.all(rows.map(async ({i, p}) => {
      const snap = await getDoc(doc(db, "products", p.id));
      if (!snap.exists()) throw new Error(`${p.title} is no longer available.`);
      const fresh = snap.data(), freshStock = stockOf(fresh);
      if ((fresh.visibility || "active") !== "active" || freshStock < i.qty) throw new Error(`Stock changed for ${p.title}. Please update your cart.`);
      if (Number(fresh.discountPrice) !== Number(p.discountPrice)) throw new Error(`The price of ${p.title} has changed. Please refresh and review your cart.`);
      return {i, p, fresh};
    }));
    const total = latest.reduce((sum, x) => sum + Number(x.fresh.discountPrice || 0) * x.i.qty, 0);
    const order = {status: "new", createdAt: serverTimestamp(), payment: f.elements.payment.value, subtotal: total, total,
      items: latest.map(({i, p, fresh}) => ({id: p.id, sku: fresh.sku || p.sku || "", title: fresh.title || p.title, price: Number(fresh.discountPrice), qty: i.qty})),
      customer: {...c, email: S.user?.email || ""}, ...(S.user ? {uid: S.user.uid} : {})};
    btn.textContent = "Placing order...";
    const ref = await addDoc(collection(db, "orders"), order);
    if (S.user && $("saveP")?.checked) await saveProfile(c).catch(() => {});
    const msg = ["New order - Nexus Choice", `Order ID: ${ref.id}`, ...order.items.map(x => `${x.title} x${x.qty} = ${money(x.price * x.qty)}`),
      `Total: ${money(total)} (${order.payment})`, `Name: ${c.name}`, `Phone: ${c.phone}`,
      `Address: ${c.address}, ${c.city}, ${c.district}`].join("\n");
    cart = []; saveCart();
    location.href = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
  } catch (x) {
    alert(x.message || "Could not place the order. Please try again.");
    btn.disabled = false; btn.textContent = "Place order and confirm on WhatsApp";
  }
}

export function showToast(message, kind = "info") {
  let host = $("toastHost");
  if (!host) { document.body.insertAdjacentHTML("beforeend", '<div id="toastHost" aria-live="polite" aria-atomic="true"></div>'); host = $("toastHost"); }
  const toast = document.createElement("div"); toast.className = `toast ${kind}`; toast.textContent = message;
  host.appendChild(toast); requestAnimationFrame(() => toast.classList.add("show"));
  window.setTimeout(() => { toast.classList.remove("show"); window.setTimeout(() => toast.remove(), 300); }, 2600);
}

export function intro() {
  // One branded entrance per browser tab; page content still animates on each navigation.
  try {
    if (sessionStorage.getItem("nc_intro") || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.body.classList.add("page-ready");
      return;
    }
    sessionStorage.setItem("nc_intro", "1");
  } catch {}
  if (document.getElementById("intro")) return;
  document.body.insertAdjacentHTML("afterbegin", `
    <div id="intro" role="status" aria-label="Nexus Choice is loading">
      <div class="intro-orbit orbit-one"></div><div class="intro-orbit orbit-two"></div>
      <div class="intro-mark">
        <img class="logo-piece piece-a" src="logo.jpg" alt="" width="160" height="160">
        <img class="logo-piece piece-b" src="logo.jpg" alt="" width="160" height="160">
        <img class="logo-piece piece-c" src="logo.jpg" alt="" width="160" height="160">
        <img class="logo-piece piece-d" src="logo.jpg" alt="Nexus Choice" width="160" height="160">
        <span class="intro-glow"></span>
      </div>
      <div class="intro-wordmark">NEXUS <b>CHOICE</b></div>
      <div class="intro-caption">DISCOVER SOMETHING BETTER</div>
      <div class="intro-progress"><i></i></div>
    </div>`);
  const overlay = $("intro");
  const go = () => {
    if (!overlay || overlay.classList.contains("bye")) return;
    overlay.classList.add("bye"); document.body.classList.add("page-ready");
    setTimeout(() => overlay.remove(), 850);
  };
  window.setTimeout(go, 2450);
  overlay.addEventListener("click", go, {once:true});
}
