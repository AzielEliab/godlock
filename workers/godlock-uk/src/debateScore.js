/**
 * GodLock debate score. Uses the published corpus TRIAD_V3 functions
 * (workers/godlock-uk/src/corpus/review.js), copied from
 * AzielEliab/aziel-corpus workers/download-tracker/src/review.js.
 * Public method: https://www.azielcorpuslibrary.net/how-its-scored
 * Author: Aziel Eliab.
 */
import { reviewDocument, TRIAD_SCHEMA } from "./corpus/review.js";

export const DEBATE_HEADLINE = "Godlock. The Debate Site of Intelligent Design";
export const SCORE_METHOD_URL = "https://www.azielcorpuslibrary.net/how-its-scored";
export const TRIAD_LABEL = "Triad";

export const METHOD_PUBLIC =
  "The score is the published corpus triad (TRIAD_V3). Public combined is the mean of factor_i × factor_j over the applicable factors among physics, linguistics, bayesian, truth_formula, CLCE, and SPRE. Display is round(combined × 100) and is not written back into combined. Factors that do not apply are omitted. They are not entered as 0. Cite: "
  + SCORE_METHOD_URL + ".";

export const BIAS_PUBLIC =
  "That number is those published checkers on the submitted text. GodLock does not add a Specified Fit prior, and it does not ask a model to move the score. The checkers still apply their own documented penalties. That is not a claim that bias is impossible.";

export const RESCORE_RULE_PUBLIC =
  "A later question rescores an earlier receipt when the match is flawless: the new text names that receipt id, it is an explicit supersedes link to that id, or the normalized text is the same succession after version tails are stripped. Loose topical similarity does not rescore. Rescore runs TRIAD_V3 again on the stored text. It does not merge the new question into the old text. The original receipt row is kept. The rescore is an added record.";

export function meterRemainder(display) {
  const n = Math.round(Number(display));
  if (!Number.isFinite(n)) return null;
  return 100 - n;
}

export function scoreDebateText(text, sha256) {
  const body = String(text || "");
  const sha = String(sha256 || "").trim().toLowerCase();
  return reviewDocument({
    title: "",
    body,
    sha256: sha,
    author: "",
    library: "corpus",
    filename: "",
    structure: { ok: false },
  });
}

export function omittedFactorNames(review) {
  const flags = review && review.applicability && review.applicability.flags;
  if (!flags) return [];
  const names = [];
  for (const key of ["physics", "linguistics", "bayesian", "truth_formula", "clce", "spre"]) {
    if (flags[key] === false) names.push(key);
  }
  return names;
}

export function triadSnapshot(review) {
  const triad = review && review.triad ? review.triad : null;
  const ready = !!(triad && triad.ready && triad.display != null && triad.combined != null && triad.schema === TRIAD_SCHEMA);
  return {
    schema: triad && triad.schema ? triad.schema : TRIAD_SCHEMA,
    ready,
    display: ready ? Math.round(Number(triad.display)) : null,
    combined: ready ? triad.combined : null,
    triad_cycle_mean: triad ? triad.triad_cycle_mean : null,
    pairing_count: triad ? triad.pairing_count : null,
    cycle_factors: triad && triad.cycle_factors ? triad.cycle_factors.slice() : [],
    factors: triad && triad.factors ? { ...triad.factors } : {},
    axis_products: triad && triad.axis_products ? { ...triad.axis_products } : {},
    omitted: omittedFactorNames(review),
    public_score: triad && triad.public_score ? triad.public_score : null,
  };
}

export function debateSummary(review) {
  const snap = triadSnapshot(review);
  if (!snap.ready) return "TRIAD_V3 did not publish a combined score for this text.";
  return "TRIAD_V3 display " + snap.display + ". Combined " + snap.combined + ". The display is not written back into combined.";
}

export function debateExplanation(review, extra) {
  const snap = triadSnapshot(review);
  const used = snap.cycle_factors.length ? snap.cycle_factors.join(", ") : "none";
  const lines = [
    METHOD_PUBLIC,
    "Applicable factors in this cycle: " + used + ". Pairings: " + (snap.pairing_count == null ? "none" : snap.pairing_count) + ".",
    snap.omitted.length ? "Omitted, not scored as 0: " + snap.omitted.join(", ") + "." : "No listed factor was omitted.",
    snap.ready ? "Display " + snap.display + ". Combined " + snap.combined + "." : "No public combined score.",
    BIAS_PUBLIC,
    RESCORE_RULE_PUBLIC,
  ];
  if (extra) lines.push(String(extra));
  return lines.join(" ");
}

function factorDiff(beforeSnap, afterSnap) {
  if (!beforeSnap || !afterSnap) return "";
  const keys = new Set([
    ...Object.keys(beforeSnap.factors || {}),
    ...Object.keys(afterSnap.factors || {}),
  ]);
  const bits = [];
  for (const key of keys) {
    const prev = beforeSnap.factors ? beforeSnap.factors[key] : null;
    const next = afterSnap.factors ? afterSnap.factors[key] : null;
    if (prev !== next) {
      bits.push(key + " " + (prev == null ? "omitted" : prev) + " → " + (next == null ? "omitted" : next));
    }
  }
  return bits.length ? "What changed: " + bits.join("; ") + "." : "";
}

export function describeRescore({ affectReason, previousDisplay, previousSource, beforeSnap, afterSnap }) {
  const reason = affectReason || "rescore";
  const prev = previousDisplay == null ? "none" : String(previousDisplay);
  const next = afterSnap && afterSnap.display != null ? String(afterSnap.display) : "none";
  const source = previousSource === "stored_score_after"
    ? "The previous number is the original stored score_after. That receipt row was not rewritten."
    : previousSource === "triad_display"
      ? "The previous number is an earlier TRIAD_V3 display. That receipt row was not rewritten."
      : "No earlier triad display was stored.";
  let changed;
  if (beforeSnap && afterSnap && beforeSnap.display === afterSnap.display) {
    changed = "TRIAD_V3 display unchanged at " + next + ". The stored challenge text was scored again and was not rewritten. Earlier receipt was rescored.";
  } else if (previousSource === "stored_score_after") {
    changed = "Earlier receipt was rescored. Old stored score_after " + prev + " is kept on the original receipt. New TRIAD_V3 display is " + next + ".";
  } else {
    changed = "Earlier receipt was rescored. TRIAD_V3 display " + prev + " → " + next + ".";
  }
  const diff = factorDiff(beforeSnap, afterSnap);
  return "Rescore (" + reason + "). " + source + " " + changed + (diff ? " " + diff : "");
}
