/**
 * Honest submit anti-spam for GodLock.uk.
 * Per-IP / fingerprint window + identical-text sha256 window.
 * No captcha vendor. Author: Aziel Eliab.
 */
import { sha256hex } from "./ledger.js";
import { REFUSE } from "./challengeText.js";

export const SUBMIT_RATE_WINDOW_MS = 60 * 1000;
export const SUBMIT_RATE_MAX = 8;
export const SUBMIT_DUP_WINDOW_MS = 120 * 1000;

const RATE_MSG = "Too many submits from this client. Try again shortly.";
const DUP_MSG = "Identical challenge text was already submitted. Try again shortly.";

export function submitFingerprint(request) {
  const ip = request.headers.get("CF-Connecting-IP")
    || (request.headers.get("X-Forwarded-For") || "").split(",")[0].trim()
    || "";
  const ua = request.headers.get("User-Agent") || "";
  return sha256hex(ip + "|" + ua).slice(0, 32);
}

function retryAfterSec(lastMs, windowMs, nowMs) {
  const remain = windowMs - (nowMs - Number(lastMs || 0));
  return Math.max(1, Math.ceil(remain / 1000));
}

async function readGuard(env, kind, key) {
  if (!env || !env.DB) return null;
  try {
    return await env.DB.prepare(
      "SELECT last_ms, count FROM submit_guard WHERE kind=? AND key=?",
    ).bind(kind, key).first();
  } catch {
    return null;
  }
}

async function writeGuard(env, kind, key, lastMs, count) {
  if (!env || !env.DB) return;
  await env.DB.prepare(
    "INSERT INTO submit_guard(kind, key, last_ms, count) VALUES(?, ?, ?, ?) ON CONFLICT(kind, key) DO UPDATE SET last_ms=excluded.last_ms, count=excluded.count",
  ).bind(kind, key, lastMs, count).run();
}

async function cleanupGuard(env, nowMs) {
  if (!env || !env.DB) return;
  const cut = nowMs - Math.max(SUBMIT_RATE_WINDOW_MS, SUBMIT_DUP_WINDOW_MS) * 2;
  try {
    await env.DB.prepare("DELETE FROM submit_guard WHERE last_ms < ?").bind(cut).run();
  } catch { /* first run */ }
}

export async function checkSubmitGuard(env, request, text, nowMs = Date.now()) {
  const fingerprint = submitFingerprint(request);
  const textSha256 = sha256hex(String(text));
  await cleanupGuard(env, nowMs);

  const ipRow = await readGuard(env, "ip", fingerprint);
  if (ipRow && (nowMs - Number(ipRow.last_ms || 0)) < SUBMIT_RATE_WINDOW_MS) {
    const n = Number(ipRow.count) || 0;
    if (n >= SUBMIT_RATE_MAX) {
      return {
        ok: false,
        code: REFUSE.RATE_LIMIT,
        error: RATE_MSG,
        status: 429,
        retryAfter: retryAfterSec(ipRow.last_ms, SUBMIT_RATE_WINDOW_MS, nowMs),
        fingerprint,
        text_sha256: textSha256,
      };
    }
  }

  const hashRow = await readGuard(env, "hash", textSha256);
  if (hashRow && (nowMs - Number(hashRow.last_ms || 0)) < SUBMIT_DUP_WINDOW_MS) {
    return {
      ok: false,
      code: REFUSE.DUP_TEXT,
      error: DUP_MSG,
      status: 429,
      retryAfter: retryAfterSec(hashRow.last_ms, SUBMIT_DUP_WINDOW_MS, nowMs),
      fingerprint,
      text_sha256: textSha256,
    };
  }

  const ipCount = ipRow && (nowMs - Number(ipRow.last_ms || 0)) < SUBMIT_RATE_WINDOW_MS
    ? (Number(ipRow.count) || 0) + 1
    : 1;
  try {
    await writeGuard(env, "ip", fingerprint, nowMs, ipCount);
    await writeGuard(env, "hash", textSha256, nowMs, 1);
  } catch { /* schema not ready; submit itself needs D1 */ }

  return { ok: true, fingerprint, text_sha256: textSha256 };
}
