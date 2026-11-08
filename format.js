import {esc} from "./firebase.js";
// Turns the description typed in the admin panel into tidy HTML.
//   blank line        -> new paragraph
//   single new line   -> line break (spaces are kept)
//   "- " or "• " line -> bullet point
//   "Label: value"    -> bold label
export function fmtDesc(text) {
  const out = [], para = [], list = [];
  const inline = s => { const m = s.match(/^([^:\n]{2,28}):\s+(\S.*)$/); return m ? `<strong>${esc(m[1])}:</strong> ${esc(m[2])}` : esc(s); };
  const flushP = () => { if (para.length) { out.push(`<p>${para.join("<br>")}</p>`); para.length = 0; } };
  const flushL = () => { if (list.length) { out.push(`<ul>${list.map(x => `<li>${x}</li>`).join("")}</ul>`); list.length = 0; } };
  for (const raw of String(text || "").replace(/\r/g, "").split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) { flushP(); flushL(); continue; }
    const b = line.trim().match(/^[-•*·▪●]\s+(.+)$/);
    if (b) { flushP(); list.push(inline(b[1])); } else { flushL(); para.push(inline(line.trim())); }
  }
  flushP(); flushL();
  return out.join("");
}
