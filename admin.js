import {auth, db, OWNER, $, esc} from "./firebase.js";
import {GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {doc, getDoc} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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

const show = on => {
  $("gate").hidden = on;
  $("app").hidden = !on;
  if (on) document.body.classList.add("admin-ready");
  else document.body.classList.remove("admin-ready");
};

const authErrorText = e => {
  const code = e?.code || "";
  const messages = {
    "auth/unauthorized-domain": "This website domain is not authorized in Firebase. Add your GitHub Pages domain in Firebase Authentication > Settings > Authorized domains.",
    "auth/popup-blocked": "Google sign-in popup was blocked. Allow popups for this website and try again.",
    "auth/popup-closed-by-user": "The Google sign-in window was closed before login finished.",
    "auth/cancelled-popup-request": "Another sign-in window is already open. Close it and try again.",
    "auth/operation-not-allowed": "Google sign-in is not enabled. Enable the Google provider in Firebase Authentication > Sign-in method.",
    "auth/network-request-failed": "Network error. Check your internet connection and try again.",
    "auth/account-exists-with-different-credential": "An account already exists with a different sign-in method. Check Firebase Authentication settings."
  };
  return messages[code] || `Google sign-in failed${code ? ` (${code})` : ""}: ${e?.message || "Unknown error"}`;
};

$("signIn").onclick = async () => {
  const btn = $("signIn");
  const msg = $("gateMsg");
  btn.disabled = true;
  msg.textContent = "Connecting to Google…";
  try {
    // If an authenticated but unauthorized account is already active, let the user switch accounts.
    if (auth.currentUser) await signOut(auth);
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (e) {
    console.error("Nexus Choice admin sign-in:", e);
    msg.textContent = authErrorText(e);
  } finally {
    btn.disabled = false;
  }
};

$("signOut").onclick = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Admin sign-out:", e);
    $("gateMsg").textContent = authErrorText(e);
  }
};

let authCheckRun = 0;
onAuthStateChanged(auth, async u => {
  const run = ++authCheckRun;
  if (!u) {
    window.ME = null;
    $("signIn").textContent = "Continue with Google";
    show(false);
    return;
  }

  const email = (u.email || "").trim().toLowerCase();
  $("signIn").textContent = "Switch Google account";

  if (!email) {
    $("gateMsg").textContent = "Google did not return an email address. Sign out and try another Google account.";
    show(false);
    return;
  }

  const ownerEmail = String(OWNER || "").trim().toLowerCase();
  let role = email === ownerEmail ? "admin" : null;

  if (!role) {
    try {
      const staffSnap = await getDoc(doc(db, "staff", email));
      if (run !== authCheckRun) return;
      if (staffSnap.exists()) role = String(staffSnap.data().role || "").trim().toLowerCase();
    } catch (e) {
      if (run !== authCheckRun) return;
      console.error("Nexus Choice staff permission lookup:", e);
      $("gateMsg").textContent =
        `Signed in as ${email}, but staff access could not be checked. ` +
        `Firestore returned: ${e.code || e.message}. Check the staff document and Firestore Rules.`;
      show(false);
      return;
    }
  }

  if (email !== ownerEmail && role === "admin") role = null;

  if (!u.emailVerified) {
    $("gateMsg").textContent =
      `Signed in as ${email}, but Firebase reports that this email is not verified. Use a verified Google account.`;
    show(false);
    return;
  }

  if (!role || !MENU.some(item => item[2] === "*" || item[2].split(" ").includes(role))) {
    $("gateMsg").textContent =
      `Google sign-in succeeded for ${email}, but this account has no Admin Panel permission. ` +
      `The owner must add a Firestore document at staff/${email} with an allowed role ` +
      `(product_manager, inventory_manager, order_manager, or support).`;
    show(false);
    return;
  }

  if (run !== authCheckRun) return;
  window.ME = {email, role};
  $("who").textContent = `${email} (${role})`;
  const items = MENU.filter(item => item[2] === "*" || item[2].split(" ").includes(role));
  $("nav").innerHTML = items.map(item => `<button data-v="${item[0]}">${item[1]}</button>`).join("");
  $("nav").onclick = e => {
    const button = e.target.closest("[data-v]");
    if (button) go(button.dataset.v);
  };
  show(true);
  go("dashboard");
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

      if (confirm(`Excel ፋይል එකෙන් Product ${jsonRows.length}ක් හමුවිය. මේවා Cloud Database එකට එකතු කරන්නද?`)) {
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
        if (typeof fetchAdminProducts === 'function') fetchAdminProducts();
      }
    } catch (err) {
      console.error("Excel Upload Error:", err);
      alert("Excel ፋයිල් එක කියවීමේ දෝෂයක් සිදු විය. කරුණාකර නිවැරදි Format එකක් භාවිතා කරන්න.");
    }
  };
  reader.readAsArrayBuffer(file);
};
