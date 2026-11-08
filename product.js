import {mount, load, S, stockOf, off, brandName, catName, add, openCart, card, intro, feeOf, showToast} from "./site.js";
import {fmtDesc} from "./format.js";
import {$, esc, money} from "./firebase.js";

intro();
mount("");
const box = $("pd"), id = new URLSearchParams(location.search).get("id");
const meta = (k, v, prop) => {
  let m = document.head.querySelector(`meta[${prop ? "property" : "name"}="${k}"]`);
  if (!m) { m = document.createElement("meta"); m.setAttribute(prop ? "property" : "name", k); document.head.appendChild(m); }
  m.content = v;
};

try { await load(); } catch (e) { box.innerHTML = `<p class="note">Could not load this product. Please refresh.</p>`; }

const p = S.products.find(x => x.id === id);
if (!p) { 
  if (S.loaded) box.innerHTML = `<p class="note">This product is not available. <a href="index.html">Back to the shop</a></p>`; 
} else {
  const imgs = p.images || [], n = stockOf(p), d = off(p);
  const desc = (p.description || `${p.title} at Nexus Choice`).slice(0, 160);
  document.title = `${p.title} | Nexus Choice`;
  meta("description", desc); meta("og:title", p.title, 1); meta("og:description", desc, 1); meta("og:image", imgs[0] || "", 1);
  
  const link = document.createElement("link"); link.rel = "canonical"; link.href = location.origin + location.pathname + "?id=" + encodeURIComponent(p.id); document.head.appendChild(link);
  
  const ld = document.createElement("script"); ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({"@context": "https://schema.org", "@type": "Product", name: p.title, image: imgs, description: desc, sku: p.sku || p.id,
    brand: {"@type": "Brand", name: brandName(p.brandId) || "Nexus Choice"},
    offers: {"@type": "Offer", priceCurrency: "LKR", price: p.discountPrice, url: link.href, availability: n > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"}});
  document.head.appendChild(ld);
  
  // Free Delivery නම් පමණක් ප්‍රොඩක්ට් පේජ් එකේ ලොකුවට පෙන්වයි. Paid ගැන කිසිවක් පෙන්වන්නේ නැත.
  const dtxt = p.deliveryType === "free" ? `<div style="background: rgba(0, 240, 255, 0.1); border: 1px solid var(--accent-neon); color: var(--accent-neon); padding: 8px 12px; border-radius: 6px; font-weight: 700; margin: 12px 0; display: inline-flex; align-items: center; gap: 6px;">🚚 FREE DELIVERY - මෙම භාණ්ඩය නොමිලේ නිවසටම එවනු ලැබේ!</div>` : "";
  
  const row = (k, v) => v ? `<tr><th>${k}</th><td>${esc(v)}</td></tr>` : "";

  // Product Video Review HTML
  let videoHTML = '';
  if (p.videoUrl) {
    videoHTML = `
      <div style="margin-top: 20px;">
        <h3 style="color: var(--accent-neon); margin-bottom: 10px; font-size: 16px;">📹 Product Video Review</h3>
        <div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; border-radius: 8px; overflow: hidden; border: 1px solid var(--accent-blue);">
          <iframe src="${esc(p.videoUrl)}" style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe>
        </div>
      </div>
    `;
  }

  box.innerHTML = `<nav class="crumbs"><a href="index.html">Shop</a> / ${catName(p.categoryId) ? `<span>${esc(catName(p.categoryId))}</span> / ` : ""}<span>${esc(p.title)}</span></nav>
  <div class="pd">
    <div class="gal"><img id="big" src="${esc(imgs[0] || "")}" alt="${esc(p.title)}" width="600" height="600">
      <div class="thumbs">${imgs.length > 1 ? imgs.map(u => `<img src="${esc(u)}" alt="" width="64" height="64" loading="lazy">`).join("") : ""}</div></div>
    <div class="info"><small>${esc(brandName(p.brandId))}</small><h1>${esc(p.title)}</h1>
      <div class="price big"><b>${money(p.discountPrice)}</b>${d ? `<s>${money(p.originalPrice)}</s><span class="save">Save ${d}%</span>` : ""}</div>
      <p class="stock ${n > 0 ? "ok" : "no"}">${n <= 0 ? "Out of stock" : n <= 5 ? "Only " + n + " left" : "In stock"}</p>
      
      ${dtxt}

      <div class="qty"><button id="qm" class="sm">-</button><input id="qty" type="number" min="1" max="${Math.max(n, 1)}" value="1"><button id="qp" class="sm">+</button></div>
      <div class="acts"><button id="addBtn" class="btn ghost"${n <= 0 ? " disabled" : ""}>Add to cart</button><button id="buyBtn" class="btn"${n <= 0 ? " disabled" : ""}>Buy now</button></div>
      <button id="shareBtn" class="share" type="button">Share</button>
      ${p.description ? `<h2>Description</h2><div class="desc">${fmtDesc(p.description)}</div>` : ""}
      ${videoHTML}
      <h2>Details</h2><table class="spec">${row("SKU", p.sku)}${row("Brand", brandName(p.brandId))}${row("Category", catName(p.categoryId))}${row("Availability", n > 0 ? "In stock" : "Out of stock")}</table>
    </div></div>
  <h2 class="rel-h">You may also like</h2><div class="grid" id="rel"></div>`;

  const qty = () => Math.max(1, Math.min(Number($("qty").value) || 1, Math.max(n, 1)));
  $("qm").onclick = () => $("qty").value = Math.max(1, qty() - 1);
  $("qp").onclick = () => $("qty").value = Math.min(Math.max(n, 1), qty() + 1);
  $("addBtn").onclick = e => { add(p.id, qty()); e.target.textContent = "Added"; setTimeout(() => e.target.textContent = "Add to cart", 900); };
  $("buyBtn").onclick = () => { add(p.id, qty()); openCart(); };
  $("shareBtn").onclick = async () => {
    const url = location.href;
    try { if (navigator.share) await navigator.share({title: p.title, url}); else { await navigator.clipboard.writeText(url); showToast("Link copied", "success"); } } catch {}
  };
  box.onclick = e => { if (e.target.closest(".thumbs") && e.target.tagName === "IMG") $("big").src = e.target.src; };

  // Related Items Integration
  const rel = S.products.filter(x => x.id !== p.id).sort((a, b) => (b.categoryId === p.categoryId) - (a.categoryId === p.categoryId)).slice(0, 4);
  $("rel").innerHTML = rel.map(card).join("");
}