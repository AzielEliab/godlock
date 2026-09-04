/**
 * GodLock.uk public HTTPS stress-test engine (Cloudflare Worker).
 * One input. Locked protocol. Append-only hash-chained receipts.
 * Not a forum, not a mesh, not a tunnel. Author: Aziel Eliab.
 */
import { randomBytes } from "node:crypto";
import { json, html, corsHeaders, wantsJson, readCookie } from "./http.js";
import { page, homeBody, verifyBody, receiptBody } from "./ui.js";
import { appendLedger, verifyLedger, ledgerEntriesForId, sha256hex } from "./ledger.js";
import { robotsTxt, sitemapXml, citeDoc, llmsDoc, BANNER, DOWNLOAD, DOWNLOAD_STATS, GITHUB, AUTHOR } from "./seo.js";
import {
  START, shouldIsolate, answerChallenge, clampScore, residualOf, hashReceipt,
} from "./engine.js";
import {
  PRESENCE_TTL_MS,
  liveNodeCountFromDb,
  submissionCountFromRows,
  presenceCutoff,
} from "./presence.js";

const TEXT_MAX = 8000;
const NODE_COOKIE = "godlock_node";

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

async function liveNodes(env, { wrote } = {}) {
  const cut = presenceCutoff();
  try {
    const row = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM heartbeats
       WHERE (last_ms IS NOT NULL AND last_ms >= ?)
          OR ((last_ms IS NULL OR last_ms = 0) AND last_utc >= ?)`
    ).bind(cut.sinceMs, cut.sinceIso).first();
    return liveNodeCountFromDb(row && row.n, wrote);
  } catch {
    return liveNodeCountFromDb(0, wrote);
  }
}

async function submissionCount(env, usesFallback) {
  let receipts = 0;
  let ledgerSubmits = 0;
  try {
    const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM receipts").first();
    receipts = Number(r && r.n) || 0;
  } catch { /* receipts table may be missing on first boot */ }
  if (receipts <= 0) {
    try {
      const l = await env.DB.prepare(
        "SELECT COUNT(*) AS n FROM ledger WHERE action IN ('SUBMIT', 'ISOLATE')"
      ).first();
      ledgerSubmits = Number(l && l.n) || 0;
    } catch { /* ledger optional */ }
  }
  return submissionCountFromRows({ receipts, ledgerSubmits, uses: usesFallback });
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

async function gatherStats(env, { wrote } = {}) {
  const score = await currentScore(env);
  const views = parseInt(await metaGet(env, "views", "0"), 10) || 0;
  const uses = parseInt(await metaGet(env, "uses", "0"), 10) || 0;
  const [nodes, downloads, submissions] = await Promise.all([
    liveNodes(env, { wrote }),
    fetchDownloads(env),
    submissionCount(env, uses),
  ]);
  return {
    live_nodes: nodes,
    views,
    uses,
    submissions,
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
  return {
    id: row.id,
    created_utc: row.created_utc,
    label: row.label,
    summary: row.summary,
    explanation: row.explanation,
    score_before: row.score_before,
    score_after: row.score_after,
    residual: row.residual,
    text_sha256: row.text_sha256,
    content_sha256: row.content_sha256,
    isolated: Number(row.isolated) ? 1 : 0,
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
    row.content_sha256 = hashReceipt(row);
    await env.DB.prepare(
      "INSERT INTO receipts(id, created_utc, text_sha256, label, summary, explanation, score_before, score_after, residual, isolated, content_sha256) VALUES(?,?,?,?,?,?,?,?,?,?,?)"
    ).bind(id, created_utc, text_sha256, row.label, row.summary, row.explanation, row.score_before, row.score_after, row.residual, 1, row.content_sha256).run();
    await appendLedger(env, "ISOLATE", { receipt_id: id, text_sha256, content_sha256: row.content_sha256 });
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
    summary: answered.summary,
    explanation: answered.explanation,
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
    weighing: answered.weighing || "",
  });
  if (score_after !== score_before) await metaSet(env, "current_score", String(score_after));
  await metaBump(env, "uses");
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
    banner: BANNER,
    limitation: BANNER,
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

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    try {
      await ensureSchema(env);
      const cookieId = readCookie(request, NODE_COOKIE);
      const hb = await touchHeartbeat(env, request, cookieId || newId());
      const nodeId = hb.id;
      const wrote = hb.wrote;

      if (path === "/robots.txt") {
        return new Response(robotsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders() } });
      }
      if (path === "/sitemap.xml") {
        const xml = await sitemapXml(env);
        return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", ...corsHeaders() } });
      }
      if (path === "/cite.json") return json(citeDoc());
      if (path === "/llms.txt") {
        return new Response(llmsDoc(), { headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders() } });
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
          submissions: stats.submissions,
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

      if (path.startsWith("/receipt/")) {
        const id = decodeURIComponent(path.slice("/receipt/".length));
        const row = await getReceipt(env, id);
        if (!row || Number(row.isolated)) {
          if (wantsJson(request, url)) return json({ ok: false, error: "not found" }, 404);
          return html(page("Receipt", receiptBody({ id, row: null, entries: [] }), { path: "/receipt/" + id, kind: "receipt" }), { status: 404 });
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
          return json({ ok: true, isolated: false, ...publicPayload(row), stats, weighing: undefined }, 200, extraHeadersFor(nodeId));
        }
        const loc = (row.isolated === true || row.isolated === 1) ? "/" : "/?r=" + encodeURIComponent(row.id);
        return new Response(null, {
          status: 303,
          headers: { Location: loc, ...corsHeaders(), ...extraHeadersFor(nodeId) },
        });
      }

      if (path === "/" && request.method === "GET") {
        await metaBump(env, "views");
        const stats = await gatherStats(env, { wrote });
        const rid = url.searchParams.get("r") || "";
        let latest = null;
        if (rid) {
          const row = await getReceipt(env, rid);
          if (row && !Number(row.isolated)) latest = row;
        }
        const prior = await publicReceipts(env, 24);
        const priorFiltered = latest ? prior.filter((p) => p.id !== latest.id) : prior;
        if (wantsJson(request, url)) {
          return json({ ok: true, stats, latest: latest ? publicPayload(latest) : null, receipts: priorFiltered.map(publicPayload) });
        }
        return html(page("GodLock", homeBody({ stats, latest, prior: priorFiltered }), { path: "/", kind: "home" }), {
          extraHeaders: extraHeadersFor(nodeId),
        });
      }

      if (path === "/ask" || path === "/login" || path === "/signup" || path === "/archive" || path.startsWith("/q/")) {
        return new Response(null, { status: 303, headers: { Location: "/", ...corsHeaders() } });
      }

      return html(page("Not found", `<div class="card"><h2>Not found</h2><p><a href="/">Back</a></p></div>`, { path }), { status: 404 });
    } catch (err) {
      return json({ ok: false, error: String(err && err.message ? err.message : err), author: AUTHOR, banner: BANNER }, 500);
    }
  },
};
