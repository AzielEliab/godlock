/**
 * Append-only hash-chain ledger matching aziel_library/core.py _ledger.
 * previous_hash = last entry_hash or 64 zeros.
 * Canonical JSON: sorted keys, separators comma-colon, WITHOUT entry_hash.
 * entry_hash = sha256(that).
 * Author: Aziel Eliab.
 */
import { createHash } from "node:crypto";
import { hideInternalDetermination } from "./publicCopy.js";

export const ZERO = "0".repeat(64);

export function canonicalJson(value) {
  if (value === null || value === undefined) return "null";
  const t = typeof value;
  if (t === "number") {
    if (!Number.isFinite(value)) return "null";
    return JSON.stringify(value);
  }
  if (t === "boolean") return value ? "true" : "false";
  if (t === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonicalJson).join(",") + "]";
  if (t === "object") {
    const keys = Object.keys(value).sort();
    return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalJson(value[k])).join(",") + "}";
  }
  return JSON.stringify(String(value));
}

export function sha256hex(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

export function hashPayload(obj) {
  return sha256hex(canonicalJson(obj));
}

export async function ensureLedger(env) {
  if (!env || !env.DB) return;
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS ledger (sequence INTEGER PRIMARY KEY, timestamp_utc TEXT NOT NULL, action TEXT NOT NULL, payload_json TEXT NOT NULL, previous_hash TEXT NOT NULL, entry_hash TEXT NOT NULL)"
  ).run();
}

async function lastEntry(env) {
  const row = await env.DB.prepare("SELECT sequence, entry_hash FROM ledger ORDER BY sequence DESC LIMIT 1").first();
  if (!row) return { sequence: 0, entry_hash: ZERO };
  return { sequence: Number(row.sequence) || 0, entry_hash: String(row.entry_hash || ZERO) };
}

export async function appendLedger(env, action, payload) {
  await ensureLedger(env);
  const body = payload && typeof payload === "object" ? payload : {};
  let lastErr = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const prev = await lastEntry(env);
    const sequence = prev.sequence + 1;
    const timestamp_utc = new Date().toISOString();
    const previous_hash = prev.entry_hash || ZERO;
    const entry = { sequence, timestamp_utc, action: String(action), payload: body, previous_hash };
    const entry_hash = hashPayload(entry);
    try {
      await env.DB.prepare(
        "INSERT INTO ledger(sequence, timestamp_utc, action, payload_json, previous_hash, entry_hash) VALUES(?,?,?,?,?,?)"
      ).bind(sequence, timestamp_utc, String(action), canonicalJson(body), previous_hash, entry_hash).run();
      return { ...entry, entry_hash };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("ledger append failed");
}

export async function verifyLedger(env) {
  await ensureLedger(env);
  const rows = (await env.DB.prepare(
    "SELECT sequence, timestamp_utc, action, payload_json, previous_hash, entry_hash FROM ledger ORDER BY sequence ASC"
  ).all()).results || [];
  const errors = [];
  let expectedPrev = ZERO;
  let expectedSeq = 1;
  let head = ZERO;
  for (const row of rows) {
    const seq = Number(row.sequence);
    if (seq !== expectedSeq) errors.push("sequence gap at " + seq + " expected " + expectedSeq);
    if (String(row.previous_hash) !== expectedPrev) errors.push("previous_hash mismatch at sequence " + seq);
    let payload = {};
    try {
      payload = JSON.parse(row.payload_json || "{}");
    } catch {
      errors.push("payload_json not JSON at sequence " + seq);
    }
    const recomputed = hashPayload({
      sequence: seq,
      timestamp_utc: row.timestamp_utc,
      action: row.action,
      payload,
      previous_hash: row.previous_hash,
    });
    if (recomputed !== row.entry_hash) errors.push("entry_hash mismatch at sequence " + seq);
    expectedPrev = row.entry_hash;
    expectedSeq = seq + 1;
    head = row.entry_hash;
  }
  return { ok: errors.length === 0, entries: rows.length, ledger_head: head, errors };
}

export async function recentLedger(env, limit) {
  await ensureLedger(env);
  const n = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const rows = (await env.DB.prepare(
    "SELECT sequence, timestamp_utc, action, payload_json, previous_hash, entry_hash FROM ledger ORDER BY sequence DESC LIMIT ?"
  ).bind(n).all()).results || [];
  return rows.map(publicEntry);
}

export async function ledgerEntriesForId(env, id) {
  await ensureLedger(env);
  const needle = String(id || "");
  if (!needle) return [];
  const rows = (await env.DB.prepare(
    "SELECT sequence, timestamp_utc, action, payload_json, previous_hash, entry_hash FROM ledger ORDER BY sequence ASC"
  ).all()).results || [];
  const out = [];
  for (const row of rows) {
    const blob = row.payload_json || "";
    if (blob.indexOf(needle) >= 0) out.push(publicEntry(row));
  }
  return out;
}

function publicEntry(row) {
  let payload = {};
  try { payload = JSON.parse(row.payload_json || "{}"); } catch { payload = {}; }
  const safe = { ...payload };
  delete safe.salt_b64;
  delete safe.hash_b64;
  delete safe.password;
  delete safe.token;
  delete safe.weighing;
  for (const k of Object.keys(safe)) {
    if (typeof safe[k] === "string") safe[k] = hideInternalDetermination(safe[k]);
  }
  return {
    sequence: row.sequence,
    timestamp_utc: row.timestamp_utc,
    action: row.action,
    payload: safe,
    previous_hash: row.previous_hash,
    entry_hash: row.entry_hash,
  };
}
