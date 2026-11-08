import {mount, load, S, card, intro} from "./site.js";
import {$, esc} from "./firebase.js";
intro(); mount("home");
let cat = "";
function draw() {
  const q = $("q").value.trim().toLowerCase();
  const list = S.products.filter(p => (!q || (p.title || "").toLowerCase().includes(q)) && (!cat || p.categoryId === cat));
  $("grid").innerHTML = list.map(card).join("") || `<p class="note">No products found.</p>`;
  const feat = S.products.filter(p => p.featured);
  $("featWrap").hidden = !feat.length || !!q || !!cat;
  $("feat").innerHTML = feat.slice(0, 8).map(card).join("");
}
try {
  await load();
  $("chips").innerHTML = `<button class="chip on" data-c="">All</button>` + S.cats.map(c => `<button class="chip" data-c="${esc(c.id)}">${esc(c.name)}</button>`).join("");
  draw();
} catch (e) { $("grid").innerHTML = `<p class="note">Could not load products. Please refresh the page.</p>`; }
$("chips").onclick = e => {
  const b = e.target.closest("[data-c]"); if (!b) return;
  cat = b.dataset.c; document.querySelectorAll(".chip").forEach(x => x.classList.toggle("on", x === b)); draw();
};
$("q").addEventListener("input", draw);
