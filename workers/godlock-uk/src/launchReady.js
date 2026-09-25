/**
 * Runtime Softwares launch-readiness cite for godlock.uk.
 * SoT is live aziel-runtime GET /v1/software: main 231b02f / 2.0.0-rc1.
 * Live Worker git_sha 231b02fcbb7b50fbd52762a49329042bc1715fe9 (read 2026-09-25).
 * Suite 2.0.0-rc1 stays the certification-point freeze. Count stays 42 on that Worker.
 * 105fa1ee was the 2026-09-18 isolate label for git 6a3798a. Live GET /v1/software
 * does not publish that version_id, so it is not cited as the live tip.
 * Ask Jeeves is not a Softwares slug. Suite help stays FragGate aziel-corpus jeeves.
 * Cite only. Do not invent LIVE shelves, or a GodLock VPN identity.
 * Softwares HTML stays GodLock-first (heading → list). This copy sits after the list.
 * Author: Aziel Eliab only.
 */

export const AUTHOR = "Aziel Eliab";
export const RUNTIME_NAME = "Aziel Runtime";
export const RUNTIME_SLUG = "aziel-runtime";
export const RUNTIME_VERSION = "2.0.0-rc1";
/** Live origin GET /v1/software git_sha (read 2026-09-25). Short form is the first 7 hex chars. */
export const RUNTIME_GIT_SHA = "231b02fcbb7b50fbd52762a49329042bc1715fe9";
export const RUNTIME_GIT_SHA_SHORT = "231b02f";
export const RUNTIME_SOT_BRANCH = "main";
export const RUNTIME_SOT =
  RUNTIME_SOT_BRANCH + " " + RUNTIME_GIT_SHA_SHORT + " / " + RUNTIME_VERSION;

export const GLAMA_RUNTIME = "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime";
export const CATALOG = "https://aziel-runtime.vibelock.workers.dev";
export const SUITE_DOWNLOAD = CATALOG + "/download";
export const SUITE_DOWNLOAD_V1 = CATALOG + "/v1/suite/download";
export const FRAGGATE_KERNEL = "https://github.com/AzielEliab/fraggate";
export const FRAGGATE_CALL = "fraggate_call";
export const DOOR = "fraggate";

export const WORKER_HARDWARE = false;
export const INVENTED_HARDWARE = false;
export const GODLOCK_IS_VPN = false;

export const AZVPN_HTTPS_WS = "REAL";
export const AZVPN_WIREGUARD = "SLOT";
export const AZVPN_OPENVPN = "SLOT";
export const AZVPN_CITE =
  "mesh/AZVPN (HTTPS/WS " + AZVPN_HTTPS_WS + "; WireGuard/" + "OpenVPN " + AZVPN_WIREGUARD + ")";

export const LAUNCH_SURFACES = Object.freeze([
  "human UI",
  "MCP " + FRAGGATE_CALL,
  "FragGate sole door",
  AZVPN_CITE,
  "radios channel cites worker_hardware:" + String(WORKER_HARDWARE),
  "/download suite pack",
]);

/** Committed pin. The mesh outlet may overlay sha and suite version after confirm. */
export function floorRuntimeCite() {
  return {
    branch: RUNTIME_SOT_BRANCH,
    version: RUNTIME_VERSION,
    git_sha: RUNTIME_GIT_SHA,
    git_sha_short: RUNTIME_GIT_SHA_SHORT,
    version_id: null,
    cite: RUNTIME_SOT,
    live: true,
    status: "floor",
    source: "floor",
    author: AUTHOR,
    identity: AUTHOR,
  };
}

export function launchReadyNoteFrom(cite) {
  const c = cite && cite.cite ? cite : floorRuntimeCite();
  const version = c.version || RUNTIME_VERSION;
  const sot = c.cite || RUNTIME_SOT;
  return RUNTIME_NAME + " " + version + " (" + sot + ") launch readiness: "
    + LAUNCH_SURFACES.join(" + ")
    + ". GodLock is a challenge/score product. Identity is Aziel Eliab. "
    + "Identity Aziel Eliab only. Prefer Try on Glama. Lamb Lens. NO-LIE. Growth-ON.";
}

export function launchReadyHtmlNoteFrom(cite) {
  const c = cite && cite.cite ? cite : floorRuntimeCite();
  const version = c.version || RUNTIME_VERSION;
  const sot = c.cite || RUNTIME_SOT;
  return RUNTIME_NAME + " " + version + " launch readiness (SoT " + sot
    + "): human UI + MCP fraggate_call + FragGate sole door + mesh/AZVPN (HTTPS/WS REAL; WireGuard/OpenVPN SLOT) "
    + "+ radios channel cites worker_hardware:false + suite pack /download. "
    + "GodLock is a challenge/score product. Identity is Aziel Eliab. Identity Aziel Eliab only. "
    + "Prefer Try on Glama. Lamb Lens. NO-LIE. Growth-ON.";
}

export const LAUNCH_READY_NOTE = launchReadyNoteFrom();
export const LAUNCH_READY_HTML_NOTE = launchReadyHtmlNoteFrom();

export function runtimeSot() {
  return {
    version: RUNTIME_VERSION,
    git_sha: RUNTIME_GIT_SHA,
    git_sha_short: RUNTIME_GIT_SHA_SHORT,
    branch: RUNTIME_SOT_BRANCH,
    cite: RUNTIME_SOT,
    live: true,
  };
}

function citeInput(cite) {
  return cite && cite.git_sha && cite.cite ? cite : floorRuntimeCite();
}

export function launchReadiness(cite) {
  const sot = citeInput(cite);
  const note = cite && cite.git_sha ? launchReadyNoteFrom(sot) : LAUNCH_READY_NOTE;
  return {
    ok: true,
    spec: "AZRT-WORKER-LAUNCH-1.0",
    product: "GodLock",
    author: AUTHOR,
    identity: AUTHOR,
    runtime: RUNTIME_NAME,
    runtime_slug: RUNTIME_SLUG,
    runtime_version: sot.version || RUNTIME_VERSION,
    runtime_git_sha: sot.git_sha,
    runtime_git_sha_short: sot.git_sha_short,
    runtime_sot: sot.cite,
    runtime_sot_live: sot.live !== false,
    runtime_sot_status: sot.status || "floor",
    door: DOOR,
    kernel: FRAGGATE_KERNEL,
    fraggate_call: FRAGGATE_CALL,
    fraggate_sole_door: true,
    human_ui: true,
    mcp_fraggate_call: true,
    mesh_azvpn: {
      https_ws: AZVPN_HTTPS_WS,
      wireguard: AZVPN_WIREGUARD,
      openvpn: AZVPN_OPENVPN,
      cite: AZVPN_CITE,
      godlock_is_vpn: GODLOCK_IS_VPN,
      note: "Runtime public VPN concentrator. GodLock is a challenge/score product. Identity is Aziel Eliab.",
    },
    radios: {
      worker_hardware: WORKER_HARDWARE,
      invented_hardware: INVENTED_HARDWARE,
      note: "Radios channel cites worker_hardware:false. Live OS/hardware bearers run on local qnm-node / qnsd.",
    },
    suite_download: SUITE_DOWNLOAD,
    suite_download_v1: SUITE_DOWNLOAD_V1,
    suite_download_note: "One-click suite pack JSON (REAL catalog + FoldLock tip + mesh cite). Worker wasm / WireGuard / OpenVPN SLOT. Counted GET /download.",
    glama: GLAMA_RUNTIME,
    glama_cta: "Try on Glama",
    lamb_lens: true,
    no_lie: true,
    growth_on: true,
    visible_1520: false,
    works_with_subsection: false,
    digital_library_chrome: false,
    softwares_heading_then_list: true,
    note,
  };
}

export function launchCiteFields(cite) {
  const ready = launchReadiness(cite);
  const sot = citeInput(cite);
  const fields = {
    runtime_git_sha: sot.git_sha,
    runtime_git_sha_short: sot.git_sha_short,
    runtime_sot: sot.cite,
    runtime_sot_branch: sot.branch || RUNTIME_SOT_BRANCH,
    runtime_sot_live: sot.live !== false,
    runtime_sot_status: sot.status || "floor",
    worker_hardware: ready.radios.worker_hardware,
    invented_hardware: ready.radios.invented_hardware,
    suite_download: ready.suite_download,
    suite_download_v1: ready.suite_download_v1,
    suite_download_note: ready.suite_download_note,
    launch_readiness: ready,
    launch_ready_note: ready.note,
    azvpn_https_ws: ready.mesh_azvpn.https_ws,
    azvpn_wireguard: ready.mesh_azvpn.wireguard,
    azvpn_openvpn: ready.mesh_azvpn.openvpn,
    godlock_is_vpn: ready.mesh_azvpn.godlock_is_vpn,
    fraggate_sole_door: ready.fraggate_sole_door,
    mcp_fraggate_call: ready.mcp_fraggate_call,
  };
  if (sot.version_id) fields.runtime_version_id = sot.version_id;
  return fields;
}

export function launchLlmsSection(cite) {
  const ready = launchReadiness(cite);
  const sotLabel = ready.runtime_sot_live ? "SoT LIVE: " : "SoT last-known: ";
  return "\n## Softwares + runtime launch readiness\n\n"
    + sotLabel + ready.runtime_sot + ".\n"
    + ready.note + "\n"
    + "Human UI: yes. MCP door: " + FRAGGATE_CALL + ". FragGate is THE single door (" + FRAGGATE_KERNEL + ").\n"
    + "mesh/AZVPN: HTTPS/WS REAL; WireGuard/OpenVPN SLOT. GET /v1/mesh cites the bind and never opens a session.\n"
    + "Radios channel cites worker_hardware:false. Invented hardware: false.\n"
    + "Suite pack: " + SUITE_DOWNLOAD + " (also " + SUITE_DOWNLOAD_V1 + ").\n"
    + "Try on Glama: " + GLAMA_RUNTIME + "\n"
    + "GodLock Softwares stays heading → list only. No Digital Library chrome. No Works-with assistants subsection.\n"
    + "Plane B Framagit stays SLOT CNS-NO-FORGE-MIRROR. Plane C stays SLOT CNS-OPERATOR-ATTEST. No LIVE flip.\n"
    + "Identity Aziel Eliab only. No visible 15:20. Lamb Lens. NO-LIE. Growth-ON.\n";
}

export function launchReadyHtml(cite) {
  const note = cite && cite.git_sha ? launchReadyHtmlNoteFrom(cite) : LAUNCH_READY_HTML_NOTE;
  return `<p class="muted launch-ready">${escapeHtml(note)}</p>`;
}

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  }[c]));
}
