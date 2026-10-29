/**
 * Bidirectional lattice for godlock.uk receipts.
 * AZRT-DUAL-LATTICE-1.0 + LATTICE-TIEBREAK-1.0.
 *
 * Primary (online writes): aziel-runtime.
 * Secondary (offline writes): aziel-corpus.
 * Third chain: username tie-break so an offline document is not a second chain.
 *
 * Wrap runs after appendLedger. The ledger entry_hash is the document hash.
 * Position is stored beside the receipt, never inside it.
 * Pull-back compares that entry_hash. It does not rebuild the ledger from zero.
 *
 * live stays false. auto_update, RF, and sat stay off. Cap-7 is not ICANN.
 * Author: Aziel Eliab.
 */
import { hashPayload } from "./ledger.js";

export const LATTICE_SPEC = "AZRT-DUAL-LATTICE-1.0";
export const TIEBREAK_SPEC = "LATTICE-TIEBREAK-1.0";
export const LATTICE_GENESIS = "0".repeat(64);
export const PRIMARY_TARGET = "aziel-runtime";
export const SECONDARY_TARGET = "aziel-corpus";
export const LATTICE_HANDLE = "godlock";
export const LATTICE_USER_RE = /^[a-zA-Z0-9._-]{1,80}$/;
export const PRIMARY_ORIGIN = "https://aziel-runtime.vibelock.workers.dev";
export const SECONDARY_ORIGIN = "https://www.azielcorpuslibrary.net";
export const LATTICE_WRAP_PATH = "/v1/lattice/wrap";
export const LATTICE_PULL_PATH = "/v1/lattice/pull";

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
  const injected = deps && deps.fetch;
  if (typeof injected === "function") return injected(url, init, target);
  if (target === PRIMARY_TARGET && env && env.AZIEL_RUNTIME && typeof env.AZIEL_RUNTIME.fetch === "function") {
    return env.AZIEL_RUNTIME.fetch(new Request(url, init));
  }
  if (target === SECONDARY_TARGET && env && env.LATTICE_REMOTE === "1" && typeof fetch === "function") {
    return fetch(url, init);
  }
  return null;
}

async function pushRemote(env, target, body, deps) {
  const url = originFor(target) + LATTICE_WRAP_PATH;
  const init = {
    method: "POST",
    headers: { "content-type": "application/json", "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    body: JSON.stringify(body),
  };
  try {
    const res = await remoteFetch(env, target, url, init, deps);
    if (!res) return { ok: false, published: false, code: "LATTICE-REMOTE-SKIPPED", target };
    const json = await res.json().catch(() => ({}));
    const status = Number(res.status) || 0;
    const published = status === 200 || status === 201;
    return { ok: published && json && json.ok !== false, published, status, target, body: json };
  } catch (err) {
    return { ok: false, published: false, code: "LATTICE-REMOTE-UNREACHABLE", target, detail: String(err && err.message ? err.message : err) };
  }
}

async function pullRemote(env, target, entryHash, deps) {
  const url = originFor(target) + LATTICE_PULL_PATH + "?entry_hash=" + encodeURIComponent(entryHash);
  const init = { method: "GET", headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } };
  try {
    const res = await remoteFetch(env, target, url, init, deps);
    if (!res) return null;
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    if (!json || typeof json !== "object") return null;
    return json.entry_hash ? json : (json.row || null);
  } catch {
    return null;
  }
}

async function persistRow(env, row) {
  memoryRows(env).push(row);
  if (!env || !env.DB || typeof env.DB.prepare !== "function") return;
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
  } catch { /* isolate chain still holds the wrap */ }
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
      username: offline || sync ? LATTICE_HANDLE : null,
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
  const position = rows.length + 1;
  const target = targetForMode(offline ? "offline" : "online");
  const stored = {
    entry_hash,
    document_hash: block.document_hash,
    target,
    offline: block.offline ? 1 : 0,
    position,
    lattice: block,
    created_utc: new Date().toISOString(),
  };
  await persistRow(env, stored);
  const remoteBody = { entry_hash, lattice: block, position, target, spec: LATTICE_SPEC };
  const pushed = await pushRemote(env, target, remoteBody, deps);
  const remotePulled = await pullRemote(env, target, entry_hash, deps);
  const localPulled = await pullLocal(env, entry_hash);
  const localCheck = checkPulledEntry(entry_hash, localPulled);
  const remoteCheck = remotePulled ? checkPulledEntry(entry_hash, remotePulled) : null;
  const pullOk = localCheck.ok && (!remoteCheck || remoteCheck.ok);
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

export function latticePullBody(row) {
  if (!row) {
    return { ok: false, live: false, code: "LATTICE-PULL-MISS", rebuilt_from_zero: false, policy: { ...LATTICE_POLICY } };
  }
  return {
    ok: true,
    live: false,
    code: "LATTICE-PULL-OK",
    entry_hash: row.entry_hash,
    position: row.position,
    target: row.target,
    lattice: row.lattice,
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
  const entry_hash = String(url.searchParams.get("entry_hash") || "");
  const row = await pullLocal(env, entry_hash);
  const body = latticePullBody(row && row.entry_hash === entry_hash ? row : null);
  return { status: body.ok ? 200 : 404, body };
}
