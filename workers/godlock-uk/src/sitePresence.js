/**
 * Report GodLock.uk concurrent human page viewers to the aziel-runtime SSoT.
 * Contract (fail-closed, aziel-runtime#154):
 *   POST /v1/mesh/site-presence
 *   { "host": "godlock.uk", "viewers": <int>, "kind": "human-page" }
 * Alias on the runtime: POST /v1/mesh/site-heartbeat. FragGate mesh/site-presence.
 * Prefer env.AZIEL_RUNTIME. Else HTTPS origin. Best-effort. Never invent viewers.
 * Author: Aziel Eliab.
 */
import { CATALOG } from "./seo.js";

export const SITE_PRESENCE_HOST = "godlock.uk";
export const SITE_PRESENCE_KIND = "human-page";
export const SITE_PRESENCE_PATH = "/v1/mesh/site-presence";
export const SITE_PRESENCE_ALIAS = "/v1/mesh/site-heartbeat";
export const SITE_VIEWER_CAP = 10_000;
export const SITE_PRESENCE_ORIGIN = CATALOG;
const BINDING_URL = "https://aziel-runtime" + SITE_PRESENCE_PATH;

const HEADERS = {
  "User-Agent": "Mozilla/5.0",
  Accept: "application/json",
  "Content-Type": "application/json",
};

/**
 * Exact hub body. Null when the count is not a non-negative integer within cap.
 * Over-cap is refused by runtime (not clamped) — do not invent a smaller number.
 */
export function sitePresencePayload(viewers) {
  if (typeof viewers === "boolean" || viewers == null || viewers === "") return null;
  if (typeof viewers === "string" && !/^\d+$/.test(viewers.trim())) return null;
  const n = typeof viewers === "number" ? viewers : Number(viewers);
  if (!Number.isInteger(n) || n < 0 || n > SITE_VIEWER_CAP) return null;
  return {
    host: SITE_PRESENCE_HOST,
    viewers: n,
    kind: SITE_PRESENCE_KIND,
  };
}

function originAllowed(env, deps) {
  if (deps && deps.probeOrigin != null) return !!deps.probeOrigin;
  if (env && (env.MESH_PROBE_ORIGIN === false || env.MESH_PROBE_ORIGIN === "0")) return false;
  return true;
}

async function drain(res) {
  try {
    if (res && res.body && typeof res.body.cancel === "function") await res.body.cancel();
  } catch { /* ignore */ }
}

/**
 * POST the already-computed human page count. Failures return posted:false
 * and must not be treated as a live-node figure.
 */
export async function postSitePresence(env, viewers, deps = {}) {
  const body = sitePresencePayload(viewers);
  if (!body) return { ok: false, posted: false, host: SITE_PRESENCE_HOST, viewers: null };
  const init = { method: "POST", headers: HEADERS, body: JSON.stringify(body) };
  const binding = env && env.AZIEL_RUNTIME && typeof env.AZIEL_RUNTIME.fetch === "function"
    ? env.AZIEL_RUNTIME.fetch.bind(env.AZIEL_RUNTIME)
    : null;
  const httpFetch = deps.fetch || (originAllowed(env, deps) ? globalThis.fetch : null);
  try {
    if (binding) {
      const res = await binding(new Request(BINDING_URL, init));
      const ok = !!(res && res.ok);
      await drain(res);
      return { ok, posted: true, via: "service-binding", host: body.host, viewers: body.viewers };
    }
    if (typeof httpFetch === "function") {
      const res = await httpFetch(SITE_PRESENCE_ORIGIN + SITE_PRESENCE_PATH, init);
      const ok = !!(res && res.ok);
      await drain(res);
      return { ok, posted: true, via: "origin", host: body.host, viewers: body.viewers };
    }
  } catch {
    return { ok: false, posted: false, host: body.host, viewers: body.viewers };
  }
  return { ok: false, posted: false, host: body.host, viewers: body.viewers };
}

/** Fire-and-forget. waitUntil keeps the POST alive without blocking the response. */
export function scheduleSitePresence(ctx, env, viewers, deps) {
  const p = Promise.resolve()
    .then(() => postSitePresence(env, viewers, deps))
    .catch(() => ({ ok: false, posted: false, host: SITE_PRESENCE_HOST, viewers: null }));
  if (ctx && typeof ctx.waitUntil === "function") {
    try { ctx.waitUntil(p); } catch { /* response still must not wait */ }
  }
  return p;
}
