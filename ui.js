// Dark/light theme, English/Sinhala language and scroll-reveal animation.
// Language works by translating the page's English text using the table below, so product
// names and descriptions typed in the admin panel are never touched. To change a Sinhala
// wording, edit it in SI; to translate a new sentence, add "English text": "සිංහල".
const SI = {
  "Shop": "සාප්පුව", "About": "අප ගැන", "My profile": "මගේ පැතිකඩ", "Cart": "කරත්තය", "Sign in": "පිවිසෙන්න", "Sign out": "ඉවත් වන්න",
  "Sign in with Google": "Google මගින් පිවිසෙන්න", "Main navigation": "ප්‍රධාන සංචාලනය", "Back to top": "ඉහළට", "Product categories": "නිෂ්පාදන කාණ්ඩ",
  "Switch to dark theme": "අඳුරු තේමාවට මාරු වන්න", "Switch to light theme": "ලා තේමාවට මාරු වන්න",
  "YOUR EVERYDAY DISCOVERY STORE": "ඔබේ දෛනික සොයාගැනීම් වෙළඳසැල", "Good finds.": "හොඳ සොයාගැනීම්.", "Great choices.": "විශිෂ්ට තේරීම්.",
  "Explore smart gadgets, useful essentials and lifestyle picks — thoughtfully selected for everyday living.": "ස්මාර්ට් ගැජට්, ප්‍රයෝජනවත් අත්‍යවශ්‍ය භාණ්ඩ සහ ජීවන රටාවට ගැලපෙන තෝරාගත් නිෂ්පාදන ගවේෂණය කරන්න.",
  "Explore the collection": "එකතුව බලන්න", "Island-wide delivery in Sri Lanka": "ශ්‍රී ලංකාව පුරා බෙදාහැරීම",
  "Curated finds": "තෝරාගත් නිෂ්පාදන", "Useful products, selected": "ප්‍රයෝජනවත්, තෝරාගත් භාණ්ඩ", "Island-wide delivery": "දිවයින පුරා බෙදාහැරීම",
  "Across Sri Lanka": "ශ්‍රී ලංකාව පුරා", "Easy ordering": "පහසු ඇණවුම්", "Checkout via WhatsApp": "WhatsApp හරහා ඇණවුම් කරන්න",
  "THE COLLECTION": "එකතුව", "Find your next favourite": "ඔබේ ඊළඟ ප්‍රියතම දේ සොයාගන්න", "Browse the latest picks from our store.": "අපගේ වෙළඳසැලේ නවතම තේරීම් බලන්න.",
  "Search products...": "නිෂ්පාදන සොයන්න...", "Search products": "නිෂ්පාදන සොයන්න", "All": "සියල්ල", "Featured picks": "විශේෂ තේරීම්",
  "Selected for you": "ඔබ වෙනුවෙන් තෝරාගත්", "Shop all products": "සියලු නිෂ්පාදන", "New discoveries await": "නව සොයාගැනීම් බලා සිටී",
  "Sort by": "පිළිවෙළ", "Newest": "අලුත්ම", "Price: low to high": "මිල: අඩු සිට වැඩි", "Price: high to low": "මිල: වැඩි සිට අඩු",
  "No products found.": "නිෂ්පාදන හමු නොවීය.", "Could not load products. Please refresh the page.": "නිෂ්පාදන ලබාගත නොහැකි විය. කරුණාකර පිටුව නැවුම් කරන්න.",
  "Sold out": "අවසන්", "Out of stock": "තොග නැත", "In stock": "තොගයේ ඇත", "Add to cart": "කරත්තයට දමන්න", "Added ✓": "එකතු විය ✓", "Added": "එකතු විය",
  "Added to your cart": "කරත්තයට එකතු කළා", "Free delivery": "නොමිලේ බෙදාහැරීම", "Free": "නොමිලේ",
  "Your cart": "ඔබේ කරත්තය", "Subtotal": "උප එකතුව", "Delivery": "බෙදාහැරීම", "Total": "මුළු මුදල", "Full name": "සම්පූර්ණ නම",
  "Phone (WhatsApp)": "දුරකථන අංකය (WhatsApp)", "Alternative phone": "විකල්ප දුරකථන අංකය", "Address": "ලිපිනය", "City": "නගරය", "District": "දිස්ත්‍රික්කය",
  "Payment": "ගෙවීම", "Cash on delivery": "බෙදාහැරීමේදී ගෙවීම", "Bank transfer": "බැංකු හරහා මුදල් මාරු කිරීම",
  "Save these details to my profile": "මෙම විස්තර මගේ පැතිකඩට සුරකින්න", "Place order and confirm on WhatsApp": "ඇණවුම් කර WhatsApp හරහා තහවුරු කරන්න",
  "Keep shopping": "සාප්පු යාම දිගටම කරන්න", "Your cart is empty.": "ඔබේ කරත්තය හිස්ය.", "Loading cart...": "කරත්තය පූරණය වෙමින්...",
  "Checking stock...": "තොග පරීක්ෂා කරමින්...", "Placing order...": "ඇණවුම් කරමින්...",
  "Decrease quantity": "ප්‍රමාණය අඩු කරන්න", "Increase quantity": "ප්‍රමාණය වැඩි කරන්න", "Remove item": "ඉවත් කරන්න",
  "Enter a valid Sri Lankan phone number, like 0771234567.": "වලංගු ශ්‍රී ලාංකික දුරකථන අංකයක් ඇතුළත් කරන්න (උදා: 0771234567).",
  "Check the alternative phone number.": "විකල්ප දුරකථන අංකය පරීක්ෂා කරන්න.", "Could not place the order. Please try again.": "ඇණවුම ලබා දීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.",
  "Sign-in could not be completed. Please try again.": "පිවිසීම සම්පූර්ණ කළ නොහැකි විය. නැවත උත්සාහ කරන්න.",
  "ABOUT NEXUS CHOICE": "NEXUS CHOICE ගැන",
  "Nexus Choice is an online store bringing together smart gadgets, useful everyday essentials and lifestyle finds. We focus on making it easier to discover practical products and place orders from anywhere in Sri Lanka.": "Nexus Choice යනු ස්මාර්ට් ගැජට්, දෛනික ජීවිතයට ප්‍රයෝජනවත් අත්‍යවශ්‍ය භාණ්ඩ සහ ජීවන රටාවට ගැලපෙන නිෂ්පාදන එක් තැනකට ගෙන එන අන්තර්ජාල වෙළඳසැලකි. ශ්‍රී ලංකාවේ ඕනෑම තැනක සිට ප්‍රායෝගික නිෂ්පාදන සොයාගැනීම සහ ඇණවුම් කිරීම පහසු කිරීම අපගේ අරමුණයි.",
  "Have a question about a product or an order? Contact our team through any of the channels below.": "නිෂ්පාදනයක් හෝ ඇණවුමක් ගැන ප්‍රශ්නයක් තිබේද? පහත ඕනෑම මාර්ගයකින් අපගේ කණ්ඩායම අමතන්න.",
  "Connect with us": "අප හා සම්බන්ධ වන්න", "WhatsApp Chat": "WhatsApp කතාබහ", "Facebook Page": "Facebook පිටුව",
  "Everyday discoveries. Better choices.": "දෛනික සොයාගැනීම්. වඩා හොඳ තේරීම්.", "DISCOVER SOMETHING BETTER": "වඩා හොඳ දෙයක් සොයාගන්න",
  "Brand": "වෙළඳ නාමය", "Category": "කාණ්ඩය", "Availability": "ලබාගත හැකි බව", "Buy now": "දැන්ම මිලදී ගන්න", "Description": "විස්තරය", "Details": "විස්තර",
  "You may also like": "ඔබ කැමති විය හැකි දේවල්", "Loading product...": "නිෂ්පාදනය පූරණය වෙමින්...", "Could not load this product. Please refresh.": "මෙම නිෂ්පාදනය ලබාගත නොහැකි විය. කරුණාකර නැවුම් කරන්න.",
  "This product is not available.": "මෙම නිෂ්පාදනය දැනට නැත.", "Back to the shop": "සාප්පුවට ආපසු", "Share": "බෙදාගන්න", "Link copied": "සබැඳිය පිටපත් කළා",
  "Sign in with Google to save your delivery details. Checkout will then fill them in for you.": "ඔබේ බෙදාහැරීමේ විස්තර සුරැකීමට Google මගින් පිවිසෙන්න. එවිට ඇණවුම් කිරීමේදී ඒවා ස්වයංක්‍රීයව පිරවෙනු ඇත.",
  "Save changes": "වෙනස්කම් සුරකින්න", "Saved. Checkout will use these details.": "සුරැකිණි. ඇණවුම් කිරීමේදී මෙම විස්තර භාවිත වේ.", "Loading...": "පූරණය වෙමින්..."
};
const RX = [
  [/^Only (\d+) left$/, "තව $1ක් පමණක් ඉතිරියි"], [/^Save (\d+)%$/, "$1% ඉතිරි කරගන්න"], [/^Delivery (Rs\. .+)$/, "බෙදාහැරීම $1"],
  [/^(.+) is no longer available\.$/, "$1 තවදුරටත් ලබාගත නොහැක."],
  [/^Stock changed for (.+)\. Please update your cart\.$/, "$1 හි තොග වෙනස් වී ඇත. කරුණාකර කරත්තය යාවත්කාලීන කරන්න."],
  [/^The price of (.+) has changed\. Please refresh and review your cart\.$/, "$1 හි මිල වෙනස් වී ඇත. කරුණාකර පිටුව නැවුම් කර කරත්තය පරීක්ෂා කරන්න."],
  [/^Could not save: (.*)$/, "සුරැකීමට නොහැකි විය: $1"]
];
const store = {get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} }};
let lang = store.get("nc_lang") === "si" ? "si" : "en";
let theme = store.get("nc_theme") === "light" ? "light" : "dark";
const tr = s => {
  const k = s.trim(); if (!k) return s;
  let v = SI[k];
  if (v === undefined) for (const [r, o] of RX) if (r.test(k)) { v = k.replace(r, o); break; }
  return v === undefined ? s : s.replace(k, v);
};
export const t = s => lang === "si" ? tr(String(s)) : String(s);
const _alert = window.alert.bind(window); window.alert = m => _alert(t(m));

const textOrig = new WeakMap(), attrOrig = new WeakMap(), ATTRS = ["placeholder", "aria-label", "title"];
const skip = n => !!n.closest?.("[data-nt],script,style,textarea");
function apply(root) {
  const nodes = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode: n => n.parentElement && !skip(n.parentElement) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT});
  for (let n; (n = w.nextNode());) nodes.push(n);
  for (const n of nodes) {
    if (!textOrig.has(n)) textOrig.set(n, n.nodeValue);
    const v = lang === "si" ? tr(textOrig.get(n)) : textOrig.get(n);
    if (n.nodeValue !== v) n.nodeValue = v;
  }
  const els = [...(root.nodeType === 1 ? [root] : []), ...root.querySelectorAll("[placeholder],[aria-label],[title]")];
  for (const el of els) {
    if (skip(el)) continue;
    for (const a of ATTRS) if (el.hasAttribute(a)) {
      let m = attrOrig.get(el); if (!m) attrOrig.set(el, m = {});
      if (!(a in m)) m[a] = el.getAttribute(a);
      const v = lang === "si" ? tr(m[a]) : m[a];
      if (el.getAttribute(a) !== v) el.setAttribute(a, v);
    }
  }
}

// Sections fade and slide in as they scroll into view.
const REVEAL = ".trust-strip>div,.section-heading,.sub-heading,.about-copy,.contact-panel,.footer-inner,.crumbs,.gal,.info>*,.rel-h,.panelx";
let io;
function scanReveal(root) {
  if (!io || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const list = [...(root.matches?.(REVEAL) ? [root] : []), ...root.querySelectorAll(REVEAL)];
  for (const el of list) if (!el.dataset.rv) { el.dataset.rv = "1"; el.classList.add("reveal"); io.observe(el); }
}

const $ = id => document.getElementById(id);
function paint() {
  const lb = $("langBtn"), tb = $("themeBtn");
  if (lb) { lb.textContent = lang === "si" ? "EN" : "සිං"; lb.title = lang === "si" ? "Switch to English" : "සිංහලට මාරු වන්න"; lb.setAttribute("aria-label", lb.title); }
  if (tb) { tb.textContent = theme === "light" ? "☾" : "☀"; tb.title = t(theme === "light" ? "Switch to dark theme" : "Switch to light theme"); tb.setAttribute("aria-label", tb.title); }
}
function setTheme(v) {
  theme = v; store.set("nc_theme", v);
  const root = document.documentElement; root.classList.add("theming"); root.dataset.theme = v;
  setTimeout(() => root.classList.remove("theming"), 450);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = v === "light" ? "#f7f4ee" : "#101a2b";
  paint();
}
export function initPrefs() {
  document.documentElement.lang = lang; document.documentElement.dataset.theme = theme;
  io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), {threshold: .12});
  if ($("themeBtn")) $("themeBtn").onclick = () => setTheme(theme === "light" ? "dark" : "light");
  if ($("langBtn")) $("langBtn").onclick = () => {
    lang = lang === "si" ? "en" : "si"; store.set("nc_lang", lang); document.documentElement.lang = lang;
    apply(document.body); paint(); document.dispatchEvent(new Event("langchange"));
  };
  const obs = new MutationObserver(muts => {
    obs.disconnect();   // our own text changes below must not trigger this callback again
    for (const m of muts) m.addedNodes.forEach(n => {
      if (n.nodeType === 1) { apply(n); scanReveal(n); } else if (n.nodeType === 3 && n.parentNode) apply(n.parentNode);
    });
    obs.observe(document.body, {childList: true, subtree: true});
  });
  apply(document.body); scanReveal(document.body); paint();
  obs.observe(document.body, {childList: true, subtree: true});
}
