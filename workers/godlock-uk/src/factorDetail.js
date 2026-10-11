/**
 * Per-factor detail for a receipt, captured at write time from the checker's
 * own output (reviewDocument / TRIAD_V3). Nothing here calls a model or
 * invents a reason: every value and reason is copied from what the checker
 * returned. Products are the arithmetic factor_i × factor_j of those values.
 * Stored inside receipt_rescores.triad_json, which is not part of any receipt
 * or ledger hash, so existing hashes are untouched.
 * Author: Aziel Eliab.
 */
import { hashPayload } from "./ledger.js";

export const FACTOR_DETAIL_SCHEMA = "godlock.factor_detail.v1";
export const FACTOR_KEYS = ["physics", "linguistics", "bayesian", "truth_formula", "clce", "spre"];
export const NOT_STORED = "per-factor detail not stored for this receipt";
const NO_REASON = "checker returned no reason";

function pick(obj, keys) {
  const out = {};
  if (!obj || typeof obj !== "object") return out;
  for (const k of keys) {
    if (obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

/** Checker output for one factor, verbatim, limited to the fields that explain the value. */
function checkerOutput(review, key) {
  const r = review || {};
  switch (key) {
    case "spre": return { engine: "SPRE", ...pick(r.spre, ["pc", "band", "factors", "audit_flags", "kid_plain"]) };
    case "clce": return { engine: "CLCE", ...pick(r.clce, ["structural", "band", "claim_count", "evidence_span_count", "headings_present", "verified_file", "kid_plain"]) };
    case "physics": return { engine: "PLR", ...pick(r.plr, ["physics_coherence", "status", "lights", "flags", "kid_plain"]) };
    case "linguistics": return { engine: "PLR", ...pick(r.plr, ["linguistic_neutrality", "status", "lights", "flags", "kid_plain"]) };
    case "truth_formula": return { engine: "TRUTH_FORMULA", ...pick(r.truth_formula, ["score", "mode", "factors", "formula"]) };
    case "bayesian": return { engine: "BAYESIAN", ...pick(r.bayesian, ["posterior", "applied", "hits", "hypotheses", "note"]) };
    default: return {};
  }
}

function applicabilityReason(review, key) {
  const a = review && review.applicability;
  if (!a) return NO_REASON;
  const src = key === "physics" || key === "linguistics" ? a.plr : a[key];
  return src && typeof src.reason === "string" && src.reason ? src.reason : NO_REASON;
}

/** Build at write time. Returns null when the checker produced no triad. */
export function factorDetail(review) {
  const triad = review && review.triad;
  if (!triad || !triad.factors) return null;
  const flags = (review.applicability && review.applicability.flags) || {};
  const cycle = Array.isArray(triad.cycle_factors) ? triad.cycle_factors.slice() : [];
  const factors = {};
  const omitted = [];
  for (const key of FACTOR_KEYS) {
    const value = triad.factors[key] === undefined ? null : triad.factors[key];
    const applicable = cycle.includes(key);
    if (applicable) {
      factors[key] = { value, applicability_reason: applicabilityReason(review, key), checker: checkerOutput(review, key) };
    } else {
      omitted.push({ factor: key, reason: applicabilityReason(review, key), flag: flags[key] === undefined ? null : flags[key] });
    }
  }
  const pairings = [];
  for (const i of cycle) {
    for (const j of cycle) {
      pairings.push({ i, j, product: Number(triad.factors[i]) * Number(triad.factors[j]) });
    }
  }
  return {
    schema: FACTOR_DETAIL_SCHEMA,
    triad_schema: triad.schema || null,
    combined: triad.combined === undefined ? null : triad.combined,
    display: triad.display === undefined ? null : triad.display,
    cycle_factors: cycle,
    factors,
    pairings,
    omitted,
    omitted_note: "Omitted factors are not scored as 0.",
  };
}

function parse(json) {
  if (!json) return null;
  try { return JSON.parse(json); } catch { return null; }
}

/**
 * Read time, from stored rows only (no recompute). rows = receipt_rescores for
 * this receipt in created order, each with triad_json.
 */
export function storedFactorView(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const initial = list.find((r) => r && r.reason === "initial") || null;
  const snapInitial = initial ? parse(initial.triad_json) : null;
  const detail = snapInitial && snapInitial.factor_detail && snapInitial.factor_detail.schema === FACTOR_DETAIL_SCHEMA
    ? snapInitial.factor_detail
    : null;
  const changes = [];
  let prev = snapInitial;
  for (const r of list) {
    if (!r || r === initial) continue;
    const snap = parse(r.triad_json);
    const entry = { created_utc: r.created_utc, reason: r.reason, changes: null, note: null };
    if (!prev || !prev.factors || !snap || !snap.factors) {
      entry.note = NOT_STORED;
    } else {
      entry.changes = [];
      for (const key of FACTOR_KEYS) {
        const a = prev.factors[key] == null ? null : Number(prev.factors[key]);
        const b = snap.factors[key] == null ? null : Number(snap.factors[key]);
        if (a === b) continue;
        entry.changes.push({ factor: key, before: a, after: b, delta: a != null && b != null ? Math.round((b - a) * 10000) / 10000 : null });
      }
    }
    changes.push(entry);
    if (snap) prev = snap;
  }
  return { factor_detail: detail, factor_detail_note: detail ? null : NOT_STORED, rescore_factor_changes: changes };
}

export const NOT_SEALED_LABEL = "Per-factor detail is stored data. It is not covered by the seal.";
export const SEALED_LABEL = "Per-factor detail is covered by the seal: its sha256 matches factor_detail_sha256 in the sealed SUBMIT entry.";

/**
 * True only when: proof is verified, the SUBMIT ledger row for this receipt
 * matches the verified checkpoint, it carries factor_detail_sha256, and the
 * sha256 of the stored factor_detail (canonical JSON) equals it. Else false.
 */
export function factorDetailSealed(detail, ledgerRows, proof) {
  if (!detail || !proof || proof.status !== "verified") return false;
  const entries = Array.isArray(proof.entries) ? proof.entries : [];
  const rows = Array.isArray(ledgerRows) ? ledgerRows : [];
  for (const row of rows) {
    if (String(row.action) !== "SUBMIT") continue;
    let payload;
    try { payload = JSON.parse(row.payload_json || "{}"); } catch { continue; }
    const want = payload && payload.factor_detail_sha256;
    if (typeof want !== "string" || want.length !== 64) continue;
    const e = entries.find((x) => Number(x.sequence) === Number(row.sequence) && x.entry_hash === row.entry_hash);
    if (!e || !e.hash_ok || !e.in_verified_range || !e.matches_checkpoint) return false;
    return hashPayload(detail) === want;
  }
  return false;
}
