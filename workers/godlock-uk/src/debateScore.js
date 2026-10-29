/**
 * GodLock debate score. Uses the published corpus TRIAD_V3 functions
 * (workers/godlock-uk/src/corpus/review.js), copied from
 * AzielEliab/aziel-corpus workers/download-tracker/src/review.js.
 * Public method: https://www.azielcorpuslibrary.net/how-its-scored
 * Author: Aziel Eliab.
 */
import { reviewDocument, TRIAD_SCHEMA, FACTOR_NAMES } from "./corpus/review.js";
import { visibleChallengeText } from "./challengeText.js";
import { sha256hex } from "./ledger.js";

export const DEBATE_HEADLINE = "Godlock. The Debate Site of Intelligent Design";
export const SCORE_METHOD_URL = "https://www.azielcorpuslibrary.net/how-its-scored";
export const TRIAD_LABEL = "Triad";
export const HEADLINE_LABEL = "Headline";
export { FACTOR_NAMES };

/** Uncertainty stays between 25% and 75%. Headline is 100 − uncertainty, so it stays in that band too. */
export const UNCERTAINTY_FLOOR = 25;
export const UNCERTAINTY_CAP = 75;

export const METHOD_PUBLIC =
  "The headline number is the average of the applicable factors among physics, linguistics, bayesian, truth_formula, CLCE, and SPRE. It is not the triad product. Uncertainty stays between 25% and 75%, so the headline stays between 25% and 75%. The published corpus triad (TRIAD_V3) stays beside that headline. Public combined is the mean of factor_i × factor_j. Display is round(combined × 100) and is not written back into combined. A mesh provenance score and a debate score average into a dual mesh. That dual mesh and the triad display are then scored against each other. Factors that do not apply are omitted. They are not entered as 0. Cite: "
  + SCORE_METHOD_URL + ".";

export const BIAS_PUBLIC =
  "That number is those published checkers on the submitted text. GodLock does not add a Specified Fit prior, and it does not ask a model to move the score. The checkers still apply their own documented penalties. That is not a claim that bias is impossible.";

export const RESCORE_RULE_PUBLIC =
  "A later question rescores an earlier receipt when the match is flawless: the new text names that receipt id, it is an explicit supersedes link to that id, or the normalized text is the same succession after version tails are stripped. Loose topical similarity does not rescore. Rescore runs TRIAD_V3 again on the stored text. It does not merge the new question into the old text. The original receipt row is kept. The rescore is an added record.";

export const READING_PUBLIC =
  "A public receipt whose challenge text is stored shows the published TRIAD_V3 reading of that text. The original receipt row is kept. The old stored label and the old stored score stay on that row and are labeled as the old number. If the stored challenge text is missing, that row is not scored. Showing the reading does not rewrite the receipt.";

export function meterRemainder(display) {
  const n = Math.round(Number(display));
  if (!Number.isFinite(n)) return null;
  return 100 - n;
}

/** Bound a raw percent so residual uncertainty stays inside 25–75. */
export function boundHeadline(rawPercent) {
  const n = Math.round(Number(rawPercent));
  if (!Number.isFinite(n)) return null;
  const maxHeadline = 100 - UNCERTAINTY_FLOOR;
  const minHeadline = 100 - UNCERTAINTY_CAP;
  return Math.min(maxHeadline, Math.max(minHeadline, n));
}

/** Arithmetic mean of the applicable six factors, as a bounded headline percent. Not the triad product. */
export function factorAveragePercent(factors) {
  const vals = FACTOR_NAMES
    .map((key) => (factors && factors[key] != null ? Number(factors[key]) : null))
    .filter((v) => v != null && Number.isFinite(v));
  if (!vals.length) return null;
  const mean = vals.reduce((sum, v) => sum + v, 0) / vals.length;
  return boundHeadline(mean * 100);
}

/** Share of the six checkers that published a value. Mesh provenance, not the suite node rollup. */
export function meshProvenancePercent(snap) {
  const factors = snap && snap.factors ? snap.factors : {};
  const present = FACTOR_NAMES.filter((key) => factors[key] != null).length;
  return Math.round((present / FACTOR_NAMES.length) * 100);
}

const DEBATE_CHECKS = [
  /\?/,
  /\b(because|therefore|thus)\b/i,
  /\b(however|objection|counter|on the other hand)\b/i,
  /\b(receipt|hash|ledger)\b/i,
  /\b(design|origin|cause|mapping)\b/i,
  /\b(not|never|refuse)\b/i,
];

/** Debate scorer on the submitted text. Separate from TRIAD_V3. */
export function debateScorerPercent(text) {
  const body = String(text || "");
  let hits = 0;
  for (const re of DEBATE_CHECKS) if (re.test(body)) hits += 1;
  return Math.round((hits / DEBATE_CHECKS.length) * 100);
}

export function dualMeshPercent(mesh, debate) {
  if (mesh == null || debate == null) return null;
  const a = Number(mesh);
  const b = Number(debate);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((a + b) / 2);
}

/** Score the dual mesh and the corpus triad display against each other. */
export function scoreAgainst(dual, triad) {
  if (dual == null || triad == null) return null;
  const a = Number(dual);
  const b = Number(triad);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return { paired: Math.round((a + b) / 2), gap: Math.abs(a - b) };
}

export function scoreCard(review, text) {
  const snap = triadSnapshot(review);
  const headline = factorAveragePercent(snap.factors);
  const residual = headline == null ? null : 100 - headline;
  const mesh = meshProvenancePercent(snap);
  const debate = debateScorerPercent(text);
  const dual = dualMeshPercent(mesh, debate);
  const triad = snap.ready ? snap.display : null;
  const against = scoreAgainst(dual, triad);
  return {
    headline,
    residual,
    mesh,
    debate,
    dual,
    triad,
    paired: against ? against.paired : null,
    gap: against ? against.gap : null,
    snap,
  };
}

export function percentLine(card) {
  if (!card) return "";
  const bits = [];
  if (card.headline != null) bits.push("Headline " + card.headline + "%");
  if (card.triad != null) bits.push("Triad " + card.triad + "%");
  if (card.mesh != null) bits.push("Mesh " + card.mesh + "%");
  if (card.debate != null) bits.push("Debate " + card.debate + "%");
  if (card.residual != null) bits.push("Residual " + card.residual + "%");
  return bits.length ? bits.join(". ") + "." : "";
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

function storedContentSha(row, text) {
  const sha = row && row.text_sha256 ? String(row.text_sha256) : "";
  return sha || sha256hex(text);
}

/**
 * Published TRIAD_V3 reading of a stored challenge.
 * Read-only. Does not write the receipt, the ledger, or combined.
 * Missing or empty stored text stays unscored.
 */
export function publishedReading(row) {
  if (!row || Number(row.isolated)) return null;
  if (row.challenge_text == null) {
    return {
      status: "missing",
      ready: false,
      display: null,
      combined: null,
      note: "Stored challenge text is missing. This receipt is not scored with TRIAD_V3.",
    };
  }
  const text = String(row.challenge_text);
  if (!visibleChallengeText(text)) {
    return {
      status: "empty",
      ready: false,
      display: null,
      combined: null,
      note: "Stored challenge text is empty. This receipt is not scored with TRIAD_V3.",
    };
  }
  const review = scoreDebateText(text, storedContentSha(row, text));
  const snap = triadSnapshot(review);
  const card = scoreCard(review, text);
  if (!snap.ready || snap.display == null || snap.combined == null) {
    return {
      status: "unscored",
      ready: false,
      display: null,
      combined: null,
      headline: card.headline,
      note: "TRIAD_V3 did not publish a combined score for this stored text.",
    };
  }
  const percents = percentLine(card);
  return {
    status: "ready",
    ready: true,
    display: snap.display,
    combined: snap.combined,
    schema: snap.schema,
    headline: card.headline,
    residual: card.residual,
    mesh: card.mesh,
    debate: card.debate,
    dual: card.dual,
    paired: card.paired,
    gap: card.gap,
    percents,
    note: "TRIAD_V3 display " + snap.display + ". Combined " + snap.combined + ". " + percents + " This reading keeps the published corpus triad beside the headline. The original receipt row was not rewritten.",
  };
}

/** Newest public row whose stored text publishes a TRIAD_V3 display. */
export function newestPublishedMeter(rows) {
  const list = (rows || []).slice().sort((a, b) => String(b && b.created_utc || "").localeCompare(String(a && a.created_utc || "")));
  for (const row of list) {
    if (!row || Number(row.isolated)) continue;
    const reading = publishedReading(row);
    if (reading && reading.ready && reading.display != null) {
      const display = Math.round(Number(reading.display));
      return {
        display,
        remainder: meterRemainder(display),
        headline: reading.headline != null ? reading.headline : null,
        residual: reading.residual != null ? reading.residual : null,
        mesh: reading.mesh != null ? reading.mesh : null,
        debate: reading.debate != null ? reading.debate : null,
        dual: reading.dual != null ? reading.dual : null,
        receipt_id: row.id || null,
        source: "stored_challenge_text",
      };
    }
  }
  return null;
}

export function oldStoredScorePhrase(row) {
  const label = row && row.label != null && String(row.label) !== "" ? String(row.label) : "none";
  const before = row ? row.score_before : null;
  const after = row ? row.score_after : null;
  const hasScores = before != null && before !== "" && after != null && after !== "";
  if (!hasScores) return "Old stored label " + label + ".";
  return "Old stored label " + label + ". Old stored score " + before + "% → " + after + "%.";
}

function laterRescoreRows(row) {
  const history = Array.isArray(row && row.rescores) ? row.rescores : [];
  return history.filter((item) => item && item.reason && item.reason !== "initial");
}

/** Visitor line. The triad reading leads. The old stored score stays labeled as the old number. */
export function visitorReceiptLine(row) {
  const old = oldStoredScorePhrase(row);
  const kept = "Original receipt kept.";
  const later = laterRescoreRows(row);
  const history = Array.isArray(row && row.rescores) ? row.rescores : [];
  const latest = row && row.latest_rescore
    ? row.latest_rescore
    : (history.length ? history[history.length - 1] : null);
  const reading = row && row.published_reading ? row.published_reading : publishedReading(row);
  if (later.length) {
    const note = latest && latest.changed_note ? String(latest.changed_note) : "";
    const storedDisplay = latest && latest.display != null ? Number(latest.display) : null;
    const live = reading && reading.ready && reading.display != null ? Number(reading.display) : null;
    const shown = live != null ? live : (storedDisplay != null && Number.isFinite(storedDisplay) ? storedDisplay : "none");
    let head = "TRIAD_V3 display " + shown + ".";
    if (live != null && storedDisplay != null && Number.isFinite(storedDisplay) && live !== storedDisplay) {
      head += " The stored rescore display was " + storedDisplay + ".";
    }
    return head + " Earlier receipt was rescored. " + note + " " + old + " " + kept;
  }
  if (!reading || reading.status === "missing" || reading.status === "empty" || !reading.ready) {
    const note = reading && reading.note
      ? reading.note
      : "Stored challenge text is missing. This receipt is not scored with TRIAD_V3.";
    return note + " " + old + " " + kept;
  }
  return reading.note + " " + old + " " + kept;
}

export function debateSummary(review, text) {
  const snap = triadSnapshot(review);
  const card = scoreCard(review, text);
  if (!snap.ready) return "TRIAD_V3 did not publish a combined score for this text.";
  const line = percentLine(card);
  return "Headline " + (card.headline == null ? "none" : card.headline) + ". TRIAD_V3 display " + snap.display + ". Combined " + snap.combined + ". " + line + " The triad display is not written back into combined.";
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
