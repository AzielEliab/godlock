/**
 * Serve-time runtime tip observation for godlock.uk cite and HTML.
 *
 * One front door: GET /v1/health (service binding, then HTTPS). Health carries
 * git_sha and version_id and is cache-control no-store. /v1/software is not
 * read here: that catalog is multi-megabyte and may be served stale-while-revalidate.
 * No mesh, download, or per-card fanout.
 *
 * Floor, observation, expected, and live tip stay distinct.
 * A stale, unavailable, timed-out, malformed, or deploy-lag read does not become the live tip.
 * Since runtime 15ef5e6, GET /v1/health copies git_sha_source and
 * git_sha_tracks_deployed_tip and does not copy deploy_lag. A live tip is
 * source deploy_var, tracks strictly true, and no deploy_lag key.
 * Omitted or partial keys stay an observation. An outlet push that omits
 * them can still seal an expectation, and that expectation is not the live tip.
 * The floor pin is not rewritten from this read.
 */
import {
  emptyObservation,
  floorRuntimeCite,
  RUNTIME_GIT_SHA_SHORT,
  RUNTIME_SOT_BRANCH,
} from "./launchReady.js";
import { RUNTIME_DEPLOY_LAG, healthTipAllowsLive, loadAppliedCite, parseSotDocument } from "./sotOutlet.js";

export const RUNTIME_HEALTH_BINDING = "https://aziel-runtime/v1/health";
export const RUNTIME_HEALTH_HTTPS = "https://aziel-runtime.vibelock.workers.dev/v1/health";
export const RUNTIME_OBSERVE_TTL_MS = 60_000;
export const RUNTIME_OBSERVE_NEGATIVE_TTL_MS = 15_000;
export const RUNTIME_OBSERVE_TIMEOUT_MS = 2500;

const moduleCache = { entry: null };

function nowMs(env, deps) {
  if (deps && typeof deps.now === "function") return deps.now();
  if (env && typeof env.RUNTIME_NOW_MS === "function") return env.RUNTIME_NOW_MS();
  return Date.now();
}

function iso(ms) {
  return new Date(ms).toISOString();
}

function cacheApi(env) {
  if (env && env.RUNTIME_CITE_CACHE instanceof Map) {
    return {
      get() { return env.RUNTIME_CITE_CACHE.get("obs") || null; },
      set(entry) { env.RUNTIME_CITE_CACHE.set("obs", entry); },
    };
  }
  if (env && env.MESH_PROBE_ORIGIN === false) {
    if (!Object.prototype.hasOwnProperty.call(env, "__runtimeCiteCache")) {
      Object.defineProperty(env, "__runtimeCiteCache", { value: { entry: null }, enumerable: false });
    }
    return {
      get() { return env.__runtimeCiteCache.entry; },
      set(entry) { env.__runtimeCiteCache.entry = entry; },
    };
  }
  if (typeof process !== "undefined" && process.env && process.env.NODE_TEST_CONTEXT) return null;
  return {
    get() { return moduleCache.entry; },
    set(entry) { moduleCache.entry = entry; },
  };
}

function isHealthUrl(url) {
  const u = String(url || "");
  if (u.includes("/download") || u.includes("/v1/software") || u.includes("/v1/mesh")) return false;
  return u === RUNTIME_HEALTH_BINDING || u === RUNTIME_HEALTH_HTTPS;
}

function isAbort(err, signal) {
  if (signal && signal.aborted) return true;
  if (!err) return false;
  if (err.name === "AbortError" || err.code === 20) return true;
  return /aborted|AbortError/i.test(String(err && err.message));
}

async function fetchHealth(fetcher, url, ms) {
  const ac = typeof AbortController === "function" ? new AbortController() : null;
  let timer = null;
  const init = {
    method: "GET",
    headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
  };
  if (ac) init.signal = ac.signal;
  let pending;
  try {
    pending = Promise.resolve(fetcher(url, init));
  } catch (err) {
    if (isAbort(err, ac && ac.signal)) {
      const aborted = new Error("timeout");
      aborted.name = "AbortError";
      throw aborted;
    }
    throw err;
  }
  const timed = new Promise((_, reject) => {
    timer = setTimeout(() => {
      if (ac) ac.abort();
      const aborted = new Error("timeout");
      aborted.name = "AbortError";
      reject(aborted);
    }, ms);
  });
  try {
    return await Promise.race([pending, timed]);
  } catch (err) {
    pending.catch(() => {});
    if (isAbort(err, ac && ac.signal)) {
      const aborted = new Error("timeout");
      aborted.name = "AbortError";
      throw aborted;
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function lagObservation(seen, meta, code, note, status) {
  const attempted = meta && meta.attempted_at;
  const sha = seen && seen.git_sha ? seen.git_sha : null;
  const short = sha ? sha.slice(0, RUNTIME_GIT_SHA_SHORT.length) : null;
  const version = seen && seen.version ? seen.version : null;
  return emptyObservation(status, {
    attempted_at: attempted || null,
    observed_at: (meta && meta.observed_at) || attempted || null,
    source_date: (meta && meta.source_date) || null,
    source: (meta && meta.source) || null,
    http_status: meta && meta.http_status != null ? meta.http_status : null,
    git_sha: sha,
    git_sha_short: short,
    version,
    version_id: seen && seen.version_id ? seen.version_id : null,
    cite: sha && version ? (RUNTIME_SOT_BRANCH + " " + short + " / " + version) : null,
    current: false,
    code,
    note,
  });
}

export function observationFromDocument(doc, meta) {
  const parsed = parseSotDocument(doc);
  const attempted = meta && meta.attempted_at;
  if (!parsed.ok) {
    const lag = parsed.code === RUNTIME_DEPLOY_LAG;
    const seen = lag && parsed.observed && parsed.observed.git_sha ? parsed.observed : null;
    return lagObservation(seen, meta, parsed.code || "SOT-BAD-DOC", lag
      ? "GET /v1/health named a git_sha that does not track the deployed tip. The observation time is this read. Not a live tip."
      : (parsed.message || "GET /v1/health did not publish a cite. Live tip not stamped."), lag ? "lag" : "malformed");
  }
  const health = healthTipAllowsLive(doc);
  if (!health.ok) {
    return lagObservation(parsed.cite, meta, health.code || RUNTIME_DEPLOY_LAG,
      "GET /v1/health is a live tip only when git_sha_source is deploy_var and git_sha_tracks_deployed_tip is true, with deploy_lag absent. This read is not that shape.",
      "lag");
  }
  const sha = parsed.cite.git_sha;
  const short = sha.slice(0, RUNTIME_GIT_SHA_SHORT.length);
  const version = parsed.cite.version;
  const version_id = parsed.cite.version_id || null;
  return {
    role: "observation",
    status: "current",
    current: true,
    live: false,
    git_sha: sha,
    git_sha_short: short,
    version,
    version_id,
    cite: RUNTIME_SOT_BRANCH + " " + short + " / " + version,
    observed_at: (meta && meta.observed_at) || attempted || null,
    attempted_at: attempted || null,
    source_date: (meta && meta.source_date) || null,
    source: (meta && meta.source) || null,
    http_status: meta && meta.http_status != null ? meta.http_status : 200,
    refresh_status: null,
    refresh_attempted_at: null,
    code: null,
    note: "Fresh GET /v1/health observation. Not the floor and not a sealed expectation.",
  };
}

function liveFromObservation(observation, expected) {
  if (!observation || observation.status !== "current" || !observation.git_sha) return null;
  const floor = floorRuntimeCite();
  return {
    role: "live",
    live: true,
    current: true,
    branch: RUNTIME_SOT_BRANCH,
    version: observation.version,
    git_sha: observation.git_sha,
    git_sha_short: observation.git_sha_short,
    version_id: observation.version_id || null,
    cite: observation.cite,
    observed_at: observation.observed_at,
    source_date: observation.source_date || null,
    source: observation.source || null,
    matches_floor: observation.git_sha === floor.git_sha,
    matches_expected: expected && expected.git_sha ? observation.git_sha === expected.git_sha : null,
  };
}

function failureObservation(status, meta) {
  return emptyObservation(status, {
    attempted_at: meta.attempted_at || null,
    source_date: meta.source_date || null,
    source: meta.source || null,
    http_status: meta.http_status != null ? meta.http_status : null,
    code: meta.code || null,
    note: meta.note,
  });
}

async function readOne(attempt, timeoutMs, attemptedAt) {
  let res;
  try {
    res = await fetchHealth(attempt.fetcher, attempt.url, timeoutMs);
  } catch (err) {
    if (isAbort(err)) {
      return failureObservation("timeout", {
        attempted_at: attemptedAt,
        source: attempt.via,
        code: "RUNTIME-OBSERVE-TIMEOUT",
        note: "GET /v1/health timed out. Live tip not stamped.",
      });
    }
    return failureObservation("unavailable", {
      attempted_at: attemptedAt,
      source: attempt.via,
      code: "RUNTIME-OBSERVE-UNAVAILABLE",
      note: "GET /v1/health did not answer. Live tip not stamped.",
    });
  }
  const httpStatus = res && typeof res.status === "number" ? res.status : 0;
  const sourceDate = res && res.headers && typeof res.headers.get === "function"
    ? res.headers.get("date")
    : null;
  if (!res || !res.ok) {
    return failureObservation("unavailable", {
      attempted_at: attemptedAt,
      source: attempt.via,
      source_date: sourceDate,
      http_status: httpStatus || null,
      code: "RUNTIME-OBSERVE-UNAVAILABLE",
      note: "GET /v1/health returned " + (httpStatus || "no status") + ". Live tip not stamped.",
    });
  }
  let doc;
  try {
    doc = await res.json();
  } catch {
    return failureObservation("malformed", {
      attempted_at: attemptedAt,
      source: attempt.via,
      source_date: sourceDate,
      http_status: httpStatus,
      code: "SOT-BAD-JSON",
      note: "GET /v1/health body was not JSON. Live tip not stamped.",
    });
  }
  return observationFromDocument(doc, {
    attempted_at: attemptedAt,
    observed_at: attemptedAt,
    source: attempt.via,
    source_date: sourceDate,
    http_status: httpStatus,
  });
}

function attemptsFor(env, deps) {
  const attempts = [];
  if (env && env.AZIEL_RUNTIME && typeof env.AZIEL_RUNTIME.fetch === "function") {
    attempts.push({
      via: "service-binding",
      url: RUNTIME_HEALTH_BINDING,
      fetcher: (url, init) => env.AZIEL_RUNTIME.fetch(new Request(url, init)),
    });
  }
  const injected = deps && deps.fetch
    ? deps.fetch
    : (env && typeof env.SOT_FETCH === "function" ? env.SOT_FETCH : null);
  const probeOrigin = !(env && env.MESH_PROBE_ORIGIN === false);
  if (injected) {
    attempts.push({ via: "https", url: RUNTIME_HEALTH_HTTPS, fetcher: injected });
  } else if (attempts.length && probeOrigin && typeof globalThis.fetch === "function") {
    attempts.push({ via: "https", url: RUNTIME_HEALTH_HTTPS, fetcher: globalThis.fetch });
  }
  return attempts.filter((row) => isHealthUrl(row.url));
}

function rank(status) {
  if (status === "current") return 4;
  if (status === "malformed") return 3;
  if (status === "timeout") return 2;
  if (status === "unavailable") return 1;
  return 0;
}

export async function observeRuntimeHealth(env, deps = {}) {
  const now = nowMs(env, deps);
  const ttl = deps.ttlMs != null
    ? deps.ttlMs
    : (env && env.RUNTIME_OBSERVE_TTL_MS != null ? env.RUNTIME_OBSERVE_TTL_MS : RUNTIME_OBSERVE_TTL_MS);
  const negativeTtl = deps.negativeTtlMs != null
    ? deps.negativeTtlMs
    : (env && env.RUNTIME_OBSERVE_NEGATIVE_TTL_MS != null ? env.RUNTIME_OBSERVE_NEGATIVE_TTL_MS : RUNTIME_OBSERVE_NEGATIVE_TTL_MS);
  const timeoutMs = deps.timeoutMs != null
    ? deps.timeoutMs
    : (env && env.RUNTIME_OBSERVE_TIMEOUT_MS != null ? env.RUNTIME_OBSERVE_TIMEOUT_MS : RUNTIME_OBSERVE_TIMEOUT_MS);
  const cache = cacheApi(env);
  const cached = cache ? cache.get() : null;
  if (cached && cached.observation && cached.observation.status === "current" && now - cached.storedAt < ttl) {
    return cached.observation;
  }
  if (cached && cached.refreshFailedAt && now - cached.refreshFailedAt < negativeTtl && cached.staleObservation) {
    return cached.staleObservation;
  }
  if (deps.block === false) {
    return emptyObservation("not-read", {
      note: "This response does not wait on GET /v1/health. A live tip is published only after a current observation on /cite.json.",
    });
  }

  const attempts = attemptsFor(env, deps);
  const attemptedAt = iso(now);
  if (!attempts.length) {
    return emptyObservation("not-read", {
      attempted_at: null,
      note: "No health front door was configured for this response. The floor is not stamped as the live tip.",
    });
  }

  let best = null;
  for (const attempt of attempts) {
    const observation = await readOne(attempt, timeoutMs, attemptedAt);
    if (!best || rank(observation.status) > rank(best.status)) best = observation;
    if (observation.status === "current") break;
  }

  if (best && best.status === "current") {
    if (cache) cache.set({ storedAt: now, observation: best, refreshFailedAt: 0, staleObservation: null });
    return best;
  }

  if (cached && cached.observation && cached.observation.status === "current") {
    const stale = {
      ...cached.observation,
      status: "stale",
      current: false,
      live: false,
      refresh_status: best ? best.status : "unavailable",
      refresh_attempted_at: attemptedAt,
      note: "Cached GET /v1/health observation is older than the freshness window and the refresh did not succeed. Not a current live tip.",
    };
    if (cache) {
      cache.set({
        storedAt: cached.storedAt,
        observation: cached.observation,
        refreshFailedAt: now,
        staleObservation: stale,
      });
    }
    return stale;
  }

  if (cache && best && best.status !== "not-read") {
    cache.set({
      storedAt: now,
      observation: null,
      refreshFailedAt: now,
      staleObservation: best,
    });
  }
  return best || failureObservation("unavailable", {
    attempted_at: attemptedAt,
    code: "RUNTIME-OBSERVE-UNAVAILABLE",
    note: "GET /v1/health did not answer. Live tip not stamped.",
  });
}

export async function readExpectedCite(env) {
  const applied = await loadAppliedCite(env);
  if (!applied || applied.status !== "live" || !applied.git_sha || applied.source === "floor") return null;
  return {
    role: "expected",
    live: false,
    current: false,
    git_sha: applied.git_sha,
    git_sha_short: applied.git_sha_short,
    version: applied.version,
    version_id: applied.version_id || null,
    cite: applied.cite,
    observed_at: applied.observed_at || null,
    source: applied.source || "pull",
    note: "Sealed outlet expectation. Not a live tip until a fresh health observation is current.",
  };
}

export async function loadRuntimeProvenance(env, deps) {
  const floor = floorRuntimeCite();
  let expected = null;
  let observation;
  try {
    expected = await readExpectedCite(env);
    observation = await observeRuntimeHealth(env, deps);
  } catch {
    observation = failureObservation("unavailable", {
      attempted_at: iso(nowMs(env, deps)),
      code: "RUNTIME-OBSERVE-UNAVAILABLE",
      note: "GET /v1/health failed. Live tip not stamped.",
    });
  }
  const live = liveFromObservation(observation, expected);
  if (live && expected && expected.git_sha) live.matches_expected = live.git_sha === expected.git_sha;
  return {
    role: "provenance",
    floor,
    observation,
    expected,
    live,
  };
}
