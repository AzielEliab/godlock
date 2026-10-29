/**
 * Bidirectional lattice for godlock.uk receipts.
 * AZRT-DUAL-LATTICE-1.0 + LATTICE-TIEBREAK-1.0.
 *
 * Primary (online writes): aziel-runtime.
 * Secondary (offline writes): aziel-corpus.
 * Third chain: the submitting user's tie-break, so an offline document is not a second chain.
 * The handle is that submitter. It is not a fixed product name.
 *
 * Wrap runs after appendLedger. The ledger entry_hash is the document hash.
 * Position is stored beside the receipt, never inside it.
 * Pull-back compares that entry_hash. It does not rebuild the ledger from zero.
 *
 * live stays false. auto_update, RF, and sat stay off. Cap-7 is not ICANN.
 * Author: Aziel Eliab.
 */
import { timingSafeEqual } from "node:crypto";
import { hashPayload } from "./ledger.js";

export const LATTICE_SPEC = "AZRT-DUAL-LATTICE-1.0";
export const TIEBREAK_SPEC = "LATTICE-TIEBREAK-1.0";
export const LATTICE_GENESIS = "0".repeat(64);
export const PRIMARY_TARGET = "aziel-runtime";
export const SECONDARY_TARGET = "aziel-corpus";
export const LATTICE_USER_RE = /^[a-zA-Z0-9._-]{1,80}$/;
export const PRIMARY_ORIGIN = "https://aziel-runtime.vibelock.workers.dev";
export const SECONDARY_ORIGIN = "https://www.azielcorpuslibrary.net";
export const LATTICE_WRAP_PATH = "/v1/lattice/wrap";
export const LATTICE_PULL_PATH = "/v1/lattice/pull";

/**
 * Pull scope. One chain across every user, site, use, host, access point, node, and mesh.
 * A narrower value is a silo and is refused. These are query fields on the existing
 * /v1/lattice/wrap and /v1/lattice/pull routes. They are not new runtime or corpus routes.
 */
export const LATTICE_AGGREGATE_SCOPE = Object.freeze({
  users: "all",
  sites: "all",
  uses: "all",
  hosts: "all",
  access_points: "all",
  nodes: "all",
  mesh: "all",
});

const AGGREGATE_KEYS = Object.keys(LATTICE_AGGREGATE_SCOPE);

/** Not a LIVE flag. Cap-7 is not an ICANN name. No spend, no auto-update, RF/sat off. */
export const LATTICE_POLICY = Object.freeze({
  live: false,
  auto_update: false,
  rf: false,
  sat: false,
  cap7_is_icann: false,
  spend: false,
  primary_target: PRIMARY_TARGET,
  secondary_target: SECONDARY_TARGET,
  tiebreak: TIEBREAK_SPEC,
});

const HEX64 = /^[a-f0-9]{64}$/;

export class LatticeError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function isHex64(value) {
  return typeof value === "string" && HEX64.test(value);
}

export function latticePrimary(documentHash, primaryPrev) {
  return hashPayload({ document: documentHash, prev: primaryPrev || LATTICE_GENESIS });
}

export function latticeOfflineSecondary(documentHash, username) {
  return hashPayload({ primary: documentHash, username: String(username) });
}

export function latticeOnlineSecondary(primary, secondaryPrev) {
  return hashPayload({ offline: false, prev: secondaryPrev || LATTICE_GENESIS, primary });
}

export function latticeTiebreak({ prev, primary, secondary, username }) {
  return hashPayload({
    chain: "tiebreak",
    prev: prev || LATTICE_GENESIS,
    primary,
    secondary,
    username: String(username),
  });
}

export function tiebreakIndexKey(username, documentHash) {
  return String(username) + "\u0000" + String(documentHash);
}

export function latticeUsername(offline, username) {
  if (!offline) return null;
  const name = username == null ? "" : String(username).trim();
  if (!name || !LATTICE_USER_RE.test(name)) {
    throw new LatticeError(
      "LATTICE-USERNAME-ABSENT",
      "An offline write needs a short username handle. A legal name is not stored. Nothing was written.",
    );
  }
  return name;
}

export function latticeTips(rows) {
  let primary = LATTICE_GENESIS;
  let secondary = LATTICE_GENESIS;
  let count = 0;
  for (const row of rows || []) {
    const lat = row && row.lattice;
    if (!lat || !isHex64(lat.primary) || !isHex64(lat.secondary)) continue;
    primary = lat.primary;
    secondary = lat.secondary;
    count += 1;
  }
  return { primary, secondary, count };
}

export function tiebreakTip(rows) {
  let tip = LATTICE_GENESIS;
  for (const row of rows || []) {
    const tb = row && row.lattice && row.lattice.tiebreak;
    if (tb && tb.status === "synced" && isHex64(tb.hash)) tip = tb.hash;
  }
  return tip;
}

/**
 * Plan one lattice block. Position is not an input and is not in the block.
 * Online primary links the chain. Offline secondary is H(document hash + username).
 * sync writes the username tie-break and refuses a second sync (LATTICE-DOUBLE).
 */
export function planLattice({ document_hash, offline = false, username = null, rows = null, sync = false } = {}) {
  if (!isHex64(document_hash)) throw new LatticeError("LATTICE-DOCUMENT", "A lattice row needs a SHA-256 document hash.");
  const off = offline === true;
  const user = latticeUsername(off, username);
  const prev = latticeTips(rows || []);
  const primary = latticePrimary(document_hash, prev.primary);
  const secondary = off
    ? latticeOfflineSecondary(document_hash, user)
    : latticeOnlineSecondary(primary, prev.secondary);
  if (off) {
    for (const row of rows || []) {
      const lat = row && row.lattice;
      if (lat && lat.offline === true && lat.secondary === secondary) {
        throw new LatticeError(
          "LATTICE-DOUBLE",
          "This document is already stored for this user while offline. The secondary hash matched, so it was not written twice.",
        );
      }
    }
  }
  let tiebreak;
  if (!off && sync === true) {
    const name = latticeUsername(true, username);
    const offSecondary = latticeOfflineSecondary(document_hash, name);
    let found = false;
    let synced = false;
    for (const row of rows || []) {
      const lat = row && row.lattice;
      if (!lat || lat.document_hash !== document_hash) continue;
      if (lat.offline === true && lat.secondary === offSecondary) found = true;
      if (lat.tiebreak && lat.tiebreak.status === "synced" && lat.tiebreak.offline_secondary === offSecondary) synced = true;
    }
    if (synced) {
      throw new LatticeError(
        "LATTICE-DOUBLE",
        "This user's offline document is already synced. The tie-break index matched, so it was not written twice.",
      );
    }
    if (!found) {
      throw new LatticeError(
        "LATTICE-SYNC-NO-OFFLINE",
        "No offline write by this user exists for this document, so there is nothing to sync. Nothing was written.",
      );
    }
    const tprev = tiebreakTip(rows || []);
    tiebreak = {
      status: "synced",
      hash: latticeTiebreak({ prev: tprev, primary, secondary: offSecondary, username: name }),
      prev: tprev,
      offline_secondary: offSecondary,
    };
  }
  return {
    ...(tiebreak ? { tiebreak } : {}),
    spec: LATTICE_SPEC,
    document_hash,
    primary,
    primary_prev: prev.primary,
    secondary,
    secondary_prev: prev.secondary,
    offline: off,
    username: user,
    lattices: ["primary", "secondary"],
  };
}

export function latticeMode(env) {
  const raw = String(env && env.LATTICE_MODE || "online").trim().toLowerCase();
  if (raw === "offline" || raw === "sync") return raw;
  return "online";
}

export function targetForMode(mode) {
  return mode === "offline" ? SECONDARY_TARGET : PRIMARY_TARGET;
}

/** Remote wrap/pull stays off until LATTICE_REMOTE=1. Unset does not call runtime or corpus. */
export function latticeRemoteEnabled(env) {
  return !!(env && String(env.LATTICE_REMOTE) === "1");
}

/** The tie-break handle is the submitter passed by the worker, never a fixed product name. */
export function submittingUsername(entry, deps) {
  const raw = deps && deps.username != null ? deps.username : (entry && entry.username != null ? entry.username : null);
  if (raw == null) return null;
  const name = String(raw).trim();
  return name || null;
}

export function scopeIsAggregate(scope) {
  if (!scope || typeof scope !== "object") return false;
  for (const key of AGGREGATE_KEYS) {
    if (scope[key] !== "all") return false;
  }
  return true;
}

export function aggregateQuery(entryHash) {
  const q = new URLSearchParams();
  if (entryHash) q.set("entry_hash", String(entryHash));
  q.set("aggregate", "1");
  for (const key of AGGREGATE_KEYS) q.set(key, LATTICE_AGGREGATE_SCOPE[key]);
  return q.toString();
}

function siloParam(url) {
  for (const key of AGGREGATE_KEYS) {
    const value = url.searchParams.get(key);
    if (value != null && value !== "" && value !== "all") return key;
  }
  return null;
}

function wantsAggregate(url) {
  if (url.searchParams.get("aggregate") === "1") return true;
  return AGGREGATE_KEYS.some((key) => url.searchParams.get(key) === "all");
}

/**
 * Operator secret for an aggregate listing. Wrangler secret LATTICE_OPERATOR_TOKEN.
 * Header only: Authorization (Bearer or raw) or X-Aziel-Runtime-Token.
 * A query string or body never carries it. Unset secret fails closed.
 */
function operatorSecret(env) {
  const raw = env && env.LATTICE_OPERATOR_TOKEN;
  if (typeof raw !== "string") return "";
  return raw.trim();
}

function headerOperatorToken(request) {
  if (!request || !request.headers || typeof request.headers.get !== "function") return "";
  const auth = request.headers.get("Authorization");
  const alt = request.headers.get("X-Aziel-Runtime-Token");
  const fromAuth = auth == null ? "" : bearerOrRaw(String(auth));
  const fromAlt = alt == null ? "" : String(alt).trim();
  if (fromAuth && fromAlt && fromAuth !== fromAlt) return "";
  return fromAuth || fromAlt;
}

function bearerOrRaw(value) {
  const trimmed = String(value || "").trim();
  const bearer = /^Bearer\s+(\S+)\s*$/i.exec(trimmed);
  if (bearer) return bearer[1];
  if (/^Bearer\b/i.test(trimmed)) return "";
  if (/\s/.test(trimmed)) return "";
  return trimmed;
}

async function verifyOperatorToken(presented, expected) {
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(presented)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const providedBytes = new Uint8Array(providedHash);
  const expectedBytes = new Uint8Array(expectedHash);
  if (typeof crypto.subtle.timingSafeEqual === "function") {
    return crypto.subtle.timingSafeEqual(providedBytes, expectedBytes);
  }
  return timingSafeEqual(providedBytes, expectedBytes);
}

/** True only when the header token matches the configured operator secret. */
export async function aggregateAuthorized(request, env) {
  const expected = operatorSecret(env);
  const presented = headerOperatorToken(request);
  if (!expected || !presented) return false;
  return verifyOperatorToken(presented, expected);
}

export function aggregateAuthRefusal() {
  return {
    ok: false,
    live: false,
    code: "LATTICE-AGGREGATE-AUTH",
    aggregate: false,
    auth: "required",
    rebuilt_from_zero: false,
    policy: { ...LATTICE_POLICY },
  };
}

/**
 * Accept a remote pull that aggregated every dimension, including a rows list.
 * A scope that names one user, site, host, node, or mesh is a silo and is not a hit.
 */
export function rowFromRemotePull(body, entryHash) {
  const want = String(entryHash || "");
  if (!body || typeof body !== "object") return { row: null, silo: false, aggregate: false };
  if (body.scope && !scopeIsAggregate(body.scope)) return { row: null, silo: true, aggregate: false };
  const nested = body.aggregate && typeof body.aggregate === "object" ? body.aggregate : null;
  const rows = Array.isArray(body.rows) ? body.rows : (nested && Array.isArray(nested.rows) ? nested.rows : null);
  const aggregate = body.aggregate === true || !!nested || scopeIsAggregate(body.scope) || Array.isArray(rows);
  if (rows) {
    const hit = rows.find((row) => row && String(row.entry_hash || "") === want);
    return { row: hit || null, silo: false, aggregate: true };
  }
  if (body.row && typeof body.row === "object") {
    const row = String(body.row.entry_hash || "") === want ? body.row : null;
    return { row, silo: false, aggregate };
  }
  if (String(body.entry_hash || "") === want) return { row: body, silo: false, aggregate };
  return { row: null, silo: false, aggregate };
}

function memoryRows(env) {
  if (!env) return [];
  if (!Array.isArray(env.__latticeRows)) env.__latticeRows = [];
  return env.__latticeRows;
}

function rowFromDb(row) {
  if (!row) return null;
  let lattice = row.lattice;
  if (typeof row.lattice_json === "string") {
    try { lattice = JSON.parse(row.lattice_json); } catch { lattice = null; }
  }
  return {
    entry_hash: String(row.entry_hash || ""),
    document_hash: String(row.document_hash || (lattice && lattice.document_hash) || ""),
    target: String(row.target || ""),
    offline: Number(row.offline) ? 1 : 0,
    position: Number(row.position) || 0,
    lattice,
  };
}

/** Chain tips for the next wrap. Not a ledger walk from genesis. */
export async function loadLatticeRows(env) {
  const mem = memoryRows(env);
  if (env && env.DB && typeof env.DB.prepare === "function") {
    try {
      const res = await env.DB.prepare(
        "SELECT entry_hash, document_hash, target, offline, position, lattice_json FROM lattice_chain ORDER BY position ASC /* lattice-rows */"
      ).all();
      const rows = (res && res.results ? res.results : []).map(rowFromDb).filter((r) => r && r.lattice);
      if (rows.length) return rows;
    } catch { /* memory holds the chain when D1 has no lattice table yet */ }
  }
  return mem.slice();
}

/**
 * Pull one wrapped receipt by entry_hash.
 * One indexed read. Does not SELECT the ledger and does not rebuild from zero.
 */
export async function pullLocal(env, entryHash) {
  const want = String(entryHash || "");
  if (!isHex64(want)) return null;
  if (env && env.DB && typeof env.DB.prepare === "function") {
    try {
      const row = await env.DB.prepare(
        "SELECT entry_hash, document_hash, target, offline, position, lattice_json FROM lattice_chain WHERE entry_hash = ? ORDER BY position DESC LIMIT 1 /* lattice-pull */"
      ).bind(want).first();
      const parsed = rowFromDb(row);
      if (parsed && parsed.entry_hash === want) return parsed;
    } catch { /* fall through to the in-isolate chain */ }
  }
  const hits = memoryRows(env).filter((r) => r && r.entry_hash === want);
  return hits.length ? hits[hits.length - 1] : null;
}

export function checkPulledEntry(expectedHash, pulled) {
  const want = String(expectedHash || "");
  if (!pulled || typeof pulled !== "object") {
    return { ok: false, code: "LATTICE-PULL-MISS", entry_hash: "", rebuilt_from_zero: false, live: false };
  }
  const got = String(pulled.entry_hash || "");
  const match = got === want && isHex64(got);
  return {
    ok: match,
    code: match ? "LATTICE-PULL-OK" : "LATTICE-ENTRY-MISMATCH",
    entry_hash: got,
    position: pulled.position != null ? Number(pulled.position) : null,
    rebuilt_from_zero: false,
    live: false,
  };
}

function originFor(target) {
  return target === SECONDARY_TARGET ? SECONDARY_ORIGIN : PRIMARY_ORIGIN;
}

async function remoteFetch(env, target, url, init, deps) {
  if (!latticeRemoteEnabled(env)) return { skipped: true, res: null };
  const injected = deps && deps.fetch;
  if (typeof injected === "function") return { skipped: false, res: await injected(url, init, target) };
  if (target === PRIMARY_TARGET && env && env.AZIEL_RUNTIME && typeof env.AZIEL_RUNTIME.fetch === "function") {
    return { skipped: false, res: await env.AZIEL_RUNTIME.fetch(new Request(url, init)) };
  }
  if (typeof fetch === "function") return { skipped: false, res: await fetch(url, init) };
  return { skipped: false, res: null };
}

async function pushRemote(env, target, body, deps) {
  const url = originFor(target) + LATTICE_WRAP_PATH;
  const init = {
    method: "POST",
    headers: { "content-type": "application/json", "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    body: JSON.stringify(body),
  };
  try {
    const got = await remoteFetch(env, target, url, init, deps);
    if (got.skipped) return { ok: false, published: false, called: false, code: "LATTICE-REMOTE-SKIPPED", target };
    if (!got.res) return { ok: false, published: false, called: true, code: "LATTICE-REMOTE-MISS", target };
    const json = await got.res.json().catch(() => ({}));
    const status = Number(got.res.status) || 0;
    if (status === 404 || status >= 400) {
      return { ok: false, published: false, called: true, code: "LATTICE-REMOTE-MISS", status, target, body: json };
    }
    const published = status === 200 || status === 201;
    const ok = published && json && json.ok !== false;
    return {
      ok,
      published,
      called: true,
      status,
      target,
      body: json,
      code: ok ? "LATTICE-WRAP-PUSH" : "LATTICE-REMOTE-MISS",
    };
  } catch (err) {
    return { ok: false, published: false, called: true, code: "LATTICE-REMOTE-UNREACHABLE", target, detail: String(err && err.message ? err.message : err) };
  }
}

async function pullRemote(env, target, entryHash, deps) {
  const url = originFor(target) + LATTICE_PULL_PATH + "?" + aggregateQuery(entryHash);
  const init = { method: "GET", headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } };
  try {
    const got = await remoteFetch(env, target, url, init, deps);
    if (got.skipped) return { skipped: true, missed: false, silo: false, row: null };
    const status = got.res ? Number(got.res.status) || 0 : 0;
    if (!got.res || !got.res.ok || status === 404) {
      return { skipped: false, missed: true, silo: false, row: null, status };
    }
    const json = await got.res.json().catch(() => null);
    const picked = rowFromRemotePull(json, entryHash);
    if (picked.silo || !picked.row) {
      return { skipped: false, missed: true, silo: !!picked.silo, row: null, status };
    }
    return { skipped: false, missed: false, silo: false, row: picked.row, status };
  } catch (err) {
    return { skipped: false, missed: true, silo: false, row: null, detail: String(err && err.message ? err.message : err) };
  }
}

function isConstraintError(err) {
  const msg = String(err && err.message ? err.message : err || "");
  return /unique|primary key|constraint|SQLITE_CONSTRAINT/i.test(msg);
}

/** Next position is max(D1, memory)+1. rows.length is not a position. */
async function nextPosition(env) {
  const mem = memoryRows(env);
  const memMax = mem.reduce((max, row) => Math.max(max, Number(row && row.position) || 0), 0);
  let dbMax = null;
  if (env && env.DB && typeof env.DB.prepare === "function") {
    try {
      const row = await env.DB.prepare(
        "SELECT COALESCE(MAX(position), 0) AS n FROM lattice_chain /* lattice-next-position */"
      ).first();
      if (row && row.n != null && Number.isFinite(Number(row.n))) dbMax = Number(row.n);
    } catch { /* no lattice table yet; memory is the chain */ }
  }
  const base = dbMax == null ? memMax : Math.max(dbMax, memMax);
  return { position: base + 1, db: dbMax != null };
}

/**
 * Write D1 first. A primary-key collision or other D1 failure does not leave
 * the row only in memory, so the two stores cannot drift.
 */
async function persistRow(env, row) {
  const mem = memoryRows(env);
  if (mem.some((item) => Number(item && item.position) === row.position)) {
    return { ok: false, code: "LATTICE-POSITION-COLLISION" };
  }
  const hasDb = !!(env && env.DB && typeof env.DB.prepare === "function");
  let dbAuthoritative = false;
  if (hasDb) {
    try {
      const probe = await env.DB.prepare(
        "SELECT COALESCE(MAX(position), 0) AS n FROM lattice_chain /* lattice-persist-probe */"
      ).first();
      dbAuthoritative = !!(probe && probe.n != null && Number.isFinite(Number(probe.n)));
    } catch { dbAuthoritative = false; }
    try {
      await env.DB.prepare(
        "INSERT INTO lattice_chain(entry_hash, document_hash, target, offline, position, lattice_json, created_utc) VALUES(?,?,?,?,?,?,?)"
      ).bind(
        row.entry_hash,
        row.document_hash,
        row.target,
        row.offline,
        row.position,
        JSON.stringify(row.lattice),
        row.created_utc,
      ).run();
    } catch (err) {
      if (isConstraintError(err)) return { ok: false, code: "LATTICE-POSITION-COLLISION" };
      if (dbAuthoritative) return { ok: false, code: "LATTICE-PERSIST-FAILED" };
    }
  }
  mem.push(row);
  return { ok: true };
}

/**
 * Wrap one ledger entry into the lattice, then pull it back by entry_hash.
 * Call this after appendLedger. Position stays off the receipt.
 */
export async function wrapLedgerEntry(env, entry, deps = {}) {
  const policy = { ...LATTICE_POLICY };
  const entry_hash = entry && entry.entry_hash ? String(entry.entry_hash) : "";
  if (!isHex64(entry_hash)) {
    return { ok: false, live: false, code: "LATTICE-DOCUMENT", policy, rebuilt_from_zero: false, written: false };
  }
  const rows = await loadLatticeRows(env);
  const mode = latticeMode(env);
  const offlinePrior = rows.some((r) => r.lattice && r.lattice.offline === true && r.lattice.document_hash === entry_hash);
  const offline = mode === "offline";
  const sync = mode === "sync" || (mode === "online" && offlinePrior);
  const username = submittingUsername(entry, deps);
  if (!sync) {
    const already = rows.find((r) => r.entry_hash === entry_hash);
    if (already) {
      const pulled = await pullLocal(env, entry_hash);
      const check = checkPulledEntry(entry_hash, pulled);
      return {
        ok: check.ok,
        live: false,
        code: "LATTICE-ALREADY",
        written: false,
        direction: { wrap: true, pull: check.ok },
        target: already.target,
        position: already.position,
        entry_hash,
        pull: check,
        lattice: already.lattice,
        policy,
        rebuilt_from_zero: false,
      };
    }
  }
  let block;
  try {
    block = planLattice({
      document_hash: entry_hash,
      offline,
      username: offline || sync ? username : null,
      rows,
      sync,
    });
  } catch (err) {
    const code = err && err.code ? err.code : "LATTICE-WRAP-FAILED";
    return { ok: false, live: false, code, written: false, policy, rebuilt_from_zero: false, entry_hash };
  }
  if (Object.prototype.hasOwnProperty.call(block, "position")) {
    return { ok: false, live: false, code: "LATTICE-POSITION-INSIDE", written: false, policy, rebuilt_from_zero: false };
  }
  const allocated = await nextPosition(env);
  const target = targetForMode(offline ? "offline" : "online");
  const stored = {
    entry_hash,
    document_hash: block.document_hash,
    target,
    offline: block.offline ? 1 : 0,
    position: allocated.position,
    lattice: block,
    created_utc: new Date().toISOString(),
  };
  const saved = await persistRow(env, stored);
  if (!saved.ok) {
    return {
      ok: false,
      live: false,
      code: saved.code,
      written: false,
      policy,
      rebuilt_from_zero: false,
      entry_hash,
    };
  }
  const position = stored.position;
  const remoteBody = {
    entry_hash,
    lattice: block,
    position,
    target,
    spec: LATTICE_SPEC,
    aggregate: true,
    scope: { ...LATTICE_AGGREGATE_SCOPE },
  };
  if (!latticeRemoteEnabled(env)) {
    const localPulled = await pullLocal(env, entry_hash);
    const localCheck = checkPulledEntry(entry_hash, localPulled);
    return {
      ok: localCheck.ok,
      live: false,
      code: localCheck.ok ? "LATTICE-LOCAL" : "LATTICE-PULL-MISS",
      written: true,
      direction: { wrap: true, pull: localCheck.ok },
      target,
      position,
      entry_hash,
      lattice: block,
      remote: { ok: false, published: false, called: false, code: "LATTICE-REMOTE-SKIPPED", target },
      pull: localCheck,
      remote_pull: null,
      policy,
      rebuilt_from_zero: false,
    };
  }
  const pushed = await pushRemote(env, target, remoteBody, deps);
  const remotePulled = await pullRemote(env, target, entry_hash, deps);
  const localPulled = await pullLocal(env, entry_hash);
  const localCheck = checkPulledEntry(entry_hash, localPulled);
  const remoteCheck = remotePulled.row ? checkPulledEntry(entry_hash, remotePulled.row) : null;
  const remoteOk = pushed.ok === true && pushed.published === true && !!(remoteCheck && remoteCheck.ok);
  if (!remoteOk) {
    return {
      ok: false,
      live: false,
      code: remotePulled.silo ? "LATTICE-SILO-REFUSED" : "LATTICE-REMOTE-MISS",
      written: true,
      direction: { wrap: true, pull: false },
      target,
      position,
      entry_hash,
      lattice: block,
      remote: pushed,
      pull: localCheck,
      remote_pull: remoteCheck,
      policy,
      rebuilt_from_zero: false,
    };
  }
  const pullOk = localCheck.ok && remoteCheck.ok;
  return {
    ok: pullOk,
    live: false,
    code: pullOk ? "LATTICE-WRAP-PULL" : "LATTICE-PULL-MISS",
    written: true,
    direction: { wrap: true, pull: pullOk },
    target,
    position,
    entry_hash,
    lattice: block,
    remote: pushed,
    pull: localCheck,
    remote_pull: remoteCheck,
    policy,
    rebuilt_from_zero: false,
  };
}

const OFFLINE_USER_KEYS = new Set(["username", "offline_user", "offline_username", "offline-user", "user"]);

/** Copy a pull lattice without the offline submitter handle. Does not mutate the stored row. */
export function stripOfflineUsernames(value) {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(stripOfflineUsernames);
  const out = {};
  for (const key of Object.keys(value)) {
    if (OFFLINE_USER_KEYS.has(key)) continue;
    const val = value[key];
    out[key] = val && typeof val === "object" ? stripOfflineUsernames(val) : val;
  }
  return out;
}

export function latticePullBody(row, { includeUsernames = false } = {}) {
  if (!row) {
    return {
      ok: false,
      live: false,
      code: "LATTICE-PULL-MISS",
      aggregate: false,
      silo: false,
      rebuilt_from_zero: false,
      policy: { ...LATTICE_POLICY },
    };
  }
  const lattice = includeUsernames ? row.lattice : stripOfflineUsernames(row.lattice);
  return {
    ok: true,
    live: false,
    code: "LATTICE-PULL-OK",
    entry_hash: row.entry_hash,
    position: row.position,
    target: row.target,
    lattice,
    aggregate: false,
    silo: false,
    rebuilt_from_zero: false,
    policy: { ...LATTICE_POLICY },
  };
}

function publicLatticeRow(row) {
  return {
    entry_hash: row.entry_hash,
    position: row.position,
    target: row.target,
    lattice: row.lattice,
  };
}

export function latticeAggregateBody(rows, entryHash) {
  const list = (rows || []).filter((row) => row && row.entry_hash).map(publicLatticeRow);
  const want = String(entryHash || "");
  const hit = want ? list.find((row) => row.entry_hash === want) : null;
  const matched = !want || !!hit;
  return {
    ok: matched,
    live: false,
    code: matched ? "LATTICE-AGGREGATE" : "LATTICE-PULL-MISS",
    aggregate: true,
    silo: false,
    scope: { ...LATTICE_AGGREGATE_SCOPE },
    rows: list,
    count: list.length,
    entry_hash: hit ? hit.entry_hash : (want ? "" : undefined),
    position: hit ? hit.position : undefined,
    target: hit ? hit.target : undefined,
    lattice: hit ? hit.lattice : undefined,
    rebuilt_from_zero: false,
    policy: { ...LATTICE_POLICY },
  };
}

export async function handleLatticeHttp(request, env, path) {
  if (path !== LATTICE_PULL_PATH && path !== LATTICE_WRAP_PATH) return null;
  if (path === LATTICE_WRAP_PATH) {
    return {
      status: 405,
      body: {
        ok: false,
        live: false,
        code: "LATTICE-WRAP-INTERNAL",
        message: "Lattice wrap runs after appendLedger inside GodLock. This door does not accept a public wrap.",
        policy: { ...LATTICE_POLICY },
      },
    };
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return { status: 405, body: { ok: false, live: false, code: "LATTICE-PULL-GET", policy: { ...LATTICE_POLICY } } };
  }
  const url = new URL(request.url);
  if (siloParam(url)) {
    return {
      status: 400,
      body: {
        ok: false,
        live: false,
        code: "LATTICE-SILO-REFUSED",
        aggregate: true,
        silo: true,
        scope: { ...LATTICE_AGGREGATE_SCOPE },
        rebuilt_from_zero: false,
        policy: { ...LATTICE_POLICY },
      },
    };
  }
  const entry_hash = String(url.searchParams.get("entry_hash") || "");
  if (wantsAggregate(url)) {
    const allowed = await aggregateAuthorized(request, env);
    if (!allowed) return { status: 401, body: aggregateAuthRefusal() };
    const rows = await loadLatticeRows(env);
    const body = latticeAggregateBody(rows, entry_hash);
    const missing = !!entry_hash && !body.entry_hash;
    return { status: missing ? 404 : 200, body };
  }
  const row = await pullLocal(env, entry_hash);
  const includeUsernames = await aggregateAuthorized(request, env);
  const body = latticePullBody(row && row.entry_hash === entry_hash ? row : null, { includeUsernames });
  return { status: body.ok ? 200 : 404, body };
}
