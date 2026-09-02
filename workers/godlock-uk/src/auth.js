/**
 * Signup / login for GodLock.uk. Same scrypt pattern as Aziel Digital Library.
 * Hidden operator uses Cloudflare secret MASTER_HASH_JSON if bound.
 * No username, password, or hash is hardcoded.
 * Author: Aziel Eliab.
 */
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { page, loginBody, signupBody } from "./ui.js";
import { appendLedger } from "./ledger.js";

const SCRYPT = { N: 16384, r: 8, p: 1, dklen: 32 };

function b64(buf) { return Buffer.from(buf).toString("base64"); }
function fromB64(s) { return Buffer.from(s, "base64"); }
function cookie(token) {
  return "godlock_session=" + token + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800";
}
function clearCookie() {
  return "godlock_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}
export function readCookie(request) {
  const raw = request.headers.get("Cookie") || "";
  const m = raw.match(/(?:^|;\s*)godlock_session=([^;]+)/);
  return m ? m[1] : "";
}
function safeEq(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  try { return timingSafeEqual(a, b); } catch { return false; }
}
function masterRec(env) {
  try { return env.MASTER_HASH_JSON ? JSON.parse(env.MASTER_HASH_JSON) : null; } catch { return null; }
}
function masterName(env) {
  const rec = masterRec(env);
  return rec && rec.username ? String(rec.username) : "";
}
function isMasterUsername(env, username) {
  const n = masterName(env);
  return !!(n && username && n.toLowerCase() === String(username).toLowerCase());
}
function verifyMaster(password, rec) {
  if (!rec || !rec.username || !rec.salt_b64 || !rec.hash_b64) return false;
  const salt = fromB64(rec.salt_b64);
  const expected = fromB64(rec.hash_b64);
  const got = scryptSync(password, salt, rec.dklen || 32, { N: rec.n || 16384, r: rec.r || 8, p: rec.p || 1 });
  return safeEq(got, expected);
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders() },
  });
}

export function html(pageBody, { status = 200, extraHeaders } = {}) {
  return new Response(pageBody, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders(), ...(extraHeaders || {}) },
  });
}

export async function getSession(env, request) {
  const token = readCookie(request);
  if (!token || !env.DB) return null;
  const row = await env.DB.prepare("SELECT * FROM sessions WHERE token=?").bind(token).first();
  if (!row) return null;
  if (row.expires_utc && row.expires_utc < new Date().toISOString()) {
    await env.DB.prepare("DELETE FROM sessions WHERE token=?").bind(token).run();
    return null;
  }
  return row;
}

function validUsername(name) {
  return /^[A-Za-z0-9_]{3,40}$/.test(name);
}

export async function handleAuth(request, url, env) {
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const signed = await getSession(env, request);

  if (path === "/signup" && request.method === "GET") {
    return html(page("Sign up", signupBody({}), { signed, path: "/signup", kind: "signup" }));
  }
  if (path === "/login" && request.method === "GET") {
    return html(page("Log in", loginBody({}), { signed, path: "/login", kind: "login" }));
  }
  if (path === "/logout") {
    const token = readCookie(request);
    if (token && env.DB) await env.DB.prepare("DELETE FROM sessions WHERE token=?").bind(token).run();
    return new Response(null, { status: 303, headers: { Location: "/", "Set-Cookie": clearCookie() } });
  }
  if (path === "/signup" && request.method === "POST") {
    const form = await request.formData();
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    if (!validUsername(username) || !password) {
      return html(page("Sign up", signupBody({ error: "Username (3–40 letters/numbers) and password required." }), { signed: null, path: "/signup", kind: "signup" }), { status: 400 });
    }
    if (isMasterUsername(env, username)) {
      return html(page("Sign up", signupBody({ error: "Username unavailable." }), { signed: null, path: "/signup", kind: "signup" }), { status: 400 });
    }
    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, SCRYPT.dklen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
    const id = randomBytes(12).toString("hex");
    try {
      await env.DB.prepare(
        "INSERT INTO users(id,username,salt_b64,hash_b64,n,r,p,dklen,created_utc) VALUES(?,?,?,?,?,?,?,?,?)"
      ).bind(id, username, b64(salt), b64(hash), SCRYPT.N, SCRYPT.r, SCRYPT.p, SCRYPT.dklen, new Date().toISOString()).run();
    } catch {
      return html(page("Sign up", signupBody({ error: "Username unavailable." }), { signed: null, path: "/signup", kind: "signup" }), { status: 400 });
    }
    await appendLedger(env, "SIGNUP", { user_id: id, username });
    const token = randomBytes(24).toString("hex");
    const exp = new Date(Date.now() + 7 * 864e5).toISOString();
    await env.DB.prepare("INSERT INTO sessions(token,user_id,username,expires_utc) VALUES(?,?,?,?)").bind(token, id, username, exp).run();
    return new Response(null, { status: 303, headers: { Location: "/", "Set-Cookie": cookie(token) } });
  }
  if (path === "/login" && request.method === "POST") {
    const form = await request.formData();
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    let userId = "", ok = false, sessionName = username;
    const rec = masterRec(env);
    if (isMasterUsername(env, username)) {
      ok = verifyMaster(password, rec);
      if (ok) { userId = "master"; sessionName = "operator"; }
    } else {
      const row = await env.DB.prepare("SELECT * FROM users WHERE username=?").bind(username).first();
      if (row) {
        const got = scryptSync(password, fromB64(row.salt_b64), row.dklen, { N: row.n, r: row.r, p: row.p });
        ok = safeEq(got, fromB64(row.hash_b64));
        if (ok) userId = row.id;
      }
    }
    if (!ok) {
      return html(page("Log in", loginBody({ error: "Login failed." }), { signed: null, path: "/login", kind: "login" }), { status: 401 });
    }
    const token = randomBytes(24).toString("hex");
    const exp = new Date(Date.now() + 7 * 864e5).toISOString();
    await env.DB.prepare("INSERT INTO sessions(token,user_id,username,expires_utc) VALUES(?,?,?,?)").bind(token, userId, sessionName, exp).run();
    return new Response(null, { status: 303, headers: { Location: "/", "Set-Cookie": cookie(token) } });
  }
  return null;
}
