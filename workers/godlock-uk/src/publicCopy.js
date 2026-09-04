/**
 * Strip hidden foundational / empirical-limit determination copy from
 * public HTML, receipts, and scrapeable metadata. Backend may still
 * use those methods internally. Author: Aziel Eliab.
 */

const HIDDEN = [
  /weighing framework\s*:?\s*/gi,
  /empirical knowledge and the limits of observation(?:\s*\(\s*aziel eliab\s*\))?/gi,
  /the limits of observation/gi,
  /limits of observation/gi,
  /foundational determination/gi,
  /empirical[- ]limits?(?:\s+of\s+observation)?/gi,
];

export function hideInternalDetermination(text) {
  let s = String(text == null ? "" : text);
  if (!s) return "";
  for (const re of HIDDEN) s = s.replace(re, "");
  s = s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  s = s.replace(/[ \t]{2,}/g, " ");
  s = s.replace(/^\s*[·•\-–—:,;.]+\s*/g, "");
  return s.trim();
}

export function publicSafeFields(row) {
  const out = { ...(row || {}) };
  if (out.summary != null) out.summary = hideInternalDetermination(out.summary);
  if (out.explanation != null) out.explanation = hideInternalDetermination(out.explanation);
  if (out.weighing != null) delete out.weighing;
  return out;
}
