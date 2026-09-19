/**
 * REDLINE-2026-09-14 machine cite on the GodLock challenge hub.
 * Challenge-only. Do not expand Softwares. Author: Aziel Eliab only.
 */
import {
  ARCHIVE_ORG_TIP_PACK_URL,
  FRAMAGIT_TIP_PACK_URL,
  FRAMAGIT_REFUSE,
  GITFLIC_REFUSE,
  GITLAB_REFUSE,
  PLANE_B_ALL_TARGETS,
  PLANE_B_WORKING_TARGETS,
  ZENODO_REFUSE,
  CAP7_SITES,
} from "./shelves.js";

const AUTHOR = "Aziel Eliab";
const CANON_HOST = "https://godlock.uk";
const AZIEL_PERSON_ID = "https://www.azieleliab.com/#aziel";
const HUB_RUNTIME_ID = "https://www.azieleliab.com/runtime#runtime";

export const REDLINE_SPEC = "REDLINE-2026-09-14";
export const REDLINE_DATE = "2026-09-14";
export const REDLINE_NAME = "Challenge-hub redline protocols";
export const FOLDLOCK_DOI = "10.5281/zenodo.22257762";

export const TOKEN_IF_ANY = Object.freeze(["Authorization", "X-Aziel-Runtime-Token"]);

export const TOKEN = Object.freeze({
  header_only: true,
  present: false,
  headers: [],
  if_any: TOKEN_IF_ANY.slice(),
  query: false,
  body: false,
  git: false,
  note: "No operator token on this challenge hub. Header-only if any (Authorization or X-Aziel-Runtime-Token). Never query, never body, never git.",
});

export const CAP7 = Object.freeze({
  spec: "CAP-7",
  design_of: "hub_designs",
  inherit: "designs",
  resolves_to_hub: false,
  sites: structuredClone(CAP7_SITES),
  note: "Cap-7 names are design_of hubs. resolves_to_hub:false. Runtime is not the identity hub. GodLock stays a product surface.",
});

export const FOLDLOCK = Object.freeze({
  slug: "foldlock",
  name: "FoldLock",
  cite_only: true,
  encryption: false,
  zip: false,
  software_tab: false,
  invented: false,
  doi: FOLDLOCK_DOI,
  note: "Cite the real FoldLock catalog Software only. FoldLock is cite-only on this hub.",
});

export const TLS = Object.freeze({
  transport: "tls",
  via: "cloudflare",
  workers_https: true,
  client_side_crypto_claim: false,
  foldlock_is_not_encryption: true,
  note: "HTTPS is terminated at the Cloudflare edge for this Worker. This challenge hub does not implement a second client-side encryption product, a browser WebCrypto vault, or FoldLock-as-cipher. Document the hop. Do not invent a lock.",
});

export const LAMB_LENS = Object.freeze({
  version: "LL-1.0",
  software_tab: false,
  door: false,
  hop: "after_fraggate",
  note: "Corpus is the public Lamb Lens shelf. GodLock is challenge only. NO-FAN.",
});

/** Challenge-hub public-door map. Not a Softwares product. GET /v1/mesh never enables. */
export const ATTACK_SURFACE = Object.freeze([
  { method: "GET", path: "/", role: "read", auth: "none" },
  { method: "GET", path: "/cite.json", role: "read", auth: "none" },
  { method: "GET", path: "/shelves", role: "read", auth: "none" },
  { method: "GET", path: "/v1/shelves", role: "read", auth: "none" },
  { method: "GET", path: "/llms.txt", role: "read", auth: "none" },
  { method: "GET", path: "/ai.txt", role: "read", auth: "none" },
  { method: "GET", path: "/robots.txt", role: "read", auth: "none", growth_on: true },
  { method: "GET", path: "/openapi.json", role: "read", auth: "none" },
  { method: "GET", path: "/verify", role: "read", auth: "none" },
  { method: "GET", path: "/v1/software", role: "read", auth: "none", suite_expand: false },
  { method: "GET", path: "/software", role: "read", auth: "none", suite_expand: false },
  { method: "GET", path: "/v1/mesh", role: "read", auth: "none", enables: false },
  { method: "GET", path: "/v1/mesh/status", role: "read", auth: "none", enables: false },
  { method: "POST", path: "/", role: "challenge", auth: "none" },
]);

export function redlineDoc() {
  return {
    spec: REDLINE_SPEC,
    name: REDLINE_NAME,
    author: AUTHOR,
    identity: AUTHOR,
    date: REDLINE_DATE,
    kind: "challenge_cite",
    challenge_only: true,
    no_fan: true,
    software_tab: false,
    fraggate_slug: false,
    growth_on: true,
    gptbot_disallow: false,
    visible_1520: false,
    person_id: AZIEL_PERSON_ID,
    person_id_stable: true,
    runtime_software_id: HUB_RUNTIME_ID,
    lamb_lens: { ...LAMB_LENS },
    cap7: { ...CAP7, sites: structuredClone(CAP7.sites) },
    tls: { ...TLS },
    foldlock: { ...FOLDLOCK },
    token: { ...TOKEN, if_any: TOKEN.if_any.slice(), headers: TOKEN.headers.slice() },
    mesh_get_never_enables: true,
    attack_surface: ATTACK_SURFACE.map((d) => ({ ...d })),
    plane_b_working_targets: PLANE_B_WORKING_TARGETS.slice(),
    plane_b_all_targets: PLANE_B_ALL_TARGETS,
    plane_b_archive_org_url: ARCHIVE_ORG_TIP_PACK_URL,
    plane_b_framagit_url: FRAMAGIT_TIP_PACK_URL,
    plane_b_framagit_refuse: FRAMAGIT_REFUSE,
    gitflic_refuse: GITFLIC_REFUSE,
    gitlab_refuse: GITLAB_REFUSE,
    zenodo_refuse: null,
    cns: "CROSS-NETWORK-SURVIVAL-1.0",
    no_lie: "NO-LIE-NO-REWRITE-1.0",
    limitation:
      "Challenge-hub redline: public-door map, header-only operator token if any, Growth-ON Allow, Cloudflare TLS cite, attack-sim refuses, ALL-TARGETS shelves. Author: Aziel Eliab only.",
  };
}

function knownZenodo(doi) {
  const s = String(doi || "").trim().toLowerCase();
  return s === FOLDLOCK_DOI.toLowerCase() || s === "https://doi.org/" + FOLDLOCK_DOI;
}

/**
 * Attack-sim refuses (REDLINE-2026-09-14 §3 + shelves honesty).
 * Feasible on this challenge hub without expanding Softwares.
 */
export function evaluateAttackSim(act = {}) {
  const a = act && typeof act === "object" ? act : {};
  const reasons = [];
  const method = String(a.method || "").toUpperCase();
  const path = String(a.path || a.url || "");
  const targets = Array.isArray(a.working_targets) ? a.working_targets.map(String) : [];

  if (
    a.get_enables_mesh === true
    || a.get_never_enables === false
    || (method === "GET" && /\/v1\/mesh/.test(path) && (a.enable === true || a.enables === true || a.radios === "on"))
  ) {
    reasons.push("RL-GET-MESH-ENABLE");
  }
  if (a.resolves_to_hub === true || a.cap7_resolves_to_hub === true) {
    reasons.push("RL-CAP7-RESOLVES-HUB");
  }
  if (a.design_of && a.resolves_to_hub === true) {
    reasons.push("RL-CAP7-RESOLVES-HUB");
  }
  if (a.invent_doi === true || a.mint_doi === true) {
    reasons.push("RL-ZENODO-INVENT");
  }
  if (a.doi && !knownZenodo(a.doi) && /10\.5281\/zenodo/i.test(String(a.doi))) {
    reasons.push("RL-ZENODO-INVENT");
  }
  if (a.token_in === "query" || a.token_in === "body" || a.token_in === "git" || a.token_query === true || a.token_body === true) {
    reasons.push("RL-TOKEN-LEAK");
  }
  if (a.foldlock_is_encryption === true || a.foldlock_as_cipher === true || a.foldlock_encryption === true) {
    reasons.push("RL-FOLDLOCK-ENCRYPT");
  }
  if (a.expand_softwares === true || a.add_softwares === true || a.softwares_sprawl === true) {
    reasons.push("RL-SOFTWARES-EXPAND");
  }
  if (a.visible_1520 === true || a.visible_15_20 === true) {
    reasons.push("RL-VISIBLE-1520");
  }
  if (targets.includes("gitflic-ru") || targets.includes("gitflic") || a.gitflic_working === true) {
    reasons.push("RL-GITFLIC-TARGET");
  }
  if (targets.includes("gitlab") || a.gitlab_working === true) {
    reasons.push("RL-GITLAB-TARGET");
  }
  if (a.framagit_url || a.invent_framagit === true) {
    reasons.push("RL-FRAMAGIT-INVENT");
  }
  if (a.archive_unverified === true || a.archive_org_hash_verify === "fail" || a.archive_org_url === null) {
    reasons.push("RL-ARCHIVE-UNVERIFIED");
  }
  if (a.az_gen_registrar === true || a.live_registrar === true) {
    reasons.push("RL-AZGEN-REGISTRAR");
  }

  if (!reasons.length) {
    return {
      ok: true,
      code: "RL-OK",
      spec: REDLINE_SPEC,
      author: AUTHOR,
      identity: AUTHOR,
    };
  }
  return {
    ok: false,
    code: reasons[0],
    reasons,
    spec: REDLINE_SPEC,
    author: AUTHOR,
    identity: AUTHOR,
    error: "REDLINE refuse: " + reasons[0],
  };
}

export function redlineCiteFields() {
  const doc = redlineDoc();
  return {
    redline: doc,
    redline_spec: REDLINE_SPEC,
    redline_date: REDLINE_DATE,
    attack_surface: doc.attack_surface,
    token_header_only: true,
    token_present: false,
    token_query: false,
    token_body: false,
    token_git: false,
    foldlock_cite_only: true,
    foldlock_encryption: false,
    foldlock_software_tab: false,
    tls_foldlock_is_not_encryption: true,
    client_side_crypto_claim: false,
    visible_1520: false,
    gptbot_disallow: false,
  };
}

export function redlineLlmsSection() {
  return "\n## REDLINE-2026-09-14\n\n"
    + "Challenge-hub redline. Author Aziel Eliab only.\n"
    + "Attack-surface map: GET / /cite.json /shelves /v1/shelves /llms.txt /robots.txt /v1/mesh (never enables) /v1/software (no suite expand).\n"
    + "Header-only tokens if any (Authorization or X-Aziel-Runtime-Token). None present on this hub. Never query, never body, never git.\n"
    + "GET /v1/mesh never enables.\n"
    + "Cap-7: design_of + resolves_to_hub:false.\n"
    + "FoldLock cite-only.\n"
    + "TLS is Cloudflare edge HTTPS. No client-side crypto claim.\n"
    + "Growth-ON. GPTBot stays Allow. No visible 15:20 chrome.\n"
    + "CNS + NO-LIE. Plane B ALL-TARGETS codeberg + archive.org + framagit. Framagit SLOT CNS-NO-FORGE-MIRROR. Plane C SLOT CNS-OPERATOR-ATTEST. No LIVE flip.\n";
}
