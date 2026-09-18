/**
 * COLD-MULTI-SHELF-1.0 cite on godlock.uk.
 * Same-level machine surface as live corpus /shelves (corpus#96).
 * GodLock is challenge-only. NO-FAN. Canonical shelves stay on corpus.
 * Author: Aziel Eliab only.
 */
import {
  CROSS_NETWORK_SURVIVAL,
  CROSS_NETWORK_SURVIVAL_RULE,
  NO_LIE_NO_REWRITE,
  NO_LIE_NO_REWRITE_SPEC,
  NO_LIE_NO_REWRITE_RULE,
  INGEST_GROWTH,
} from "./ingestReceipt.js";

const AUTHOR = "Aziel Eliab";
const CANON_HOST = "https://godlock.uk";
const LIBRARY = "https://www.azielcorpuslibrary.net";
const AZIEL_OFFICIAL = "https://www.azieleliab.com/";
const HEDIDNTJUMP = "https://www.hedidntjump.com/";
const AZIEL_PERSON_ID = "https://www.azieleliab.com/#aziel";
const HUB_RUNTIME_ID = "https://www.azieleliab.com/runtime#runtime";

export const COLD_MULTI_SHELF = "COLD-MULTI-SHELF-1.0";
export const CANONICAL_SHELVES = LIBRARY + "/shelves";
export const CANONICAL_SHELVES_JSON = LIBRARY + "/v1/shelves";
export const CANONICAL_LOCKSET = LIBRARY + "/lockset.json";
export const CANONICAL_BRIDGE = LIBRARY + "/bridge.json";
export const CORPUS_ROLL = "corpus#96";
export const OPERATOR_ROLL = "2026-09-14";
export const LOCKSET_ID = "AZLOCK-INGEST-REEXPAND-1.0";
export const LOCKSET_TIP = "c831429befc221bd41caeb0a6d1c5361602db5684abab7af6d39714084b6b245";
export const CODEBERG_TIP_PACK =
  "b549362c0736ddb54ddc488812327c464e0da1167281f92fd1a4263eedf5df37";
export const CODEBERG_TIP_PACK_URL = "https://codeberg.org/AzielEliab/aziel-lockset-tip";
export const ARCHIVE_ORG_TIP_PACK_URL = "https://archive.org/details/aziel-lockset-tip";
export const ARCHIVE_ORG_ITEM = "aziel-lockset-tip";
export const ARCHIVE_ORG_DOWNLOAD = "https://archive.org/download/aziel-lockset-tip/";
export const ARCHIVE_ORG_TIP_PACK_202609_URL = "https://archive.org/details/aziel-lockset-tip_202609";
export const ARCHIVE_ORG_ITEM_202609 = "aziel-lockset-tip_202609";
export const ARCHIVE_ORG_DOWNLOAD_202609 = "https://archive.org/download/aziel-lockset-tip_202609/";
export const ARCHIVE_ORG_ZIP_202609 = "https://archive.org/download/aziel-lockset-tip_202609/aziel-lockset-tip.zip";
export const ARCHIVE_ORG_ZIP_ALT_202609 = "https://archive.org/download/aziel-lockset-tip_202609/aziel-lockset-tip%202.zip";
export const FRAMAGIT_TIP_PACK_URL = null;
export const FRAMAGIT_REFUSE = "CNS-NO-FORGE-MIRROR";
export const PLANE_B_WORKING_TARGETS = Object.freeze(["codeberg", "archive.org", "framagit"]);
export const PLANE_B_ALL_TARGETS = "CNS-PLANE-B-ALL-TARGETS";
export const ZENODO_REFUSE = "CNS-ZENODO-IP-BAN";
export const GITFLIC_REFUSE = "CNS-GITFLIC-EMAIL";
export const GITLAB_REFUSE = "CNS-GITLAB-CF-LOOP";
export const PLANE_C_ATTEST = "CNS-OPERATOR-ATTEST";
export const TIP_PACK_FILES = Object.freeze([
  "aziel-tip-pack.tar",
  "SHA256SUMS",
  "lockset.json",
  "verify-airgap.sh",
]);
export const PLANE_B_SLOT_IDS = Object.freeze([
  "plane-b-alt-forge-archive",
  "plane-b-codeberg-tip-pack",
  "plane-b-archive-org-tip-pack",
  "plane-b-archive-org-tip-pack-202609",
  "plane-b-framagit-tip-pack",
]);
export const PLANE_B_REFUSED_IDS = Object.freeze([
  "plane-b-gitflic-ru-tip-pack",
  "plane-b-gitlab-tip-pack",
  "plane-b-zenodo-tip-pack",
]);
export const PLANE_B_NOTE =
  "Codeberg + archive.org hash-verify PASS (still SLOT). archive.org has two items (aziel-lockset-tip + aziel-lockset-tip_202609), same blast_radius — not a second independent shelf. Zip wrap on the 202609 item: flat IA sha256 on the zip may be null; inner aziel-tip-pack.tar hash-verifies. Framagit URL null. SLOT CNS-NO-FORGE-MIRROR. No LIVE flip. LIVE only when all three pass (CNS-PLANE-B-ALL-TARGETS). GitFlic refused CNS-GITFLIC-EMAIL. GitLab refused CNS-GITLAB-CF-LOOP. Zenodo refused CNS-ZENODO-IP-BAN.";
export const COLD_MULTI_SHELF_RULE =
  "Planes A/B/C: A=one CF/GitHub tunnel (5 surfaces / 2 family radii, not 5 shelves); B=alt independent forge/archive tip-pack SLOT; C=USB airgap SLOT. Survival = bytes↔hash. LIVE only after hash verify.";

export const FAMILY_BLAST_RADII = Object.freeze(["cloudflare", "github"]);
export const PUBLISHED_SURFACE_IDS = Object.freeze([
  "azieleliab-com",
  "azielcorpuslibrary-net",
  "godlock-uk",
  "hedidntjump-com",
  "github-aziel-corpus",
]);

export const CAP7_SITES = Object.freeze({
  azcorpus: {
    design_of: LIBRARY + "/",
    resolves_to_hub: false,
    name_may_change: true,
    public_icann: false,
  },
  azlibrary: {
    design_of: LIBRARY + "/",
    resolves_to_hub: false,
    name_may_change: true,
    public_icann: false,
  },
  azeliab: {
    design_of: AZIEL_OFFICIAL,
    resolves_to_hub: false,
    name_may_change: true,
    public_icann: false,
  },
  godlock: {
    design_of: CANON_HOST + "/",
    resolves_to_hub: false,
    name_may_change: true,
    public_icann: false,
  },
  hedidntjump: {
    design_of: HEDIDNTJUMP,
    resolves_to_hub: false,
    name_may_change: true,
    public_icann: false,
  },
});

export const PLANES = Object.freeze({
  A: {
    name: "CF/GitHub tunnel",
    status: "live",
    independent: true,
    mirrors: 4,
    published_surfaces: 5,
    family_blast_radii: FAMILY_BLAST_RADII.slice(),
    note: "4 CF hubs + GitHub = 5 published surfaces / 2 family radii (cloudflare + github). One cf-github plane, not five shelves.",
  },
  B: {
    name: "alternate independent forge/archive tip-pack",
    status: "slot",
    doi: null,
    working_targets: PLANE_B_WORKING_TARGETS.slice(),
    zenodo_working_path: false,
    live_ready: false,
    refuse: ZENODO_REFUSE,
    codeberg_tip_pack: CODEBERG_TIP_PACK,
    codeberg_url: CODEBERG_TIP_PACK_URL,
    archive_org_url: ARCHIVE_ORG_TIP_PACK_URL,
    archive_org_secondary_url: ARCHIVE_ORG_TIP_PACK_202609_URL,
    archive_org_secondary_item: ARCHIVE_ORG_ITEM_202609,
    archive_org_items: [ARCHIVE_ORG_ITEM, ARCHIVE_ORG_ITEM_202609],
    archive_org_hash_verify: "pass",
    framagit_url: FRAMAGIT_TIP_PACK_URL,
    framagit_refuse: FRAMAGIT_REFUSE,
    framagit_status: "slot",
    hash_verify: "pass",
    gitflic: GITFLIC_REFUSE,
    gitlab: GITLAB_REFUSE,
    note: PLANE_B_NOTE,
  },
  C: {
    name: "USB airgap + optional second forge",
    status: "slot",
    live_ready: false,
    primary: "usb_airgap",
    refuse: [PLANE_C_ATTEST, "CNS-NO-FORGE-MIRROR"],
    attest: "USB offline-verify before LIVE: copy the airgap pack off-network, run verify-airgap.sh / sha256sum -c SHA256SUMS against the published tip, then operator attest (CNS-OPERATOR-ATTEST).",
    note: "Plane C USB stays SLOT until CNS-OPERATOR-ATTEST. No LIVE flip.",
  },
});

function archiveOrgSecondaryCite() {
  return {
    id: "plane-b-archive-org-tip-pack-202609",
    url: ARCHIVE_ORG_TIP_PACK_202609_URL,
    identifier: ARCHIVE_ORG_ITEM_202609,
    item: ARCHIVE_ORG_ITEM_202609,
    download_base: ARCHIVE_ORG_DOWNLOAD_202609,
    zip: ARCHIVE_ORG_ZIP_202609,
    zip_alt: ARCHIVE_ORG_ZIP_ALT_202609,
    wrap: "zip",
    ia_flat_sha256: null,
    sha256sums_flat_check: "incomplete",
    inner_pack: "aziel-tip-pack.tar",
    pack_sha256: CODEBERG_TIP_PACK,
    lockset_tip: LOCKSET_TIP,
    hash_verify: "pass",
    same_blast_radius: "archive-org",
    independent_shelf: false,
  };
}

function planeAHost(id, origin, verified) {
  return {
    id,
    plane: "A",
    kind: "other",
    status: "live",
    origin,
    lockset: origin.replace(/\/$/, "") + "/lockset.json",
    receipts: origin.replace(/\/$/, "") + "/receipts",
    shelves: origin.replace(/\/$/, "") + "/shelves",
    blast_radius: "cf-github",
    independent: false,
    lockset_shelf: true,
    verified_in_this_repo: verified,
    note: "One of four Plane A host mirrors. Not an independent shelf.",
  };
}

export function shelvesDoc() {
  return {
    spec: COLD_MULTI_SHELF,
    kind: "challenge_cite",
    product: "GodLock",
    host_kind: "product_surface",
    challenge_only: true,
    no_fan: true,
    lamb_lens: "Corpus is the public Lamb Lens shelf. GodLock is challenge only. NO-FAN.",
    growth_on: true,
    ingest_growth: INGEST_GROWTH,
    author: AUTHOR,
    identity: AUTHOR,
    person_id: AZIEL_PERSON_ID,
    runtime_id: HUB_RUNTIME_ID,
    official_site: AZIEL_OFFICIAL,
    roll: OPERATOR_ROLL,
    corpus: CORPUS_ROLL,
    canonical_shelves: CANONICAL_SHELVES,
    canonical_shelves_json: CANONICAL_SHELVES_JSON,
    canonical_lockset: CANONICAL_LOCKSET,
    canonical_bridge: CANONICAL_BRIDGE,
    cite: CANON_HOST + "/cite.json",
    llms: CANON_HOST + "/llms.txt",
    ai: CANON_HOST + "/ai.txt",
    shelves: CANON_HOST + "/shelves",
    shelves_json: CANON_HOST + "/v1/shelves",
    lockset: CANONICAL_LOCKSET,
    lockset_id: LOCKSET_ID,
    lockset_tip: LOCKSET_TIP,
    lockset_doi: null,
    doi: null,
    zenodo_status: "Do not invent DOIs.",
    zenodo_working_path: false,
    refuse: ZENODO_REFUSE,
    rule: COLD_MULTI_SHELF_RULE,
    cold_multi_shelf: COLD_MULTI_SHELF,
    cold_multi_shelf_rule: COLD_MULTI_SHELF_RULE,
    cross_network_survival: CROSS_NETWORK_SURVIVAL,
    cross_network_survival_rule: CROSS_NETWORK_SURVIVAL_RULE,
    no_lie: "NO-LIE",
    no_rewrite: "NO-REWRITE",
    no_lie_no_rewrite: NO_LIE_NO_REWRITE,
    no_lie_no_rewrite_rule: NO_LIE_NO_REWRITE_RULE,
    no_lie_spec: NO_LIE_NO_REWRITE_SPEC,
    cap: 7,
    cap7_sites: structuredClone(CAP7_SITES),
    resolves_to_hub: false,
    name_may_change: true,
    public_icann: false,
    fifth_product: false,
    visible_1520: false,
    softwares_tab: false,
    mesh_radio: false,
    az_gen_live_icann_publish: false,
    planes: structuredClone(PLANES),
    published_surfaces: 5,
    published_surface_ids: PUBLISHED_SURFACE_IDS.slice(),
    published_surfaces_note: "4 CF hubs + GitHub. Not 5 independent shelves.",
    family_blast_radii: FAMILY_BLAST_RADII.slice(),
    min_independent_shelves: 3,
    independent_live_blast_radii: ["cf-github"],
    independent_live_count: 1,
    independent_requirement_met: false,
    survival: "bytes↔hash",
    crawlers: "extra-shelf-not-reexpand",
    training_residue: "rumor",
    live: [
      "plane-a-cf-github",
      "plane-a-git-aziel-corpus",
      "plane-a-host-azieleliab-com",
      "plane-a-host-azielcorpuslibrary-net",
      "plane-a-host-godlock-uk",
      "plane-a-host-hedidntjump-com",
    ],
    slot: [
      ...PLANE_B_SLOT_IDS,
      "plane-c-usb-airgap",
      "plane-c-forge-off-github",
    ],
    refused: PLANE_B_REFUSED_IDS.slice(),
    registry: {
      spec: COLD_MULTI_SHELF,
      author: AUTHOR,
      identity: AUTHOR,
      umbrella: "CROSS-NETWORK-SURVIVAL-1.0",
      no_lie_spec: NO_LIE_NO_REWRITE_SPEC,
      lockset_id: LOCKSET_ID,
      lockset_tip: LOCKSET_TIP,
      lockset_zenodo: null,
      lockset_doi: null,
      canonical_shelves: CANONICAL_SHELVES,
      challenge_only: true,
      no_fan: true,
      planes: structuredClone(PLANES),
      published_surfaces: 5,
      published_surface_ids: PUBLISHED_SURFACE_IDS.slice(),
      published_surfaces_note: "4 CF hubs + GitHub. Not 5 independent shelves.",
      family_blast_radii: FAMILY_BLAST_RADII.slice(),
      min_independent_shelves: 3,
      independent_live_blast_radii: ["cf-github"],
      independent_live_count: 1,
      independent_requirement_met: false,
      survival: "bytes↔hash",
      crawlers: "extra-shelf-not-reexpand",
      training_residue: "rumor",
      live: [
        "plane-a-cf-github",
        "plane-a-git-aziel-corpus",
        "plane-a-host-azieleliab-com",
        "plane-a-host-azielcorpuslibrary-net",
        "plane-a-host-godlock-uk",
        "plane-a-host-hedidntjump-com",
      ],
      slot: [
        ...PLANE_B_SLOT_IDS,
        "plane-c-usb-airgap",
        "plane-c-forge-off-github",
      ],
      refused: PLANE_B_REFUSED_IDS.slice(),
      shelves: [
        {
          id: "plane-a-cf-github",
          plane: "A",
          kind: "other",
          status: "live",
          blast_radius: "cf-github",
          independent: true,
          lockset_shelf: true,
          git: "https://github.com/AzielEliab/aziel-corpus",
          note: "LIVE multi-host, same tunnel. Count as one CF/GitHub plane.",
        },
        {
          id: "plane-a-git-aziel-corpus",
          plane: "A",
          kind: "git_mirror",
          status: "live",
          url: "https://github.com/AzielEliab/aziel-corpus",
          blast_radius: "cf-github",
          independent: false,
          lockset_shelf: true,
          note: "Same Plane A blast radius as the four CF hosts. Not a second independent shelf.",
        },
        planeAHost("plane-a-host-azieleliab-com", "https://www.azieleliab.com", false),
        planeAHost("plane-a-host-azielcorpuslibrary-net", LIBRARY, false),
        {
          ...planeAHost("plane-a-host-godlock-uk", CANON_HOST, true),
          challenge_only: true,
          no_fan: true,
          verify: "This Worker serves /shelves as a challenge-only cite of the canonical corpus registry.",
        },
        planeAHost("plane-a-host-hedidntjump-com", "https://www.hedidntjump.com", false),
        {
          id: "plane-b-alt-forge-archive",
          plane: "B",
          kind: "other",
          status: "slot",
          doi: null,
          url: null,
          blast_radius: "alt-forge-archive",
          independent: true,
          lockset_shelf: true,
          lockset_doi: false,
          working_targets: PLANE_B_WORKING_TARGETS.slice(),
          refuse: "CNS-NO-FORGE-MIRROR",
          note: "Not Zenodo. Not GitFlic (CNS-GITFLIC-EMAIL). Not GitLab (CNS-GITLAB-CF-LOOP). Codeberg + archive.org PASS (two IA items, one working_targets kind); Framagit URL null. LIVE only when all three pass (CNS-PLANE-B-ALL-TARGETS).",
        },
        {
          id: "plane-b-codeberg-tip-pack",
          plane: "B",
          kind: "git_mirror",
          status: "slot",
          forge: "codeberg",
          url: CODEBERG_TIP_PACK_URL,
          branch: "main",
          files: TIP_PACK_FILES.slice(),
          pack_sha256: CODEBERG_TIP_PACK,
          lockset_tip: LOCKSET_TIP,
          hash_verify: "pass",
          tip_verified: true,
          live_ready: false,
          doi: null,
          blast_radius: "codeberg",
          independent: true,
          lockset_shelf: true,
          refuse: PLANE_B_ALL_TARGETS,
          reason: "Codeberg tip-pack uploaded and hash-verify PASS. SLOT until Framagit also hash-verify. Plane B LIVE only when Codeberg + archive.org + Framagit all pass (CNS-PLANE-B-ALL-TARGETS). doi null.",
        },
        {
          id: "plane-b-archive-org-tip-pack",
          plane: "B",
          kind: "archive_org",
          status: "slot",
          url: ARCHIVE_ORG_TIP_PACK_URL,
          identifier: ARCHIVE_ORG_ITEM,
          item: ARCHIVE_ORG_ITEM,
          download_base: ARCHIVE_ORG_DOWNLOAD,
          files: TIP_PACK_FILES.slice(),
          pack_sha256: CODEBERG_TIP_PACK,
          lockset_tip: LOCKSET_TIP,
          hash_verify: "pass",
          tip_verified: true,
          live_ready: false,
          doi: null,
          blast_radius: "archive-org",
          independent: true,
          lockset_shelf: true,
          secondary_items: [archiveOrgSecondaryCite()],
          refuse: PLANE_B_ALL_TARGETS,
          reason: "archive.org tip-pack uploaded and hash-verify PASS at https://archive.org/details/aziel-lockset-tip (pack " + CODEBERG_TIP_PACK + "). A second IA item (aziel-lockset-tip_202609) is the same blast_radius archive-org, listed under secondary_items — not a new independent shelf. SLOT until Framagit also hash-verify. Plane B LIVE only when Codeberg + archive.org + Framagit all pass (CNS-PLANE-B-ALL-TARGETS). doi null.",
        },
        {
          id: "plane-b-archive-org-tip-pack-202609",
          plane: "B",
          kind: "archive_org",
          status: "slot",
          url: ARCHIVE_ORG_TIP_PACK_202609_URL,
          identifier: ARCHIVE_ORG_ITEM_202609,
          item: ARCHIVE_ORG_ITEM_202609,
          download_base: ARCHIVE_ORG_DOWNLOAD_202609,
          zip: ARCHIVE_ORG_ZIP_202609,
          zip_alt: ARCHIVE_ORG_ZIP_ALT_202609,
          wrap: "zip",
          ia_flat_sha256: null,
          sha256sums_flat_check: "incomplete",
          inner_pack: "aziel-tip-pack.tar",
          files: ["aziel-lockset-tip.zip"],
          inner_files: TIP_PACK_FILES.slice(),
          pack_sha256: CODEBERG_TIP_PACK,
          lockset_tip: LOCKSET_TIP,
          hash_verify: "pass",
          tip_verified: true,
          live_ready: false,
          doi: null,
          blast_radius: "archive-org",
          independent: false,
          lockset_shelf: true,
          same_pack_as: "plane-b-archive-org-tip-pack",
          required_for_plane_b_live: false,
          refuse: PLANE_B_ALL_TARGETS,
          reason: "Second archive.org tip-pack item (aziel-lockset-tip_202609). Same blast_radius archive-org as the primary item — not a new independent shelf. Zip wraps the tip files; flat IA metadata sha256 on the zip may be null. SHA256SUMS flat-check incomplete at IA file list is OK because inner aziel-tip-pack.tar SHA-256 " + CODEBERG_TIP_PACK + " hash-verifies (AZBot PASS; same pack as Codeberg + primary archive.org). SLOT until Framagit also hash-verify. Plane B LIVE only when Codeberg + archive.org + Framagit all pass (CNS-PLANE-B-ALL-TARGETS). doi null.",
        },
        {
          id: "plane-b-framagit-tip-pack",
          plane: "B",
          kind: "git_mirror",
          status: "slot",
          forge: "framagit",
          url: FRAMAGIT_TIP_PACK_URL,
          blast_radius: "framagit",
          independent: true,
          lockset_shelf: true,
          refuse: FRAMAGIT_REFUSE,
          live_ready: false,
          reason: "Framagit is the third Plane B LIVE-promotion target (CNS-PLANE-B-ALL-TARGETS = Codeberg + archive.org + Framagit). No verified URL in-repo. SLOT CNS-NO-FORGE-MIRROR. Do not invent a URL. No LIVE flip.",
        },
        {
          id: "plane-b-gitflic-ru-tip-pack",
          plane: "B",
          kind: "git_mirror",
          status: "refused",
          forge: "gitflic-ru",
          url: null,
          blast_radius: "gitflic-ru",
          independent: true,
          lockset_shelf: false,
          refuse: GITFLIC_REFUSE,
          reason: "GitFlic is not a Plane B working target (CNS-GITFLIC-EMAIL). ALL-TARGETS is Codeberg + archive.org + Framagit. Do not invent a GitFlic URL.",
        },
        {
          id: "plane-b-gitlab-tip-pack",
          plane: "B",
          kind: "git_mirror",
          status: "refused",
          forge: "gitlab",
          url: null,
          blast_radius: "gitlab",
          independent: true,
          lockset_shelf: false,
          refuse: GITLAB_REFUSE,
          reason: "GitLab is not a Plane B working path (CNS-GITLAB-CF-LOOP). Do not invent a GitLab URL.",
        },
        {
          id: "plane-b-zenodo-tip-pack",
          plane: "B",
          kind: "zenodo_doi",
          status: "refused",
          doi: null,
          url: null,
          blast_radius: "zenodo-cern",
          independent: true,
          lockset_shelf: false,
          lockset_doi: false,
          refuse: [ZENODO_REFUSE, "CNS-NO-TIP-DOI"],
          reason: "Operator IP banned at Zenodo (CNS-ZENODO-IP-BAN). Zenodo is not the Plane B working shelf. No tip-pack DOI (CNS-NO-TIP-DOI). cite.json / lockset doi stay null. Do not invent.",
        },
        {
          id: "plane-c-usb-airgap",
          plane: "C",
          kind: "usb_airgap",
          status: "slot",
          blast_radius: "operator-airgap",
          independent: true,
          lockset_shelf: true,
          primary: true,
          refuse: PLANE_C_ATTEST,
          attest: PLANES.C.attest,
          reason: "USB airgap export stays SLOT until an operator attests an off-network copy still hashes (CNS-OPERATOR-ATTEST).",
        },
        {
          id: "plane-c-forge-off-github",
          plane: "C",
          kind: "git_mirror",
          status: "slot",
          url: null,
          forge: null,
          blast_radius: "second-forge",
          independent: true,
          lockset_shelf: true,
          refuse: "CNS-NO-FORGE-MIRROR",
          reason: "Optional Plane C second-forge slot. Codeberg / archive.org / Framagit are Plane B working targets, not this slot. SLOT. Do not invent a URL.",
        },
      ],
      verify: {
        paste_hash: CANON_HOST + "/verify",
        lockset: CANONICAL_LOCKSET,
        shelves: CANONICAL_SHELVES,
        local_shelves: CANON_HOST + "/shelves",
        rule: "yes/no against the published lockset tip " + LOCKSET_TIP + ". Cheap mismatch. cite, don't merge. GodLock challenge receipts stay distinct. bytes survive; crawlers do not re-expand.",
      },
      growth_on: true,
      softwares_tab: false,
      mesh_radio: false,
      az_gen_live_icann_publish: false,
      note: COLD_MULTI_SHELF_RULE + " GodLock = challenge only. NO-FAN. Canonical shelves " + CANONICAL_SHELVES + ".",
    },
    verify: {
      paste_hash: CANON_HOST + "/verify",
      lockset: CANONICAL_LOCKSET,
      shelves: CANONICAL_SHELVES,
      local_shelves: CANON_HOST + "/shelves",
      rule: "Cite the canonical corpus shelves. GodLock does not write the public lockset. Challenge receipts stay on this host.",
    },
    note:
      "Operator ROLL OUT " +
      OPERATOR_ROLL +
      " — GodLock same level as live corpus /shelves (" +
      CORPUS_ROLL +
      "). Challenge only. NO-FAN. Canonical shelves " +
      CANONICAL_SHELVES +
      ". Plane A 5 surfaces / 2 radii. Plane B ALL-TARGETS Codeberg + archive.org PASS " +
      ARCHIVE_ORG_TIP_PACK_URL +
      " and " +
      ARCHIVE_ORG_TIP_PACK_202609_URL +
      " (same blast_radius; independent:false on 202609; independent_live_count=1); Framagit url null SLOT " +
      FRAMAGIT_REFUSE +
      " — no LIVE flip; GitFlic " +
      GITFLIC_REFUSE +
      "; GitLab " +
      GITLAB_REFUSE +
      "; Zenodo " +
      ZENODO_REFUSE +
      " doi null. Plane C attest SLOT " +
      PLANE_C_ATTEST +
      " — no LIVE flip. Cap-7 design_of + resolves_to_hub:false. Person @id " +
      AZIEL_PERSON_ID +
      ". Lamb Lens. Growth-ON. CNS + NO-LIE.",
  };
}

export function locksetCiteDoc() {
  return {
    spec: LOCKSET_ID,
    kind: "lockset_cite",
    product: "GodLock",
    challenge_only: true,
    no_fan: true,
    writes_public_ledger: false,
    author: AUTHOR,
    identity: AUTHOR,
    person_id: AZIEL_PERSON_ID,
    lockset_id: LOCKSET_ID,
    tip: LOCKSET_TIP,
    doi: null,
    zenodo: null,
    refuse: ZENODO_REFUSE,
    canonical: CANONICAL_LOCKSET,
    shelves: CANONICAL_SHELVES,
    local_shelves: CANON_HOST + "/shelves",
    note: "GodLock cites the published corpus lockset tip. This Worker does not write the public ledger. doi null.",
  };
}

export function shelvesCiteFields() {
  return {
    shelves: CANON_HOST + "/shelves",
    shelves_json: CANON_HOST + "/v1/shelves",
    canonical_shelves: CANONICAL_SHELVES,
    canonical_shelves_json: CANONICAL_SHELVES_JSON,
    lockset: CANONICAL_LOCKSET,
    lockset_id: LOCKSET_ID,
    lockset_tip: LOCKSET_TIP,
    lockset_doi: null,
    doi: null,
    zenodo_status: "Do not invent DOIs.",
    zenodo_working_path: false,
    zenodo_refuse: ZENODO_REFUSE,
    cold_multi_shelf: COLD_MULTI_SHELF,
    cold_multi_shelf_rule: COLD_MULTI_SHELF_RULE,
    cold_multi_shelf_corpus: CORPUS_ROLL,
    cold_multi_shelf_roll: OPERATOR_ROLL,
    challenge_only: true,
    no_fan: true,
    lamb_lens: "Corpus is the public Lamb Lens shelf. GodLock is challenge only. NO-FAN.",
    growth_on: true,
    published_surfaces: 5,
    family_blast_radii: FAMILY_BLAST_RADII.slice(),
    plane_a: "5 surfaces / 2 family radii (cloudflare + github). One cf-github plane, not five shelves.",
    plane_b_working_targets: PLANE_B_WORKING_TARGETS.slice(),
    plane_b_all_targets: PLANE_B_ALL_TARGETS,
    plane_b_codeberg_tip_pack: CODEBERG_TIP_PACK,
    plane_b_codeberg_status: "slot",
    plane_b_archive_org_url: ARCHIVE_ORG_TIP_PACK_URL,
    plane_b_archive_org_secondary_url: ARCHIVE_ORG_TIP_PACK_202609_URL,
    plane_b_archive_org_secondary_item: ARCHIVE_ORG_ITEM_202609,
    plane_b_archive_org_hash_verify: "pass",
    plane_b_framagit_url: FRAMAGIT_TIP_PACK_URL,
    plane_b_framagit_refuse: FRAMAGIT_REFUSE,
    plane_b_framagit_status: "slot",
    plane_b_live_ready: false,
    plane_b_gitflic_refuse: GITFLIC_REFUSE,
    plane_b_gitlab_refuse: GITLAB_REFUSE,
    plane_b_doi: null,
    plane_c_attest: PLANE_C_ATTEST,
    plane_c_status: "slot",
    plane_c_live_ready: false,
    cap: 7,
    cap7_sites: structuredClone(CAP7_SITES),
    resolves_to_hub: false,
    cap7_godlock_design_of: CAP7_SITES.godlock.design_of,
    cap7_godlock_resolves_to_hub: false,
    bridge: CANONICAL_BRIDGE,
  };
}

export function shelvesLlmsSection() {
  return "\n## Cold multi-shelf (CROSS-NETWORK-SURVIVAL executable)\n\n"
    + "Spec: " + COLD_MULTI_SHELF + "\n"
    + COLD_MULTI_SHELF_RULE + "\n"
    + "GodLock is challenge only. NO-FAN. Canonical shelves: " + CANONICAL_SHELVES + "\n"
    + "Local machine surface: " + CANON_HOST + "/shelves · " + CANON_HOST + "/v1/shelves\n"
    + "Cite: " + CANON_HOST + "/cite.json · LLMs: " + CANON_HOST + "/llms.txt · AI: " + CANON_HOST + "/ai.txt\n"
    + "Person @id: " + AZIEL_PERSON_ID + "\n"
    + "Lamb Lens: Corpus is the public Lamb Lens shelf. GodLock does not fan Corpus.\n"
    + "Growth-ON.\n"
    + "Plane A: 5 published surfaces / 2 family radii (cloudflare + github). One CF/GitHub tunnel, not five shelves.\n"
    + "Plane B ALL-TARGETS: codeberg + archive.org + framagit. Codeberg tip-pack " + CODEBERG_TIP_PACK + " SLOT (hash-verify PASS). archive.org " + ARCHIVE_ORG_TIP_PACK_URL + " PASS and " + ARCHIVE_ORG_TIP_PACK_202609_URL + " PASS (same blast_radius archive-org; not a second independent shelf; independent_live_count stays 1). Framagit url null. SLOT " + FRAMAGIT_REFUSE + ". No LIVE flip. GitFlic refused " + GITFLIC_REFUSE + ". GitLab refused " + GITLAB_REFUSE + ". LIVE only when all three pass (" + PLANE_B_ALL_TARGETS + ").\n"
    + "Zenodo tip-pack refused " + ZENODO_REFUSE + ". doi null. Do not invent a DOI.\n"
    + "Plane C: USB airgap SLOT until " + PLANE_C_ATTEST + ". No LIVE flip.\n"
    + "Cap-7: design_of hubs; resolves_to_hub: false; name_may_change: true; public_icann: false. GodLock design_of " + CANON_HOST + "/.\n"
    + "Lockset cite (GodLock does not write the public ledger): " + CANONICAL_LOCKSET + " tip " + LOCKSET_TIP + "\n"
    + "Corpus roll: " + CORPUS_ROLL + ". Operator roll: " + OPERATOR_ROLL + ".\n"
    + CROSS_NETWORK_SURVIVAL + ": " + CROSS_NETWORK_SURVIVAL_RULE + "\n"
    + NO_LIE_NO_REWRITE + ": " + NO_LIE_NO_REWRITE_RULE + "\n";
}
