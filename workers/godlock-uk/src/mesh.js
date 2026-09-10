/**
 * Suite mesh client aligned to QNM-BUILD-1.0.
 * Public rollup is live|locked|isolated counts only. No Node Gate. No auto-heal.
 * Default OFF until operator/runtime enable. Not an anonymity network.
 * QNS-CD-1.0 is a hub cite / Worker mesh cross-map only (photon QNS1
 * packet transfer). Local qnsd lives in qnm-node. This Worker does not
 * implement qnsd and does not expose a public qnsd proxy.
 * Identity Aziel Eliab only. Runtime routes may not be merged yet — fail closed.
 * Author: Aziel Eliab.
 */
import { AUTHOR, CATALOG, PUBLIC_RUNTIME, RUNTIME_PATH, ANON_BROADCAST, GITHUB_RUNTIME } from "./seo.js";

export const QNM_SPEC = "QNM-BUILD-1.0";
export const QNS_CD_SPEC = "QNS-CD-1.0";
export const QNS_CD_NAME = "photon QNS1 packet transfer";
export const QNM_NODE = "https://github.com/AzielEliab/qnm-node";
export const AZINTERFACE = "https://github.com/AzielEliab/azinterface";
export const MESH_DEFAULT_OFF = true;
export const MESH_ANONYMITY_NETWORK = false;
export const MESH_NODE_GATE = false;
export const MESH_AUTO_HEAL = false;
export const MESH_IDENTITY = AUTHOR;

/** Hub cite / Worker mesh cross-map. Not a Softwares-tab product. No public qnsd proxy. */
export const QNS_CD = Object.freeze({
  spec: QNS_CD_SPEC,
  name: QNS_CD_NAME,
  kind: "hub-cite",
  softwares_tab: false,
  public_proxy: false,
  local_qnsd: true,
  qnsd_implemented_here: false,
  node_gate: false,
  default_off: true,
  identity: AUTHOR,
  author: AUTHOR,
  qnsd: QNM_NODE,
  runtime: GITHUB_RUNTIME,
  pair_custody: AZINTERFACE,
  cites: Object.freeze({
    qnm_node: QNM_NODE,
    aziel_runtime: GITHUB_RUNTIME,
    azinterface: AZINTERFACE,
    qnm_wp: GITHUB_RUNTIME + "/blob/main/docs/designs/QNM-WP-1.0.md",
    node_ops: GITHUB_RUNTIME + "/blob/main/docs/designs/NODE-OPS-1.0.md",
    node_mesh: GITHUB_RUNTIME + "/blob/main/docs/NODE_MESH.md",
    qnm_build: QNM_NODE + "/blob/main/docs/QNM-BUILD-1.0.md",
  }),
  note: "QNS-CD-1.0 photon QNS1 packet transfer. Hub cite / Worker mesh cross-map only. Not a Softwares-tab product. Local qnsd is coded in qnm-node. Runtime cites + catalog field live in aziel-runtime. AZInterface holds pair custody. This Worker does not implement qnsd and does not expose a public qnsd proxy.",
});

export const MESH_NOTE =
  "QNM-BUILD-1.0. QNS-CD-1.0 photon QNS1 packet transfer (hub cite / Worker mesh cross-map only; local qnsd in qnm-node; no public proxy). Suite mesh default off. Live|locked|isolated counts only. No Node Gate. No auto-heal. Not an anonymity network.";
export const MESH_NOTE_ON =
  "QNM-BUILD-1.0. QNS-CD-1.0 photon QNS1 packet transfer (hub cite / Worker mesh cross-map only; local qnsd in qnm-node; no public proxy). Suite mesh is on. Live|locked|isolated counts only. No Node Gate. No auto-heal. Not an anonymity network.";

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
  "Local communique style tool (text → TTS / desk reel / metadata-culled MP4 + SHA-256 receipt). Not a publish path on godlock.uk. Not hosted on this Worker. No ffmpeg farm.";

const UA = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

function firstNum(...vals) {
  for (const raw of vals) {
    if (raw == null || raw === "") continue;
    const n = typeof raw === "number" ? raw : Number(String(raw).replace(/,/g, ""));
    if (Number.isFinite(n) && n >= 0) return Math.floor(n);
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

export function emptyRollup() {
  return { live: 0, locked: 0, isolated: 0 };
}

export function meshRollup(mesh) {
  const m = mesh && typeof mesh === "object" ? mesh : {};
  const r = m.rollup && typeof m.rollup === "object" && !Array.isArray(m.rollup) ? m.rollup : {};
  return {
    live: firstNum(r.live, m.live_nodes, m.live) ?? 0,
    locked: firstNum(r.locked, m.locked_nodes, m.locked) ?? 0,
    isolated: firstNum(r.isolated, m.isolated_nodes, m.isolated) ?? 0,
  };
}

function parseRollup(inner, listedLive) {
  const r = inner.rollup && typeof inner.rollup === "object" && !Array.isArray(inner.rollup)
    ? inner.rollup
    : {};
  const live = firstNum(
    r.live,
    r.live_nodes,
    r.live_count,
    inner.live,
    inner.live_nodes,
    inner.mesh_live_nodes,
    inner.live_count,
    inner.count,
    inner.n,
    inner.node_count,
    listedLive,
  );
  const locked = firstNum(
    r.locked,
    r.locked_nodes,
    r.locked_count,
    inner.locked,
    inner.locked_nodes,
    inner.locked_count,
  );
  const isolated = firstNum(
    r.isolated,
    r.isolated_nodes,
    r.isolated_count,
    inner.isolated,
    inner.isolated_nodes,
    inner.isolated_count,
  );
  return {
    live: live != null ? live : 0,
    locked: locked != null ? locked : 0,
    isolated: isolated != null ? isolated : 0,
  };
}

export function emptyMesh(extra = {}) {
  const rollup = extra.rollup && typeof extra.rollup === "object"
    ? { ...emptyRollup(), ...extra.rollup }
    : emptyRollup();
  return {
    ok: true,
    spec: QNM_SPEC,
    enabled: false,
    default_off: true,
    live_nodes: 0,
    status: extra.status || "off",
    source: extra.source || "fallback",
    node_gate: false,
    auto_heal: false,
    anonymity_network: false,
    author: AUTHOR,
    identity: AUTHOR,
    note: MESH_NOTE,
    door: PUBLIC_MESH,
    ...extra,
    spec: QNM_SPEC,
    qns_cd: QNS_CD,
    rollup,
    node_gate: false,
    auto_heal: false,
    anonymity_network: false,
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
  const listed = asList(inner.nodes || inner.list || inner.peers || inner.live_nodes_list)
    .map(compactMeshNode)
    .filter(Boolean);
  const rollup = parseRollup(inner, listed.length ? listed.length : null);
  const enabled = truthyEnabled(inner.enabled)
    || truthyEnabled(inner.mesh_enabled)
    || String(inner.status || "").toLowerCase() === "on";
  const unavailable = inner.ok === false
    && !enabled
    && (inner.error || inner.status === "unavailable" || inner.status === "not_found");
  const status = enabled ? "on" : (unavailable ? "unavailable" : "off");
  const live = enabled ? rollup.live : 0;
  const locked = enabled ? rollup.locked : 0;
  const isolated = enabled ? rollup.isolated : 0;
  return emptyMesh({
    ok: inner.ok !== false,
    enabled,
    default_off: inner.default_off !== false,
    live_nodes: live,
    rollup: { live, locked, isolated },
    status,
    source: inner.source || "parsed",
    door: inner.door || PUBLIC_MESH,
    note: enabled ? MESH_NOTE_ON : MESH_NOTE,
  });
}

export function publicMesh(mesh) {
  const m = mesh && typeof mesh === "object" ? mesh : emptyMesh();
  const enabled = !!m.enabled;
  const rollup = enabled ? meshRollup(m) : emptyRollup();
  return {
    spec: QNM_SPEC,
    enabled,
    default_off: m.default_off !== false,
    live_nodes: enabled ? rollup.live : 0,
    rollup,
    status: enabled ? "on" : (m.status === "unavailable" ? "unavailable" : "off"),
    source: m.source || "fallback",
    node_gate: false,
    auto_heal: false,
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
    qns_cd: QNS_CD,
    note: m.note || MESH_NOTE,
  };
}

export function meshStatusLine(mesh) {
  const m = mesh && typeof mesh === "object" ? mesh : emptyMesh();
  if (m.enabled) {
    const r = meshRollup(m);
    return "Suite mesh: on · live " + r.live + " · locked " + r.locked + " · isolated " + r.isolated + ". QNS-CD-1.0. Not an anonymity network.";
  }
  if (m.status === "unavailable") {
    return "Suite mesh: off (unavailable). QNM-BUILD-1.0. QNS-CD-1.0. Not an anonymity network.";
  }
  return "Suite mesh: off (default). QNM-BUILD-1.0. QNS-CD-1.0. Not an anonymity network.";
}

/**
 * Public Live Nodes: QNM rollup.live when mesh is enabled (no visiting floor),
 * otherwise GodLock.uk site heartbeats.
 */
export function alignLiveNodes({ siteLiveNodes, mesh } = {}) {
  const site = Number(siteLiveNodes);
  const siteN = Number.isFinite(site) && site >= 0 ? site : 0;
  if (mesh && mesh.enabled) {
    return meshRollup(mesh).live;
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
  if (body.error && !body.enabled && !body.mesh && !body.nodes && !body.list && !body.rollup) return false;
  return body.enabled != null
    || body.mesh_enabled != null
    || body.live_nodes != null
    || body.rollup != null
    || body.locked != null
    || body.isolated != null
    || body.mesh != null
    || body.nodes != null
    || body.list != null
    || body.peers != null
    || body.status === "on"
    || body.status === "off"
    || body.default_off != null
    || body.spec === QNM_SPEC
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
    spec: QNM_SPEC,
    door: PUBLIC_MESH,
    list: PUBLIC_MESH_LIST,
    join: PUBLIC_MESH_JOIN,
    heartbeat: PUBLIC_MESH_HEARTBEAT,
    enable: PUBLIC_MESH_ENABLE,
    disable: PUBLIC_MESH_DISABLE,
    mcp: PUBLIC_RUNTIME + "/mcp",
    fraggate: PUBLIC_RUNTIME + "/v1/fraggate/call",
    ops: MESH_OPS.slice(),
    rollup_shape: "live|locked|isolated counts only",
    default_off: true,
    node_gate: false,
    auto_heal: false,
    anonymity_network: false,
    author: AUTHOR,
    identity: AUTHOR,
    qns_cd: QNS_CD,
    qns_cd_spec: QNS_CD_SPEC,
    anon_broadcast: ANON_BROADCAST,
    anon_broadcast_note: ANON_BROADCAST_NOTE,
    anon_broadcast_publish_path: false,
  };
}
