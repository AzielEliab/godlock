/**
 * Aziel Eliab software catalog for godlock.uk/software.
 * Live fetch via AZIEL_RUNTIME service binding, then HTTPS origin / library,
 * then this snapshot so the page never drops to two GitHub links.
 * Snapshot matches aziel-runtime 1.6.2 catalog.json products (27 engines).
 * Do not invent slugs. Author: Aziel Eliab.
 */
import { hideInternalDetermination } from "./publicCopy.js";
import {
  AUTHOR, CATALOG, LIBRARY, RUNTIME_PATH, RUNTIME_VERSION, GITHUB_RUNTIME,
  FRAGGATE_KERNEL, DOWNLOAD, GITHUB,
} from "./seo.js";

export const CATALOG_JSON_PATH = "/v1/catalog.json";
export const CATALOG_ORIGIN_URL = CATALOG + CATALOG_JSON_PATH;
export const CATALOG_LIBRARY_URL = LIBRARY + "/runtime" + CATALOG_JSON_PATH;
export const CATALOG_PUBLIC_URL = RUNTIME_PATH + CATALOG_JSON_PATH;
/** In-process service-binding dest (Worker name), then the same origin URL runtimeRoot uses. */
export const BINDING_CATALOG_URLS = [
  "https://aziel-runtime" + CATALOG_JSON_PATH,
  CATALOG_ORIGIN_URL,
];

const UA = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

export const CATALOG_FALLBACK_PRODUCTS = [
  { slug: "vibelock", name: "VibeLock", version: "0.3.0", one_line: "Physical-consistency evaluation of speech audio. Risk assessment, not a liveness proof.", github: "https://github.com/AzielEliab/vibelock", download: "https://vibelock-download-tracker.vibelock.workers.dev/download" },
  { slug: "veillock", name: "VeilLock", version: "0.2.0", one_line: "Local camera/screen steps for YOUR device only. Not a call interceptor.", github: "https://github.com/AzielEliab/veillock", download: "https://veillock-download-tracker.vibelock.workers.dev/download" },
  { slug: "codelock", name: "CodeLock", version: "0.1.0", one_line: "Canonical or Rosetta HTML view of source. Alters perception, not meaning.", github: "https://github.com/AzielEliab/codelock", download: "https://codelock-download-tracker.vibelock.workers.dev/download" },
  { slug: "godlock", name: "GodLock", version: "0.1.0", one_line: "Offline ABAD / hardening score. Not a VPN and not an anonymity network.", github: GITHUB, download: DOWNLOAD },
  { slug: "shadowlock", name: "ShadowLock", version: "0.2.0", one_line: "Zero-retention observation of a job list you already have. No OS hook.", github: "https://github.com/AzielEliab/shadowlock", download: "https://shadowlock-download-tracker.vibelock.workers.dev/download" },
  { slug: "temporallock", name: "TemporalLock", version: "0.2.0", one_line: "Hash-chained receipts anyone can verify. Explicit genesis, append, verify.", github: "https://github.com/AzielEliab/temporallock", download: "https://temporallock-download-tracker.vibelock.workers.dev/download" },
  { slug: "forgereceipts", name: "ForgeReceipts", version: "0.3.0", one_line: "ForgeReceipts 0.3.0: Local receipt / checklist helper with jurisdiction-aware state picker (all 50 states + federal baseline) customizing UI/legal framing. Not legal advice. Does not contact courts. Author Aziel Eliab.", github: "https://github.com/AzielEliab/forgereceipts", download: "https://forgereceipts-download-tracker.vibelock.workers.dev/download" },
  { slug: "decisiongate", name: "DecisionGATE", version: "0.1.0", one_line: "Five sequential gates on a proposal. Freedom without clarity is chaos.", github: "https://github.com/AzielEliab/decisiongate", download: "https://decisiongate-download-tracker.vibelock.workers.dev/download" },
  { slug: "zsolver", name: "ZionPattern Solver", version: "0.2.0", one_line: "Nine ontology nodes (Zioncheck seed). Hard 75% cap. Does not solve cases.", github: "https://github.com/AzielEliab/zion-pattern-solver", download: "https://zsolver-download-tracker.vibelock.workers.dev/download" },
  { slug: "azos", name: "AZ-OS", version: "0.3.0", one_line: "Read-only status / principles. Does not grant remote shell.", github: "https://github.com/AzielEliab/azos", download: "https://azos-download-tracker.vibelock.workers.dev/download" },
  { slug: "glossafilter", name: "Glossa Filter", version: "0.1.0", one_line: "Render an intent across bundled peer ids. Human opinion remains human.", github: "https://github.com/AzielEliab/glossafilter", download: "https://glossafilter-download-tracker.vibelock.workers.dev/download" },
  { slug: "miragegrid", name: "MirageGrid", version: "0.2.0", one_line: "Ephemeral session node assignment. Not a VPN and not an anonymity network.", github: "https://github.com/AzielEliab/miragegrid", download: "https://miragegrid-download-tracker.vibelock.workers.dev/download" },
  { slug: "staticclock", name: "StaticClock", version: "0.2.0", one_line: "Five advisory fields for a geo. Not a scheduler.", github: "https://github.com/AzielEliab/staticclock", download: "https://staticclock-download-tracker.vibelock.workers.dev/download" },
  { slug: "chronolock", name: "ChronoLock", version: "0.1.0", one_line: "Advisory temporal window 08:30–10:30 local. Distinct from TemporalLock.", github: "https://github.com/AzielEliab/chronolock", download: "https://chronolock-download-tracker.vibelock.workers.dev/download" },
  { slug: "postking", name: "Post-King Chess", version: "0.1.0", one_line: "Continuity chess. The goal is not to win. The goal is to remain.", github: "https://github.com/AzielEliab/postking-chess", download: "https://postking-download-tracker.vibelock.workers.dev/download" },
  { slug: "azclce", name: "AZ-CLCE", version: "0.3.0", one_line: "Jaccard triple / pairwise / CLCE+. Detects inconsistency, not intent.", github: "https://github.com/AzielEliab/az-clce", download: "https://azclce-download-tracker.vibelock.workers.dev/download" },
  { slug: "ark", name: "The ARK", version: "0.1.0", one_line: "Mode E heuristics sweep. Not a kernel. Hosted never unlocks or stores vaults.", github: "https://github.com/AzielEliab/ark", download: "https://ark-download-tracker.vibelock.workers.dev/download" },
  { slug: "azai", name: "AZAI", version: "0.3.1", one_line: "Local OpenAI-compatible runtime. Not a new foundation model. Jeeves is not sovereign.", github: "https://github.com/AzielEliab/azai", download: "https://azai-download-tracker.vibelock.workers.dev/download" },
  { slug: "spectrallock", name: "SpectralLock", version: "0.3.0", one_line: "Overlay preview modes. 256px hosted preview, not a spectrometer.", github: "https://github.com/AzielEliab/spectrallock", download: "https://spectrallock-download-tracker.vibelock.workers.dev/download" },
  { slug: "azbot", name: "AZBot", version: "0.2.0", one_line: "Skill, not a foundation model. Hosted /v1/skill returns markdown.", github: "https://github.com/AzielEliab/azbot", download: "https://azbot-download-tracker.vibelock.workers.dev/download" },
  { slug: "employeelock", name: "EmployeeLock", version: "0.1.0", one_line: "Hash-chained accountability workbook. Not a court, not UL, not a truth score.", github: "https://github.com/AzielEliab/employeelock", download: "https://employeelock-download-tracker.vibelock.workers.dev/download" },
  { slug: "foldlock", name: "FoldLock", version: "0.8.0", one_line: "Algorithmic tether-word suppression on UTF-8 text. Not zip.", github: "https://github.com/AzielEliab/foldlock", download: "https://foldlock-download-tracker.vibelock.workers.dev/download" },
  { slug: "whistlelock", name: "WhistleLock", version: "0.1.0", one_line: "Local drop ledger + dead-man copy. Not a mailer.", github: "https://github.com/AzielEliab/whistlelock", download: "https://whistlelock-download-tracker.vibelock.workers.dev/download" },
  { slug: "trajectorylock", name: "TrajectoryLock", version: "0.1.0", one_line: "Auditable geometric test. Research prototype, not a certified forensic instrument.", github: "https://github.com/AzielEliab/trajectorylock", download: "https://trajectorylock-download-tracker.vibelock.workers.dev/download" },
  { slug: "mialock", name: "M.I.A.Lock", version: "0.1.1", one_line: "M.I.A.Lock 0.1.1: event map + Doe matching + uncertainty ellipses + coverage heat. Doe leads ≠ ID. Heat ≠ presence. Author Aziel Eliab.", github: "https://github.com/AzielEliab/mialock", download: "https://mialock-download-tracker.vibelock.workers.dev/download" },
  { slug: "azieltether", name: "AzielTether", version: "0.1.0", one_line: "AzielTether 0.1.0: central × decentral survival mesh for downloaded Aziel software. Prefer-central; peer sync when down; public HTTPS stays mesh-free. Not a VPN. Author Aziel Eliab.", github: "https://github.com/AzielEliab/azieltether", download: "https://azieltether-download-tracker.vibelock.workers.dev/download" },
  { slug: "aziel-corpus", name: "Aziel Digital Library", version: "2.6.2", one_line: "Self-contained immutable digital library. Public MASTER. Not a 26-card index.", github: "https://github.com/AzielEliab/aziel-corpus", download: "https://www.azielcorpuslibrary.net/download" },
];

export const CATALOG_SLUGS = CATALOG_FALLBACK_PRODUCTS.map((p) => p.slug);
export const CATALOG_PRODUCT_COUNT = CATALOG_FALLBACK_PRODUCTS.length;

export const RUNTIME_CARD = {
  slug: "aziel-runtime",
  name: "Aziel Eliab Runtime",
  version: RUNTIME_VERSION,
  one_line: "One door — discover, route, refuse. Hosts the FragGate kernel (FG-0.1) and every catalog engine. Author Aziel Eliab.",
  github: GITHUB_RUNTIME,
  download: "",
  invoke: RUNTIME_PATH,
  kernel: FRAGGATE_KERNEL,
  suite: true,
};

export function compactProduct(raw) {
  if (!raw || typeof raw !== "object") return null;
  const slug = String(raw.slug || "").trim();
  if (!slug) return null;
  return {
    slug,
    name: String(raw.name || slug),
    version: raw.version != null && raw.version !== "" ? String(raw.version) : "",
    one_line: hideInternalDetermination(String(raw.one_line || raw.banner || "")),
    github: raw.github ? String(raw.github) : "",
    download: raw.download ? String(raw.download) : "",
  };
}

export function invokeHref(product) {
  const slug = String((product && product.slug) || "");
  if (product && product.invoke) return String(product.invoke);
  if (slug === "aziel-runtime" || slug === "fraggate") return RUNTIME_PATH;
  if (slug) return RUNTIME_PATH + "/v1/pull/" + encodeURIComponent(slug);
  return RUNTIME_PATH;
}

export function publicProduct(product) {
  const p = compactProduct(product) || product;
  if (!p || !p.slug) return null;
  return {
    slug: p.slug,
    name: p.name,
    version: p.version || "",
    one_line: hideInternalDetermination(p.one_line || ""),
    github: p.github || "",
    download: p.download || "",
    invoke: invokeHref(p),
    author: AUTHOR,
  };
}

function mergeLiveOverFallback(live) {
  const fallbackBySlug = new Map(CATALOG_FALLBACK_PRODUCTS.map((p) => [p.slug, p]));
  const liveBySlug = new Map();
  for (const raw of live) {
    const p = compactProduct(raw);
    if (p) liveBySlug.set(p.slug, p);
  }
  const out = [];
  const seen = new Set();
  for (const base of CATALOG_FALLBACK_PRODUCTS) {
    const next = liveBySlug.get(base.slug) || fallbackBySlug.get(base.slug);
    if (!next || seen.has(next.slug)) continue;
    seen.add(next.slug);
    out.push(next);
  }
  for (const p of liveBySlug.values()) {
    if (seen.has(p.slug)) continue;
    if (p.slug === "aziel-runtime") continue;
    seen.add(p.slug);
    out.push(p);
  }
  return out;
}

function asProductList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") return Object.values(value);
  return [];
}

export function productsFromCatalogDoc(body) {
  if (!body || typeof body !== "object") return [];
  const buckets = [
    asProductList(body.products),
    asProductList(body.catalog),
    asProductList(body.items),
    asProductList(body.software),
  ];
  if (Array.isArray(body.true_engine_slugs)) {
    buckets.push(body.true_engine_slugs.map((slug) => ({ slug })));
  }
  const out = [];
  const seen = new Set();
  for (const list of buckets) {
    for (const raw of list) {
      const p = compactProduct(typeof raw === "string" ? { slug: raw } : raw);
      if (!p || seen.has(p.slug) || p.slug === "aziel-runtime") continue;
      seen.add(p.slug);
      out.push(p);
    }
  }
  return out;
}

async function productsFromResponse(res) {
  if (!res || !res.ok) return [];
  const body = await res.json().catch(() => null);
  return productsFromCatalogDoc(body);
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

export async function fetchCatalogProducts(env, deps = {}) {
  const httpFetch = deps.fetch || globalThis.fetch;
  const timeoutMs = deps.timeoutMs != null ? deps.timeoutMs : 4000;
  const hasBinding = !!(env && env.AZIEL_RUNTIME && typeof env.AZIEL_RUNTIME.fetch === "function");

  if (hasBinding) {
    for (const url of BINDING_CATALOG_URLS) {
      try {
        const res = await env.AZIEL_RUNTIME.fetch(new Request(url, { method: "GET", headers: UA }));
        const live = await productsFromResponse(res);
        if (live.length) {
          return { products: mergeLiveOverFallback(live), source: "service-binding" };
        }
      } catch { /* try next binding dest */ }
    }
    return { products: CATALOG_FALLBACK_PRODUCTS.map((p) => ({ ...p })), source: "fallback" };
  }

  for (const [source, url] of [["origin", CATALOG_ORIGIN_URL], ["library", CATALOG_LIBRARY_URL]]) {
    try {
      const res = await fetchJson(httpFetch, url, timeoutMs);
      const live = await productsFromResponse(res);
      if (live.length) {
        return { products: mergeLiveOverFallback(live), source };
      }
    } catch { /* try next */ }
  }

  return { products: CATALOG_FALLBACK_PRODUCTS.map((p) => ({ ...p })), source: "fallback" };
}

export function softwareSuite(products) {
  const incoming = Array.isArray(products) ? products.map(compactProduct).filter(Boolean) : [];
  const seen = new Set();
  const out = [];
  const push = (raw) => {
    const p = compactProduct(raw);
    if (!p || seen.has(p.slug)) return;
    seen.add(p.slug);
    out.push({ ...p, invoke: raw && raw.invoke ? raw.invoke : invokeHref(p), kernel: raw && raw.kernel, suite: !!(raw && raw.suite) });
  };
  push(RUNTIME_CARD);
  for (const p of incoming) push(p);
  return out;
}

export function catalogSlugList() {
  return CATALOG_SLUGS.slice();
}
