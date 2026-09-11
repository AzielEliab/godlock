/**
 * Same-origin /runtime door on GodLock.uk.
 * Mirrors the Digital Library proxy (service binding AZIEL_RUNTIME, else HTTPS
 * origin) so assistants find GodLock → Runtime without a stale HTML copy.
 * Author: Aziel Eliab.
 */
import {
  AUTHOR, CANON_HOST, CATALOG, LIBRARY_RUNTIME, PUBLIC_RUNTIME, RUNTIME_PATH,
  RUNTIME_VERSION, FRAGGATE_KERNEL, runtimeSameAs, runtimeSoftwareNode,
  runtimeWebApiNode, personNode, defaultDescription, runtimeDistribution,
  ecosystemLinks, personRef, AZIEL_PERSON_ID,
} from "./seo.js";
import { navItems } from "./ui.js";
import {
  handleRuntimeUses,
  isRuntimeUsesPath,
  recordRuntimeUse,
  scheduleRuntimeUse,
  shouldCountRuntimeUse,
  stampRuntimeVia,
} from "./runtimeUses.js";

export const RUNTIME_ORIGIN = CATALOG;
const UA = "Mozilla/5.0";

const HOP = new Set([
  "host", "connection", "keep-alive", "transfer-encoding", "content-length",
  "content-encoding", "te", "trailer", "upgrade", "proxy-connection",
]);

const PREFIX_PATHS = [
  "/v1/",
  "/openapi.json",
  "/mcp",
  "/cite.json",
  "/llms.txt",
  "/ai.txt",
  "/robots.txt",
  "/sitemap.xml",
  "/sitemap-index.xml",
  "/p/",
  "/sigil.png",
  "/glama.json",
];

export function isRuntimeRequest(pathname) {
  const p = String(pathname || "").replace(/\/+$/, "") || "/";
  return p === RUNTIME_PATH || String(pathname || "").startsWith(RUNTIME_PATH + "/");
}

export function destFromRuntimePath(pathname, search) {
  const raw = String(pathname || "");
  const q = search || "";
  if (raw === RUNTIME_PATH || raw === RUNTIME_PATH + "/") return "/" + q;
  if (!raw.startsWith(RUNTIME_PATH + "/")) return null;
  return raw.slice(RUNTIME_PATH.length) + q;
}

export function shouldPrefixRuntimePath(path) {
  const p = String(path || "");
  if (!p.startsWith("/") || p.startsWith("//") || p.startsWith(RUNTIME_PATH + "/") || p === RUNTIME_PATH) {
    return false;
  }
  return PREFIX_PATHS.some((pre) => p === pre || p.startsWith(pre));
}

export function rewriteOriginUrls(text) {
  let s = String(text == null ? "" : text);
  if (!s) return s;
  s = s.split(RUNTIME_ORIGIN + "/").join(PUBLIC_RUNTIME + "/");
  s = s.split(RUNTIME_ORIGIN).join(PUBLIC_RUNTIME);
  return s;
}

function rewriteRootAbsolute(text, { html = false, json = false } = {}) {
  let s = String(text || "");
  if (html) {
    s = s.replace(/\b(href|src|action)=(["'])(\/[^"']*)\2/gi, (m, attr, q, path) => {
      if (!shouldPrefixRuntimePath(path)) return m;
      return attr + "=" + q + RUNTIME_PATH + path + q;
    });
    s = s.replace(/\bcontent=(["'])(https?:\/\/[^"']+|\/[^"']+)\1/gi, (m, q, val) => {
      if (shouldPrefixRuntimePath(val)) return "content=" + q + RUNTIME_PATH + val + q;
      return m;
    });
  }
  if (json) {
    s = s.replace(/"(\/[^"]*)"/g, (m, path) => {
      if (!shouldPrefixRuntimePath(path)) return m;
      return "\"" + RUNTIME_PATH + path + "\"";
    });
  }
  return s;
}

export function rewriteRuntimeBody(text, contentType) {
  const ct = String(contentType || "").toLowerCase();
  let s = rewriteOriginUrls(text);
  const html = ct.includes("html");
  const json = ct.includes("json");
  const xml = ct.includes("xml");
  const plain = ct.includes("text/plain") || ct.includes("text/markdown");
  if (html || json) s = rewriteRootAbsolute(s, { html, json });
  if (html) s = injectRuntimeChrome(s);
  if (json || html) s = ensureRuntimeCrossLinks(s, { html, json });
  if (xml || plain) {
    /* origin sitemap/llms already rewritten via origin host swap */
  }
  return s;
}

export function rewriteLocation(loc) {
  const raw = String(loc || "");
  if (!raw) return raw;
  if (raw.startsWith(RUNTIME_ORIGIN)) return rewriteOriginUrls(raw);
  if (shouldPrefixRuntimePath(raw)) return RUNTIME_PATH + raw;
  return raw;
}

function shouldRewriteType(ct) {
  const t = String(ct || "").toLowerCase();
  return /html|json|xml|text\/plain|text\/markdown|javascript/.test(t);
}

export function runtimeCors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, X-Aziel-Runtime-Token, MCP-Protocol-Version, mcp-session-id",
    "Access-Control-Expose-Headers": "X-Aziel-Runtime-Version, X-Aziel-Runtime-Role, X-Aziel-Runtime-Root, X-Aziel-Runtime-Via",
  };
}

function dropHopHeaders(headers) {
  const out = new Headers();
  for (const [k, v] of headers) {
    const key = k.toLowerCase();
    if (HOP.has(key) || key.startsWith("cf-")) continue;
    out.set(k, v);
  }
  if (!out.get("User-Agent")) out.set("User-Agent", UA);
  return stampRuntimeVia(out);
}

export function runtimeChromeNav() {
  const items = navItems();
  const links = items.map((it, i) => {
    const color = it.aziel ? "#b08ae0" : "#c9a227";
    const link = `<a href="${it.href}" style="color:${color};text-decoration:none">${it.label}</a>`;
    return i ? `<span style="color:#9aa3b2"> | </span>${link}` : link;
  }).join("");
  const dist = runtimeDistribution({ sameOrigin: true }).map((b) => {
    const primary = !!b.primary;
    const bg = primary ? "#c9a227" : "transparent";
    const fg = primary ? "#14110a" : "#efe6d6";
    const border = primary ? "none" : "1px solid #3a3228";
    return `<a href="${b.href}" style="display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 14px;border-radius:12px;font:700 14px/1.2 system-ui,sans-serif;text-decoration:none;background:${bg};color:${fg};border:${border}">${b.label}</a>`;
  }).join("");
  const eco = ecosystemLinks().map((it) => {
    const color = it.secondary ? "#9aa3b2" : "#c9a227";
    return `<a href="${it.href}" style="color:${color};text-decoration:none">${it.label}</a>`;
  }).join(`<span style="color:#9aa3b2"> · </span>`);
  return `<nav aria-label="GodLock" style="font:14px/1.45 system-ui,sans-serif;margin:0 0 .75rem;padding:0 0 .85rem;border-bottom:1px solid #2a3140"><a href="/" style="color:#efe6d6;font-weight:800;text-decoration:none;margin-right:.75rem">GodLock</a>${links}</nav><nav aria-label="Aziel Eliab ecosystem" style="font:13px/1.45 system-ui,sans-serif;margin:0 0 .85rem;color:#9aa3b2"><p style="margin:0 0 4px">Part of the Aziel Eliab ecosystem</p>${eco}</nav><div id="godlock-runtime-dist" aria-label="Aziel Runtime distribution" style="display:flex;flex-wrap:wrap;gap:10px;margin:0 0 1.2rem">${dist}</div>`;
}

function injectRuntimeChrome(html) {
  const chrome = runtimeChromeNav();
  if (/id="godlock-runtime-chrome"/.test(html)) return html;
  if (/<body[^>]*>/i.test(html)) {
    return html.replace(/<body([^>]*)>/i, `<body$1><div id="godlock-runtime-chrome">${chrome}</div>`);
  }
  return `<div id="godlock-runtime-chrome">${chrome}</div>` + html;
}

function unique(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    if (!item || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

function mergeSameAs(node) {
  const extra = runtimeSameAs();
  const cur = Array.isArray(node.sameAs) ? node.sameAs : (node.sameAs ? [node.sameAs] : []);
  node.sameAs = unique(cur.concat(extra));
  return node;
}

function rewriteIdentityNode(node) {
  if (!node || typeof node !== "object") return node;
  const out = { ...node };
  if (out["@type"] === "Person") {
    out["@id"] = AZIEL_PERSON_ID;
  }
  for (const key of ["author", "publisher", "creator", "provider", "copyrightHolder"]) {
    if (out[key]) out[key] = personRef();
  }
  return out;
}

function addRuntimeGraphNodes(ld) {
  const person = personNode();
  const extras = [person, runtimeSoftwareNode(person), runtimeWebApiNode(person)];
  if (ld && Array.isArray(ld["@graph"])) {
    ld["@graph"] = ld["@graph"].map((n) => {
      if (!n || typeof n !== "object") return n;
      let next = rewriteIdentityNode(n);
      if (next["@type"] === "SoftwareApplication" || next["@type"] === "WebAPI" || next["@type"] === "WebSite") {
        next = mergeSameAs(next);
      }
      return next;
    });
    const types = new Set(ld["@graph"].map((n) => (n && n["@id"]) || ""));
    for (const n of extras) {
      if (!types.has(n["@id"])) ld["@graph"].push(n);
    }
    return ld;
  }
  if (ld && typeof ld === "object") return mergeSameAs(rewriteIdentityNode({ ...ld }));
  return ld;
}

function ensureRuntimeCrossLinks(text, { html, json }) {
  let s = String(text || "");
  if (html) {
    s = s.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i, (m, raw) => {
      try {
        const ld = addRuntimeGraphNodes(JSON.parse(raw));
        return "<script type=\"application/ld+json\">" + JSON.stringify(ld) + "</script>";
      } catch {
        return m;
      }
    });
    return s;
  }
  if (json) {
    try {
      const doc = JSON.parse(s);
      if (doc && typeof doc === "object" && !Array.isArray(doc)) {
        doc.godlock_runtime = PUBLIC_RUNTIME;
        doc.library_runtime = LIBRARY_RUNTIME;
        doc.origin_runtime = RUNTIME_ORIGIN + "/";
        doc.sameAs = unique([].concat(doc.sameAs || [], runtimeSameAs()));
        doc.related = unique([].concat(doc.related || [], runtimeSameAs()));
        if (!doc.author) doc.author = AUTHOR;
        if (!doc.identity) doc.identity = AUTHOR;
        s = JSON.stringify(doc, null, 2);
      }
    } catch {
      /* leave rewritten text */
    }
  }
  return s;
}

async function cancelBody(res) {
  try {
    if (res && res.body && typeof res.body.cancel === "function") await res.body.cancel();
  } catch { /* ignore */ }
}

export async function proxyOrigin(request, destPathAndQuery, env) {
  const dest = new URL(destPathAndQuery, RUNTIME_ORIGIN + "/");
  const init = {
    method: request.method === "HEAD" && dest.pathname === "/" ? "GET" : request.method,
    headers: dropHopHeaders(request.headers),
    redirect: "manual",
  };
  if (init.method !== "GET" && init.method !== "HEAD") init.body = request.body;
  if (env && env.AZIEL_RUNTIME && typeof env.AZIEL_RUNTIME.fetch === "function") {
    return env.AZIEL_RUNTIME.fetch(new Request(dest.toString(), init));
  }
  return fetch(dest.toString(), init);
}

function decorateHeaders(res, via) {
  const headers = new Headers(res.headers);
  headers.set("X-Aziel-Runtime-Root", PUBLIC_RUNTIME);
  headers.set("X-Aziel-Runtime-Via", via);
  headers.set("X-Aziel-Runtime-Host", CANON_HOST);
  for (const [k, v] of Object.entries(runtimeCors())) {
    headers.set(k, v);
  }
  const loc = headers.get("Location");
  if (loc) headers.set("Location", rewriteLocation(loc));
  return headers;
}

async function finishProxy(request, res, via) {
  const headers = decorateHeaders(res, via);
  const ct = headers.get("Content-Type") || "";
  if (request.method === "HEAD") {
    await cancelBody(res);
    return new Response(null, { status: res.status, statusText: res.statusText, headers });
  }
  if (!shouldRewriteType(ct)) {
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }
  const text = await res.text();
  const rewritten = rewriteRuntimeBody(text, ct);
  headers.delete("content-length");
  return new Response(rewritten, { status: res.status, statusText: res.statusText, headers });
}

function jsonError(body, status) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...runtimeCors() },
  });
}

export async function handleRuntimeRoot(request, url, env, ctx) {
  if (!isRuntimeRequest(url.pathname)) return null;
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: runtimeCors() });
  }
  const dest = destFromRuntimePath(url.pathname, url.search);
  if (dest == null) return null;
  const destPath = String(dest).split("?")[0];
  if (isRuntimeUsesPath(destPath)) {
    if (request.method === "GET" || request.method === "HEAD") {
      return handleRuntimeUses(request, env);
    }
    return jsonError({
      ok: false,
      error: "method not allowed",
      host: "godlock.uk",
      via: "godlock.uk",
      author: AUTHOR,
    }, 405);
  }
  if (shouldCountRuntimeUse(request.method, destPath)) {
    const counted = scheduleRuntimeUse(ctx, () => recordRuntimeUse(env, request.method, destPath));
    if (counted) await counted;
  }
  const via = env && env.AZIEL_RUNTIME ? "service-binding" : "origin-fetch";
  let res;
  try {
    res = await proxyOrigin(request, dest, env);
  } catch (err) {
    return jsonError({
      ok: false,
      error: "runtime origin unreachable",
      origin: RUNTIME_ORIGIN + "/",
      door: PUBLIC_RUNTIME,
      library: LIBRARY_RUNTIME,
      version: RUNTIME_VERSION,
      kernel: FRAGGATE_KERNEL,
      author: AUTHOR,
      detail: String(err && err.message ? err.message : err),
    }, 502);
  }
  return finishProxy(request, res, via);
}

export function runtimeDoorDescription() {
  return defaultDescription("runtime");
}
