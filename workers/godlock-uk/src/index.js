/**
 * GodLock.uk public HTTPS stress-test engine (Cloudflare Worker).
 * One input. Locked protocol. Append-only hash-chained receipts.
 * Not a forum, not a tunnel. Suite mesh is QNM-BUILD-1.0 (default OFF):
 * live|locked|isolated counts only. No Node Gate. No auto-heal.
 * Not an anonymity network. Author: Aziel Eliab.
 */
import { randomBytes } from "node:crypto";
import { json, html, corsHeaders, wantsJson, readCookie } from "./http.js";
import {
  page, homeBody, verifyBody, receiptBody, azielEliabBody, azielEliabText,
  reasonBody, reasonText, softwareBody, donateBody, AZIEL_ELIAB_PATH, REASON_PATH, SOFTWARE_PATH, DONATE_PATH,
} from "./ui.js";
import { donateDoc, DONATE_RAILS, donateQrIdFromPath } from "./donate.js";
import { handleRuntimeRoot, isRuntimeRequest, runtimeCors } from "./runtimeRoot.js";
import { appendLedger, verifyLedger, ledgerEntriesForId, sha256hex } from "./ledger.js";
import {
  robotsTxt, sitemapXml, citeDoc, llmsDoc, aiDoc, siteOpenApi, BANNER, DOWNLOAD, DOWNLOAD_STATS, GITHUB, AUTHOR, CATALOG,
  PUBLIC_RUNTIME, RUNTIME_PATH, permanentIdentityRedirect,
} from "./seo.js";
import {
  fetchCatalogProducts, softwareSuite, publicProduct, softwareApiDoc,
  loadCatalogForHtml, scheduleCatalogRefresh, SOFTWARE_HTML_CACHE_CONTROL,
} from "./catalog.js";
import {
  START, shouldIsolate, answerChallenge, clampScore, residualOf, hashReceipt,
} from "./engine.js";
import {
  PRESENCE_TTL_MS,
  liveNodeCountFromDb,
  usesCountFromLedger,
  presenceCutoff,
} from "./presence.js";
import { hideInternalDetermination, publicSafeFields } from "./publicCopy.js";
import {
  fetchMeshSnapshot,
  alignLiveNodes,
  publicMesh,
  meshOpsDoc,
  isOriginMeshReadPath,
  originMeshWriteRefused,
  hubMeshStatusDoc,
} from "./mesh.js";

const TEXT_MAX = 8000;
const NODE_COOKIE = "godlock_node";

/** Production probes LIVE origin /v1/mesh/status. Tests set MESH_PROBE_ORIGIN=false. */
function meshSnapshotDeps(env) {
  if (env && (env.MESH_PROBE_ORIGIN === false || env.MESH_PROBE_ORIGIN === "0")) {
    return { probeOrigin: false };
  }
  return { fetch: globalThis.fetch, probeOrigin: true };
}

async function ensureSchema(env) {
  if (!env || !env.DB) return;
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY, created_utc TEXT NOT NULL, text_sha256 TEXT NOT NULL,
      label TEXT NOT NULL, summary TEXT NOT NULL, explanation TEXT NOT NULL,
      score_before REAL NOT NULL, score_after REAL NOT NULL, residual REAL NOT NULL,
      isolated INTEGER NOT NULL DEFAULT 0, content_sha256 TEXT NOT NULL)`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_receipts_created ON receipts(created_utc)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_receipts_public ON receipts(isolated, created_utc)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS ledger (
      sequence INTEGER PRIMARY KEY, timestamp_utc TEXT NOT NULL, action TEXT NOT NULL,
      payload_json TEXT NOT NULL, previous_hash TEXT NOT NULL, entry_hash TEXT NOT NULL)`),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS heartbeats (session_id TEXT PRIMARY KEY, last_utc TEXT NOT NULL, last_ms INTEGER)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_heartbeats_last ON heartbeats(last_utc)"),
    env.DB.prepare("INSERT OR IGNORE INTO metadata(key, value) VALUES ('current_score', '50')"),
    env.DB.prepare("INSERT OR IGNORE INTO metadata(key, value) VALUES ('views', '0')"),
    env.DB.prepare("INSERT OR IGNORE INTO metadata(key, value) VALUES ('uses', '0')"),
  ]);
  try {
    await env.DB.prepare("ALTER TABLE heartbeats ADD COLUMN last_ms INTEGER").run();
  } catch { /* column already present */ }
  try {
    await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_heartbeats_last_ms ON heartbeats(last_ms)").run();
  } catch { /* index or column not ready */ }
  // Floor Uses into metadata so a parent receipt/ledger wipe does not drop the counter.
  // Never lower views, uses, or download KV.
  try {
    const l = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM ledger WHERE action IN ('SUBMIT', 'ISOLATE')"
    ).first();
    const ledgerN = Number(l && l.n) || 0;
    const metaN = parseInt(await metaGet(env, "uses", "0"), 10) || 0;
    if (ledgerN > metaN) await metaSet(env, "uses", String(ledgerN));
  } catch { /* first run */ }
}

function newId() {
  return randomBytes(12).toString("hex");
}

async function metaGet(env, key, fallback) {
  try {
    const row = await env.DB.prepare("SELECT value FROM metadata WHERE key=?").bind(key).first();
    if (row && row.value != null && row.value !== "") return row.value;
  } catch { /* first run */ }
  return fallback;
}

async function metaSet(env, key, value) {
  await env.DB.prepare(
    "INSERT INTO metadata(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value"
  ).bind(key, String(value)).run();
}

async function metaBump(env, key) {
  const cur = parseInt(await metaGet(env, key, "0"), 10) || 0;
  const next = cur + 1;
  await metaSet(env, key, String(next));
  return next;
}

async function currentScore(env) {
  const raw = await metaGet(env, "current_score", String(START));
  const n = parseFloat(raw);
  return clampScore(Number.isFinite(n) ? n : START);
}

function sessionIdFrom(request, cookieId) {
  if (cookieId && /^[A-Za-z0-9_-]{8,64}$/.test(cookieId)) return cookieId;
  const ua = request.headers.get("User-Agent") || "";
  const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "";
  return sha256hex(ua + "|" + ip).slice(0, 24);
}

function nodeCookieHeader(id) {
  return NODE_COOKIE + "=" + id + "; Path=/; Secure; SameSite=Lax; Max-Age=31536000";
}

async function touchHeartbeat(env, request, cookieId) {
  const id = sessionIdFrom(request, cookieId);
  const nowMs = Date.now();
  const now = new Date(nowMs).toISOString();
  const cut = presenceCutoff(nowMs);
  let wrote = false;
  try {
    await env.DB.prepare(
      "INSERT INTO heartbeats(session_id, last_utc, last_ms) VALUES(?, ?, ?) ON CONFLICT(session_id) DO UPDATE SET last_utc=excluded.last_utc, last_ms=excluded.last_ms"
    ).bind(id, now, nowMs).run();
    wrote = true;
    await env.DB.prepare(
      "DELETE FROM heartbeats WHERE (last_ms IS NOT NULL AND last_ms < ?) OR ((last_ms IS NULL OR last_ms = 0) AND last_utc < ?)"
    ).bind(cut.cleanupMs, cut.cleanupIso).run();
  } catch {
    try {
      await env.DB.prepare(
        "INSERT INTO heartbeats(session_id, last_utc) VALUES(?, ?) ON CONFLICT(session_id) DO UPDATE SET last_utc=excluded.last_utc"
      ).bind(id, now).run();
      wrote = true;
    } catch { /* ignore heartbeat errors so the page still renders */ }
  }
  return { id, wrote };
}

async function liveNodes(env, { wrote, visiting } = {}) {
  const cut = presenceCutoff();
  try {
    const row = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM heartbeats
       WHERE (last_ms IS NOT NULL AND last_ms >= ?)
          OR ((last_ms IS NULL OR last_ms = 0) AND last_utc >= ?)`
    ).bind(cut.sinceMs, cut.sinceIso).first();
    return liveNodeCountFromDb(row && row.n, !!(wrote || visiting));
  } catch {
    return liveNodeCountFromDb(0, !!(wrote || visiting));
  }
}

async function usesCount(env) {
  let ledgerN = 0;
  try {
    const l = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM ledger WHERE action IN ('SUBMIT', 'ISOLATE')"
    ).first();
    ledgerN = Number(l && l.n) || 0;
  } catch { /* empty or first run */ }
  const metaN = parseInt(await metaGet(env, "uses", "0"), 10) || 0;
  return usesCountFromLedger({ ledgerSubmits: ledgerN, metadataUses: metaN });
}

async function fetchDownloads(env) {
  try {
    const r = await fetch(DOWNLOAD_STATS, { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } });
    if (r.ok) {
      const j = await r.json();
      const n = Number(j && (j.total != null ? j.total : (j.downloads != null ? j.downloads : j.count)));
      if (Number.isFinite(n)) {
        try { await metaSet(env, "downloads_cache", String(n)); } catch { /* ignore */ }
        return n;
      }
    }
  } catch { /* tracker optional */ }
  try {
    const cached = parseInt(await metaGet(env, "downloads_cache", ""), 10);
    if (Number.isFinite(cached) && cached > 0) return cached;
  } catch { /* ignore */ }
  const views = parseInt(await metaGet(env, "views", "0"), 10) || 0;
  const uses = parseInt(await metaGet(env, "uses", "0"), 10) || 0;
  return views + uses;
}

async function publicReceipts(env, limit) {
  const n = Math.min(Math.max(Number(limit) || 24, 1), 100);
  const res = await env.DB.prepare(
    "SELECT id, created_utc, text_sha256, label, summary, explanation, score_before, score_after, residual, isolated, content_sha256 FROM receipts WHERE isolated=0 ORDER BY created_utc DESC LIMIT ?"
  ).bind(n).all();
  return res.results || [];
}

async function getReceipt(env, id) {
  return env.DB.prepare("SELECT * FROM receipts WHERE id=?").bind(id).first();
}

async function gatherStats(env, { wrote, visiting } = {}) {
  const score = await currentScore(env);
  const views = parseInt(await metaGet(env, "views", "0"), 10) || 0;
  const [siteNodes, downloads, uses, meshSnap] = await Promise.all([
    liveNodes(env, { wrote, visiting }),
    fetchDownloads(env),
    usesCount(env),
    fetchMeshSnapshot(env, meshSnapshotDeps(env)),
  ]);
  const mesh = publicMesh(meshSnap);
  const live = alignLiveNodes({
    siteLiveNodes: siteNodes,
    mesh,
    visiting: !!(wrote || visiting),
  });
  return {
    live_nodes: live,
    site_live_nodes: siteNodes,
    mesh,
    views,
    uses,
    downloads,
    current_score: score,
    residual: residualOf(score),
    presence_ttl_ms: PRESENCE_TTL_MS,
  };
}

async function readChallengeText(request) {
  const ct = (request.headers.get("Content-Type") || "").toLowerCase();
  if (ct.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return String((body && (body.text || body.challenge || body.body)) || "").slice(0, TEXT_MAX);
  }
  const form = await request.formData().catch(() => null);
  if (form) return String(form.get("text") || form.get("challenge") || form.get("body") || "").slice(0, TEXT_MAX);
  const raw = await request.text().catch(() => "");
  return String(raw || "").slice(0, TEXT_MAX);
}

function publicPayload(row) {
  const safe = publicSafeFields(row);
  return {
    id: safe.id,
    created_utc: safe.created_utc,
    label: safe.label,
    summary: hideInternalDetermination(safe.summary),
    explanation: hideInternalDetermination(safe.explanation),
    score_before: safe.score_before,
    score_after: safe.score_after,
    residual: safe.residual,
    text_sha256: safe.text_sha256,
    content_sha256: safe.content_sha256,
    isolated: Number(safe.isolated) ? 1 : 0,
  };
}

async function processSubmit(env, text) {
  const created_utc = new Date().toISOString();
  const id = newId();
  const text_sha256 = sha256hex(text);
  const isolated = shouldIsolate(text) ? 1 : 0;
  const score_before = await currentScore(env);

  if (isolated) {
    const row = {
      id,
      created_utc,
      text_sha256,
      label: "Isolated",
      summary: "Isolated locally. Not scored. Not shown on the public feed.",
      explanation: "",
      score_before,
      score_after: score_before,
      residual: residualOf(score_before),
      isolated: 1,
    };
    row.summary = hideInternalDetermination(row.summary);
    row.explanation = hideInternalDetermination(row.explanation);
    row.content_sha256 = hashReceipt(row);
    await env.DB.prepare(
      "INSERT INTO receipts(id, created_utc, text_sha256, label, summary, explanation, score_before, score_after, residual, isolated, content_sha256) VALUES(?,?,?,?,?,?,?,?,?,?,?)"
    ).bind(id, created_utc, text_sha256, row.label, row.summary, row.explanation, row.score_before, row.score_after, row.residual, 1, row.content_sha256).run();
    await appendLedger(env, "ISOLATE", { receipt_id: id, text_sha256, content_sha256: row.content_sha256 });
    const uses = await usesCount(env);
    try { if (uses > 0) await metaSet(env, "uses", String(uses)); } catch { /* keep prior floor */ }
    return { ...row, isolated: true };
  }

  const prior = await publicReceipts(env, 8);
  const answered = await answerChallenge(env, text, score_before, prior);
  const score_after = clampScore(score_before + Number(answered.score_delta || 0));
  const residual = residualOf(score_after);
  const row = {
    id,
    created_utc,
    text_sha256,
    label: answered.label,
    summary: hideInternalDetermination(answered.summary),
    explanation: hideInternalDetermination(answered.explanation),
    score_before,
    score_after,
    residual,
    isolated: 0,
  };
  row.content_sha256 = hashReceipt(row);
  await env.DB.prepare(
    "INSERT INTO receipts(id, created_utc, text_sha256, label, summary, explanation, score_before, score_after, residual, isolated, content_sha256) VALUES(?,?,?,?,?,?,?,?,?,?,?)"
  ).bind(id, created_utc, text_sha256, row.label, row.summary, row.explanation, score_before, score_after, residual, 0, row.content_sha256).run();
  await appendLedger(env, "SUBMIT", {
    receipt_id: id,
    label: row.label,
    text_sha256,
    content_sha256: row.content_sha256,
    score_before,
    score_after,
    residual,
  });
  await appendLedger(env, "SCORE", {
    receipt_id: id,
    score_before,
    score_after,
    residual,
    delta: Math.round((score_after - score_before) * 10) / 10,
  });
  if (score_after !== score_before) await metaSet(env, "current_score", String(score_after));
  const uses = await usesCount(env);
  try { if (uses > 0) await metaSet(env, "uses", String(uses)); } catch { /* keep prior floor */ }
  return row;
}

async function healthPayload(env, { wrote } = {}) {
  const extra = {};
  try {
    const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM receipts").first();
    const p = await env.DB.prepare("SELECT COUNT(*) AS n FROM receipts WHERE isolated=0").first();
    const l = await env.DB.prepare("SELECT COUNT(*) AS n FROM ledger").first();
    extra.receipts = Number(r && r.n) || 0;
    extra.public_receipts = Number(p && p.n) || 0;
    extra.ledger_entries = Number(l && l.n) || 0;
    extra.d1 = "ok";
  } catch (err) {
    extra.d1 = "error";
    extra.error = String(err && err.message ? err.message : err);
  }
  const stats = extra.d1 === "ok" ? await gatherStats(env, { wrote }) : {};
  return {
    ok: extra.d1 === "ok",
    product: "GodLock",
    site: "godlock.uk",
    author: AUTHOR,
    banner: hideInternalDetermination(BANNER),
    limitation: hideInternalDetermination(BANNER),
    download: DOWNLOAD,
    github: GITHUB,
    ...stats,
    ...extra,
  };
}


function extraHeadersFor(nodeId, more) {
  const h = { ...(more || {}) };
  if (nodeId) h["Set-Cookie"] = nodeCookieHeader(nodeId);
  return h;
}

async function serveDonateQrPng(request, env, path) {
  const id = donateQrIdFromPath(path);
  const known = DONATE_RAILS.some((r) => r.id === id);
  if (!id || !known) {
    return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders() } });
  }
  if (!env || !env.ASSETS) {
    return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders() } });
  }
  const assetUrl = new URL(path, request.url);
  const assetRes = await env.ASSETS.fetch(new Request(assetUrl, { method: "GET" }));
  if (!assetRes.ok) {
    return new Response("not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders() } });
  }
  const headers = new Headers();
  headers.set("Content-Type", "image/png");
  headers.set("Cache-Control", "public, max-age=86400, immutable");
  const len = assetRes.headers.get("Content-Length");
  if (len) headers.set("Content-Length", len);
  for (const [k, v] of Object.entries(corsHeaders())) headers.set(k, v);
  if (request.method === "HEAD") return new Response(null, { status: 200, headers });
  return new Response(assetRes.body, { status: 200, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (request.method === "OPTIONS") {
      if (isRuntimeRequest(url.pathname) || isRuntimeRequest(path)) {
        return new Response(null, { status: 204, headers: runtimeCors() });
      }
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if ((request.method === "GET" || request.method === "HEAD") && donateQrIdFromPath(path)) {
      return serveDonateQrPng(request, env, path);
    }

    try {
      await ensureSchema(env);
      const cookieId = readCookie(request, NODE_COOKIE);
      const hb = await touchHeartbeat(env, request, cookieId || newId());
      const nodeId = hb.id;
      const wrote = hb.wrote;

      if (path === "/internal" || path.startsWith("/internal/")) {
        return html(page("Not found", `<div class="card"><h2>Not found</h2><p><a href="/">Back</a></p></div>`, { path, kind: "notfound" }), { status: 404 });
      }

      if (isRuntimeRequest(url.pathname) || isRuntimeRequest(path)) {
        const runtime = await handleRuntimeRoot(request, url, env, ctx);
        if (runtime) return runtime;
      }

      if (path === "/robots.txt") {
        return new Response(robotsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders() } });
      }
      if (path === "/sitemap.xml") {
        const fetched = await fetchCatalogProducts(env);
        const products = softwareSuite(fetched.products, { version: fetched.version });
        const xml = await sitemapXml(env, { products });
        return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", ...corsHeaders() } });
      }
      if (path === "/cite.json") {
        const fetched = await fetchCatalogProducts(env);
        const products = softwareSuite(fetched.products, { version: fetched.version });
        const catalogN = products.filter((p) => p.slug !== "aziel-runtime" && p.slug !== "fraggate").length;
        return json({
          ...citeDoc(),
          software_product_count: catalogN,
          software_slugs: products.map((p) => p.slug),
          software_source: fetched.source,
        });
      }
      if (path === "/llms.txt") {
        return new Response(llmsDoc(), { headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders() } });
      }
      if (path === "/ai.txt") {
        return new Response(aiDoc(), { headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders() } });
      }
      if (path === "/openapi.json") {
        return json(siteOpenApi());
      }

      const identityTo = permanentIdentityRedirect(path);
      if (identityTo) {
        return new Response(null, {
          status: 308,
          headers: { Location: identityTo, ...corsHeaders(), ...extraHeadersFor(nodeId) },
        });
      }
      if (path === "/health") return json(await healthPayload(env, { wrote }));

      if (path === "/stats") {
        const stats = await gatherStats(env, { wrote });
        return json({
          ok: true,
          product: "GodLock",
          site: "godlock.uk",
          author: AUTHOR,
          ...stats,
        }, 200, extraHeadersFor(nodeId));
      }

      if (path === "/count") {
        const stats = await gatherStats(env, { wrote });
        return json({
          ok: true,
          live_nodes: stats.live_nodes,
          site_live_nodes: stats.site_live_nodes,
          mesh_enabled: !!(stats.mesh && stats.mesh.enabled),
          mesh_live_nodes: stats.mesh && stats.mesh.enabled ? stats.mesh.live_nodes : 0,
          mesh_locked: stats.mesh && stats.mesh.enabled && stats.mesh.rollup ? stats.mesh.rollup.locked : 0,
          mesh_isolated: stats.mesh && stats.mesh.enabled && stats.mesh.rollup ? stats.mesh.rollup.isolated : 0,
          uses: stats.uses,
        }, 200, extraHeadersFor(nodeId));
      }

      if (isOriginMeshReadPath(path)) {
        if (request.method !== "GET" && request.method !== "HEAD") {
          return json(originMeshWriteRefused(), 405, extraHeadersFor(nodeId));
        }
        const runtimeUrl = new URL(request.url);
        runtimeUrl.pathname = RUNTIME_PATH + path;
        try {
          const proxied = await handleRuntimeRoot(
            new Request(runtimeUrl.toString(), { method: request.method, headers: request.headers }),
            runtimeUrl,
            env,
            ctx,
          );
          if (proxied && proxied.status >= 200 && proxied.status < 400) {
            return proxied;
          }
        } catch { /* remain-OFF local snapshot; GET never enables */ }
        const stats = await gatherStats(env, { wrote });
        return json(hubMeshStatusDoc(stats, path), 200, extraHeadersFor(nodeId));
      }

      if (path === "/mesh") {
        const stats = await gatherStats(env, { wrote });
        return json({
          ok: true,
          product: "GodLock",
          site: "godlock.uk",
          author: AUTHOR,
          identity: AUTHOR,
          ...meshOpsDoc(),
          spec: "QNM-BUILD-1.0",
          anonymity_network: false,
          default_off: true,
          node_gate: false,
          auto_heal: false,
          live_nodes: stats.live_nodes,
          rollup: stats.mesh && stats.mesh.rollup ? stats.mesh.rollup : { live: 0, locked: 0, isolated: 0 },
          site_live_nodes: stats.site_live_nodes,
          mesh: stats.mesh,
        }, 200, extraHeadersFor(nodeId));
      }

      if (path === "/heartbeat" && request.method === "POST") {
        const stats = await gatherStats(env, { wrote });
        return json({ ok: true, ...stats }, 200, extraHeadersFor(nodeId));
      }

      if (path === "/verify") {
        const report = await verifyLedger(env);
        if (wantsJson(request, url)) {
          return json({
            ok: report.ok,
            status: report.ok ? "VERIFIED" : "VERIFICATION FAILED",
            product: "GodLock",
            author: AUTHOR,
            banner: BANNER,
            ledger_entries: report.entries,
            ledger_head: report.ledger_head,
            errors: report.errors,
            verified_utc: new Date().toISOString(),
          });
        }
        return html(page("Verify", verifyBody({ report }), { path: "/verify", kind: "verify" }), {
          extraHeaders: extraHeadersFor(nodeId),
        });
      }

      if (path === DONATE_PATH) {
        if (wantsJson(request, url)) {
          return json({
            ...donateDoc(),
            author: AUTHOR,
          }, 200, extraHeadersFor(nodeId));
        }
        return html(page("Donate", donateBody(), { path: DONATE_PATH, kind: "donate" }), {
          extraHeaders: extraHeadersFor(nodeId),
        });
      }

      if (path === REASON_PATH) {
        if (wantsJson(request, url)) {
          return json({
            ok: true,
            product: "GodLock",
            site: "godlock.uk",
            author: AUTHOR,
            title: "Specified Fit, Not Pretty Spirals",
            path: REASON_PATH,
            identity: AUTHOR,
            text: reasonText(),
          }, 200, extraHeadersFor(nodeId));
        }
        return html(page("Specified Fit, Not Pretty Spirals", reasonBody(), { path: REASON_PATH, kind: "reason" }), {
          extraHeaders: extraHeadersFor(nodeId),
        });
      }

      if (path === AZIEL_ELIAB_PATH) {
        if (wantsJson(request, url)) {
          return json({
            ok: true,
            product: "GodLock",
            site: "godlock.uk",
            author: AUTHOR,
            title: "Aziel Eliab",
            path: AZIEL_ELIAB_PATH,
            identity: AUTHOR,
            library: "https://www.azielcorpuslibrary.net/AzielEliab",
            text: azielEliabText(),
          }, 200, extraHeadersFor(nodeId));
        }
        return html(page("Aziel Eliab", azielEliabBody(), { path: AZIEL_ELIAB_PATH, kind: "aziel" }), {
          extraHeaders: extraHeadersFor(nodeId),
        });
      }

      if (path === "/v1/software") {
        if (!wantsJson(request, url) && (request.headers.get("Accept") || "").toLowerCase().includes("text/html")) {
          return new Response(null, {
            status: 308,
            headers: { Location: SOFTWARE_PATH, ...corsHeaders(), ...extraHeadersFor(nodeId) },
          });
        }
        const fetched = await fetchCatalogProducts(env);
        const extras = { version: fetched.version, source: fetched.source };
        return json(softwareApiDoc(fetched.products, extras), 200, extraHeadersFor(nodeId));
      }

      if (path === SOFTWARE_PATH) {
        if (wantsJson(request, url)) {
          const fetched = await fetchCatalogProducts(env);
          const extras = { version: fetched.version };
          const products = softwareSuite(fetched.products, extras);
          return json({
            ok: true,
            product: "GodLock",
            author: AUTHOR,
            identity: AUTHOR,
            path: SOFTWARE_PATH,
            catalog: PUBLIC_RUNTIME + "/v1/software",
            catalog_origin: CATALOG + "/v1/software",
            catalog_fraggate: PUBLIC_RUNTIME + "/v1/fraggate/list",
            catalog_fraggate_origin: CATALOG + "/v1/fraggate/list",
            catalog_json: PUBLIC_RUNTIME + "/v1/catalog.json",
            source: fetched.source,
            sort: "plain-gate-lock",
            clock_is_not_lock: true,
            product_count: products.filter((p) => p.slug !== "aziel-runtime" && p.slug !== "fraggate").length,
            suite_count: products.length,
            counters_fetched: 0,
            products: products.map(publicProduct).filter(Boolean),
          }, 200, extraHeadersFor(nodeId));
        }
        const fetched = await loadCatalogForHtml(env);
        scheduleCatalogRefresh(ctx, env);
        const extras = { version: fetched.version };
        const products = softwareSuite(fetched.products, extras);
        return html(page("Software", softwareBody({ products: fetched.products, extras }), { path: SOFTWARE_PATH, kind: "software", products }), {
          extraHeaders: extraHeadersFor(nodeId, { "Cache-Control": SOFTWARE_HTML_CACHE_CONTROL }),
        });
      }

      if (path.startsWith("/receipt/")) {
        const id = decodeURIComponent(path.slice("/receipt/".length));
        const row = await getReceipt(env, id);
        if (!row || Number(row.isolated)) {
          if (wantsJson(request, url)) return json({ ok: false, error: "not found" }, 404);
          return html(page("Receipt", receiptBody({ id, row: null, entries: [] }), { path: "/receipt/" + id, kind: "receipt", indexable: false }), { status: 404 });
        }
        const entries = await ledgerEntriesForId(env, id);
        if (wantsJson(request, url)) return json({ ok: true, receipt: publicPayload(row), ledger: entries });
        return html(page("Receipt", receiptBody({ id, row, entries }), { path: "/receipt/" + id, kind: "receipt" }));
      }

      if ((path === "/submit" || path === "/") && request.method === "POST") {
        const text = await readChallengeText(request);
        const row = await processSubmit(env, text);
        const stats = await gatherStats(env, { wrote });
        if (wantsJson(request, url)) {
          if (row.isolated === true || row.isolated === 1) {
            return json({ ok: true, isolated: true, id: row.id, text_sha256: row.text_sha256, stats }, 200, extraHeadersFor(nodeId));
          }
          return json({ ok: true, isolated: false, ...publicPayload(row), stats }, 200, extraHeadersFor(nodeId));
        }
        const loc = (row.isolated === true || row.isolated === 1) ? "/" : "/?r=" + encodeURIComponent(row.id);
        return new Response(null, {
          status: 303,
          headers: { Location: loc, ...corsHeaders(), ...extraHeadersFor(nodeId) },
        });
      }

      if (path === "/" && request.method === "GET") {
        await metaBump(env, "views");
        const stats = await gatherStats(env, { wrote, visiting: true });
        const rid = url.searchParams.get("r") || "";
        let latest = null;
        if (rid) {
          const row = await getReceipt(env, rid);
          if (row && !Number(row.isolated)) latest = row;
        }
        const prior = await publicReceipts(env, 24);
        const priorFiltered = latest ? prior.filter((p) => p.id !== latest.id) : prior;
        const fetched = await fetchCatalogProducts(env);
        const extras = { version: fetched.version };
        if (wantsJson(request, url)) {
          return json({
            ok: true,
            stats,
            latest: latest ? publicPayload(latest) : null,
            receipts: priorFiltered.map(publicPayload),
            software: softwareApiDoc(fetched.products, { ...extras, source: fetched.source }),
          });
        }
        return html(page("GodLock", homeBody({ stats, latest, prior: priorFiltered, products: fetched.products, extras }), { path: "/", kind: "home" }), {
          extraHeaders: extraHeadersFor(nodeId),
        });
      }

      if (path === "/ask" || path === "/login" || path === "/signup" || path === "/archive" || path.startsWith("/q/")) {
        return new Response(null, { status: 303, headers: { Location: "/", ...corsHeaders() } });
      }

      return html(page("Not found", `<div class="card"><h2>Not found</h2><p><a href="/">Back</a></p></div>`, { path, kind: "notfound" }), { status: 404 });
    } catch (err) {
      return json({ ok: false, error: String(err && err.message ? err.message : err), author: AUTHOR, banner: BANNER }, 500);
    }
  },
};
