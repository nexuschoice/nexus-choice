import {auth, db, OWNER, $, esc} from "./firebase.js";
import {GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {doc, getDoc} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
