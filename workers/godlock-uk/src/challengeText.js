/**
 * Challenge-text validation for GodLock.uk submit / score paths.
 * Null is not an empty string. Empty / whitespace-only text is not scored.
 * Author: Aziel Eliab.
 */

export const TEXT_MAX = 8000;
export const CHALLENGE_KEYS = ["text", "challenge", "body"];

export const REFUSE = {
  NULL_ARG: "GODLOCK-NULL-ARG",
  EMPTY_TEXT: "GODLOCK-EMPTY-TEXT",
  RATE_LIMIT: "GODLOCK-RATE-LIMIT",
  DUP_TEXT: "GODLOCK-DUP-TEXT",
  TEXT_TOO_LARGE: "GODLOCK-TEXT-TOO-LARGE",
};

const EMPTY_MSG = "Challenge text is empty. Nothing was scored or archived.";
const NULL_MSG = "Challenge text is null or missing. Nothing was scored or archived.";
const TYPE_MSG = "Challenge text must be a string. Nothing was scored or archived.";
const LARGE_MSG = "Challenge text is too large. Nothing was scored or archived.";

/** Strip ordinary and zero-width whitespace so “whitespace-ish” cannot score. */
export function visibleChallengeText(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[\s\u200b\u200c\u200d\ufeff]/g, "");
}

export function refuseBody(code, error, extra) {
  return {
    ok: false,
    code,
    error,
    product: "GodLock",
    author: "Aziel Eliab",
    scored: false,
    archived: false,
    ...(extra || {}),
  };
}

export function validateChallengeText(value) {
  if (value === undefined || value === null) {
    return { ok: false, code: REFUSE.NULL_ARG, error: NULL_MSG, status: 400 };
  }
  if (typeof value !== "string") {
    return { ok: false, code: REFUSE.NULL_ARG, error: TYPE_MSG, status: 400 };
  }
  if (value.length > TEXT_MAX) {
    return {
      ok: false,
      code: REFUSE.TEXT_TOO_LARGE,
      error: LARGE_MSG,
      status: 413,
      max: TEXT_MAX,
    };
  }
  if (!visibleChallengeText(value)) {
    return { ok: false, code: REFUSE.EMPTY_TEXT, error: EMPTY_MSG, status: 400 };
  }
  return { ok: true, text: value };
}

function firstOwnChallenge(obj) {
  for (const key of CHALLENGE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) return { key, value: obj[key] };
  }
  return null;
}

export function inspectChallengeBody(body) {
  if (body === undefined || body === null) {
    return { ok: false, code: REFUSE.NULL_ARG, error: NULL_MSG, status: 400 };
  }
  if (typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, code: REFUSE.NULL_ARG, error: NULL_MSG, status: 400 };
  }
  const found = firstOwnChallenge(body);
  if (!found) {
    return { ok: false, code: REFUSE.NULL_ARG, error: NULL_MSG, status: 400 };
  }
  return validateChallengeText(found.value);
}

export function inspectChallengeForm(form) {
  if (!form || typeof form.has !== "function") {
    return { ok: false, code: REFUSE.NULL_ARG, error: NULL_MSG, status: 400 };
  }
  for (const key of CHALLENGE_KEYS) {
    if (form.has(key)) {
      const value = form.get(key);
      if (value != null && typeof value !== "string") {
        return { ok: false, code: REFUSE.NULL_ARG, error: TYPE_MSG, status: 400 };
      }
      return validateChallengeText(value);
    }
  }
  return { ok: false, code: REFUSE.NULL_ARG, error: NULL_MSG, status: 400 };
}

export async function readChallengeText(request) {
  const ct = (request.headers.get("Content-Type") || "").toLowerCase();
  if (ct.includes("application/json")) {
    let body;
    try {
      body = await request.json();
    } catch {
      return { ok: false, code: REFUSE.NULL_ARG, error: NULL_MSG, status: 400 };
    }
    return inspectChallengeBody(body);
  }
  if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
    const form = await request.formData().catch(() => null);
    return inspectChallengeForm(form);
  }
  const raw = await request.text().catch(() => undefined);
  if (raw === undefined) {
    return { ok: false, code: REFUSE.NULL_ARG, error: NULL_MSG, status: 400 };
  }
  const trimmed = String(raw).trim();
  if (!trimmed) return validateChallengeText(raw);
  try {
    return inspectChallengeBody(JSON.parse(raw));
  } catch {
    return validateChallengeText(raw);
  }
}

export function ChallengeRefuse(code, error, status) {
  const err = new Error(error);
  err.name = "ChallengeRefuse";
  err.code = code;
  err.status = status || 400;
  err.refused = true;
  return err;
}
