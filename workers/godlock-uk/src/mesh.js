/**
 * Suite mesh client aligned to QNM-BUILD-1.0 + SPLIT THE WIRES + COLD-COPY SURVIVAL + REHEAL.
 * Public Live Nodes = human mesh users + cited human uses from Worker /v1/mesh.
 * Never software_nodes. Softwares catalog stays separate.
 * Presence rollup is live|locked|isolated counts only. No Node Gate. No auto-heal.
 * Read-only suite presence ON. This Worker has no mesh-off function.
 * Mesh may be unavailable on public GodLock — refuse/status still bind the law.
 * Not an anonymity network.
 * QNS-CD-1.0 is a hub cite / Worker mesh cross-map only (photon QNS1
 * packet transfer). Local qnsd lives in qnm-node. This Worker does not
 * implement qnsd and does not expose a public qnsd proxy.
 * Phoenix is local only. Die-with-pull does not bring godlock.uk back.
 * REHEAL refuse: poisoned node uses own last good tip + verified trusted pull
 * OR phoenix-WAIT. No neighbor talk-back-to-health. Softwares stays Runtime-only.
 * Identity Aziel Eliab only. Runtime routes may not be merged yet — fail closed.
 * Author: Aziel Eliab.
 */
import { AUTHOR, CATALOG, PUBLIC_RUNTIME, RUNTIME_PATH, ANON_BROADCAST, GITHUB_RUNTIME } from "./seo.js";

export const QNM_SPEC = "QNM-BUILD-1.0";
export const QNS_CD_SPEC = "QNS-CD-1.0";
export const QNS_CD_NAME = "photon QNS1 packet transfer";
export const QNM_NODE = "https://github.com/AzielEliab/qnm-node";
export const AZINTERFACE = "https://github.com/AzielEliab/azinterface";
export const MESH_DEFAULT = "on";
export const MESH_DEFAULT_OFF = false;
export const MESH_READONLY = true;
export const MESH_ANONYMITY_NETWORK = false;
export const MESH_NODE_GATE = false;
export const MESH_AUTO_HEAL = false;
export const MESH_IDENTITY = AUTHOR;

export const SPLIT_THE_WIRES = "SPLIT THE WIRES";
export const SPLIT_THE_WIRES_SPEC = "SPLIT-THE-WIRES-1.0";
export const COLD_COPY_SURVIVAL = "COLD-COPY SURVIVAL";
export const COLD_COPY_SURVIVAL_SPEC = "COLD-COPY-SURVIVAL-1.0";
export const REHEAL = "REHEAL";
export const REHEAL_SPEC = "REHEAL-1.0";
export const REHEAL_ALLOWED = Object.freeze(["live", "locked", "isolated", "tip-hash"]);
export const REHEAL_FORBIDDEN = Object.freeze(["bodies", "diffs", "vote-to-fix"]);
export const REHEAL_ACTION = "isolate+drop-tether+local-phoenix";
export const REHEAL_RECOVER = "own-last-good-tip+verified-trusted-pull";
export const REHEAL_OR = "phoenix-WAIT";
export const TIP_TICK_MIN_MS = 500;
export const TIP_TICK_MAX_MS = 1000;
export const PAYLOAD_DWELL_S = 777;
export const TIP_SOCKET = "1s";
export const PAYLOAD_SOCKET = "777s";

export const SPLIT_THE_WIRES_LAW = Object.freeze({
  name: SPLIT_THE_WIRES,
  spec: SPLIT_THE_WIRES_SPEC,
  author: AUTHOR,
  identity: AUTHOR,
  tip: Object.freeze({
    kind: "tip-only",
    tick_ms: Object.freeze([TIP_TICK_MIN_MS, TIP_TICK_MAX_MS]),
    carry: "presence+tip-hash",
    size: "fixed",
    socket: TIP_SOCKET,
  }),
  payload: Object.freeze({
    kind: "pull-only",
    update: "proof-not-timer",
    cite: "prev+lockset",
    fail: "closed",
    dwell_s: PAYLOAD_DWELL_S,
    socket: PAYLOAD_SOCKET,
    clock_desync: "not-yes",
    ambiguous: "isolate",
  }),
  sockets_share: false,
  equivocation: "ends-peer-not-chain",
  emit_last: "locally",
  phoenix: Object.freeze({
    scope: "local",
    die_with_pull: true,
    brings_uk_back: false,
    note: "Phoenix is local only. Die-with-pull does not bring godlock.uk back.",
  }),
  partition: "no-auto-splice",
  heartbeat_loss: "not-poison",
  last_packet_on_loss: "not-apply",
});

export const COLD_COPY_SURVIVAL_LAW = Object.freeze({
  name: COLD_COPY_SURVIVAL,
  spec: COLD_COPY_SURVIVAL_SPEC,
  author: AUTHOR,
  identity: AUTHOR,
  copies: "multiply",
  live_sync: false,
  tip_erase: "expensive",
  server_pull_erases_records: false,
  data_outlives_creators: true,
  note: "Cold copies multiply. Live sync is refused. The tip is expensive to erase. A server pull does not erase records. Data outlives creators.",
});

export const SPLIT_THE_WIRES_NOTE =
  "SPLIT THE WIRES. Tip-only 0.5–1s tick (presence+tip hash, fixed-size). Pull-only payload plane. Update is proof, not a timer (cite prev+lockset, fail-closed; 777s dwell after valid cite; clock desync is not yes; ambiguous isolates). Equivocation ends the peer, not the chain. Emit last locally. Phoenix is local only — die-with-pull does not bring godlock.uk back. Partition does not auto-splice. Heartbeat loss is not poison and does not apply the last packet. 1s and 777s never share a socket.";

export const COLD_COPY_SURVIVAL_NOTE =
  "COLD-COPY SURVIVAL. Cold copies multiply. Live sync is refused. The tip is expensive to erase. A server pull does not erase records. Data outlives creators.";

export const REHEAL_LAW = Object.freeze({
  name: REHEAL,
  spec: REHEAL_SPEC,
  author: AUTHOR,
  identity: AUTHOR,
  poisoned: Object.freeze({
    recover: REHEAL_RECOVER,
    or: REHEAL_OR,
    neighbor_talkback: false,
    action: REHEAL_ACTION,
  }),
  allowed: REHEAL_ALLOWED,
  forbidden: REHEAL_FORBIDDEN,
  isolate: true,
  drop_tether: true,
  phoenix: "local",
  phoenix_wait: true,
  talk_back_to_health: false,
  softwares: "runtime-only",
  softwares_tab: false,
  note: "REHEAL refuse. Poisoned node: own last good tip + verified trusted pull OR phoenix-WAIT. No neighbor talk-back-to-health. Allowed: live/locked/isolated/tip-hash. Forbidden: bodies/diffs/vote-to-fix. Isolate+drop tether+local phoenix. Softwares stays Runtime-only.",
});

export const REHEAL_NOTE = REHEAL_LAW.note;

export const MESH_LAW_NOTE =
  SPLIT_THE_WIRES_NOTE + " " + COLD_COPY_SURVIVAL_NOTE + " " + REHEAL_NOTE
  + " Law binds when public GodLock mesh is unavailable. Author Aziel Eliab only.";

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

export const LIVE_NODES_PLANE = "human-mesh-users-uses";
export const LIVE_NODES_NOTE =
  "Public Live Nodes (live_nodes / rollup.mesh) count human mesh users (join/heartbeat/presence with human bearers) plus the cited human uses signal (USES / human_uses) from Worker /v1/mesh. Isolated humans stay on isolated_nodes. Not Softwares catalog length. Not downloaded Softwares instances. Not software_nodes. software_nodes is the {slug}-worker roster and never feeds this pill. Softwares catalog stays separate. Uses are interaction counters, not unique people. Live Nodes does not invent users. Zero is honest when no humans are present and uses are 0/unbound.";
export const SOFTWARE_NODES_NOTE =
  "software_nodes / rollup.software count Softwares product Workers ({slug}-worker) from suite-presence fan-out. Softwares catalog stays separate. They must never feed public Live Nodes.";

export const MESH_NOTE =
  "QNM-BUILD-1.0. QNS-CD-1.0 photon QNS1 packet transfer (hub cite / Worker mesh cross-map only; local qnsd in qnm-node; no public proxy). Suite mesh is on (read-only suite presence). Public Live Nodes are human mesh users + cited human uses from Worker /v1/mesh — not Softwares, not mesh-size software_nodes. Presence stay live|locked|isolated counts only. No Node Gate. No auto-heal. Not an anonymity network. "
  + MESH_LAW_NOTE;
export const MESH_NOTE_ON = MESH_NOTE;

export const MESH_PATH = "/v1/mesh";
export const MESH_STATUS_PATH = "/v1/mesh/status";
export const MESH_NODES_PATH = "/v1/mesh/nodes";
export const MESH_JOIN_PATH = "/v1/mesh/join";
export const MESH_HEARTBEAT_PATH = "/v1/mesh/heartbeat";
export const MESH_LEAVE_PATH = "/v1/mesh/leave";
export const MESH_ENABLE_PATH = "/v1/mesh/enable";
export const MESH_DISABLE_PATH = "/v1/mesh/disable";
export const MESH_REHEAL_PATH = "/v1/mesh/reheal";
/** @deprecated LIVE QNM rollup is GET /v1/mesh/status and /v1/mesh/nodes. /list 404s. */
export const MESH_LIST_PATH = MESH_NODES_PATH;

export const MESH_READ_PATHS = [MESH_STATUS_PATH, MESH_NODES_PATH, MESH_PATH];
/** Same-origin apex proxies for Live Nodes clients (parity with azieleliab.com / corpus). GET only. */
export const ORIGIN_MESH_READ_PATHS = [MESH_PATH, MESH_STATUS_PATH];
/** Public write ops on the runtime door. disable is not a function on this Worker. */
export const MESH_OPS = ["status", "nodes", "join", "heartbeat", "leave", "enable"];

export function isOriginMeshReadPath(pathname) {
  const p = String(pathname || "").replace(/\/+$/, "") || "/";
  return ORIGIN_MESH_READ_PATHS.includes(p);
}

/** Apex or same-origin runtime mesh JSON that must present as read-only ON. */
export function isPublicMeshJsonPath(pathname) {
  const raw = String(pathname || "").replace(/\/+$/, "") || "/";
  const p = raw.startsWith(RUNTIME_PATH + "/") ? raw.slice(RUNTIME_PATH.length) : raw;
  return MESH_READ_PATHS.includes(p);
}

export function isMeshDisablePath(pathname) {
  const p = String(pathname || "").replace(/\/+$/, "") || "/";
  return p === MESH_DISABLE_PATH || p === RUNTIME_PATH + MESH_DISABLE_PATH;
}

export function isMeshRehealPath(pathname) {
  const p = String(pathname || "").replace(/\/+$/, "") || "/";
  return p === MESH_REHEAL_PATH || p === RUNTIME_PATH + MESH_REHEAL_PATH;
}

export function meshLawFields() {
  return {
    law: SPLIT_THE_WIRES,
    law_spec: SPLIT_THE_WIRES_SPEC,
    split_the_wires: SPLIT_THE_WIRES_LAW,
    cold_copy_survival: COLD_COPY_SURVIVAL,
    cold_copy_survival_spec: COLD_COPY_SURVIVAL_SPEC,
    cold_copy: COLD_COPY_SURVIVAL_LAW,
    sockets_share: false,
    phoenix: "local",
    phoenix_die_with_pull: true,
    phoenix_brings_uk_back: false,
    live_sync: false,
    server_pull_erases_records: false,
    data_outlives_creators: true,
    reheal: REHEAL,
    reheal_spec: REHEAL_SPEC,
    reheal_law: REHEAL_LAW,
    neighbor_talkback: false,
    reheal_allowed: REHEAL_ALLOWED,
    reheal_forbidden: REHEAL_FORBIDDEN,
    reheal_poisoned: REHEAL_RECOVER + "|" + REHEAL_OR,
    reheal_action: REHEAL_ACTION,
    softwares_runtime_only: true,
    softwares_tab: false,
    law_binds_when_off: true,
    worker_hardware: false,
    invented_hardware: false,
    azvpn: Object.freeze({
      https_ws: "REAL",
      wireguard: "SLOT",
      openvpn: "SLOT",
      godlock_is_vpn: false,
      note: "Runtime public VPN concentrator (HTTPS/WS REAL; WireGuard/OpenVPN SLOT). GodLock is a challenge/score product. Identity is Aziel Eliab.",
    }),
    author: AUTHOR,
    identity: AUTHOR,
  };
}

export function stampMeshLaw(doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) return doc;
  const out = { ...doc, ...meshLawFields() };
  if (typeof out.note === "string") {
    if (!/SPLIT THE WIRES/.test(out.note)) out.note = (out.note + " " + SPLIT_THE_WIRES_NOTE).trim();
    if (!/COLD-COPY SURVIVAL/.test(out.note)) out.note = (out.note + " " + COLD_COPY_SURVIVAL_NOTE).trim();
    if (!/\bREHEAL\b/.test(out.note)) out.note = (out.note + " " + REHEAL_NOTE).trim();
  } else {
    out.note = MESH_LAW_NOTE;
  }
  return out;
}

function meshLawRefuse(code, error, extra = {}) {
  return stampMeshLaw({
    ok: false,
    error,
    code,
    spec: QNM_SPEC,
    author: AUTHOR,
    identity: AUTHOR,
    door: PUBLIC_MESH,
    ...extra,
  });
}

export function phoenixBringsUkRefused() {
  return meshLawRefuse(
    "STW-PHOENIX-UK",
    "Phoenix is local only. Die-with-pull does not bring godlock.uk back.",
    { phoenix: "local", phoenix_die_with_pull: true, phoenix_brings_uk_back: false },
  );
}

export function liveSyncRefused() {
  return meshLawRefuse(
    "CCS-LIVE-SYNC",
    "COLD-COPY SURVIVAL refuses live sync. Cold copies multiply.",
  );
}

export function serverPullEraseRefused() {
  return meshLawRefuse(
    "CCS-PULL-ERASES",
    "A server pull does not erase records. Data outlives creators.",
    { server_pull_erases_records: false, data_outlives_creators: true },
  );
}

export function rehealRefused() {
  return meshLawRefuse(
    "RH-NEIGHBOR-TALKBACK",
    REHEAL_NOTE,
    {
      reheal: REHEAL,
      neighbor_talkback: false,
      allowed: REHEAL_ALLOWED,
      forbidden: REHEAL_FORBIDDEN,
      action: REHEAL_ACTION,
      softwares: "runtime-only",
    },
  );
}

export function evaluateSplitTheWires(act = {}) {
  const a = act && typeof act === "object" ? act : {};
  const reasons = [];
  const tipSocket = a.tip_socket != null ? String(a.tip_socket) : TIP_SOCKET;
  const payloadSocket = a.payload_socket != null ? String(a.payload_socket) : PAYLOAD_SOCKET;
  if (a.shares_socket === true || a.tip_and_payload_same_socket === true || a.split === false) {
    reasons.push("STW-SHARED-SOCKET");
  }
  if (a.socket_1s != null && a.socket_777s != null && String(a.socket_1s) === String(a.socket_777s)) {
    reasons.push("STW-SHARED-SOCKET");
  }
  if (tipSocket && payloadSocket && tipSocket === payloadSocket) {
    reasons.push("STW-SHARED-SOCKET");
  }
  if (a.plane === "tip") {
    if (a.tick_ms != null && (Number(a.tick_ms) < TIP_TICK_MIN_MS || Number(a.tick_ms) > TIP_TICK_MAX_MS)) {
      reasons.push("STW-TIP-TICK");
    }
    if (a.size && a.size !== "fixed") reasons.push("STW-TIP-NOT-FIXED");
    if (a.carry && a.carry !== "presence+tip-hash") reasons.push("STW-TIP-NOT-FIXED");
    if (a.payload && a.payload !== "presence+tip-hash") reasons.push("STW-TIP-NOT-FIXED");
  }
  if (a.plane === "payload" || a.plane === "pull") {
    if (a.mode === "push" || a.push === true) reasons.push("STW-PUSH-PAYLOAD");
    if (a.update === "timer" || a.update_is_timer === true) reasons.push("STW-TIMER-UPDATE");
    if (a.cite_prev === false || a.lockset === false) reasons.push("STW-CITE-FAIL-CLOSED");
    if (a.clock_desync === "yes" || a.clock_desync_is_yes === true) reasons.push("STW-CLOCK-DESYNC");
    if (a.ambiguous === true && a.isolate !== true) reasons.push("STW-AMBIGUOUS-ISOLATE");
    if (a.dwell_s != null && Number(a.dwell_s) !== PAYLOAD_DWELL_S && a.skip_dwell === true) {
      reasons.push("STW-DWELL");
    }
  }
  if (a.equivocation === true && (a.ends === "chain" || a.ends_chain === true)) {
    reasons.push("STW-EQUIVOCATION-CHAIN");
  }
  if (a.emit_last === "remote" || a.emit_last_locally === false) {
    reasons.push("STW-EMIT-LAST-REMOTE");
  }
  if (
    a.phoenix === "hunt"
    || a.phoenix_hunt === true
    || a.bring_uk_back === true
    || a.phoenix_brings_uk === true
    || a.brings_uk_back === true
  ) {
    reasons.push("STW-PHOENIX-UK");
  }
  if (a.auto_splice === true || a.partition_splice === true) {
    reasons.push("STW-AUTO-SPLICE");
  }
  if (a.heartbeat_loss === true) {
    if (a.poison === true || a.treat_as_poison === true) reasons.push("STW-LOSS-IS-POISON");
    if (a.apply_last_packet === true) reasons.push("STW-APPLY-LAST-PACKET");
  }
  if (!reasons.length) {
    return stampMeshLaw({ ok: true, code: "STW-OK", spec: QNM_SPEC });
  }
  return meshLawRefuse(reasons[0], "SPLIT THE WIRES refuse: " + reasons[0], { reasons });
}

export function evaluateColdCopySurvival(act = {}) {
  const a = act && typeof act === "object" ? act : {};
  const reasons = [];
  if (a.live_sync === true || a.sync === "live") reasons.push("CCS-LIVE-SYNC");
  if (a.multiply === false || a.cold_copies === false || a.single_live_copy === true) {
    reasons.push("CCS-NO-MULTIPLY");
  }
  if (a.erase_tip === true || a.tip_erase === "cheap" || a.tip_erase_cheap === true) {
    reasons.push("CCS-ERASE-TIP");
  }
  if ((a.server_pull === true || a.pull === true) && (a.erase_records === true || a.erases_records === true)) {
    reasons.push("CCS-PULL-ERASES");
  }
  if ((a.creator_gone === true || a.creators_dead === true) && a.erase_data === true) {
    reasons.push("CCS-CREATOR-DEATH-ERASE");
  }
  if (!reasons.length) {
    return stampMeshLaw({ ok: true, code: "CCS-OK", spec: QNM_SPEC });
  }
  return meshLawRefuse(reasons[0], "COLD-COPY SURVIVAL refuse: " + reasons[0], { reasons });
}

function rehealShareItems(act) {
  const raw = act.share != null ? act.share : (act.gossip != null ? act.gossip : act.exchange);
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map((item) => String(item || "").trim()).filter(Boolean);
  return String(raw).split(/[|,/+\s]+/).map((item) => item.trim()).filter(Boolean);
}

function rehealPhoenixWait(act) {
  const phoenix = String(act.phoenix || "").trim();
  return act.phoenix_wait === true
    || phoenix === "WAIT"
    || phoenix === "phoenix-WAIT"
    || act.or === REHEAL_OR;
}

function rehealOwnTipPull(act) {
  const ownTip = act.own_last_good_tip === true
    || act.last_good_tip === "own"
    || act.tip === "own-last-good";
  const trustedPull = act.verified_trusted_pull === true
    || act.trusted_pull === "verified"
    || act.pull === "verified-trusted";
  return ownTip && trustedPull;
}

export function evaluateReheal(act = {}) {
  const a = act && typeof act === "object" ? act : {};
  const reasons = [];
  if (
    a.neighbor_talkback === true
    || a.talk_back_to_health === true
    || a.neighbor_heal === true
    || a.heal_from_neighbor === true
    || a.talkback === true
  ) {
    reasons.push("RH-NEIGHBOR-TALKBACK");
  }
  const share = rehealShareItems(a);
  if (a.bodies === true || a.share_bodies === true || share.includes("bodies")) {
    reasons.push("RH-BODIES");
  }
  if (a.diffs === true || a.share_diffs === true || share.includes("diffs")) {
    reasons.push("RH-DIFFS");
  }
  if (
    a.vote_to_fix === true
    || a.vote === "fix"
    || a.vote === "vote-to-fix"
    || share.includes("vote-to-fix")
  ) {
    reasons.push("RH-VOTE-TO-FIX");
  }
  for (const item of share) {
    if (!REHEAL_ALLOWED.includes(item) && !REHEAL_FORBIDDEN.includes(item)) {
      reasons.push("RH-FORBIDDEN-SHARE");
      break;
    }
  }
  if (a.softwares_tab === true || a.softwares === "sprawl" || a.add_softwares === true || a.softwares_runtime_only === false) {
    reasons.push("RH-SOFTWARES-RUNTIME-ONLY");
  }
  const poisoned = a.poisoned === true || a.node === "poisoned";
  if (poisoned) {
    if (a.isolate === false || a.isolated === false) reasons.push("RH-NO-ISOLATE");
    if (a.drop_tether === false || a.keep_tether === true || a.tether === "keep") {
      reasons.push("RH-KEEP-TETHER");
    }
    if (a.phoenix === "remote" || a.phoenix === "hunt" || a.phoenix_local === false) {
      reasons.push("RH-REMOTE-PHOENIX");
    }
    if (!rehealPhoenixWait(a) && !rehealOwnTipPull(a)) {
      reasons.push("RH-NO-OWN-TIP");
    }
  }
  if (!reasons.length) {
    return stampMeshLaw({ ok: true, code: "RH-OK", spec: QNM_SPEC });
  }
  return meshLawRefuse(reasons[0], "REHEAL refuse: " + reasons[0], { reasons });
}

export function evaluateMeshLaw(act = {}) {
  const wires = evaluateSplitTheWires(act);
  if (!wires.ok) return wires;
  const cold = evaluateColdCopySurvival(act);
  if (!cold.ok) return cold;
  return evaluateReheal(act);
}

export function meshDisableRefused() {
  return stampMeshLaw({
    ok: false,
    error: "mesh-off is not a function on this Worker",
    code: "MESH-NO-DISABLE",
    mesh_default: MESH_DEFAULT,
    default: MESH_DEFAULT,
    default_off: false,
    readonly: true,
    mesh_readonly: true,
    enabled: true,
    get_never_enables: true,
    author: AUTHOR,
    identity: AUTHOR,
    spec: QNM_SPEC,
    note: "GodLock.uk presents read-only QNM suite presence. This Worker has no path that turns suite presence off.",
    door: PUBLIC_MESH,
  });
}

export function originMeshWriteRefused() {
  return stampMeshLaw({
    ok: false,
    error: "method not allowed",
    get_never_enables: true,
    default_off: false,
    default: MESH_DEFAULT,
    mesh_default: MESH_DEFAULT,
    readonly: true,
    mesh_readonly: true,
    enabled: false,
    author: AUTHOR,
    identity: AUTHOR,
    spec: QNM_SPEC,
    note: "GET never enables. Read-only suite presence. This Worker has no mesh-off function.",
    door: PUBLIC_MESH,
  });
}

export function scrubMeshOffCopy(text) {
  return String(text == null ? "" : text)
    .replace(/Suite mesh default off/gi, "Suite mesh is on (read-only suite presence)")
    .replace(/suite mesh \(default off\)/gi, "suite mesh (read-only, on)")
    .replace(/\bdefault off\b/gi, "read-only, on")
    .replace(/Remain-OFF\.?\s*/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export function alignPublicMeshSurface(doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) return doc;
  const out = { ...doc };
  delete out.mesh_default_off;
  delete out.disable;
  out.mesh_default = MESH_DEFAULT;
  out.default = MESH_DEFAULT;
  out.default_off = false;
  out.readonly = true;
  out.mesh_readonly = true;
  if (out.mesh === "off") out.mesh = "on";
  if (typeof out.note === "string") out.note = scrubMeshOffCopy(out.note);
  if (typeof out.limitation === "string") out.limitation = scrubMeshOffCopy(out.limitation);
  if (Array.isArray(out.ops)) {
    out.ops = out.ops.filter((op) => String(op) !== "disable");
  }
  if (out.display && typeof out.display === "object" && !Array.isArray(out.display)) {
    const display = { ...out.display };
    if (typeof display.summary === "string") display.summary = scrubMeshOffCopy(display.summary);
    if (Array.isArray(display.fields)) {
      display.fields = display.fields.map((field) => {
        if (!field || typeof field !== "object") return field;
        const next = { ...field };
        const label = String(next.label || "").toLowerCase();
        if (label === "mesh default" || label === "default" || label === "mesh_default") {
          next.value = MESH_DEFAULT;
        } else if (typeof next.value === "string") {
          next.value = scrubMeshOffCopy(next.value);
        }
        return next;
      });
    }
    out.display = display;
  }
  if (out.mesh && typeof out.mesh === "object" && !Array.isArray(out.mesh)) {
    out.mesh = alignPublicMeshSurface(out.mesh);
  }
  return stampMeshLaw(out);
}

export const PUBLIC_MESH = PUBLIC_RUNTIME + MESH_PATH;
export const PUBLIC_MESH_STATUS = PUBLIC_RUNTIME + MESH_STATUS_PATH;
export const PUBLIC_MESH_NODES = PUBLIC_RUNTIME + MESH_NODES_PATH;
export const PUBLIC_MESH_LIST = PUBLIC_MESH_NODES;
export const PUBLIC_MESH_JOIN = PUBLIC_RUNTIME + MESH_JOIN_PATH;
export const PUBLIC_MESH_HEARTBEAT = PUBLIC_RUNTIME + MESH_HEARTBEAT_PATH;
export const PUBLIC_MESH_LEAVE = PUBLIC_RUNTIME + MESH_LEAVE_PATH;
export const PUBLIC_MESH_ENABLE = PUBLIC_RUNTIME + MESH_ENABLE_PATH;
export const PUBLIC_MESH_DISABLE = PUBLIC_RUNTIME + MESH_DISABLE_PATH;

export const BINDING_MESH_HOSTS = ["https://aziel-runtime", CATALOG];
export const HTTPS_MESH_HOSTS = [CATALOG];

export const BINDING_MESH_URLS = BINDING_MESH_HOSTS.flatMap((host) => (
  MESH_READ_PATHS.map((p) => host + p)
));

export const HTTPS_MESH_URLS = HTTPS_MESH_HOSTS.flatMap((host) => (
  MESH_READ_PATHS.map((p) => host + p)
));

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

export function isSoftwareWorkerNodeId(nodeId) {
  const id = String(nodeId || "");
  return id.endsWith("-worker") && !/^mesh_/.test(id);
}

/** Listed nodes that may back a legacy Live Nodes fallback. Never Softwares workers or instances. */
export function countsTowardListedLive(raw) {
  if (raw == null) return false;
  const n = typeof raw === "string" ? { id: raw } : raw;
  if (typeof n !== "object") return false;
  const id = String(n.id || n.node_id || n.session_id || n.peer || n.name || "").trim();
  if (isSoftwareWorkerNodeId(id)) return false;
  const kind = String(n.kind || n.plane || "").trim().toLowerCase();
  if (kind === "software" || kind === "instance") return false;
  return !!(id || n.product || n.last_utc);
}

function rollupObject(mesh) {
  const m = mesh && typeof mesh === "object" ? mesh : {};
  return m.rollup && typeof m.rollup === "object" && !Array.isArray(m.rollup) ? m.rollup : {};
}

function softwareNodesOf(inner) {
  const r = rollupObject(inner);
  const sw = r.software && typeof r.software === "object" && !Array.isArray(r.software) ? r.software : {};
  const parts = firstNum(inner.software_live_nodes) != null
    || firstNum(inner.software_locked_nodes) != null
    || firstNum(inner.software_isolated_nodes) != null
    ? (firstNum(inner.software_live_nodes) || 0)
      + (firstNum(inner.software_locked_nodes) || 0)
      + (firstNum(inner.software_isolated_nodes) || 0)
    : null;
  const nested = firstNum(sw.live) != null || firstNum(sw.locked) != null || firstNum(sw.isolated) != null
    ? (firstNum(sw.live) || 0) + (firstNum(sw.locked) || 0) + (firstNum(sw.isolated) || 0)
    : null;
  return firstNum(inner.software_nodes, parts, nested);
}

function humanUsersUsesOf(inner) {
  const r = rollupObject(inner);
  const h = r.human && typeof r.human === "object" && !Array.isArray(r.human) ? r.human : {};
  const users = firstNum(
    inner.human_mesh_users,
    firstNum(inner.human_live_nodes) != null || firstNum(inner.human_locked_nodes) != null
      ? (firstNum(inner.human_live_nodes) || 0) + (firstNum(inner.human_locked_nodes) || 0)
      : null,
    firstNum(h.live) != null || firstNum(h.locked) != null
      ? (firstNum(h.live) || 0) + (firstNum(h.locked) || 0)
      : null,
  );
  const uses = firstNum(inner.human_uses);
  if (users == null && uses == null) return null;
  return (users || 0) + (uses || 0);
}

/**
 * Public Live Nodes from Worker /v1/mesh: human mesh users + cited human uses.
 * Never software_nodes / Softwares catalog length.
 */
export function parsePublicLiveNodes(inner, listedLive) {
  const src = inner && typeof inner === "object" && !Array.isArray(inner) ? inner : {};
  const r = rollupObject(src);
  const sot = firstNum(src.live_nodes, r.mesh);
  if (sot != null) return sot;
  const human = humanUsersUsesOf(src);
  if (human != null) return human;
  const software = softwareNodesOf(src);
  const presenceLive = firstNum(
    r.live,
    r.live_nodes,
    r.live_count,
    src.live,
    src.mesh_live_nodes,
    src.live_count,
    src.count,
    src.n,
    src.node_count,
  );
  if (software != null && (presenceLive == null || software === presenceLive)) {
    return listedLive != null ? listedLive : 0;
  }
  return firstNum(presenceLive, listedLive) ?? 0;
}

/** Presence buckets (all planes). Not the public Live Nodes pill after aziel-runtime#151. */
export function meshRollup(mesh) {
  const m = mesh && typeof mesh === "object" ? mesh : {};
  const r = rollupObject(m);
  return {
    live: firstNum(r.live, m.live, r.live_nodes) ?? 0,
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
  return stampMeshLaw({
    ok: true,
    spec: QNM_SPEC,
    enabled: false,
    default_off: false,
    mesh_default: MESH_DEFAULT,
    readonly: true,
    mesh_readonly: true,
    live_nodes: 0,
    live_nodes_plane: LIVE_NODES_PLANE,
    live_nodes_note: LIVE_NODES_NOTE,
    software_nodes: 0,
    software_nodes_note: SOFTWARE_NODES_NOTE,
    status: extra.status || "unavailable",
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
  });
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
  const listedLive = listed.filter(countsTowardListedLive).length;
  const listedLiveOrNull = listedLive ? listedLive : null;
  const presence = parseRollup(inner, listedLiveOrNull);
  const liveNodes = parsePublicLiveNodes(inner, listedLiveOrNull);
  const enabled = truthyEnabled(inner.enabled)
    || truthyEnabled(inner.mesh_enabled)
    || String(inner.status || "").toLowerCase() === "on";
  const unavailable = inner.ok === false
    && !enabled
    && (inner.error || inner.status === "unavailable" || inner.status === "not_found");
  const status = enabled ? "on" : "unavailable";
  const live = enabled ? liveNodes : 0;
  const locked = enabled ? presence.locked : 0;
  const isolated = enabled ? presence.isolated : 0;
  const software = softwareNodesOf(inner);
  return emptyMesh({
    ok: inner.ok !== false,
    enabled,
    default_off: false,
    mesh_default: MESH_DEFAULT,
    readonly: true,
    mesh_readonly: true,
    live_nodes: live,
    live_nodes_plane: inner.live_nodes_plane || LIVE_NODES_PLANE,
    live_nodes_note: typeof inner.live_nodes_note === "string" && inner.live_nodes_note.trim()
      ? inner.live_nodes_note
      : LIVE_NODES_NOTE,
    human_mesh_users: firstNum(inner.human_mesh_users),
    human_uses: firstNum(inner.human_uses),
    human_uses_complete: inner.human_uses_complete === true,
    software_nodes: enabled && software != null ? software : 0,
    software_nodes_note: SOFTWARE_NODES_NOTE,
    rollup: {
      live: enabled ? presence.live : 0,
      locked,
      isolated,
    },
    status,
    source: inner.source || "parsed",
    door: inner.door || PUBLIC_MESH,
    note: MESH_NOTE,
  });
}

export function publicMesh(mesh) {
  const m = mesh && typeof mesh === "object" ? mesh : emptyMesh();
  const enabled = !!m.enabled;
  const rollup = enabled ? meshRollup(m) : emptyRollup();
  const live = enabled ? parsePublicLiveNodes(m) : 0;
  const software = softwareNodesOf(m);
  return stampMeshLaw({
    spec: QNM_SPEC,
    enabled,
    default_off: false,
    mesh_default: MESH_DEFAULT,
    readonly: true,
    mesh_readonly: true,
    live_nodes: live,
    live_nodes_plane: m.live_nodes_plane || LIVE_NODES_PLANE,
    live_nodes_note: typeof m.live_nodes_note === "string" && m.live_nodes_note.trim()
      ? m.live_nodes_note
      : LIVE_NODES_NOTE,
    human_mesh_users: firstNum(m.human_mesh_users),
    human_uses: firstNum(m.human_uses),
    human_uses_complete: m.human_uses_complete === true,
    software_nodes: enabled && software != null ? software : 0,
    software_nodes_note: SOFTWARE_NODES_NOTE,
    rollup,
    status: enabled ? "on" : "unavailable",
    source: m.source || "fallback",
    node_gate: false,
    auto_heal: false,
    anonymity_network: false,
    worker_hardware: false,
    invented_hardware: false,
    author: AUTHOR,
    identity: AUTHOR,
    door: PUBLIC_MESH,
    status_url: PUBLIC_MESH_STATUS,
    list: PUBLIC_MESH_NODES,
    join: PUBLIC_MESH_JOIN,
    heartbeat: PUBLIC_MESH_HEARTBEAT,
    leave: PUBLIC_MESH_LEAVE,
    enable: PUBLIC_MESH_ENABLE,
    mcp: RUNTIME_PATH + "/mcp",
    fraggate: RUNTIME_PATH + "/v1/fraggate/call",
    ops: MESH_OPS.slice(),
    qns_cd: QNS_CD,
    note: scrubMeshOffCopy(m.note || MESH_NOTE),
  });
}

export function meshStatusLine(mesh) {
  const m = mesh && typeof mesh === "object" ? mesh : emptyMesh();
  if (m.enabled) {
    const r = meshRollup(m);
    const live = firstNum(m.live_nodes, m.rollup && m.rollup.mesh) ?? r.live;
    return "Suite mesh: on · live " + live + " · locked " + r.locked + " · isolated " + r.isolated;
  }
  if (m.status === "unavailable") {
    return "Suite mesh: on · rollup unavailable";
  }
  return "Suite mesh: on";
}

/**
 * Public Live Nodes: Worker /v1/mesh live_nodes (human mesh users + cited
 * human uses) when mesh is enabled (no visiting floor, never software_nodes).
 * Otherwise GodLock.uk site heartbeats.
 */
export function alignLiveNodes({ siteLiveNodes, mesh } = {}) {
  const site = Number(siteLiveNodes);
  const siteN = Number.isFinite(site) && site >= 0 ? site : 0;
  if (mesh && mesh.enabled) {
    return parsePublicLiveNodes(mesh);
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
  if (body.code === "MESH-NOT-FOUND") return false;
  if (body.ok === false && !truthyEnabled(body.enabled) && body.rollup == null && body.live_nodes == null) {
    return false;
  }
  if (body.error && !body.enabled && !body.mesh && !body.nodes && !body.list && !body.rollup) return false;
  return body.enabled != null
    || body.mesh_enabled != null
    || body.live_nodes != null
    || body.human_mesh_users != null
    || body.human_uses != null
    || body.software_nodes != null
    || body.live_nodes_plane != null
    || body.rollup != null
    || body.locked != null
    || body.isolated != null
    || body.mesh != null
    || body.nodes != null
    || body.list != null
    || body.peers != null
    || body.status === "on"
    || body.status === "off"
    || body.code === "MESH-OK"
    || body.op === "status"
    || body.op === "nodes"
    || body.default_off != null
    || body.spec === QNM_SPEC
    || body.door === "mesh";
}

function isWriteMeshUrl(url) {
  const u = String(url || "");
  return /\/v1\/mesh\/(enable|disable|join|heartbeat|leave|broadcast)(?:\?|$)/.test(u);
}

async function readMeshCandidate(fetcher, url, timeoutMs) {
  if (isWriteMeshUrl(url)) return null;
  const res = await fetcher(url, timeoutMs);
  const body = await readJsonResponse(res);
  if (!looksLikeMeshDoc(body)) return null;
  return { url, body };
}

async function firstMeshCandidate(fetcher, urls, timeoutMs) {
  for (const url of urls) {
    try {
      const hit = await readMeshCandidate(fetcher, url, timeoutMs);
      if (hit) return hit;
    } catch { /* try next dest */ }
  }
  return null;
}

/**
 * Display rollup only. GET /v1/mesh, /status, and /nodes never enable.
 * Prefer the LIVE origin (aziel-runtime.vibelock.workers.dev) when it answers,
 * because the same-account binding can serve a stale isolate. qnm-node stays
 * local. Not a Softwares-tab product. FragGate remains the single write door.
 */
export async function fetchMeshSnapshot(env, deps = {}) {
  const timeoutMs = deps.timeoutMs != null ? deps.timeoutMs : 3500;
  const hasBinding = !!(env && env.AZIEL_RUNTIME && typeof env.AZIEL_RUNTIME.fetch === "function");
  const probeOrigin = deps.probeOrigin != null ? !!deps.probeOrigin : !!deps.fetch;
  const httpFetch = deps.fetch || (probeOrigin ? globalThis.fetch : null);

  const bindingFetch = hasBinding
    ? async (url) => env.AZIEL_RUNTIME.fetch(new Request(url, { method: "GET", headers: UA }))
    : null;
  const originFetch = probeOrigin && typeof httpFetch === "function"
    ? async (url, ms) => fetchJson(httpFetch, url, ms != null ? ms : timeoutMs)
    : null;

  const jobs = [];
  if (bindingFetch) {
    jobs.push(
      firstMeshCandidate(bindingFetch, BINDING_MESH_URLS, timeoutMs)
        .then((hit) => ({ source: "service-binding", hit }))
        .catch(() => ({ source: "service-binding", hit: null })),
    );
  }
  if (originFetch) {
    jobs.push(
      firstMeshCandidate(originFetch, HTTPS_MESH_URLS, timeoutMs)
        .then((hit) => ({ source: "origin", hit }))
        .catch(() => ({ source: "origin", hit: null })),
    );
  }

  const found = jobs.length ? await Promise.all(jobs) : [];
  const origin = found.find((row) => row.source === "origin" && row.hit);
  const binding = found.find((row) => row.source === "service-binding" && row.hit);
  const chosen = origin || binding;
  if (chosen && chosen.hit && chosen.hit.body) {
    return parseMeshDoc({ ...chosen.hit.body, source: chosen.source });
  }
  return emptyMesh({ status: "unavailable", source: "fallback" });
}

/**
 * Hub-local read-only snapshot when the runtime proxy is down.
 * GET /v1/mesh and /v1/mesh/status never enable. No mesh-off function.
 */
export function hubMeshStatusDoc(stats, path) {
  const mesh = publicMesh(stats && stats.mesh);
  const enabled = !!mesh.enabled;
  const rollup = enabled ? meshRollup(mesh) : emptyRollup();
  return stampMeshLaw({
    ok: true,
    product: "GodLock",
    site: "godlock.uk",
    author: AUTHOR,
    identity: AUTHOR,
    via: path || MESH_STATUS_PATH,
    get_never_enables: true,
    default_off: false,
    default: MESH_DEFAULT,
    mesh_default: MESH_DEFAULT,
    readonly: true,
    mesh_readonly: true,
    enabled,
    mesh: "on",
    status: enabled ? "on" : "unavailable",
    live_nodes: enabled ? (firstNum(mesh.live_nodes) ?? rollup.live) : 0,
    live_nodes_plane: LIVE_NODES_PLANE,
    live_nodes_note: LIVE_NODES_NOTE,
    software_nodes: enabled ? (firstNum(mesh.software_nodes) ?? 0) : 0,
    software_nodes_note: SOFTWARE_NODES_NOTE,
    locked_nodes: enabled ? rollup.locked : 0,
    isolated_nodes: enabled ? rollup.isolated : 0,
    rollup,
    site_live_nodes: stats && stats.site_live_nodes != null ? stats.site_live_nodes : 0,
    spec: QNM_SPEC,
    qns_cd: QNS_CD,
    qns_cd_spec: QNS_CD_SPEC,
    node_gate: false,
    auto_heal: false,
    anonymity_network: false,
    note: MESH_NOTE,
    mesh_status: PUBLIC_MESH_STATUS,
    mesh_status_local: "https://godlock.uk" + MESH_STATUS_PATH,
    mesh_status_runtime: PUBLIC_MESH_STATUS,
    mesh_nodes: PUBLIC_MESH_NODES,
    mesh_nodes_runtime: PUBLIC_MESH_NODES,
    door: PUBLIC_MESH,
    ...meshOpsDoc(),
    enabled,
    default_off: false,
    mesh_default: MESH_DEFAULT,
    readonly: true,
    mesh_readonly: true,
    get_never_enables: true,
    author: AUTHOR,
    identity: AUTHOR,
  });
}

export function meshOpsDoc() {
  return stampMeshLaw({
    spec: QNM_SPEC,
    door: PUBLIC_MESH,
    status_url: PUBLIC_MESH_STATUS,
    nodes_url: PUBLIC_MESH_NODES,
    list: PUBLIC_MESH_NODES,
    join: PUBLIC_MESH_JOIN,
    heartbeat: PUBLIC_MESH_HEARTBEAT,
    leave: PUBLIC_MESH_LEAVE,
    enable: PUBLIC_MESH_ENABLE,
    mcp: PUBLIC_RUNTIME + "/mcp",
    fraggate: PUBLIC_RUNTIME + "/v1/fraggate/call",
    ops: MESH_OPS.slice(),
    rollup_shape: "live_nodes = human mesh users + cited human uses; presence live|locked|isolated; software_nodes separate",
    live_nodes_plane: LIVE_NODES_PLANE,
    live_nodes_note: LIVE_NODES_NOTE,
    software_nodes_note: SOFTWARE_NODES_NOTE,
    default_off: false,
    mesh_default: MESH_DEFAULT,
    readonly: true,
    mesh_readonly: true,
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
  });
}
