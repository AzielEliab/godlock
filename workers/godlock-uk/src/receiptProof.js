/**
 * Receipt proof for the expand (drop-down) view of a public thread.
 * Hash-linked and sealed. NOT signed: there is no signature anywhere here.
 *
 * D1 cost: a verified checkpoint {seq, hash, count, at} is cached per isolate
 * and in the Cache API (no KV writes). Each request does a one-row head probe
 * (ORDER BY sequence DESC LIMIT 1), verifies only rows after the checkpoint,
 * and reads this receipt's rows by the indexed receipt_id expression.
 * The checkpoint keeps the verified entry_hash for every seq (~64 B/row,
 * ~4.5 KB today) so receipt rows are matched against verified hashes, not just
 * re-hashed in isolation. TODO when the ledger grows large: replace the full
 * hash list with a Merkle root plus per-row inclusion paths.
 *
 * Fails closed: "verified" only when the chain verifies up to the probed head,
 * the row count read equals head.seq - checkpoint.seq, and every receipt row
 * recomputes to its entry_hash inside the verified range. Otherwise
 * "unverified" or "missing", with no seal. Nothing is invented.
 * Author: Aziel Eliab.
 */
import { hashPayload, ZERO } from "./ledger.js";

export const PROOF_NOT_SIGNED = "Hash-linked and sealed. Not signed.";
export const VERIFY_PATH = "/verify";
export const CHECKPOINT_CACHE_URL = "https://godlock.uk/__ledger-checkpoint/v1";
export const RECEIPT_ID_EXPR = "json_extract(payload_json, '$.receipt_id')";
export const RECEIPT_ID_INDEX_SQL = "CREATE INDEX IF NOT EXISTS idx_ledger_receipt_id ON ledger(" + RECEIPT_ID_EXPR + ")";
const COLS = "sequence, timestamp_utc, action, payload_json, previous_hash, entry_hash";
export const HEAD_SQL = "SELECT sequence, entry_hash, timestamp_utc FROM ledger ORDER BY sequence DESC LIMIT 1";
export const TAIL_SQL = "SELECT " + COLS + " FROM ledger WHERE sequence > ? ORDER BY sequence ASC";
export const BY_RECEIPT_SQL = "SELECT " + COLS + " FROM ledger WHERE " + RECEIPT_ID_EXPR + " = ? ORDER BY sequence ASC";

const GENESIS = { seq: 0, hash: ZERO, count: 0, at: null, hashes: [] };
let isolateCheckpoint = null;
let indexEnsured = false;

export function _resetProofCache() { isolateCheckpoint = null; indexEnsured = false; }

function parse(blob) {
  try { return { ok: true, value: JSON.parse(blob || "{}") }; } catch { return { ok: false, value: {} }; }
}

export function rowHashOk(row) {
  const p = parse(row.payload_json);
  if (!p.ok) return false;
  return hashPayload({
    sequence: Number(row.sequence),
    timestamp_utc: row.timestamp_utc,
    action: row.action,
    payload: p.value,
    previous_hash: row.previous_hash,
  }) === row.entry_hash;
}

/** Pure. Verify rows continuing from checkpoint cp up to head. */
export function verifyForward(cp, rows, head) {
  const errors = [];
  const list = Array.isArray(rows) ? rows : [];
  let prev = cp.hash;
  let seq = cp.seq;
  let at = cp.at;
  const hashes = (cp.hashes || []).slice();
  for (const row of list) {
    const s = Number(row.sequence);
    if (s !== seq + 1) errors.push("sequence gap at " + s);
    if (String(row.previous_hash) !== prev) errors.push("previous_hash mismatch at sequence " + s);
    if (!rowHashOk(row)) errors.push("entry_hash mismatch at sequence " + s);
    prev = String(row.entry_hash);
    hashes.push(prev);
    seq = s;
    at = row.timestamp_utc;
  }
  const headSeq = head ? Number(head.sequence) : 0;
  const headHash = head ? String(head.entry_hash) : ZERO;
  if (list.length !== headSeq - cp.seq) errors.push("partial read: got " + list.length + " rows, head expects " + (headSeq - cp.seq));
  if (seq !== headSeq || prev !== headHash) errors.push("chain does not end at probed head");
  if (errors.length) return { ok: false, errors };
  return { ok: true, errors, checkpoint: { seq: headSeq, hash: headHash, count: headSeq, at, hashes } };
}

function validCheckpoint(cp) {
  return !!cp && Number.isInteger(cp.seq) && cp.seq >= 0 && typeof cp.hash === "string" && cp.hash.length === 64
    && cp.count === cp.seq && Array.isArray(cp.hashes) && cp.hashes.length === cp.seq
    && (cp.seq === 0 || cp.hashes[cp.seq - 1] === cp.hash);
}

async function loadCheckpoint() {
  if (validCheckpoint(isolateCheckpoint)) return isolateCheckpoint;
  try {
    if (typeof caches !== "undefined" && caches.default) {
      const hit = await caches.default.match(CHECKPOINT_CACHE_URL);
      if (hit) {
        const cp = await hit.json();
        if (validCheckpoint(cp)) { isolateCheckpoint = cp; return cp; }
      }
    }
  } catch { /* cache miss is fine */ }
  return null;
}

async function storeCheckpoint(cp) {
  isolateCheckpoint = cp;
  try {
    if (typeof caches !== "undefined" && caches.default) {
      await caches.default.put(CHECKPOINT_CACHE_URL, new Response(JSON.stringify(cp), {
        headers: { "Content-Type": "application/json", "Cache-Control": "max-age=86400" },
      }));
    }
  } catch { /* isolate copy still holds */ }
}

/** Verified head: cached checkpoint forward to the probed head, else full re-verify. */
export async function verifiedHead(env) {
  const head = await env.DB.prepare(HEAD_SQL).first();
  const headSeq = head ? Number(head.sequence) : 0;
  const headHash = head ? String(head.entry_hash) : ZERO;
  let cp = await loadCheckpoint();
  if (cp && (cp.seq > headSeq)) cp = null;
  if (cp && cp.seq === headSeq) {
    if (cp.hash === headHash) return { ok: true, checkpoint: cp, errors: [] };
    cp = null;
  }
  const tryFrom = async (from) => {
    const rows = (await env.DB.prepare(TAIL_SQL).bind(from.seq).all()).results || [];
    return verifyForward(from, rows, head);
  };
  let res = cp ? await tryFrom(cp) : null;
  if (!res || !res.ok) {
    // Checkpoint stale or forked away: re-verify from genesis once.
    isolateCheckpoint = null;
    res = await tryFrom(GENESIS);
  }
  if (!res.ok) return { ok: false, checkpoint: null, errors: res.errors };
  await storeCheckpoint(res.checkpoint);
  return { ok: true, checkpoint: res.checkpoint, errors: [] };
}

/**
 * A receipt row counts only if its entry_hash equals the verified hash saved at
 * its seq and its previous_hash equals the verified hash at seq-1. This catches
 * a row below the checkpoint that was rewritten with a recomputed entry_hash.
 */
export function matchesCheckpoint(cp, r) {
  if (!cp || !Array.isArray(cp.hashes)) return false;
  const seq = Number(r.sequence);
  if (!Number.isInteger(seq) || seq < 1 || seq > cp.hashes.length) return false;
  const expectPrev = seq === 1 ? ZERO : cp.hashes[seq - 2];
  return String(r.entry_hash) === cp.hashes[seq - 1] && String(r.previous_hash) === expectPrev;
}

/** Pure. Build the proof from the verified head and this receipt's rows. */
export function buildReceiptProof(headResult, receiptRows) {
  const base = { not_signed: PROOF_NOT_SIGNED, verify_url: VERIFY_PATH };
  const rows = Array.isArray(receiptRows) ? receiptRows : [];
  const cp = headResult && headResult.ok ? headResult.checkpoint : null;
  const entries = rows.map((r) => ({
    sequence: Number(r.sequence),
    action: String(r.action),
    timestamp_utc: r.timestamp_utc,
    entry_hash: String(r.entry_hash),
    previous_hash: String(r.previous_hash),
    hash_ok: rowHashOk(r),
    in_verified_range: !!cp && Number(r.sequence) <= cp.seq,
    matches_checkpoint: matchesCheckpoint(cp, r),
  }));
  const errors = (headResult && headResult.errors) ? headResult.errors.slice() : [];
  if (!entries.length) {
    return { ...base, entries, status: "missing", receipt_hash: null, prev_hash: null, seal: null, sealed_at: null, errors: errors.concat(["no ledger entry for this receipt"]) };
  }
  const first = entries[0];
  const ok = !!cp && entries.every((e) => e.hash_ok && e.in_verified_range && e.matches_checkpoint);
  if (!ok && !errors.length) errors.push("receipt entry not inside verified chain");
  return {
    ...base,
    entries,
    status: ok ? "verified" : "unverified",
    receipt_hash: first.entry_hash,
    prev_hash: first.previous_hash,
    timestamp_utc: first.timestamp_utc,
    seal: ok ? cp.hash : null,
    sealed_at: ok ? cp.at : null,
    sealed_seq: ok ? cp.seq : null,
    errors,
  };
}

// Fallback only. The real index ships as migrations/0001_ledger_receipt_id_index.sql.
async function ensureReceiptIndex(env) {
  if (indexEnsured) return;
  await env.DB.prepare(RECEIPT_ID_INDEX_SQL).run();
  indexEnsured = true;
}

/** One indexed read of this receipt's ledger rows. Exact receipt_id match, never substring. */
export async function receiptLedgerRows(env, id) {
  const needle = String(id || "");
  if (!needle) return [];
  try { await ensureReceiptIndex(env); } catch { /* query still exact without index */ }
  return (await env.DB.prepare(BY_RECEIPT_SQL).bind(needle).all()).results || [];
}

/** Returns { rows, proof }. rows feed the public ledger list; proof fails closed. */
export async function receiptLedgerAndProof(env, id) {
  let rows = [];
  try {
    rows = await receiptLedgerRows(env, id);
  } catch {
    return { rows: [], proof: { status: "missing", not_signed: PROOF_NOT_SIGNED, verify_url: VERIFY_PATH, entries: [], receipt_hash: null, prev_hash: null, seal: null, sealed_at: null, errors: ["ledger read failed"] } };
  }
  let head;
  try { head = await verifiedHead(env); } catch { head = { ok: false, checkpoint: null, errors: ["ledger head read failed"] }; }
  return { rows, proof: buildReceiptProof(head, rows) };
}
