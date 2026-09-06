/**
 * Suite decentralized node mesh client (aziel-runtime /v1/mesh/*).
 * Default OFF. Not an anonymity network. Identity Aziel Eliab only.
 * Runtime routes may not be merged yet — fail closed to empty/disabled.
 * Author: Aziel Eliab.
 */
import { AUTHOR, CATALOG, PUBLIC_RUNTIME, RUNTIME_PATH, ANON_BROADCAST } from "./seo.js";
import { liveNodeCountFromDb } from "./presence.js";

export const MESH_DEFAULT_OFF = true;
export const MESH_ANONYMITY_NETWORK = false;
export const MESH_IDENTITY = AUTHOR;

export const MESH_PATH = "/v1/mesh";
export const MESH_LIST_PATH = "/v1/mesh/list";
export const MESH_JOIN_PATH = "/v1/mesh/join";
export const MESH_HEARTBEAT_PATH = "/v1/mesh/heartbeat";
export const MESH_ENABLE_PATH = "/v1/mesh/enable";
export const MESH_DISABLE_PATH = "/v1/mesh/disable";

export const MESH_OPS = ["join", "heartbeat", "list", "enable", "disable"];

export const PUBLIC_MESH = PUBLIC_RUNTIME + MESH_PATH;
export const PUBLIC_MESH_LIST = PUBLIC_RUNTIME + MESH_LIST_PATH;
export const PUBLIC_MESH_JOIN = PUBLIC_RUNTIME + MESH_JOIN_PATH;
export const PUBLIC_MESH_HEARTBEAT = PUBLIC_RUNTIME + MESH_HEARTBEAT_PATH;
export const PUBLIC_MESH_ENABLE = PUBLIC_RUNTIME + MESH_ENABLE_PATH;
export const PUBLIC_MESH_DISABLE = PUBLIC_RUNTIME + MESH_DISABLE_PATH;

export const BINDING_MESH_URLS = [
  "https://aziel-runtime" + MESH_PATH,
  "https://aziel-runtime" + MESH_LIST_PATH,
  CATALOG + MESH_PATH,
  CATALOG + MESH_LIST_PATH,
];

export const HTTPS_MESH_URLS = [
  CATALOG + MESH_PATH,
  CATALOG + MESH_LIST_PATH,
];

export { ANON_BROADCAST };
export const ANON_BROADCAST_NOTE =
  "Local communique style tool (text → TTS / desk reel / metadata-culled MP4 + SHA-256 receipt). Not hosted on this Worker. No ffmpeg farm.";

const UA = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

function firstNum(...vals) {
  for (const raw of vals) {
    if (raw == null || raw === "") continue;
    const n = typeof raw === "number" ? raw : Number(String(raw).replace(/,/g, ""));
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return null;
}

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return Object.values(value);
  return [];
}

function truthyEnabled(value) {
  if (value === true || value === 1) return true;
  const s = String(value || "").trim().toLowerCase();
  return s === "on" || s === "enabled" || s === "true" || s === "live";
}

export function emptyMesh(extra = {}) {
  return {
    ok: true,
    enabled: false,
    default_off: true,
    live_nodes: 0,
    nodes: [],
    status: extra.status || "off",
    source: extra.source || "fallback",
    anonymity_network: false,
    author: AUTHOR,
    identity: AUTHOR,
    note: "Suite decentralized node mesh. Default off. Not an anonymity network.",
    door: PUBLIC_MESH,
    ...extra,
  };
}

export function compactMeshNode(raw) {
  if (raw == null) return null;
  if (typeof raw === "string") {
    const id = raw.trim();
    return id ? { id } : null;
  }
  if (typeof raw !== "object") return null;
  const id = String(raw.id || raw.node_id || raw.session_id || raw.peer || raw.name || "").trim();
  const product = String(raw.product || raw.slug || raw.suite || "").trim();
  const seen = raw.last_utc || raw.last_seen || raw.seen_utc || raw.heartbeat_utc || "";
  if (!id && !product && !seen) return null;
  const out = {};
  if (id) out.id = id;
  if (product) out.product = product;
  if (seen) out.last_utc = String(seen);
  return out;
}

export function parseMeshDoc(body) {
  if (body == null) return emptyMesh({ status: "unavailable", source: "empty" });
  if (typeof body !== "object" || Array.isArray(body)) {
    return emptyMesh({ status: "unavailable", source: "empty" });
  }
  const inner = body.mesh && typeof body.mesh === "object" && !Array.isArray(body.mesh)
    ? { ...body, ...body.mesh }
    : body;
  const nodes = asList(inner.nodes || inner.list || inner.peers || inner.live_nodes_list)
    .map(compactMeshNode)
    .filter(Boolean);
  const live = firstNum(
    inner.live_nodes,
    inner.mesh_live_nodes,
    inner.count,
    inner.n,
    inner.node_count,
    nodes.length ? nodes.length : null,
  );
  const live_nodes = live != null ? live : 0;
  const enabled = truthyEnabled(inner.enabled)
    || truthyEnabled(inner.mesh_enabled)
    || String(inner.status || "").toLowerCase() === "on";
  const unavailable = inner.ok === false
    && !enabled
    && (inner.error || inner.status === "unavailable" || inner.status === "not_found");
  const status = enabled ? "on" : (unavailable ? "unavailable" : "off");
  return emptyMesh({
    ok: inner.ok !== false,
    enabled,
    default_off: inner.default_off !== false,
    live_nodes: enabled ? live_nodes : 0,
    nodes: enabled ? nodes : [],
    status,
    source: inner.source || "parsed",
    door: inner.door || PUBLIC_MESH,
    note: enabled
      ? "Suite decentralized node mesh is on. Not an anonymity network."
      : "Suite decentralized node mesh. Default off. Not an anonymity network.",
  });
}

export function publicMesh(mesh) {
  const m = mesh && typeof mesh === "object" ? mesh : emptyMesh();
  return {
    enabled: !!m.enabled,
    default_off: m.default_off !== false,
    live_nodes: m.enabled ? (Number(m.live_nodes) || 0) : 0,
    nodes: m.enabled && Array.isArray(m.nodes) ? m.nodes : [],
    status: m.enabled ? "on" : (m.status === "unavailable" ? "unavailable" : "off"),
    source: m.source || "fallback",
    anonymity_network: false,
    author: AUTHOR,
    identity: AUTHOR,
    door: PUBLIC_MESH,
    list: PUBLIC_MESH_LIST,
    join: PUBLIC_MESH_JOIN,
    heartbeat: PUBLIC_MESH_HEARTBEAT,
    enable: PUBLIC_MESH_ENABLE,
    disable: PUBLIC_MESH_DISABLE,
    mcp: RUNTIME_PATH + "/mcp",
    fraggate: RUNTIME_PATH + "/v1/fraggate/call",
    ops: MESH_OPS.slice(),
    note: m.note || "Suite decentralized node mesh. Default off. Not an anonymity network.",
  };
}

export function meshStatusLine(mesh) {
  const m = mesh && typeof mesh === "object" ? mesh : emptyMesh();
  if (m.enabled) {
    const n = Number(m.live_nodes);
    const count = Number.isFinite(n) ? n : 0;
    return "Suite mesh: on · " + count + " live nodes. Not an anonymity network.";
  }
  if (m.status === "unavailable") {
    return "Suite mesh: off (unavailable). Default off. Not an anonymity network.";
  }
  return "Suite mesh: off (default). Not an anonymity network.";
}

/**
 * Public Live Nodes: suite mesh count when mesh is enabled,
 * otherwise GodLock.uk site heartbeats.
 */
export function alignLiveNodes({ siteLiveNodes, mesh, visiting } = {}) {
  const site = Number(siteLiveNodes);
  const siteN = Number.isFinite(site) && site >= 0 ? site : 0;
  if (mesh && mesh.enabled) {
    return liveNodeCountFromDb(mesh.live_nodes, !!visiting);
  }
  return siteN;
}

async function readJsonResponse(res) {
  if (!res) return null;
  if (!res.ok) {
    try {
      if (res.body && typeof res.body.cancel === "function") await res.body.cancel();
    } catch { /* ignore */ }
    return null;
  }
  const ct = String(res.headers.get("Content-Type") || "").toLowerCase();
  if (ct && !ct.includes("json") && !ct.includes("text/plain")) {
    try {
      if (res.body && typeof res.body.cancel === "function") await res.body.cancel();
    } catch { /* ignore */ }
    return null;
  }
  return res.json().catch(() => null);
}

async function fetchJson(fetcher, url, ms) {
  const ac = typeof AbortController === "function" ? new AbortController() : null;
  const timer = ac && ms ? setTimeout(() => ac.abort(), ms) : null;
  try {
    const init = { headers: UA };
    if (ac) init.signal = ac.signal;
    return await fetcher(url, init);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function looksLikeMeshDoc(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  if (body.error && !body.enabled && !body.mesh && !body.nodes && !body.list) return false;
  return body.enabled != null
    || body.mesh_enabled != null
    || body.live_nodes != null
    || body.mesh != null
    || body.nodes != null
    || body.list != null
    || body.peers != null
    || body.status === "on"
    || body.status === "off"
    || body.default_off != null
    || body.door === "mesh";
}

export async function fetchMeshSnapshot(env, deps = {}) {
  const httpFetch = deps.fetch || globalThis.fetch;
  const timeoutMs = deps.timeoutMs != null ? deps.timeoutMs : 3500;
  const hasBinding = !!(env && env.AZIEL_RUNTIME && typeof env.AZIEL_RUNTIME.fetch === "function");

  if (hasBinding) {
    for (const url of BINDING_MESH_URLS) {
      try {
        const res = await env.AZIEL_RUNTIME.fetch(new Request(url, { method: "GET", headers: UA }));
        const body = await readJsonResponse(res);
        if (looksLikeMeshDoc(body)) {
          return parseMeshDoc({ ...body, source: "service-binding" });
        }
      } catch { /* try next binding dest */ }
    }
    return emptyMesh({ status: "unavailable", source: "fallback" });
  }

  /* No binding: only probe HTTPS when a fetch is injected (tests / explicit).
   * Live Nodes run on every homepage/heartbeat — do not stall on origin 404. */
  if (deps.fetch && typeof httpFetch === "function") {
    for (const url of HTTPS_MESH_URLS) {
      try {
        const res = await fetchJson(httpFetch, url, timeoutMs);
        const body = await readJsonResponse(res);
        if (looksLikeMeshDoc(body)) {
          return parseMeshDoc({ ...body, source: "origin" });
        }
      } catch { /* try next */ }
    }
  }

  return emptyMesh({ status: "unavailable", source: "fallback" });
}

export function meshOpsDoc() {
  return {
    door: PUBLIC_MESH,
    list: PUBLIC_MESH_LIST,
    join: PUBLIC_MESH_JOIN,
    heartbeat: PUBLIC_MESH_HEARTBEAT,
    enable: PUBLIC_MESH_ENABLE,
    disable: PUBLIC_MESH_DISABLE,
    mcp: PUBLIC_RUNTIME + "/mcp",
    fraggate: PUBLIC_RUNTIME + "/v1/fraggate/call",
    ops: MESH_OPS.slice(),
    default_off: true,
    anonymity_network: false,
    author: AUTHOR,
    identity: AUTHOR,
    anon_broadcast: ANON_BROADCAST,
    anon_broadcast_note: ANON_BROADCAST_NOTE,
  };
}
