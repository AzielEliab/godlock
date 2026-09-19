/**
 * BAN-SURVIVAL-1.0 hub pull for godlock.uk.
 * SoT is GET /v1/survival on Aziel Runtime (short TTL). Cite only.
 * Not a second FragGate door. Not /mcp. Never invent a live door.
 * GodLock is a product name, not identity. Person @id
 * https://www.azieleliab.com/#aziel. Lamb Lens. NO-LIE. No visible 15:20.
 * Author: Aziel Eliab only.
 */
const AUTHOR = "Aziel Eliab";
const AZIEL_PERSON_ID = "https://www.azieleliab.com/#aziel";
const CANON_HOST = "https://godlock.uk";
const CATALOG = "https://aziel-runtime.vibelock.workers.dev";
const PUBLIC_RUNTIME = CANON_HOST + "/runtime";

export const BAN_SURVIVAL = "BAN-SURVIVAL-1.0";
export const BAN_PLATFORMS = "BAN-PLATFORMS-1.0";
export const BAN_CALLING_NAME = "BAN-CALLING-NAME-1.0";
export const CAP7_SHUFFLE = "CAP7-SHUFFLE-1.0";
export const SURVIVAL_TTL_MS = 60 * 1000;
export const SURVIVAL_CACHE_CONTROL = "public, max-age=60, s-maxage=60, stale-while-revalidate=120";
export const SURVIVAL_ORIGIN = CATALOG + "/v1/survival";
export const SURVIVAL_ORIGIN_ALIAS = CATALOG + "/survival";
export const SURVIVAL_LOCAL = CANON_HOST + "/survival";
export const SURVIVAL_LOCAL_JSON = CANON_HOST + "/v1/survival";
export const SURVIVAL_RUNTIME = PUBLIC_RUNTIME + "/survival";
export const MIRAGEGRID_WORKER = "https://miragegrid.vibelock.workers.dev";
export const MIRAGEGRID_BRIDGE = MIRAGEGRID_WORKER + "/bridge";
export const MIRAGEGRID_CAP7 = MIRAGEGRID_WORKER + "/v1/cap7";
export const MIRAGEGRID_SHUFFLE = MIRAGEGRID_WORKER + "/v1/shuffle";
export const MIRAGEGRID_DOWNLOAD = "https://miragegrid-download-tracker.vibelock.workers.dev";

export const SURVIVAL_READ_PATHS = Object.freeze(["/v1/survival", "/survival"]);
export const BINDING_SURVIVAL_URLS = Object.freeze(
  ["https://aziel-runtime", CATALOG].flatMap((host) => SURVIVAL_READ_PATHS.map((p) => host + p)),
);
export const HTTPS_SURVIVAL_URLS = Object.freeze(
  [CATALOG].flatMap((host) => SURVIVAL_READ_PATHS.map((p) => host + p)),
);

const UA = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

export const FALLBACK_LIVE_DOORS = Object.freeze([
  {
    id: "workers-dev",
    origin: "https://aziel-runtime.vibelock.workers.dev",
    via: "workers.dev",
    status: "live",
    independent: false,
  },
  {
    id: "library-runtime",
    origin: "https://www.azielcorpuslibrary.net/runtime",
    via: "service-binding",
    status: "live",
    independent: false,
  },
  {
    id: "author-runtime",
    origin: "https://www.azieleliab.com/runtime",
    via: "service-binding",
    status: "live",
    independent: false,
  },
  {
    id: "godlock-runtime",
    origin: "https://godlock.uk/runtime",
    via: "service-binding",
    status: "live",
    independent: false,
  },
]);

export const FALLBACK_PLATFORM_IDS = Object.freeze(["windows", "mac", "linux", "android", "ios"]);

export const FALLBACK_CALLING_NAME = Object.freeze({
  spec: BAN_CALLING_NAME,
  rotated: false,
  calling_name: "Aziel Runtime",
  calling_slug: "aziel-runtime",
  identity: AUTHOR,
  identity_unchanged: true,
  chainlock_rewrite: false,
  akm_rewrite: false,
  alert: null,
  note: "No honest ban signal. Live calling name stays Aziel Runtime. Identity Aziel Eliab only.",
});

export const FALLBACK_PLATFORMS = Object.freeze({
  spec: BAN_PLATFORMS,
  all_live: true,
  native_app_store: false,
  calling_name: "Aziel Runtime",
  survival: "/survival",
  ids: FALLBACK_PLATFORM_IDS.slice(),
  note: "Windows, Mac, Linux, Android, and iPhone are LIVE on the public Worker (browser / PWA / download / MCP). Hubs pull /survival. Not five native store binaries.",
});

/** Factory Worker LIVE. Hosted Cap-7 /mcp stays SLOT unless SoT says otherwise. */
export const MIRAGEGRID_CAP7_CITE = Object.freeze({
  factory: "miragegrid",
  factory_only: true,
  worker: MIRAGEGRID_WORKER,
  bridge: MIRAGEGRID_BRIDGE,
  cap7: MIRAGEGRID_CAP7,
  shuffle: MIRAGEGRID_SHUFFLE,
  download_plane: MIRAGEGRID_DOWNLOAD,
  status: "live",
  resolves_to_hub: false,
  name_may_change: true,
  public_icann: false,
  hardcoded_single_host: false,
  public_pair: Object.freeze(["azgrid", "azbooth"]),
  aznet_side: Object.freeze(["azcloak", "azvault", "azshift", "azflag", "azstandby"]),
  godlock_design_of: Object.freeze(["azcloak", "azstandby"]),
  note: "Named MirageGrid app Worker is LIVE. Cap-7 factory sites inherit hub design DNA only. resolves_to_hub is false. Public pair (azgrid + azbooth) is LIVE Worker HTTPS. Remainder is AZNet-side SLOT. Not /mcp. Not ICANN .az.",
});

export const FALLBACK_CAP7_AZNET = Object.freeze({
  layer: 3,
  factory: "miragegrid",
  factory_only: true,
  radio_phy: false,
  resolves_to_hub: false,
  name_may_change: true,
  public_icann: false,
  live_registrar: false,
  fifth_product: false,
  cite: Object.freeze({
    status: "live",
    mesh_az_generator: CATALOG + "/v1/mesh/az-generator",
    miragegrid_bridge: MIRAGEGRID_BRIDGE,
    fraggate: "fraggate_call { slug: \"miragegrid\", op: \"bridge\" }",
  }),
  aznet_verify: Object.freeze({
    status: "live",
    ops: Object.freeze(["stamp", "verify_hash", "receipt_verify"]),
    door: "fraggate_call",
    note: "AZNet verification side-net. Hash continuity when a public door is banned. Never hosts payloads.",
  }),
  hosted_endpoints: Object.freeze({
    status: "slot",
    is_live_door: false,
    note: "AZNet never hosts payloads. Cap-7 names are not /mcp and not ICANN aliases. Do not invent a hosted endpoint.",
  }),
  shuffle: Object.freeze({
    spec: CAP7_SHUFFLE,
    layout: "live",
    path: "ping → land → that-round update",
    hardcoded_single_host: false,
    resolves_to_hub: false,
    site_count: 7,
  }),
  worker: MIRAGEGRID_CAP7_CITE,
});

export const SURVIVAL_FALLBACK = Object.freeze({
  spec: BAN_SURVIVAL,
  mode: "LIVE",
  author: AUTHOR,
  identity: AUTHOR,
  person_id: AZIEL_PERSON_ID,
  umbrella: "CROSS-NETWORK-SURVIVAL-1.0",
  no_lie_spec: "NO-LIE-NO-REWRITE-1.0",
  mutual_backup: true,
  shelves_are_not_a_live_door: true,
  shelves_backup_for: "death-by-ban",
  live_doors_backup_for: "cold-shelf-death",
  lie_to_survive: false,
  rewrite_key: false,
  second_door: false,
  fraggate_is_the_door: true,
  visible_1520: false,
  growth_on: true,
  live_doors: FALLBACK_LIVE_DOORS,
  platforms: FALLBACK_PLATFORMS,
  calling_name: FALLBACK_CALLING_NAME,
  cap7_aznet: FALLBACK_CAP7_AZNET,
  source: "fallback",
  pulled: false,
  note: "Fallback BAN-SURVIVAL cite when the live /survival pull is unavailable. Never invent a live door. Never claim a banned host is LIVE.",
});

let survivalMemory = { at: 0, doc: null };

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return Object.values(value);
  return [];
}

function compactDoor(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = String(raw.id || "").trim();
  const origin = String(raw.origin || "").trim();
  const status = String(raw.status || "").trim().toLowerCase();
  if (!id || !origin || !/^https:\/\//i.test(origin)) return null;
  if (status && status !== "live") return null;
  return {
    id,
    origin,
    via: raw.via ? String(raw.via) : "",
    status: "live",
    independent: raw.independent === true,
  };
}

export function compactLiveDoors(raw) {
  const out = [];
  const seen = new Set();
  for (const row of asList(raw)) {
    const door = compactDoor(row);
    if (!door || seen.has(door.id) || seen.has(door.origin)) continue;
    seen.add(door.id);
    seen.add(door.origin);
    out.push(door);
  }
  return out.length ? out : FALLBACK_LIVE_DOORS.slice();
}

export function compactCallingName(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const name = String(src.calling_name || FALLBACK_CALLING_NAME.calling_name).trim() || FALLBACK_CALLING_NAME.calling_name;
  return {
    spec: String(src.spec || BAN_CALLING_NAME),
    rotated: src.rotated === true,
    calling_name: name,
    calling_slug: String(src.calling_slug || FALLBACK_CALLING_NAME.calling_slug),
    identity: AUTHOR,
    identity_unchanged: src.identity_unchanged !== false,
    chainlock_rewrite: src.chainlock_rewrite === true,
    akm_rewrite: src.akm_rewrite === true,
    alert: src.alert == null ? null : String(src.alert),
    note: src.note ? String(src.note) : FALLBACK_CALLING_NAME.note,
  };
}

export function compactPlatforms(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const ids = asList(src.platforms)
    .map((p) => String((p && p.id) || "").trim())
    .filter(Boolean);
  return {
    spec: String(src.spec || BAN_PLATFORMS),
    all_live: src.all_live !== false,
    native_app_store: src.native_app_store === true,
    calling_name: String(src.calling_name || FALLBACK_CALLING_NAME.calling_name),
    survival: String(src.survival || "/survival"),
    ids: ids.length ? ids : FALLBACK_PLATFORM_IDS.slice(),
    note: src.note ? String(src.note) : FALLBACK_PLATFORMS.note,
  };
}

export function compactCap7(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const cite = src.cite && typeof src.cite === "object" ? src.cite : {};
  const hosted = src.hosted_endpoints && typeof src.hosted_endpoints === "object" ? src.hosted_endpoints : {};
  const shuffle = src.shuffle && typeof src.shuffle === "object" ? src.shuffle : {};
  const verify = src.aznet_verify && typeof src.aznet_verify === "object" ? src.aznet_verify : {};
  return {
    layer: src.layer == null ? 3 : src.layer,
    factory: String(src.factory || "miragegrid"),
    factory_only: src.factory_only !== false,
    radio_phy: src.radio_phy === true,
    resolves_to_hub: false,
    name_may_change: src.name_may_change !== false,
    public_icann: src.public_icann === true,
    live_registrar: src.live_registrar === true,
    fifth_product: src.fifth_product === true,
    cite: {
      status: String(cite.status || "live"),
      mesh_az_generator: String(cite.mesh_az_generator || CATALOG + "/v1/mesh/az-generator"),
      miragegrid_bridge: MIRAGEGRID_BRIDGE,
      fraggate: String(cite.fraggate || "fraggate_call { slug: \"miragegrid\", op: \"bridge\" }"),
    },
    aznet_verify: {
      status: String(verify.status || "live"),
      ops: asList(verify.ops).length ? asList(verify.ops).map(String) : FALLBACK_CAP7_AZNET.aznet_verify.ops.slice(),
      door: "fraggate_call",
      note: verify.note ? String(verify.note) : FALLBACK_CAP7_AZNET.aznet_verify.note,
    },
    hosted_endpoints: {
      status: String(hosted.status || "slot"),
      is_live_door: hosted.is_live_door === true,
      note: hosted.note ? String(hosted.note) : FALLBACK_CAP7_AZNET.hosted_endpoints.note,
    },
    shuffle: {
      spec: String(shuffle.spec || CAP7_SHUFFLE),
      layout: String(shuffle.layout || "live"),
      path: String(shuffle.path || "ping → land → that-round update"),
      hardcoded_single_host: shuffle.hardcoded_single_host === true,
      resolves_to_hub: false,
      site_count: Number(shuffle.site_count) || 7,
    },
    worker: { ...MIRAGEGRID_CAP7_CITE },
  };
}

export function looksLikeSurvivalDoc(body) {
  if (!body || typeof body !== "object") return false;
  const spec = String(body.spec || "");
  if (!/BAN-SURVIVAL/i.test(spec)) return false;
  if (String(body.author || body.identity || "") !== AUTHOR) return false;
  if (body.person_id && String(body.person_id) !== AZIEL_PERSON_ID) return false;
  if (body.lie_to_survive === true) return false;
  if (body.second_door === true) return false;
  if (!body.live_doors && !body.platforms && !body.calling_name && !body.cap7_aznet) return false;
  return true;
}

export function compactSurvivalSot(raw, meta = {}) {
  const src = looksLikeSurvivalDoc(raw) ? raw : SURVIVAL_FALLBACK;
  const calling = compactCallingName(src.calling_name);
  const platforms = compactPlatforms(src.platforms);
  const cap7 = compactCap7(src.cap7_aznet);
  return {
    spec: String(src.spec || BAN_SURVIVAL),
    mode: String(src.mode || "LIVE"),
    author: AUTHOR,
    identity: AUTHOR,
    person_id: AZIEL_PERSON_ID,
    umbrella: String(src.umbrella || "CROSS-NETWORK-SURVIVAL-1.0"),
    no_lie_spec: String(src.no_lie_spec || "NO-LIE-NO-REWRITE-1.0"),
    mutual_backup: src.mutual_backup !== false,
    shelves_are_not_a_live_door: src.shelves_are_not_a_live_door !== false,
    shelves_backup_for: String(src.shelves_backup_for || "death-by-ban"),
    live_doors_backup_for: String(src.live_doors_backup_for || "cold-shelf-death"),
    lie_to_survive: false,
    rewrite_key: false,
    second_door: false,
    fraggate_is_the_door: src.fraggate_is_the_door !== false,
    visible_1520: false,
    growth_on: src.growth_on !== false,
    live_doors: compactLiveDoors(src.live_doors),
    platforms,
    calling_name: calling,
    cap7_aznet: cap7,
    source: meta.source || src.source || "fallback",
    pulled: meta.pulled === true,
    pulled_at: meta.pulled_at || null,
    sot_url: meta.sot_url || SURVIVAL_ORIGIN,
    note: src.note ? String(src.note) : SURVIVAL_FALLBACK.note,
  };
}

async function readJsonResponse(res) {
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
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

async function firstSurvival(fetcher, urls, timeoutMs) {
  for (const url of urls) {
    try {
      const res = await fetchJson(fetcher, url, timeoutMs);
      const body = await readJsonResponse(res);
      if (looksLikeSurvivalDoc(body)) return { url, body };
    } catch { /* try next dest */ }
  }
  return null;
}

/**
 * Pull BAN-SURVIVAL SoT. Prefer the live origin (binding can be a stale isolate).
 * Short TTL. Never invent a live door on miss — fall back to the last honest cite.
 */
export async function fetchSurvivalSot(env, deps = {}) {
  const now = Date.now();
  const ttl = deps.ttlMs != null ? deps.ttlMs : SURVIVAL_TTL_MS;
  if (!deps.force && survivalMemory.doc && now - survivalMemory.at < ttl) {
    return survivalMemory.doc;
  }

  const timeoutMs = deps.timeoutMs != null ? deps.timeoutMs : 2500;
  const hasBinding = !!(env && env.AZIEL_RUNTIME && typeof env.AZIEL_RUNTIME.fetch === "function");
  const probeOrigin = deps.probeOrigin != null ? !!deps.probeOrigin : !!deps.fetch;
  const httpFetch = deps.fetch || (probeOrigin ? globalThis.fetch : null);

  const bindingFetch = hasBinding
    ? async (url, init) => env.AZIEL_RUNTIME.fetch(new Request(url, init))
    : null;
  const originFetch = probeOrigin && typeof httpFetch === "function"
    ? async (url, init) => httpFetch(url, init)
    : null;

  const jobs = [];
  if (originFetch) {
    jobs.push(
      firstSurvival(originFetch, HTTPS_SURVIVAL_URLS, timeoutMs)
        .then((hit) => ({ source: "origin", hit }))
        .catch(() => ({ source: "origin", hit: null })),
    );
  }
  if (bindingFetch) {
    jobs.push(
      firstSurvival(bindingFetch, BINDING_SURVIVAL_URLS, timeoutMs)
        .then((hit) => ({ source: "service-binding", hit }))
        .catch(() => ({ source: "service-binding", hit: null })),
    );
  }

  const found = jobs.length ? await Promise.all(jobs) : [];
  const origin = found.find((row) => row.source === "origin" && row.hit);
  const binding = found.find((row) => row.source === "service-binding" && row.hit);
  const chosen = origin || binding;
  const doc = chosen && chosen.hit && chosen.hit.body
    ? compactSurvivalSot(chosen.hit.body, {
      source: chosen.source,
      pulled: true,
      pulled_at: new Date().toISOString(),
      sot_url: chosen.hit.url,
    })
    : compactSurvivalSot(SURVIVAL_FALLBACK, { source: "fallback", pulled: false });

  survivalMemory = { at: now, doc };
  return doc;
}

export function resetSurvivalCache() {
  survivalMemory = { at: 0, doc: null };
}

export function survivalCiteFields(sot) {
  const doc = sot && sot.spec ? sot : compactSurvivalSot(SURVIVAL_FALLBACK);
  const calling = doc.calling_name || FALLBACK_CALLING_NAME;
  const platforms = doc.platforms || FALLBACK_PLATFORMS;
  const cap7 = doc.cap7_aznet || FALLBACK_CAP7_AZNET;
  return {
    ban_survival: BAN_SURVIVAL,
    ban_survival_mode: doc.mode,
    ban_survival_sot: SURVIVAL_ORIGIN,
    ban_survival_local: SURVIVAL_LOCAL,
    ban_survival_local_json: SURVIVAL_LOCAL_JSON,
    ban_survival_runtime: SURVIVAL_RUNTIME,
    ban_survival_ttl_ms: SURVIVAL_TTL_MS,
    ban_survival_pulled: !!doc.pulled,
    ban_survival_source: doc.source || "fallback",
    mutual_backup: doc.mutual_backup !== false,
    shelves_are_not_a_live_door: doc.shelves_are_not_a_live_door !== false,
    shelves_backup_for: doc.shelves_backup_for || "death-by-ban",
    live_doors_backup_for: doc.live_doors_backup_for || "cold-shelf-death",
    live_doors: (doc.live_doors || FALLBACK_LIVE_DOORS).map((d) => ({ ...d })),
    live_door_ids: (doc.live_doors || FALLBACK_LIVE_DOORS).map((d) => d.id),
    live_door_origins: (doc.live_doors || FALLBACK_LIVE_DOORS).map((d) => d.origin),
    platforms_spec: platforms.spec || BAN_PLATFORMS,
    platforms_all_live: platforms.all_live !== false,
    platforms_native_app_store: platforms.native_app_store === true,
    platforms_ids: (platforms.ids || FALLBACK_PLATFORM_IDS).slice(),
    calling_name_spec: calling.spec || BAN_CALLING_NAME,
    calling_name: calling.calling_name,
    calling_slug: calling.calling_slug,
    calling_name_rotated: calling.rotated === true,
    calling_name_identity: AUTHOR,
    calling_name_alert: calling.alert,
    cap7_factory: cap7.factory || "miragegrid",
    cap7_factory_worker: MIRAGEGRID_WORKER,
    cap7_factory_bridge: MIRAGEGRID_BRIDGE,
    cap7_resolves_to_hub: false,
    cap7_public_icann: false,
    cap7_cite_status: cap7.cite && cap7.cite.status ? cap7.cite.status : "live",
    cap7_hosted_endpoints: cap7.hosted_endpoints && cap7.hosted_endpoints.status ? cap7.hosted_endpoints.status : "slot",
    cap7_hosted_is_live_door: !!(cap7.hosted_endpoints && cap7.hosted_endpoints.is_live_door),
    cap7_shuffle_spec: cap7.shuffle && cap7.shuffle.spec ? cap7.shuffle.spec : CAP7_SHUFFLE,
    cap7_public_pair: MIRAGEGRID_CAP7_CITE.public_pair.slice(),
    cap7_aznet_side: MIRAGEGRID_CAP7_CITE.aznet_side.slice(),
    cap7_godlock_design_of: MIRAGEGRID_CAP7_CITE.godlock_design_of.slice(),
    cap7_aznet: {
      ...cap7,
      worker: { ...MIRAGEGRID_CAP7_CITE },
    },
    lie_to_survive: false,
    visible_1520: false,
    product_not_identity: true,
  };
}

export function survivalHubDoc(sot) {
  const doc = sot && sot.spec ? sot : compactSurvivalSot(SURVIVAL_FALLBACK);
  const fields = survivalCiteFields(doc);
  return {
    ok: true,
    kind: "hub_cite",
    spec: BAN_SURVIVAL,
    product: "GodLock",
    host_kind: "product_surface",
    challenge_only: true,
    second_door: false,
    fraggate_is_the_door: true,
    author: AUTHOR,
    identity: AUTHOR,
    person_id: AZIEL_PERSON_ID,
    sot: SURVIVAL_ORIGIN,
    local: SURVIVAL_LOCAL,
    local_json: SURVIVAL_LOCAL_JSON,
    runtime: SURVIVAL_RUNTIME,
    ttl_ms: SURVIVAL_TTL_MS,
    pulled: !!doc.pulled,
    source: doc.source || "fallback",
    pulled_at: doc.pulled_at || null,
    mode: doc.mode,
    mutual_backup: fields.mutual_backup,
    live_doors: fields.live_doors,
    platforms: doc.platforms,
    platforms_all_live: fields.platforms_all_live,
    calling_name: doc.calling_name,
    cap7_aznet: fields.cap7_aznet,
    cap7_factory_worker: MIRAGEGRID_WORKER,
    resolves_to_hub: false,
    lie_to_survive: false,
    visible_1520: false,
    lamb_lens: true,
    no_lie: true,
    growth_on: true,
    product_not_identity: true,
    note: "GodLock.uk pulls BAN-SURVIVAL SoT (short TTL) and cites it. Cap-7 Worker "
      + MIRAGEGRID_WORKER + " is LIVE; resolves_to_hub is false. Hosted Cap-7 /mcp stays SLOT. GodLock is a challenge/score product. Identity is Aziel Eliab. Person @id "
      + AZIEL_PERSON_ID + ". Lamb Lens. NO-LIE. No visible 15:20.",
  };
}

export function survivalLlmsSection(sot) {
  const fields = survivalCiteFields(sot);
  return "\n## BAN-SURVIVAL (hub pull)\n\n"
    + "Spec: " + BAN_SURVIVAL + " (LIVE). SoT: " + SURVIVAL_ORIGIN + " (short TTL " + SURVIVAL_TTL_MS + " ms).\n"
    + "Local cite: " + SURVIVAL_LOCAL + " · " + SURVIVAL_LOCAL_JSON + " · runtime " + SURVIVAL_RUNTIME + "\n"
    + "Mutual backup: cold shelves back up death-by-ban; live multi-front backs up cold-shelf death. Keep both. Shelves are not /mcp.\n"
    + "Live doors: " + fields.live_door_ids.join(", ") + " — " + fields.live_door_origins.join(" · ") + "\n"
    + "Platforms: " + BAN_PLATFORMS + " all_live:" + String(fields.platforms_all_live) + " native_app_store:" + String(fields.platforms_native_app_store) + " (" + fields.platforms_ids.join(", ") + "). Not five native store binaries.\n"
    + "Calling name: " + fields.calling_name + " (slug " + fields.calling_slug + "). Rotated:" + String(fields.calling_name_rotated) + ". Identity Aziel Eliab only. ChainLock/AKM do not rewrite identity.\n"
    + "Cap-7: factory MirageGrid Worker " + MIRAGEGRID_WORKER + " LIVE. resolves_to_hub: false. Public pair " + fields.cap7_public_pair.join(" + ") + " LIVE Worker HTTPS. AZNet-side SLOT. GodLock design_of sites: " + fields.cap7_godlock_design_of.join(", ") + ".\n"
    + "Cap-7 cite+AZNet verify LIVE. Hosted Cap-7 /mcp " + fields.cap7_hosted_endpoints + ". Shuffle: ping MirageGrid until one site lands — do not hardcode a host.\n"
    + "Never invent a live door. Never claim a banned host is LIVE. GodLock is a challenge/score product. Identity is Aziel Eliab. Person @id " + AZIEL_PERSON_ID + ". Lamb Lens. NO-LIE. No visible 15:20.\n";
}
