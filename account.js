import {mount, S, fieldsHTML, fillForm, readForm, saveProfile, signInUser} from "./site.js";
import {$, esc} from "./firebase.js";
mount("account");
function render() {
  const box = $("acc");
  if (!S.user) {
    box.innerHTML = `<h1>My profile</h1><p class="mut">Sign in with Google to save your delivery details. Checkout will then fill them in for you.</p><button id="si" class="btn wide">Sign in with Google</button>`;
    $("si").onclick = signInUser; return;
  }
  box.innerHTML = `<h1>My profile</h1><p class="mut">${esc(S.user.email)}</p><form id="pf">${fieldsHTML()}<button class="btn wide">Save changes</button><p id="msg" class="note"></p></form>`;
  const f = $("pf"); fillForm(f, {name: S.user.displayName, ...(S.profile || {})});
  f.onsubmit = async e => {
    e.preventDefault(); const m = $("msg");
    try { await saveProfile(readForm(f)); m.textContent = "Saved. Checkout will use these details."; } catch (x) { m.textContent = "Could not save: " + x.message; }
  };
}
document.addEventListener("authchange", render);
