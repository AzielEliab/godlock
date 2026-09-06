/**
 * Same-origin /runtime API use tracker (host log).
 * Counts FragGate / MCP / session / pull / v1 traffic on this door only.
 * Not GodLock product Uses (those stay SUBMIT/ISOLATE on the receipt ledger).
 * Author: Aziel Eliab.
 */
import { AUTHOR, CANON_HOST, CATALOG, LIBRARY_RUNTIME, PUBLIC_RUNTIME } from "./seo.js";

const RUNTIME_ORIGIN = CATALOG;

function usesCors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, X-Aziel-Runtime-Token, MCP-Protocol-Version, mcp-session-id",
    "Access-Control-Expose-Headers": "X-Aziel-Runtime-Version, X-Aziel-Runtime-Role, X-Aziel-Runtime-Root, X-Aziel-Runtime-Via",
  };
}

export const RUNTIME_VIA_HOST = "godlock.uk";
export const USES_PREFIX = "runtime_uses|";
export const USES_KEY_TOTAL = USES_PREFIX + "total";
export const USES_KEY_BY_PATH = USES_PREFIX + "by_path";
export const USES_KEY_RECENT = USES_PREFIX + "recent";
export const USES_RECENT_MAX = 24;

const SEO_STATIC = new Set([
  "/cite.json",
  "/llms.txt",
  "/ai.txt",
  "/robots.txt",
  "/sitemap.xml",
  "/sitemap-index.xml",
  "/sigil.png",
  "/glama.json",
]);

export function normalizeDestPath(pathname) {
  let p = String(pathname || "").split("?")[0];
  if (!p.startsWith("/")) p = "/" + p;
  p = p.replace(/\/+$/, "") || "/";
  return p;
}

/** Collapse unbounded path segments so KV keys stay bounded. */
export function bucketRuntimePath(pathname) {
  let p = normalizeDestPath(pathname);
  p = p.replace(/^\/v1\/session\/[^/]+/, "/v1/session/*");
  return p;
}

export function isRuntimeUsesPath(pathname) {
  const p = normalizeDestPath(pathname);
  return p === "/v1/uses";
}

export function shouldCountRuntimeUse(method, destPath) {
  const m = String(method || "GET").toUpperCase();
  if (m === "OPTIONS") return false;
  const p = normalizeDestPath(destPath);
  if (!p || p === "/") return false;
  if (isRuntimeUsesPath(p)) return false;
  if (SEO_STATIC.has(p)) return false;
  if ((m === "GET" || m === "HEAD") && (p === "/v1/health" || p === "/v1/ready")) return false;
  if (p === "/mcp" || p.startsWith("/mcp/")) return true;
  if (p === "/openapi.json") return true;
  if (p.startsWith("/v1/")) return true;
  if (p.startsWith("/p/")) return true;
  return false;
}

/** Prefer RUNTIME_USES; fall back to DOWNLOADS so one existing KV can host the prefix. */
export function kvForRuntimeUses(env) {
  if (env && env.RUNTIME_USES && typeof env.RUNTIME_USES.get === "function") return env.RUNTIME_USES;
  if (env && env.DOWNLOADS && typeof env.DOWNLOADS.get === "function") return env.DOWNLOADS;
  return null;
}

export function stampRuntimeVia(headers) {
  const out = headers instanceof Headers ? headers : new Headers(headers || {});
  out.set("X-Aziel-Runtime-Via", RUNTIME_VIA_HOST);
  return out;
}

async function readJson(kv, key, fallback) {
  try {
    const raw = await kv.get(key);
    if (raw == null || raw === "") return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function recordRuntimeUse(env, method, destPath) {
  const kv = kvForRuntimeUses(env);
  if (!kv) return null;
  const path = bucketRuntimePath(destPath);
  if (!shouldCountRuntimeUse(method, path)) return null;
  try {
    const total = (parseInt(await kv.get(USES_KEY_TOTAL), 10) || 0) + 1;
    await kv.put(USES_KEY_TOTAL, String(total));
    const rawMap = await readJson(kv, USES_KEY_BY_PATH, {});
    const map = rawMap && typeof rawMap === "object" && !Array.isArray(rawMap) ? rawMap : {};
    map[path] = (parseInt(map[path], 10) || 0) + 1;
    await kv.put(USES_KEY_BY_PATH, JSON.stringify(map));
    let recent = await readJson(kv, USES_KEY_RECENT, []);
    if (!Array.isArray(recent)) recent = [];
    recent.unshift({
      t: new Date().toISOString(),
      method: String(method || "GET").toUpperCase(),
      path,
    });
    await kv.put(USES_KEY_RECENT, JSON.stringify(recent.slice(0, USES_RECENT_MAX)));
    return { uses: total, path };
  } catch {
    return null;
  }
}

export function scheduleRuntimeUse(ctx, work) {
  const p = Promise.resolve().then(() => work()).catch(() => null);
  if (ctx && typeof ctx.waitUntil === "function") {
    ctx.waitUntil(p);
    return null;
  }
  return p;
}

async function fetchOriginUses(env) {
  if (!env || !env.AZIEL_RUNTIME || typeof env.AZIEL_RUNTIME.fetch !== "function") return null;
  try {
    const dest = new URL("/v1/uses", RUNTIME_ORIGIN + "/");
    const headers = stampRuntimeVia(new Headers({
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
    }));
    const res = await env.AZIEL_RUNTIME.fetch(new Request(dest.toString(), { method: "GET", headers }));
    if (!res || !res.ok) {
      try { if (res && res.body && typeof res.body.cancel === "function") await res.body.cancel(); } catch { /* ignore */ }
      return null;
    }
    const ct = String(res.headers.get("Content-Type") || "").toLowerCase();
    if (!ct.includes("json")) {
      try { if (res.body && typeof res.body.cancel === "function") await res.body.cancel(); } catch { /* ignore */ }
      return null;
    }
    const doc = await res.json();
    if (!doc || typeof doc !== "object" || Array.isArray(doc)) return null;
    return doc;
  } catch {
    return null;
  }
}

export async function readRuntimeUses(env) {
  const kv = kvForRuntimeUses(env);
  let uses = 0;
  let by_path = {};
  let recent = [];
  if (kv) {
    uses = parseInt(await kv.get(USES_KEY_TOTAL), 10) || 0;
    const map = await readJson(kv, USES_KEY_BY_PATH, {});
    by_path = map && typeof map === "object" && !Array.isArray(map) ? map : {};
    const rows = await readJson(kv, USES_KEY_RECENT, []);
    recent = Array.isArray(rows) ? rows.slice(0, USES_RECENT_MAX) : [];
  }
  const body = {
    ok: true,
    host: RUNTIME_VIA_HOST,
    via: RUNTIME_VIA_HOST,
    uses,
    by_path,
    recent,
    author: AUTHOR,
    identity: AUTHOR,
    kind: "runtime-host",
    note: "API uses through the same-origin /runtime door. Not GodLock product Uses (ledger SUBMIT/ISOLATE on /stats and /count).",
    product_uses: CANON_HOST + "/stats",
    godlock_runtime: PUBLIC_RUNTIME,
    library_runtime: LIBRARY_RUNTIME,
    origin_runtime: RUNTIME_ORIGIN + "/",
  };
  const origin = await fetchOriginUses(env);
  if (origin) body.origin = origin;
  return body;
}

export async function handleRuntimeUses(request, env) {
  const body = await readRuntimeUses(env);
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "X-Aziel-Runtime-Via": RUNTIME_VIA_HOST,
    "X-Aziel-Runtime-Root": PUBLIC_RUNTIME,
    "X-Aziel-Runtime-Host": CANON_HOST,
    ...usesCors(),
  };
  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }
  return new Response(JSON.stringify(body, null, 2), { status: 200, headers });
}
