import {auth, db, OWNER, $, esc} from "./firebase.js";
import {GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {doc, getDoc} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// Firestore collection සහ addDoc මෙතැනට එකතු කළා
import {collection, addDoc} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

// ==========================================
// EXCEL BULK UPLOAD HANDLER FOR ADMIN
// ==========================================
window.handleExcelUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json(worksheet);

      if (confirm(`Excel ፋයිල් එකෙන් Product ${jsonRows.length}ක් හමුවිය. මේවා Cloud Database එකට එකතු කරන්නද?`)) {
        for (let row of jsonRows) {
          const productData = {
            title: row.title || 'New Product',
            discountPrice: Number(row.discountPrice) || 0,
            originalPrice: Number(row.originalPrice) || null,
            status: row.status || 'in',
            category: row.category || 'General',
            deliveryType: row.deliveryType || 'free',
            deliveryFee: Number(row.deliveryFee) || 0,
            videoUrl: row.videoUrl || '',
            images: [row.img1 || 'https://i.ibb.co/v6LkbPJZ/T800.png'].filter(Boolean)
          };
          await addDoc(collection(db, "products"), productData);
        }
        alert("සියලුම නිෂ්පාදන සාර්ථකව Cloud Database එකට එකතු විය!");
        if (typeof fetchAdminProducts === 'function') {
          fetchAdminProducts();
        }
      }
    } catch (err) {
      console.error("Excel Upload Error:", err);
      alert("Excel ፋයිල් එක කියවීමේ දෝෂයක් සිදු විය. කරුණාකර නිවැරදි Format එකක් භාවිතා කරන්න.");
    }
  };
  reader.readAsArrayBuffer(file);
};