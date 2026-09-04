/**
 * Heartbeat presence + submission tally helpers.
 * Live Nodes = distinct sessions with a heartbeat inside PRESENCE_TTL_MS.
 * Submissions = receipts (fallback: ledger SUBMIT/ISOLATE, then metadata uses).
 * Author: Aziel Eliab.
 */

export const PRESENCE_TTL_MS = 5 * 60 * 1000;
export const PRESENCE_CLEANUP_MS = 15 * 60 * 1000;

export function liveNodeCountFromDb(dbCount, justTouched) {
  const n = Number(dbCount);
  const count = Number.isFinite(n) ? Math.max(0, n) : 0;
  if (justTouched && count < 1) return 1;
  return count;
}

export function submissionCountFromRows({ receipts, ledgerSubmits, uses } = {}) {
  const r = Number(receipts);
  if (Number.isFinite(r) && r > 0) return r;
  const l = Number(ledgerSubmits);
  if (Number.isFinite(l) && l > 0) return l;
  const u = Number(uses);
  return Number.isFinite(u) && u > 0 ? u : 0;
}

export function presenceCutoff(nowMs = Date.now()) {
  return {
    sinceMs: nowMs - PRESENCE_TTL_MS,
    sinceIso: new Date(nowMs - PRESENCE_TTL_MS).toISOString(),
    cleanupMs: nowMs - PRESENCE_CLEANUP_MS,
    cleanupIso: new Date(nowMs - PRESENCE_CLEANUP_MS).toISOString(),
  };
}
