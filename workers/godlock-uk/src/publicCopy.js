/**
 * Strip hidden determination-method labels from public HTML, receipts,
 * and scrapeable metadata. Backend may still use those methods internally.
 * Engagement tokens that appear in a user's own challenge quote are not
 * rewritten here (this runs on engine summary/explanation). Stored
 * challenge_text is the submitter's exact text and is not rewritten.
 * Author: Aziel Eliab.
 *
 * Branded framework titles are removed. Everyday scientific English is kept
 * readable: "limits of observation" is rewritten, not deleted mid-sentence.
 */

const BRANDED_REMOVE = [
  /weighing framework\s*:?\s*/gi,
  /weighing internals?\s*:?\s*/gi,
  /empirical knowledge and the limits of observation(?:\s*\(\s*aziel eliab\s*\))?/gi,
  /foundational determination/gi,
  /INTERNAL_CRITERIA/gi,
  /internal criteria/gi,
  /bootstrap lock/gi,
  /ABAD framework/gi,
  /unpublished frameworks?/gi,
];

const NEUTRAL_REWRITE = [
  [/empirical[- ]limits?(?:\s+of\s+observation)/gi, "observational limits"],
  [/the limits of observation/gi, "observational limits"],
  [/limits of observation/gi, "observational limits"],
];

export function hideInternalDetermination(text) {
  let s = String(text == null ? "" : text);
  if (!s) return "";
  for (const re of BRANDED_REMOVE) {
    re.lastIndex = 0;
    s = s.replace(re, "");
  }
  for (const [re, to] of NEUTRAL_REWRITE) {
    re.lastIndex = 0;
    s = s.replace(re, to);
  }
  s = s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  s = s.replace(/[ \t]{2,}/g, " ");
  s = s.replace(/\s+([,.;:!?])/g, "$1");
  s = s.replace(/^\s*[·•\-–—:,;.]+\s*/g, "");
  s = s.replace(/[ \t]{2,}/g, " ");
  return s.trim();
}

export function publicSafeFields(row) {
  const out = { ...(row || {}) };
  if (out.summary != null) out.summary = hideInternalDetermination(out.summary);
  if (out.explanation != null) out.explanation = hideInternalDetermination(out.explanation);
  if (out.weighing != null) delete out.weighing;
  return out;
}
