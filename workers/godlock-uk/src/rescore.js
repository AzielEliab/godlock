/**
 * Which prior receipts a new question affects.
 * Match rule is the corpus succession rule: flawless only.
 * Loose topical relatedness is not a rescore.
 * Cite: AzielEliab/aziel-corpus workers/download-tracker/src/succession.js
 * (subject + title lineage, or an explicit supersedes link).
 * Author: Aziel Eliab.
 */

const LINEAGE_TAIL =
  /\s*[-–—:|]*\s*[([{]?\s*(?:v(?:er(?:sion)?)?|rev(?:ision)?|ed(?:ition)?|updated?|revised|supersedes?|superseded(?:\s+by)?|draft|final|addendum|corrigendum|errata)\b.*$/i;

export function normalizeKey(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function lineageCore(text) {
  let s = String(text || "").replace(/\s+/g, " ").trim();
  if (s.length > 240) s = s.slice(0, 240);
  let prev = "";
  while (s !== prev) {
    prev = s;
    s = s.replace(LINEAGE_TAIL, "");
    s = s.replace(/\s*[([{]\s*\d+(?:st|nd|rd|th)?\s*(?:ed(?:ition)?)?\s*[)\]}]\s*$/i, "");
    s = s.replace(/\s+v?\d+(?:\.\d+){0,3}\s*$/i, "");
  }
  const core = normalizeKey(s);
  return core.length >= 12 ? core : "";
}

function idPattern(id) {
  return new RegExp("\\b" + String(id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
}

/**
 * @returns "" when this prior is not affected, otherwise a succession reason.
 */
export function affectReason(newText, prior, newSha) {
  if (!prior || !prior.id || Number(prior.isolated)) return "";
  const text = String(newText || "");
  const id = String(prior.id);
  if (idPattern(id).test(text)) {
    if (/\bsupersedes?\b|\bsuperseded[-_ ]?by\b/i.test(text)) return "explicit";
    return "explicit_id";
  }
  const nextCore = lineageCore(text);
  const priorCore = lineageCore(prior.challenge_text || "");
  if (!nextCore || !priorCore || nextCore !== priorCore) return "";
  if (newSha && prior.text_sha256 && String(newSha) === String(prior.text_sha256)) return "";
  return "subject_title_lineage";
}

export function affectedPriors(newText, priors, newSha) {
  const out = [];
  for (const prior of priors || []) {
    const reason = affectReason(newText, prior, newSha);
    if (reason) out.push({ prior, reason });
  }
  return out;
}
