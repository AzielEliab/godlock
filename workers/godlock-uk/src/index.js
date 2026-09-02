/**
 * GodLock.uk public board (Cloudflare Worker).
 * Hash-chained questions, posts, replies, reacts. Append-only.
 * Not a VPN, not a mesh, not a tunnel. No Cloudflare Tunnel.
 * Author: Aziel Eliab.
 */
import { randomBytes } from "node:crypto";
import { handleAuth, getSession, html, json, corsHeaders } from "./auth.js";
import { page, homeBody, askBody, threadBody, archiveBody, verifyBody, receiptBody } from "./ui.js";
import { appendLedger, verifyLedger, recentLedger, ledgerEntriesForId, sha256hex, canonicalJson, ZERO } from "./ledger.js";
import { robotsTxt, sitemapXml, citeDoc, llmsDoc, BANNER, CANON_HOST, DOWNLOAD, GITHUB, AUTHOR } from "./seo.js";

const TITLE_MAX = 200;
const BODY_MAX = 20000;

async function ensureSchema(env) {
  if (!env || !env.DB) return;
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      salt_b64 TEXT NOT NULL, hash_b64 TEXT NOT NULL,
      n INTEGER NOT NULL, r INTEGER NOT NULL, p INTEGER NOT NULL, dklen INTEGER NOT NULL,
      created_utc TEXT NOT NULL)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY, user_id TEXT NOT NULL, username TEXT NOT NULL, expires_utc TEXT NOT NULL)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK (kind IN ('question','post','reply')),
      parent_id TEXT, title TEXT NOT NULL DEFAULT '', body TEXT NOT NULL,
      created_by TEXT NOT NULL, created_utc TEXT NOT NULL, content_sha256 TEXT NOT NULL)`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_posts_kind_created ON posts(kind, created_utc)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_id)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS interactions (
      id TEXT PRIMARY KEY, kind TEXT NOT NULL, target_id TEXT NOT NULL, created_by TEXT,
      created_utc TEXT NOT NULL, payload_json TEXT NOT NULL DEFAULT '{}', content_sha256 TEXT NOT NULL)`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_interactions_target ON interactions(target_id, kind)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS ledger (
      sequence INTEGER PRIMARY KEY, timestamp_utc TEXT NOT NULL, action TEXT NOT NULL,
      payload_json TEXT NOT NULL, previous_hash TEXT NOT NULL, entry_hash TEXT NOT NULL)`),
  ]);
}

function newId() {
  return randomBytes(12).toString("hex");
}

function clip(s, n) {
  return String(s || "").trim().slice(0, n);
}

async function listThreads(env, q) {
  const query = String(q || "").trim();
  const like = "%" + query.replace(/%/g, "") + "%";
  const sql = `SELECT p.id, p.kind, p.title, p.body, p.created_by, p.created_utc, p.content_sha256,
    (SELECT COUNT(*) FROM posts r WHERE r.parent_id = p.id) AS reply_count,
    (SELECT COUNT(*) FROM interactions i WHERE i.target_id = p.id AND i.kind = 'react') AS react_count
    FROM posts p
    WHERE p.kind IN ('question','post')
    ${query ? "AND (p.title LIKE ? OR p.body LIKE ? OR p.created_by LIKE ?)" : ""}
    ORDER BY p.created_utc DESC LIMIT 100`;
  const stmt = env.DB.prepare(sql);
  const res = query ? await stmt.bind(like, like, like).all() : await stmt.all();
  return res.results || [];
}

async function getPost(env, id) {
  return env.DB.prepare("SELECT * FROM posts WHERE id=?").bind(id).first();
}

async function getReplies(env, parentId) {
  const res = await env.DB.prepare(
    "SELECT * FROM posts WHERE parent_id=? AND kind='reply' ORDER BY created_utc ASC"
  ).bind(parentId).all();
  return res.results || [];
}

async function reactCount(env, id) {
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM interactions WHERE target_id=? AND kind='react'"
  ).bind(id).first();
  return row && row.n != null ? Number(row.n) : 0;
}

async function healthPayload(env) {
  const counts = {};
  try {
    const u = await env.DB.prepare("SELECT COUNT(*) AS n FROM users").first();
    const p = await env.DB.prepare("SELECT COUNT(*) AS n FROM posts").first();
    const q = await env.DB.prepare("SELECT COUNT(*) AS n FROM posts WHERE kind='question'").first();
    const r = await env.DB.prepare("SELECT COUNT(*) AS n FROM posts WHERE kind='reply'").first();
    const i = await env.DB.prepare("SELECT COUNT(*) AS n FROM interactions").first();
    const l = await env.DB.prepare("SELECT COUNT(*) AS n FROM ledger").first();
    counts.users = Number(u && u.n) || 0;
    counts.posts = Number(p && p.n) || 0;
    counts.questions = Number(q && q.n) || 0;
    counts.replies = Number(r && r.n) || 0;
    counts.interactions = Number(i && i.n) || 0;
    counts.ledger_entries = Number(l && l.n) || 0;
    counts.d1 = "ok";
  } catch (err) {
    counts.d1 = "error";
    counts.error = String(err && err.message ? err.message : err);
  }
  return {
    ok: counts.d1 === "ok",
    product: "GodLock",
    site: "godlock.uk",
    author: AUTHOR,
    banner: BANNER,
    limitation: BANNER,
    download: DOWNLOAD,
    github: GITHUB,
    canonical: CANON_HOST,
    ...counts,
  };
}

async function createPost(env, { signed, kind, title, body, parent_id }) {
  const k = kind === "reply" ? "reply" : kind === "post" ? "post" : "question";
  const t = clip(title, TITLE_MAX);
  const b = clip(body, BODY_MAX);
  if (!b) {
    const err = new Error("Body is required.");
    err.status = 400;
    throw err;
  }
  if (k !== "reply" && !t) {
    const err = new Error("Title is required.");
    err.status = 400;
    throw err;
  }
  let parent = parent_id || null;
  if (k === "reply") {
    if (!parent) {
      const err = new Error("Reply needs a parent.");
      err.status = 400;
      throw err;
    }
    const root = await getPost(env, parent);
    if (!root) {
      const err = new Error("Parent not found.");
      err.status = 404;
      throw err;
    }
    if (root.kind === "reply" && root.parent_id) parent = root.parent_id;
  } else {
    parent = null;
  }
  const id = newId();
  const created_utc = new Date().toISOString();
  const created_by = signed.username;
  const content = { kind: k, parent_id: parent, title: t, body: b, created_by, created_utc };
  const content_sha256 = sha256hex(canonicalJson(content));
  await env.DB.prepare(
    "INSERT INTO posts(id,kind,parent_id,title,body,created_by,created_utc,content_sha256) VALUES(?,?,?,?,?,?,?,?)"
  ).bind(id, k, parent, t, b, created_by, created_utc, content_sha256).run();
  const action = k === "reply" ? "REPLY" : k === "question" ? "QUESTION" : "POST";
  await appendLedger(env, action, {
    post_id: id,
    kind: k,
    parent_id: parent,
    title: t,
    body: b,
    created_by,
    content_sha256,
  });
  return { id, kind: k, parent_id: parent };
}

async function createReact(env, { signed, targetId }) {
  const post = await getPost(env, targetId);
  if (!post) {
    const err = new Error("Target not found.");
    err.status = 404;
    throw err;
  }
  const id = newId();
  const created_utc = new Date().toISOString();
  const payload = { emoji: "up" };
  const content_sha256 = sha256hex(canonicalJson({ kind: "react", target_id: targetId, created_by: signed.username, created_utc, payload }));
  await env.DB.prepare(
    "INSERT INTO interactions(id,kind,target_id,created_by,created_utc,payload_json,content_sha256) VALUES(?,?,?,?,?,?,?)"
  ).bind(id, "react", targetId, signed.username, created_utc, canonicalJson(payload), content_sha256).run();
  await appendLedger(env, "INTERACT", {
    interaction_id: id,
    kind: "react",
    target_id: targetId,
    created_by: signed.username,
    payload,
    content_sha256,
  });
  return { id, target_id: post.parent_id || post.id };
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

      if (path === "/robots.txt") {
        return new Response(robotsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders() } });
      }
      if (path === "/sitemap.xml") {
        const xml = await sitemapXml(env);
        return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", ...corsHeaders() } });
      }
      if (path === "/cite.json") {
        return json(citeDoc());
      }
      if (path === "/llms.txt") {
        return new Response(llmsDoc(), { headers: { "Content-Type": "text/plain; charset=utf-8", ...corsHeaders() } });
      }
      if (path === "/health") {
        return json(await healthPayload(env));
      }

      const authRes = await handleAuth(request, url, env);
      if (authRes) return authRes;

      const signed = await getSession(env, request);

      if (path === "/verify") {
        const report = await verifyLedger(env);
        const accept = (request.headers.get("Accept") || "").toLowerCase();
        if (url.searchParams.get("format") === "json" || accept.includes("application/json") && !accept.includes("text/html")) {
          return json({
            ok: report.ok,
            status: report.ok ? "VERIFIED" : "VERIFICATION FAILED",
            product: "GodLock",
            author: AUTHOR,
            banner: BANNER,
            ledger_entries: report.entries,
            ledger_head: report.ledger_head,
            errors: report.errors,
            genesis: ZERO,
            verified_utc: new Date().toISOString(),
          });
        }
        return html(page("Verify", verifyBody({ report }), { signed, path: "/verify", kind: "verify" }));
      }

      if (path === "/archive") {
        const report = await verifyLedger(env);
        const recent = await recentLedger(env, 20);
        return html(page("Archive", archiveBody({ report, recent }), { signed, path: "/archive", kind: "archive" }));
      }

      if (path.startsWith("/receipt/")) {
        const id = decodeURIComponent(path.slice("/receipt/".length));
        const post = await getPost(env, id);
        const entries = await ledgerEntriesForId(env, id);
        return html(page("Receipt", receiptBody({ id, post, entries }), { signed, path: "/receipt/" + id, kind: "archive" }));
      }

      if (path === "/ask" && request.method === "GET") {
        return html(page("Ask", askBody({ signed }), { signed, path: "/ask", kind: "ask" }));
      }
      if (path === "/ask" && request.method === "POST") {
        if (!signed) {
          return html(page("Ask", askBody({ signed: null }), { signed: null, path: "/ask", kind: "ask" }), { status: 401 });
        }
        const form = await request.formData();
        try {
          const created = await createPost(env, {
            signed,
            kind: String(form.get("kind") || "question"),
            title: form.get("title"),
            body: form.get("body"),
          });
          return new Response(null, { status: 303, headers: { Location: "/q/" + created.id } });
        } catch (err) {
          return html(page("Ask", askBody({ signed, error: err.message || "Could not publish." }), { signed, path: "/ask", kind: "ask" }), { status: err.status || 400 });
        }
      }

      if (path.startsWith("/react/") && request.method === "POST") {
        if (!signed) return json({ error: "login required" }, 401);
        const targetId = decodeURIComponent(path.slice("/react/".length));
        try {
          const created = await createReact(env, { signed, targetId });
          return new Response(null, { status: 303, headers: { Location: "/q/" + created.target_id } });
        } catch (err) {
          return json({ error: err.message || "react failed" }, err.status || 400);
        }
      }

      if (path.startsWith("/q/")) {
        const id = decodeURIComponent(path.slice("/q/".length));
        const post = await getPost(env, id);
        if (request.method === "POST") {
          if (!signed) {
            return html(page("Sign in", askBody({ signed: null }), { signed: null, path: "/login", kind: "login" }), { status: 401 });
          }
          const form = await request.formData();
          try {
            await createPost(env, {
              signed,
              kind: "reply",
              title: "",
              body: form.get("body"),
              parent_id: id,
            });
            return new Response(null, { status: 303, headers: { Location: "/q/" + id } });
          } catch (err) {
            const replies = post ? await getReplies(env, post.id) : [];
            const reacts = post ? await reactCount(env, post.id) : 0;
            return html(page("Question", threadBody({ post, replies, reacts, signed, error: err.message }), { signed, path: "/q/" + id, kind: "thread" }), { status: err.status || 400 });
          }
        }
        if (!post) {
          return html(page("Not found", threadBody({ post: null }), { signed, path: "/q/" + id, kind: "thread" }), { status: 404 });
        }
        const root = post.kind === "reply" && post.parent_id ? await getPost(env, post.parent_id) : post;
        const thread = root || post;
        const replies = await getReplies(env, thread.id);
        const reacts = await reactCount(env, thread.id);
        return html(page(thread.title || "Thread", threadBody({ post: thread, replies, reacts, signed }), { signed, path: "/q/" + thread.id, kind: "thread" }));
      }

      if (path === "/" && request.method === "GET") {
        const q = url.searchParams.get("q") || "";
        const rows = await listThreads(env, q);
        return html(page("Home", homeBody({ q, rows, signed }), { signed, path: "/", kind: "home" }));
      }

      return html(page("Not found", `<div class="card"><h2>Not found</h2><p><a href="/">Back home</a></p></div>`, { signed, path }), { status: 404 });
    } catch (err) {
      return json({ ok: false, error: String(err && err.message ? err.message : err), author: AUTHOR, banner: BANNER }, 500);
    }
  },
};
