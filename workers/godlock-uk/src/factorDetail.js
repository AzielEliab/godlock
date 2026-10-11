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

/** Build at write time, normalized through JSON so the stored bytes and the hashed value agree. */
export function factorDetail(review) {
  const raw = rawFactorDetail(review);
  return raw == null ? null : JSON.parse(JSON.stringify(raw));
}

function rawFactorDetail(review) {
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
  return { factor_detail: detail, factor_detail_note: detail ? null : NOT_STORED };
}

export const NOT_SEALED_LABEL = "Per-factor detail is stored data. It is not covered by the seal.";
export const SEALED_LABEL = "Per-factor detail is covered by the seal: its sha256 matches factor_detail_sha256 in the sealed SUBMIT entry.";

/**
 * True only when: proof is verified, the SUBMIT ledger row for this receipt
 * matches the verified checkpoint, it carries factor_detail_sha256, and the
 * sha256 of the stored factor_detail (canonical JSON) equals it. Else false.
 */
export function factorDetailSealed(detail, ledgerRows, proof, match) {
  if (!detail || !proof || proof.status !== "verified") return false;
  const isMine = typeof match === "function" ? match : (row) => String(row.action) === "SUBMIT";
  const entries = Array.isArray(proof.entries) ? proof.entries : [];
  const rows = Array.isArray(ledgerRows) ? ledgerRows : [];
  for (const row of rows) {
    let payload;
    try { payload = JSON.parse(row.payload_json || "{}"); } catch { continue; }
    if (!isMine(row, payload)) continue;
    const want = payload && payload.factor_detail_sha256;
    if (typeof want !== "string" || want.length !== 64) continue;
    const e = entries.find((x) => Number(x.sequence) === Number(row.sequence) && x.entry_hash === row.entry_hash);
    if (!e || !e.hash_ok || !e.in_verified_range || !e.matches_checkpoint) return false;
    return hashPayload(detail) === want;
  }
  return false;
}

function detailOf(json) {
  const snap = parse(json);
  return snap && snap.factor_detail && snap.factor_detail.schema === FACTOR_DETAIL_SCHEMA ? snap.factor_detail : null;
}

function valueOf(d, key) {
  const f = d && d.factors ? d.factors[key] : null;
  return f && f.value != null ? Number(f.value) : null;
}

function payloadOf(row) {
  try { return JSON.parse(row.payload_json || "{}"); } catch { return null; }
}

/** One ledger row is sealed for this detail: in the verified chain and its factor_detail_sha256 matches. */
function rowSealed(row, detail, proof) {
  if (!row || !detail || !proof || proof.status !== "verified") return false;
  const p = payloadOf(row);
  const want = p && p.factor_detail_sha256;
  if (typeof want !== "string" || want.length !== 64) return false;
  const e = (Array.isArray(proof.entries) ? proof.entries : [])
    .find((x) => Number(x.sequence) === Number(row.sequence) && x.entry_hash === row.entry_hash);
  if (!e || !e.hash_ok || !e.in_verified_range || !e.matches_checkpoint) return false;
  return hashPayload(detail) === want;
}

/**
 * Rescore lines ordered and paired by the hashed ledger, never by unhashed
 * receipt_rescores fields. history = receipt_rescores rows (any order; used
 * only to look up stored detail by id). ledgerRows = this receipt's ledger rows.
 * Line i compares the detail sealed by RESCORE row i with the detail sealed by
 * the immediately preceding SUBMIT/RESCORE row for this receipt_id (adjacent in
 * the filtered seq order, so nothing can sit between them). Labels and reason
 * come from the hashed ledger row. Rescores with no ledger row are listed last
 * as not covered.
 */
export function ledgerRescoreLines(history, ledgerRows, proof, receiptId) {
  const hist = Array.isArray(history) ? history : [];
  const byId = new Map();
  let initialDetail = null;
  for (const h of hist) {
    if (!h) continue;
    if (h.reason === "initial") initialDetail = detailOf(h.triad_json);
    else if (h.id != null) byId.set(String(h.id), h);
  }
  const rid = String(receiptId || "");
  const chain = (Array.isArray(ledgerRows) ? ledgerRows : [])
    .map((row) => ({ row, p: payloadOf(row) }))
    .filter(({ row, p }) => p && (!rid || p.receipt_id === rid) && (row.action === "SUBMIT" || row.action === "RESCORE"))
    .sort((x, y) => Number(x.row.sequence) - Number(y.row.sequence));
  const lines = [];
  const seen = new Set();
  let prev = null; // { row, detail }
  for (const { row, p } of chain) {
    if (row.action === "SUBMIT") { prev = { row, detail: initialDetail }; continue; }
    const id = p.rescore_id == null ? null : String(p.rescore_id);
    const h = id ? byId.get(id) : null;
    if (id) seen.add(id);
    const detail = h ? detailOf(h.triad_json) : null;
    const line = {
      id,
      ledger_seq: Number(row.sequence),
      ledger_timestamp_utc: row.timestamp_utc,
      reason: typeof p.reason === "string" ? p.reason : null,
      changes: null,
      note: null,
      sealed: false,
    };
    if (!prev || !prev.detail || !detail) {
      line.note = NOT_STORED;
    } else {
      line.changes = [];
      for (const key of FACTOR_KEYS) {
        const x = valueOf(prev.detail, key);
        const y = valueOf(detail, key);
        if (x === y) continue;
        line.changes.push({ factor: key, before: x, after: y, delta: x != null && y != null ? Math.round((y - x) * 10000) / 10000 : null });
      }
    }
    line.sealed = !!prev && rowSealed(row, detail, proof) && rowSealed(prev.row, prev.detail, proof);
    lines.push(line);
    prev = { row, detail };
  }
  for (const [id] of byId) {
    if (seen.has(id)) continue;
    lines.push({ id, ledger_seq: null, ledger_timestamp_utc: null, reason: null, changes: null, note: "no ledger entry for this rescore", sealed: false });
  }
  return lines;
}

/**
 * Summary/explanation are covered only when the SUBMIT row is in the verified
 * chain and its content_sha256 equals the hash recomputed from the stored
 * receipt row (hashFn = engine.hashReceipt). Else false.
 */
export function reasoningSealed(receiptRow, ledgerRows, proof, hashFn) {
  if (!receiptRow || !proof || proof.status !== "verified" || typeof hashFn !== "function") return false;
  const sub = (Array.isArray(ledgerRows) ? ledgerRows : []).find((r) => String(r.action) === "SUBMIT");
  if (!sub) return false;
  const p = payloadOf(sub);
  if (!p || typeof p.content_sha256 !== "string") return false;
  const e = (Array.isArray(proof.entries) ? proof.entries : [])
    .find((x) => Number(x.sequence) === Number(sub.sequence) && x.entry_hash === sub.entry_hash);
  if (!e || !e.hash_ok || !e.in_verified_range || !e.matches_checkpoint) return false;
  let h;
  try { h = hashFn(receiptRow); } catch { return false; }
  return h === p.content_sha256;
}
