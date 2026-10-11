/**
 * Receipt proof for the expand (drop-down) view of a public thread.
 * Hash-linked and sealed. NOT signed: there is no signature anywhere here.
 *
 * Fails closed: status is "verified" only when every ledger entry for the
 * receipt recomputes to its entry_hash, links to the entry before it, and the
 * whole ledger verifies from genesis to the head that is reported as the seal.
 * Anything else is "unverified" or "missing". Nothing is invented.
 * Author: Aziel Eliab.
 */
import { hashPayload, ZERO } from "./ledger.js";

export const PROOF_NOT_SIGNED = "Hash-linked and sealed. Not signed.";

function parse(blob) {
  try { return { ok: true, value: JSON.parse(blob || "{}") }; } catch { return { ok: false, value: {} }; }
}

/**
 * Pure. rows = every ledger row (sequence ASC, raw payload_json), id = receipt id.
 * Returns { status, receipt_hash, prev_hash, seal, sealed_at, entries, errors, not_signed }.
 */
export function buildReceiptProof(rows, id) {
  const needle = String(id || "");
  const all = Array.isArray(rows) ? rows : [];
  const errors = [];
  let expectedPrev = ZERO;
  let expectedSeq = 1;
  let head = ZERO;
  let headAt = null;
  const mine = [];
  for (const row of all) {
    const seq = Number(row.sequence);
    if (seq !== expectedSeq) errors.push("sequence gap at " + seq);
    if (String(row.previous_hash) !== expectedPrev) errors.push("previous_hash mismatch at sequence " + seq);
    const p = parse(row.payload_json);
    if (!p.ok) errors.push("payload_json not JSON at sequence " + seq);
    const recomputed = hashPayload({
      sequence: seq,
      timestamp_utc: row.timestamp_utc,
      action: row.action,
      payload: p.value,
      previous_hash: row.previous_hash,
    });
    const hashOk = p.ok && recomputed === row.entry_hash;
    if (!hashOk) errors.push("entry_hash mismatch at sequence " + seq);
    if (needle && String(row.payload_json || "").indexOf(needle) >= 0) {
      mine.push({
        sequence: seq,
        action: String(row.action),
        timestamp_utc: row.timestamp_utc,
        entry_hash: String(row.entry_hash),
        previous_hash: String(row.previous_hash),
        hash_ok: hashOk,
        link_ok: String(row.previous_hash) === expectedPrev,
      });
    }
    expectedPrev = String(row.entry_hash);
    expectedSeq = seq + 1;
    head = String(row.entry_hash);
    headAt = row.timestamp_utc;
  }
  const base = { not_signed: PROOF_NOT_SIGNED, verify_url: "/verify", entries: mine };
  if (!mine.length) {
    return { ...base, status: "missing", receipt_hash: null, prev_hash: null, seal: null, sealed_at: null, errors: ["no ledger entry for this receipt"] };
  }
  const first = mine[0];
  const chainOk = errors.length === 0 && mine.every((e) => e.hash_ok && e.link_ok);
  return {
    ...base,
    status: chainOk ? "verified" : "unverified",
    receipt_hash: first.entry_hash,
    prev_hash: first.previous_hash,
    timestamp_utc: first.timestamp_utc,
    // The seal is the ledger head the chain verified up to. Only reported when it verified.
    seal: chainOk ? head : null,
    sealed_at: chainOk ? headAt : null,
    errors,
  };
}

export async function receiptProofForId(env, id) {
  try {
    const rows = (await env.DB.prepare(
      "SELECT sequence, timestamp_utc, action, payload_json, previous_hash, entry_hash FROM ledger ORDER BY sequence ASC"
    ).all()).results || [];
    return buildReceiptProof(rows, id);
  } catch (err) {
    return { status: "missing", not_signed: PROOF_NOT_SIGNED, verify_url: "/verify", entries: [], receipt_hash: null, prev_hash: null, seal: null, sealed_at: null, errors: ["ledger read failed"] };
  }
}
