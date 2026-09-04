/**
 * Heartbeat presence + Uses tally helpers.
 * Live Nodes = distinct sessions with a heartbeat inside PRESENCE_TTL_MS.
 * Uses = ledger SUBMIT + ISOLATE only (real submissions on the receipt ledger).
 * Heartbeats and page views do not increment Uses. Author: Aziel Eliab.
 */

export const PRESENCE_TTL_MS = 5 * 60 * 1000;
export const PRESENCE_CLEANUP_MS = 15 * 60 * 1000;

export function liveNodeCountFromDb(dbCount, justTouched) {
  const n = Number(dbCount);
  const count = Number.isFinite(n) ? Math.max(0, n) : 0;
  if (justTouched && count < 1) return 1;
  return count;
}

/** Uses = ledgered submissions only. Receipts or metadata without ledger rows do not count. */
export function usesCountFromLedger({ ledgerSubmits } = {}) {
  const l = Number(ledgerSubmits);
  if (!Number.isFinite(l) || l < 0) return 0;
  return l;
}

export function presenceCutoff(nowMs = Date.now()) {
  return {
    sinceMs: nowMs - PRESENCE_TTL_MS,
    sinceIso: new Date(nowMs - PRESENCE_TTL_MS).toISOString(),
    cleanupMs: nowMs - PRESENCE_CLEANUP_MS,
    cleanupIso: new Date(nowMs - PRESENCE_CLEANUP_MS).toISOString(),
  };
}
