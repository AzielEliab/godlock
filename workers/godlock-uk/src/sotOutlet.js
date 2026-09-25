/**
 * GodLock mesh outlet for runtime sot_sync (SOT-SYNC-1.0).
 * Outlet id: godlock-uk.
 *
 * Authority is live GET https://aziel-runtime.vibelock.workers.dev/v1/software.
 * One SoT change fans in here by pull or by push. This outlet updates
 * Softwares/runtime cite strings only: full git sha, 7-char short sha, and
 * suite version. It does not mirror Softwares cards. GodLock stays
 * GodLock-first. Ask Jeeves is not a Softwares peer.
 *
 * version_id 105fa1ee is the 2026-09-18 isolate label for git 6a3798a.
 * Live GET /v1/software does not publish it. This outlet never re-claims it.
 *
 * Gate: dry_run previews, confirm applies and seals a receipt. confirm is
 * consent to apply the cite. It is not tenant auth.
 * Unreachable authority keeps the last-known cite and reports status
 * "unreachable". Download counters are not touched.
 *
 * Identity Aziel Eliab only.
 */
import { json } from "./http.js";
import { ZERO, hashPayload } from "./ledger.js";
import { floorRuntimeCite } from "./launchReady.js";

export const SOT_SYNC_SPEC = "SOT-SYNC-1.0";
export const SOT_SYNC_OP = "sot_sync";
export const OUTLET_ID = "godlock-uk";
export const AUTHOR = "Aziel Eliab";
export const UNEXPOSED_VERSION_ID = "105fa1ee";
export const SOT_AUTHORITY = "https://aziel-runtime.vibelock.workers.dev/v1/software";
export const SOT_BINDING_URL = "https://aziel-runtime/v1/software";
export const SOT_STATE_KEY = "sot_outlet";
export const SOT_RECEIPT_KEY = "sot_outlet_receipt";

export const SOT_CONFIRM_REQUIRED = "SOT-CONFIRM-REQUIRED";
export const SOT_DRY_RUN = "SOT-DRY-RUN";
export const SOT_VERSION_ID_UNEXPOSED = "SOT-VERSION-ID-UNEXPOSED";
export const SOT_IDENTITY = "SOT-IDENTITY";
export const SOT_OUTLET_MISMATCH = "SOT-OUTLET-MISMATCH";
export const SOT_BAD_SHA = "SOT-BAD-SHA";
export const SOT_BAD_VERSION = "SOT-BAD-VERSION";
export const SOT_BAD_DOC = "SOT-BAD-DOC";
export const SOT_BAD_JSON = "SOT-BAD-JSON";
export const SOT_METHOD = "SOT-METHOD";
export const SOT_UNREACHABLE = "SOT-UNREACHABLE";

export const CONFIRM_CONSENT_NOTE =
  "confirm is consent to apply this SoT cite. It is not tenant auth and it does not upgrade isolation.";

export const UNREACHABLE_NOTE =
  "Live SoT unreachable. Last-known cite kept. This is not a fresh live read.";

const UA = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

export function isTruthyFlag(value) {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes";
  }
  return false;
}

export function isSotOutletPath(path) {
  const p = String(path || "").replace(/\/+$/, "") || "/";
  return p === "/v1/sot" || p === "/v1/sot/sync" || p === "/v1/sot/push";
}

export function memoryStore(seed) {
  const data = new Map();
  if (seed && typeof seed === "object") {
    for (const [k, v] of Object.entries(seed)) data.set(k, v);
  }
  return {
    async get(key) {
      return data.has(key) ? data.get(key) : null;
    },
    async set(key, value) {
      data.set(key, value);
    },
  };
}

export function d1MetadataStore(env) {
  return {
    async get(key) {
      try {
        const row = await env.DB.prepare("SELECT value FROM metadata WHERE key=?").bind(key).first();
        if (!row || row.value == null || row.value === "") return null;
        return JSON.parse(row.value);
      } catch {
        return null;
      }
    },
    async set(key, value) {
      const text = JSON.stringify(value);
      await env.DB.prepare(
        "INSERT INTO metadata(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      ).bind(key, text).run();
    },
  };
}

export function storeFromEnv(env) {
  if (env && env.SOT_STORE && typeof env.SOT_STORE.get === "function") return env.SOT_STORE;
  if (env && env.DB && typeof env.DB.prepare === "function") return d1MetadataStore(env);
  return memoryStore();
}

function honesty() {
  return {
    confirm_is_not_auth: true,
    confirm_is_consent: true,
    confirm_upgrades_isolation: false,
    tenant_auth: false,
    confirm_note: CONFIRM_CONSENT_NOTE,
  };
}

function baseEnvelope(extra) {
  return {
    ok: true,
    spec: SOT_SYNC_SPEC,
    op: SOT_SYNC_OP,
    outlet_id: OUTLET_ID,
    product: "GodLock",
    author: AUTHOR,
    identity: AUTHOR,
    godlock_first: true,
    full_softwares_mirror: false,
    cloned_suite: false,
    ask_jeeves_softwares_peer: false,
    software_cards_applied: 0,
    invented_cards: false,
    download_counters_touched: false,
    version_id_claimed: false,
    ...honesty(),
    ...extra,
  };
}

function refuse(code, message, extra) {
  return baseEnvelope({
    ok: false,
    code,
    applied: false,
    mutated: false,
    dry_run: false,
    receipt: null,
    ledger_written: false,
    message,
    ...extra,
  });
}

export function sotContract() {
  return baseEnvelope({
    read: { method: "GET", path: "/v1/sot", alias: "/v1/sot/sync" },
    authority: SOT_AUTHORITY,
    authority_method: "GET",
    authority_fields: ["version", "git_sha", "count"],
    cite_fields: ["git_sha", "git_sha_short", "version", "runtime_sot"],
    version_id_policy:
      "Omit version_id unless the live SoT document publishes one. Never claim 105fa1ee. That id is the 2026-09-18 isolate label for git 6a3798a and is not on GET /v1/software.",
    pull: {
      direction: "pull",
      method: "POST",
      path: "/v1/sot/sync",
      reads: "GET /v1/software on the authority (service binding https://aziel-runtime/v1/software, then HTTPS). Never GET /download.",
      body: { dry_run: true, confirm: true },
    },
    push: {
      direction: "push",
      method: "POST",
      path: "/v1/sot/push",
      outlet_id: OUTLET_ID,
      body_fields: ["outlet_id", "op", "git_sha", "version", "count", "dry_run", "confirm"],
      wrapped_sot: "Optional object field sot with git_sha and version. software[] cards are ignored.",
    },
    gate: {
      dry_run: "Preview the cite diff. No write. No receipt.",
      confirm: CONFIRM_CONSENT_NOTE + " Set confirm=true to apply and seal a receipt.",
      missing: SOT_CONFIRM_REQUIRED,
      hint: "confirm=true | dry_run=true",
    },
    unreachable: {
      code: SOT_UNREACHABLE,
      keep: "last-known",
      status: "unreachable",
      live: false,
      honest: true,
      note: UNREACHABLE_NOTE,
    },
    floor_cite: floorRuntimeCite().cite,
    note: "GodLock-first outlet. Cite strings only. Not a Softwares mirror. Ask Jeeves is not a card. Download counters stay on the download tracker.",
  });
}

function identityOk(doc) {
  for (const key of ["author", "identity"]) {
    if (doc[key] == null || String(doc[key]).trim() === "") continue;
    if (String(doc[key]).trim() !== AUTHOR) return false;
  }
  return true;
}

function claimsUnexposed(doc) {
  const fields = [doc.version_id, doc.runtime_version_id, doc.cite, doc.runtime_sot];
  if (doc.sot && typeof doc.sot === "object" && !Array.isArray(doc.sot)) {
    fields.push(doc.sot.version_id, doc.sot.runtime_version_id, doc.sot.cite, doc.sot.runtime_sot);
  }
  return fields.some((v) => v != null && String(v).toLowerCase().includes(UNEXPOSED_VERSION_ID));
}

export function parseSotDocument(doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    return { ok: false, code: SOT_BAD_DOC, message: "SoT document must be an object." };
  }
  if (!identityOk(doc)) {
    return { ok: false, code: SOT_IDENTITY, message: "Identity is Aziel Eliab only." };
  }
  if (claimsUnexposed(doc)) {
    return {
      ok: false,
      code: SOT_VERSION_ID_UNEXPOSED,
      message: "Refused unexposed version_id 105fa1ee. Live GET /v1/software does not publish it. Cite not updated.",
    };
  }
  const git_sha = String(doc.git_sha || "").trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(git_sha)) {
    return { ok: false, code: SOT_BAD_SHA, message: "git_sha must be 40 hex characters from GET /v1/software." };
  }
  const version = String(doc.version || doc.suite_version || "").trim();
  if (!version) {
    return { ok: false, code: SOT_BAD_VERSION, message: "Suite version is required." };
  }
  const rawVid = doc.version_id != null ? doc.version_id : doc.runtime_version_id;
  const version_id = rawVid == null || String(rawVid).trim() === "" ? null : String(rawVid).trim();
  const git_sha_short = git_sha.slice(0, 7);
  const cite = version_id
    ? "main " + git_sha_short + " / version_id " + version_id + " / " + version
    : "main " + git_sha_short + " / " + version;
  const count = Number(doc.count);
  const cards_seen = Array.isArray(doc.software) ? doc.software.length : 0;
  return {
    ok: true,
    cards_seen,
    cite: {
      branch: "main",
      version,
      git_sha,
      git_sha_short,
      version_id,
      cite,
      observed_count: Number.isFinite(count) ? count : null,
      author: AUTHOR,
      identity: AUTHOR,
    },
  };
}

function documentFromBody(body) {
  const wrapped = body && body.sot;
  if (wrapped && typeof wrapped === "object" && !Array.isArray(wrapped) && (wrapped.git_sha || wrapped.version)) {
    return {
      ...wrapped,
      author: wrapped.author || body.author,
      identity: wrapped.identity || body.identity,
    };
  }
  return body || {};
}

function citeSnapshot(cite) {
  const c = cite || floorRuntimeCite();
  return {
    branch: c.branch || "main",
    version: c.version,
    git_sha: c.git_sha,
    git_sha_short: c.git_sha_short,
    version_id: c.version_id || null,
    cite: c.cite,
  };
}

function publicCurrent(state) {
  const floor = floorRuntimeCite();
  const cite = state && state.cite ? state.cite : floor;
  const status = state && state.status ? state.status : floor.status;
  const live = state ? state.live !== false : floor.live;
  return {
    status,
    live: status === "unreachable" ? false : live,
    source: (state && state.source) || floor.source,
    kept: status === "unreachable" ? "last-known" : null,
    observed_at: (state && state.observed_at) || null,
    attempted_at: (state && state.attempted_at) || null,
    observed_count: cite.observed_count != null ? cite.observed_count : null,
    ...citeSnapshot(cite),
    version_id: cite.version_id || null,
    note: (state && state.note) || null,
  };
}

async function readState(store) {
  const raw = await store.get(SOT_STATE_KEY);
  return raw && typeof raw === "object" ? raw : null;
}

async function readReceipt(store) {
  const raw = await store.get(SOT_RECEIPT_KEY);
  return raw && typeof raw === "object" ? raw : null;
}

function sealReceipt(previousHash, before, after, extra) {
  const body = {
    spec: SOT_SYNC_SPEC,
    op: SOT_SYNC_OP,
    outlet_id: OUTLET_ID,
    action: "sot-sync",
    author: AUTHOR,
    identity: AUTHOR,
    direction: extra.direction,
    status: extra.status,
    applied: extra.applied === true,
    cite_changed: extra.cite_changed === true,
    before,
    after,
    download_counters_touched: false,
    software_cards_applied: 0,
    version_id: after.version_id || null,
    version_id_claimed: false,
    previous_hash: previousHash || ZERO,
  };
  return { ...body, entry_hash: hashPayload(body) };
}

function isAuthorityUrl(url) {
  const u = String(url || "");
  if (u.includes("/download")) return false;
  return u === SOT_BINDING_URL || u === SOT_AUTHORITY;
}

async function fetchJson(fetcher, url, ms) {
  const ac = typeof AbortController === "function" ? new AbortController() : null;
  const timer = ac && ms ? setTimeout(() => ac.abort(), ms) : null;
  try {
    const init = { method: "GET", headers: UA };
    if (ac) init.signal = ac.signal;
    return await fetcher(url, init);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function pullAuthority(env, deps = {}) {
  const timeoutMs = deps.timeoutMs != null ? deps.timeoutMs : 4000;
  const urls = [];
  const attempts = [];
  if (env && env.AZIEL_RUNTIME && typeof env.AZIEL_RUNTIME.fetch === "function") {
    attempts.push({
      via: "service-binding",
      url: SOT_BINDING_URL,
      fetcher: (url, init) => env.AZIEL_RUNTIME.fetch(new Request(url, init)),
    });
  }
  const httpFetch = deps.fetch || globalThis.fetch;
  if (typeof httpFetch === "function") {
    attempts.push({ via: "https", url: SOT_AUTHORITY, fetcher: httpFetch });
  }
  for (const attempt of attempts) {
    if (!isAuthorityUrl(attempt.url)) continue;
    urls.push(attempt.url);
    try {
      const res = await fetchJson(attempt.fetcher, attempt.url, timeoutMs);
      if (!res || !res.ok) continue;
      const doc = await res.json();
      if (doc && typeof doc === "object" && doc.git_sha && doc.version) {
        return { ok: true, doc, via: attempt.via, url: attempt.url, urls };
      }
    } catch { /* try the next authority front */ }
  }
  return { ok: false, status: "unreachable", urls };
}

function gateOf(body) {
  const dryRun = isTruthyFlag(body && body.dry_run);
  if (dryRun) return { dry_run: true, confirm: false };
  if (isTruthyFlag(body && body.confirm)) return { dry_run: false, confirm: true };
  return { refuse: true };
}

export async function runSotSync({ direction, body, env, store, fetch, now } = {}) {
  const used = store || storeFromEnv(env);
  const gate = gateOf(body);
  const dir = direction === "push" ? "push" : "pull";
  if (gate.refuse) {
    return refuse(
      SOT_CONFIRM_REQUIRED,
      "sot_sync is mutating. Set confirm=true to apply and seal a receipt, or dry_run=true for a preview that does not write. " + CONFIRM_CONSENT_NOTE,
      { direction: dir, hint: "confirm=true | dry_run=true", http: 400 },
    );
  }
  if (body && body.outlet_id != null && String(body.outlet_id).trim() !== "" && String(body.outlet_id) !== OUTLET_ID) {
    return refuse(
      SOT_OUTLET_MISMATCH,
      "This outlet accepts outlet_id godlock-uk only.",
      { direction: dir, http: 400 },
    );
  }

  const previous = await readState(used);
  const beforeCite = previous && previous.cite ? previous.cite : floorRuntimeCite();
  const before = citeSnapshot(beforeCite);
  const prevReceipt = await readReceipt(used);
  const previousHash = prevReceipt && prevReceipt.entry_hash ? prevReceipt.entry_hash : ZERO;
  const stamp = typeof now === "function" ? now() : new Date().toISOString();

  let parsed;
  let urls = [];
  let via = dir;
  if (dir === "pull") {
    const pulled = await pullAuthority(env, { fetch, timeoutMs: body && body.timeoutMs });
    urls = pulled.urls || [];
    if (!pulled.ok) {
      return finishUnreachable({
        used, gate, dir, before, beforeCite, previous, previousHash, stamp, urls,
      });
    }
    via = pulled.via;
    parsed = parseSotDocument(pulled.doc);
  } else {
    parsed = parseSotDocument(documentFromBody(body));
  }

  if (!parsed.ok) {
    return refuse(parsed.code, parsed.message, {
      direction: dir,
      http: 400,
      applied: false,
      before,
      urls,
    });
  }

  const after = citeSnapshot(parsed.cite);
  const citeChanged = after.git_sha !== before.git_sha || after.version !== before.version || after.cite !== before.cite;
  const would = {
    ...after,
    observed_count: parsed.cite.observed_count,
    status: "live",
    live: true,
    source: dir,
    cards_seen: parsed.cards_seen,
    cards_applied: 0,
  };

  if (gate.dry_run) {
    return baseEnvelope({
      code: SOT_DRY_RUN,
      direction: dir,
      via,
      dry_run: true,
      applied: false,
      mutated: false,
      receipt: null,
      ledger_written: false,
      status: "preview",
      live: false,
      cite_changed: citeChanged,
      before,
      would,
      urls,
      http: 200,
      note: "Preview only. No cite write and no receipt. " + CONFIRM_CONSENT_NOTE,
    });
  }

  const receipt = sealReceipt(previousHash, before, after, {
    direction: dir,
    status: "live",
    applied: true,
    cite_changed: citeChanged,
  });
  const state = {
    outlet_id: OUTLET_ID,
    cite: { ...parsed.cite, live: true, status: "live", source: dir },
    status: "live",
    live: true,
    source: dir,
    via,
    observed_at: stamp,
    attempted_at: stamp,
    note: null,
    author: AUTHOR,
    identity: AUTHOR,
    software_cards_applied: 0,
    download_counters_touched: false,
  };
  await used.set(SOT_STATE_KEY, state);
  await used.set(SOT_RECEIPT_KEY, receipt);
  return baseEnvelope({
    direction: dir,
    via,
    dry_run: false,
    confirm: true,
    applied: true,
    mutated: true,
    ledger_written: true,
    status: "live",
    live: true,
    cite_changed: citeChanged,
    before,
    cite: publicCurrent(state),
    receipt,
    urls,
    http: 200,
    note: "Cite strings updated from live SoT. Softwares cards were not copied. Download counters were not touched.",
  });
}

async function finishUnreachable({ used, gate, dir, before, beforeCite, previous, previousHash, stamp, urls }) {
  const after = citeSnapshot(beforeCite);
  if (gate.dry_run) {
    return baseEnvelope({
      code: SOT_UNREACHABLE,
      direction: dir,
      dry_run: true,
      applied: false,
      mutated: false,
      receipt: null,
      ledger_written: false,
      status: "unreachable",
      live: false,
      kept: "last-known",
      honest: true,
      cite_changed: false,
      before,
      would: { ...after, status: "unreachable", live: false, kept: "last-known" },
      urls,
      http: 200,
      note: UNREACHABLE_NOTE + " Preview only. No write.",
    });
  }
  const receipt = sealReceipt(previousHash, before, after, {
    direction: dir,
    status: "unreachable",
    applied: false,
    cite_changed: false,
  });
  const state = {
    outlet_id: OUTLET_ID,
    cite: { ...beforeCite, version_id: beforeCite.version_id || null },
    status: "unreachable",
    live: false,
    source: (previous && previous.source) || "floor",
    observed_at: (previous && previous.observed_at) || null,
    attempted_at: stamp,
    note: UNREACHABLE_NOTE,
    author: AUTHOR,
    identity: AUTHOR,
    software_cards_applied: 0,
    download_counters_touched: false,
  };
  await used.set(SOT_STATE_KEY, state);
  await used.set(SOT_RECEIPT_KEY, receipt);
  return baseEnvelope({
    code: SOT_UNREACHABLE,
    direction: dir,
    dry_run: false,
    confirm: true,
    applied: false,
    mutated: true,
    ledger_written: true,
    status: "unreachable",
    live: false,
    kept: "last-known",
    honest: true,
    cite_changed: false,
    before,
    cite: publicCurrent(state),
    receipt,
    urls,
    http: 200,
    note: UNREACHABLE_NOTE,
  });
}

export async function loadAppliedCite(env) {
  const state = await readState(storeFromEnv(env));
  if (!state || !state.cite || !state.cite.git_sha) return null;
  return {
    ...state.cite,
    live: state.status === "unreachable" ? false : state.live !== false,
    status: state.status || "live",
    source: state.source || "pull",
  };
}

export async function handleSotOutlet(request, env, path) {
  const p = String(path || "").replace(/\/+$/, "") || "/";
  const method = String(request.method || "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") {
    if (p === "/v1/sot/push") {
      return json(refuse(SOT_METHOD, "POST /v1/sot/push accepts a runtime sot_sync push. GET /v1/sot reads the outlet."), 405);
    }
    const store = storeFromEnv(env);
    const state = await readState(store);
    const receipt = await readReceipt(store);
    const body = {
      ...sotContract(),
      current: publicCurrent(state),
      receipt: receipt || null,
    };
    return json(body);
  }
  if (method !== "POST") {
    return json(refuse(SOT_METHOD, "Use GET /v1/sot, POST /v1/sot/sync, or POST /v1/sot/push."), 405);
  }
  if (p === "/v1/sot") {
    return json(refuse(SOT_METHOD, "GET /v1/sot reads the outlet. POST /v1/sot/sync pulls. POST /v1/sot/push accepts a push."), 405);
  }
  let body = {};
  const raw = await request.text();
  if (String(raw || "").trim()) {
    try {
      body = JSON.parse(raw);
    } catch {
      return json(refuse(SOT_BAD_JSON, "SoT sync body must be JSON."), 400);
    }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json(refuse(SOT_BAD_JSON, "SoT sync body must be a JSON object."), 400);
  }
  const direction = p === "/v1/sot/push" ? "push" : "pull";
  const result = await runSotSync({
    direction,
    body,
    env,
    store: storeFromEnv(env),
    fetch: env && env.SOT_FETCH,
  });
  const status = result.http || (result.ok ? 200 : 400);
  const { http, ...publicBody } = result;
  return json(publicBody, status);
}
