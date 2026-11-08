// Shared setup + helpers. The Firebase config is public by design;
// real protection comes from firestore.rules.
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
const app = initializeApp({
  apiKey: "AIzaSyDV4r6Z8YGLS6U33CnptF0IDq_oGyquojY",
  authDomain: "nexus-choice.firebaseapp.com",
  projectId: "nexus-choice",
  storageBucket: "nexus-choice.firebasestorage.app",
  messagingSenderId: "914919173575",
  appId: "1:914919173575:web:628ceaf8e690c55c307de2"
});
export const auth = getAuth(app), db = getFirestore(app);
export const OWNER = "nisalsasindu2007@gmail.com"; // also set in firestore.rules
export const $ = id => document.getElementById(id);
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const money = n => "Rs. " + Number(n || 0).toLocaleString("en-LK");
