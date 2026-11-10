/**
 * Runtime Softwares launch-readiness cite for godlock.uk.
 * Floor pin, read 2026-10-30: main ce673365 / 2.0.0-rc1,
 * git_sha ce673365700d41fc604292ab2b92b1b1ca504016,
 * version_id eaf0b54c-1e5b-4d54-a582-25c5cdc09f92 (vid eaf0b54c).
 * The floor is not the live tip and is not restamped when a read fails.
 * /cite.json, /llms.txt, and Softwares HTML publish four distinct values:
 * floor, observation, expected, and live tip. The live tip is only a fresh
 * GET /v1/health observation. Suite 2.0.0-rc1 stays the certification-point freeze.
 * Authority count stays 42 on that Worker. GodLock hub Softwares is hub-scope
 * (JSON one product row; HTML ItemList numberOfItems 2), not those 42 cards.
 * 105fa1ee was the 2026-09-18 isolate label for git 6a3798a. It is not this tip.
 * Ask Jeeves is not a Softwares slug. Suite help stays FragGate aziel-corpus jeeves.
 * Cite only. Do not invent LIVE shelves, or a GodLock VPN identity.
 * Softwares HTML stays GodLock-first (heading → list). This copy sits after the list.
 * Author: Aziel Eliab only.
 */

export const AUTHOR = "Aziel Eliab";
export const RUNTIME_NAME = "Aziel Runtime";
export const RUNTIME_SLUG = "aziel-runtime";
export const RUNTIME_VERSION = "2.0.0-rc1";
/** Floor git_sha read 2026-10-30. Public short stamp is the 8-char tip prefix. Not the live tip. */
export const RUNTIME_GIT_SHA = "ce673365700d41fc604292ab2b92b1b1ca504016";
export const RUNTIME_GIT_SHA_SHORT = "ce673365";
export const RUNTIME_FLOOR_READ_AT = "2026-10-30";
/**
 * Floor version_id read 2026-10-30 (vid eaf0b54c).
 * Not copied into the live tip when GET /v1/health does not answer.
 */
export const RUNTIME_VERSION_ID = "eaf0b54c-1e5b-4d54-a582-25c5cdc09f92";
export const RUNTIME_VERSION_ID_NOTE =
  "Floor version_id read 2026-10-30 (vid eaf0b54c). This pin is not the current live tip. A missed, stale, timed-out, or malformed GET /v1/health does not copy it forward. env.CF_VERSION_METADATA.id on the runtime Worker. Not a baked suite constant.";
export const RUNTIME_VERSION_ID_SERVE_NOTE =
  "version_id from GET /v1/health at the observation time. env.CF_VERSION_METADATA.id on the runtime Worker. Not a baked suite constant.";
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
    version_id: RUNTIME_VERSION_ID,
    version_id_source: "floor",
    version_id_note: RUNTIME_VERSION_ID_NOTE,
    cite: RUNTIME_SOT,
    live: false,
    current: false,
    role: "floor",
    status: "floor",
    source: "floor",
    read_at: RUNTIME_FLOOR_READ_AT,
    author: AUTHOR,
    identity: AUTHOR,
  };
}

function sotPhrase(cite) {
  const prov = provenanceOf(cite);
  if (prov.live) {
    return "SoT LIVE " + prov.live.cite + " observed " + prov.live.observed_at;
  }
  const floor = "SoT floor " + prov.floor.cite + " (read " + prov.floor.read_at + ")";
  if (prov.expected && prov.expected.cite) {
    return floor + "; expected " + prov.expected.cite + " (not a live tip)";
  }
  return floor + "; live tip not confirmed";
}

export function launchReadyNoteFrom(cite) {
  const prov = provenanceOf(cite);
  const version = (prov.live && prov.live.version) || RUNTIME_VERSION;
  return RUNTIME_NAME + " " + version + " (" + sotPhrase(cite) + ") launch readiness: "
    + LAUNCH_SURFACES.join(" + ")
    + ". GodLock is a challenge/score product. Identity is Aziel Eliab. "
    + "Identity Aziel Eliab only. Prefer Try on Glama. Lamb Lens. NO-LIE. Growth-ON.";
}

export function launchReadyHtmlNoteFrom(cite) {
  const version = (provenanceOf(cite).live && provenanceOf(cite).live.version) || RUNTIME_VERSION;
  return RUNTIME_NAME + " " + version + " launch readiness (" + sotPhrase(cite)
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
    version_id: RUNTIME_VERSION_ID,
    branch: RUNTIME_SOT_BRANCH,
    cite: RUNTIME_SOT,
    live: false,
    current: false,
    role: "floor",
    status: "floor",
    read_at: RUNTIME_FLOOR_READ_AT,
  };
}

export function emptyObservation(status, extra) {
  return {
    role: "observation",
    status: status || "not-read",
    current: false,
    live: false,
    git_sha: null,
    git_sha_short: null,
    version: null,
    version_id: null,
    cite: null,
    observed_at: null,
    attempted_at: null,
    source_date: null,
    source: null,
    http_status: null,
    refresh_status: null,
    refresh_attempted_at: null,
    code: null,
    note: "No live tip is stamped from this observation.",
    ...(extra || {}),
  };
}

/** Static documents and callers that pass a serve cite or a full provenance bundle. */
export function provenanceOf(cite) {
  if (cite && cite.role === "provenance" && cite.floor && cite.observation) {
    return {
      role: "provenance",
      floor: cite.floor,
      observation: cite.observation,
      expected: cite.expected || null,
      live: cite.live && cite.live.git_sha ? cite.live : null,
    };
  }
  const floor = floorRuntimeCite();
  if (cite && cite.git_sha && cite.source === "serve" && cite.status === "current" && cite.live === true && cite.observed_at) {
    const live = {
      role: "live",
      live: true,
      current: true,
      branch: cite.branch || RUNTIME_SOT_BRANCH,
      version: cite.version,
      git_sha: cite.git_sha,
      git_sha_short: cite.git_sha_short,
      version_id: cite.version_id || null,
      cite: cite.cite,
      observed_at: cite.observed_at,
      source_date: cite.source_date || null,
      source: cite.via || cite.source || "serve",
      matches_floor: cite.git_sha === floor.git_sha,
      matches_expected: null,
    };
    return {
      role: "provenance",
      floor,
      observation: {
        ...emptyObservation("current"),
        status: "current",
        current: true,
        git_sha: live.git_sha,
        git_sha_short: live.git_sha_short,
        version: live.version,
        version_id: live.version_id,
        cite: live.cite,
        observed_at: live.observed_at,
        attempted_at: live.observed_at,
        source_date: live.source_date,
        source: live.source,
        note: "Fresh GET /v1/health observation.",
      },
      expected: null,
      live,
    };
  }
  return {
    role: "provenance",
    floor,
    observation: emptyObservation("not-read", {
      note: "This response did not read GET /v1/health. The floor is not stamped as the live tip.",
    }),
    expected: null,
    live: null,
  };
}

export function launchReadiness(cite) {
  const prov = provenanceOf(cite);
  const sot = prov.live || prov.floor;
  const note = launchReadyNoteFrom(cite && (cite.role === "provenance" || cite.git_sha) ? cite : undefined);
  return {
    ok: true,
    spec: "AZRT-WORKER-LAUNCH-1.0",
    product: "GodLock",
    author: AUTHOR,
    identity: AUTHOR,
    runtime: RUNTIME_NAME,
    runtime_slug: RUNTIME_SLUG,
    runtime_version: sot.version || RUNTIME_VERSION,
    runtime_git_sha: prov.live ? prov.live.git_sha : null,
    runtime_git_sha_short: prov.live ? prov.live.git_sha_short : null,
    runtime_sot: prov.live ? prov.live.cite : null,
    runtime_sot_live: !!prov.live,
    runtime_sot_status: prov.live ? "current" : (prov.observation.status || "not-read"),
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
  const prov = provenanceOf(cite);
  const ready = launchReadiness(cite);
  const live = prov.live;
  const fields = {
    runtime_floor: {
      role: "floor",
      live: false,
      current: false,
      cite: prov.floor.cite,
      git_sha: prov.floor.git_sha,
      git_sha_short: prov.floor.git_sha_short,
      version: prov.floor.version,
      version_id: prov.floor.version_id,
      read_at: prov.floor.read_at,
      source: "floor",
      note: prov.floor.version_id_note,
    },
    runtime_observation: prov.observation,
    runtime_expected: prov.expected,
    runtime_live: live,
    runtime_git_sha: live ? live.git_sha : null,
    runtime_git_sha_short: live ? live.git_sha_short : null,
    runtime_sot: live ? live.cite : null,
    runtime_sot_branch: RUNTIME_SOT_BRANCH,
    runtime_sot_live: !!live,
    runtime_sot_status: live ? "current" : (prov.observation.status || "not-read"),
    runtime_floor_git_sha: prov.floor.git_sha,
    runtime_floor_git_sha_short: prov.floor.git_sha_short,
    runtime_floor_sot: prov.floor.cite,
    runtime_floor_version_id: prov.floor.version_id,
    runtime_floor_read_at: prov.floor.read_at,
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
  if (live && live.version_id) {
    fields.runtime_version_id = live.version_id;
    fields.runtime_version_id_source = "serve";
    fields.runtime_version_id_note = RUNTIME_VERSION_ID_SERVE_NOTE
      + " Observed at " + (live.observed_at || "unspecified") + ".";
  }
  return fields;
}

export function versionIdSource(sot) {
  if (sot && sot.version_id_source) return sot.version_id_source;
  if (sot && sot.source === "serve") return "serve";
  if (sot && sot.source === "floor") return "floor";
  return "last-known";
}

export function versionIdNote(sot) {
  if (sot && sot.version_id_note) return sot.version_id_note;
  return versionIdSource(sot) === "serve" ? RUNTIME_VERSION_ID_SERVE_NOTE : RUNTIME_VERSION_ID_NOTE;
}

export function runtimeProvenanceText(cite) {
  const prov = provenanceOf(cite);
  const obs = prov.observation || emptyObservation("not-read");
  const lines = [
    "Floor: " + prov.floor.cite + " / version_id " + prov.floor.version_id
      + " (read " + prov.floor.read_at + "). Floor is not a live tip.",
    "Observation: " + obs.status
      + (obs.observed_at ? " observed " + obs.observed_at : "")
      + (obs.attempted_at && obs.attempted_at !== obs.observed_at ? " attempted " + obs.attempted_at : "")
      + (obs.source_date ? " source_date " + obs.source_date : "")
      + ".",
  ];
  if (obs.git_sha && obs.status !== "current") {
    lines.push("Observation tip: " + obs.git_sha + " is not current.");
  }
  if (obs.refresh_status) {
    lines.push("Refresh: " + obs.refresh_status
      + (obs.refresh_attempted_at ? " at " + obs.refresh_attempted_at : "") + ".");
  }
  if (prov.expected && prov.expected.git_sha) {
    lines.push("Expected: " + (prov.expected.cite || prov.expected.git_sha)
      + (prov.expected.observed_at ? " sealed " + prov.expected.observed_at : "")
      + ". Expected is not the live tip.");
  } else {
    lines.push("Expected: none. No sealed expectation is copied into the live tip.");
  }
  if (prov.live) {
    lines.push("Live tip: " + prov.live.cite + " observed " + prov.live.observed_at + ".");
  } else {
    lines.push("Live tip: none. A failed, stale, or missing read is not stamped as current.");
  }
  return lines.join("\n") + "\n";
}

export function launchLlmsSection(cite) {
  const ready = launchReadiness(cite);
  const prov = provenanceOf(cite);
  const versionIdLine = prov.live && prov.live.version_id
    ? "Published version_id: " + prov.live.version_id + ". " + RUNTIME_VERSION_ID_SERVE_NOTE
      + " Observed at " + prov.live.observed_at + ".\n"
    : "";
  return "\n## Softwares + runtime launch readiness\n\n"
    + runtimeProvenanceText(cite)
    + versionIdLine
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
  const note = cite ? launchReadyHtmlNoteFrom(cite) : LAUNCH_READY_HTML_NOTE;
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
