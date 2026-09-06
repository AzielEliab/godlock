/**
 * Aziel Eliab software catalog for godlock.uk/software.
 * Live fetch via AZIEL_RUNTIME service binding, then HTTPS origin / library,
 * then this snapshot so the page never drops to two GitHub links.
 * Snapshot is a fallback floor, not a 27-only cap — live catalog slugs
 * (peacelock, azmail, …) are included automatically. Do not invent slugs.
 * Sort: Plain → Gate → Lock. Clock ≠ Lock. Author: Aziel Eliab.
 */
import { hideInternalDetermination } from "./publicCopy.js";
import {
  AUTHOR, CATALOG, LIBRARY, RUNTIME_PATH, RUNTIME_VERSION, GITHUB_RUNTIME,
  FRAGGATE_KERNEL, FRAGGATE_DOWNLOAD, FRAGGATE_WORKER, FRAGGATE_COUNT,
  AZBROWSER_DOWNLOAD, AZBROWSER_WORKER, AZBROWSER_COUNT, DOWNLOAD, GITHUB,
} from "./seo.js";

export const CATALOG_JSON_PATH = "/v1/catalog.json";
export const CATALOG_USES_PATH = "/v1/uses";
export const CATALOG_ORIGIN_URL = CATALOG + CATALOG_JSON_PATH;
export const CATALOG_LIBRARY_URL = LIBRARY + "/runtime" + CATALOG_JSON_PATH;
export const CATALOG_PUBLIC_URL = RUNTIME_PATH + CATALOG_JSON_PATH;
/** In-process service-binding dest (Worker name), then the same origin URL runtimeRoot uses. */
export const BINDING_CATALOG_URLS = [
  "https://aziel-runtime" + CATALOG_JSON_PATH,
  CATALOG_ORIGIN_URL,
];
export const BINDING_USES_URLS = [
  "https://aziel-runtime" + CATALOG_USES_PATH,
  CATALOG + CATALOG_USES_PATH,
];

const UA = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

/** Known extras already hosted on this page. Keep if present; do not invent. */
export const EXTRA_SUITE_SLUGS = ["aziel-runtime", "embryolock"];
const EXTRA_SUITE_SET = new Set(EXTRA_SUITE_SLUGS);
const EXTRA_RANK = { "aziel-runtime": 0, embryolock: 1 };
const FAMILY_RANK = { extra: -1, plain: 0, gate: 1, lock: 2 };

/** AZNet stays off /software until its own Worker is live. Do not invent a combined card. */
export const OMIT_UNTIL_WORKER_SLUGS = ["aznet", "az-net"];
const OMIT_UNTIL_WORKER_SET = new Set(OMIT_UNTIL_WORKER_SLUGS);

export function omitUntilWorker(slug) {
  const s = String(slug || "").toLowerCase().replace(/[\s_]+/g, "-");
  return OMIT_UNTIL_WORKER_SET.has(s);
}

/** Hub copy: AZBrowser is its own card. Strip combined AZNet branding. */
export function hubProductCopy(raw) {
  const slug = String((raw && raw.slug) || "").toLowerCase();
  let name = String((raw && raw.name) || slug);
  let one_line = hideInternalDetermination(String((raw && (raw.one_line || raw.banner)) || ""));
  const combined = slug === "azbrowser" || /azbrowser\s*\/\s*aznet/i.test(name) || /azbrowser\s*\/\s*aznet/i.test(one_line);
  if (combined) {
    name = "AZBrowser";
    one_line = one_line
      .replace(/AZBrowser\s*\/\s*AZNet\s*/gi, "AZBrowser ")
      .replace(/\bAZNet\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+\./g, ".")
      .trim();
  }
  return { name, one_line };
}

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
  { slug: "peacelock", name: "PeaceLock", version: "0.1.0", one_line: "Chosen silence / chosen inaction as a first-class receipt (PL-WP-0.1).", github: "https://github.com/AzielEliab/peacelock", download: "https://peacelock-download-tracker.vibelock.workers.dev/download" },
  { slug: "azmail", name: "AZMail", version: "0.1.0", one_line: "AZMail (APP 1.0): anonymous MCP mesh + advisory airlock. Not a full internet MTA. Mesh default off. FragGate only.", github: "https://github.com/AzielEliab/azmail", download: "https://azmail-download-tracker.vibelock.workers.dev/download" },
  { slug: "azbrowser", name: "AZBrowser", version: "0.1.0", one_line: "AZBrowser Phase 1: secure research browser + Lamb Lens ethical search. Cite; refuse harvest; no invented visits. FragGate only. Not Chromium. Author Aziel Eliab.", github: "https://github.com/AzielEliab/azbrowser", download: AZBROWSER_DOWNLOAD, worker: AZBROWSER_WORKER, worker_home: AZBROWSER_WORKER, count: AZBROWSER_COUNT },
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

/** Own hub card. Download/Worker point at the FragGate tracker, not GitHub-only. */
export const FRAGGATE_CARD = {
  slug: "fraggate",
  name: "FragGate",
  version: "0.1.0",
  one_line: "FragGate is Aziel Eliab software: FG-0.1 kernel against tool fragmentation and model hallucination. Dual surface — Worker UI and MCP/OpenAPI share List / Describe / Call / Verify. Author Aziel Eliab.",
  github: FRAGGATE_KERNEL,
  download: FRAGGATE_DOWNLOAD,
  worker: FRAGGATE_WORKER,
  worker_home: FRAGGATE_WORKER,
  count: FRAGGATE_COUNT,
  invoke: RUNTIME_PATH,
  kernel: FRAGGATE_KERNEL,
  suite: true,
};

function firstNum(...vals) {
  for (const raw of vals) {
    if (raw == null || raw === "") continue;
    const n = typeof raw === "number" ? raw : Number(String(raw).replace(/,/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function looksLikeUrl(value) {
  const s = String(value || "").trim();
  return /^https?:\/\//i.test(s) || s.startsWith("/");
}

export function workerHref(product) {
  if (!product) return "";
  if (product.worker_home) return String(product.worker_home);
  const worker = String(product.worker || "");
  if (worker.startsWith("http")) return worker;
  const download = String(product.download || "");
  if (download) return download.replace(/\/download\/?$/i, "/");
  return "";
}

export function countHref(product) {
  if (!product) return "";
  if (product.count && looksLikeUrl(product.count)) return String(product.count);
  const download = String(product.download || "");
  if (download) return download.replace(/\/download\/?$/i, "/count");
  return "";
}

/** Plain A–Z → Gate A–Z → Lock A–Z. Clock is not Lock. FragGate is Gate (with DecisionGATE). */
export function suiteFamily(product) {
  const slug = String((product && product.slug) || "").toLowerCase();
  if (slug === "fraggate") return "gate";
  if (EXTRA_SUITE_SET.has(slug)) return "extra";
  const name = String((product && product.name) || "").toLowerCase().replace(/[\s._'-]+/g, "");
  const token = slug || name;
  if (token.endsWith("clock")) return "plain";
  if (token.endsWith("gate")) return "gate";
  if (token.endsWith("lock")) return "lock";
  return "plain";
}

export function sortSoftwareSuite(products) {
  return (Array.isArray(products) ? products.slice() : []).sort((a, b) => {
    const fa = FAMILY_RANK[suiteFamily(a)] ?? 0;
    const fb = FAMILY_RANK[suiteFamily(b)] ?? 0;
    if (fa !== fb) return fa - fb;
    if (fa === FAMILY_RANK.extra) {
      const ia = EXTRA_RANK[String((a && a.slug) || "")] ?? 50;
      const ib = EXTRA_RANK[String((b && b.slug) || "")] ?? 50;
      if (ia !== ib) return ia - ib;
    }
    return String((a && (a.name || a.slug)) || "").localeCompare(String((b && (b.name || b.slug)) || ""), "en");
  });
}

export function compactProduct(raw) {
  if (!raw || typeof raw !== "object") return null;
  const slug = String(raw.slug || "").trim();
  if (!slug || omitUntilWorker(slug)) return null;
  const copy = hubProductCopy({ ...raw, slug });
  const countUrl = looksLikeUrl(raw.count) ? String(raw.count) : "";
  return {
    slug,
    name: copy.name || slug,
    version: raw.version != null && raw.version !== "" ? String(raw.version) : "",
    one_line: copy.one_line,
    github: raw.github ? String(raw.github) : "",
    download: raw.download ? String(raw.download) : "",
    worker: raw.worker ? String(raw.worker) : "",
    worker_home: raw.worker_home ? String(raw.worker_home) : "",
    count: countUrl,
    downloads: firstNum(raw.downloads, raw.download_count, !looksLikeUrl(raw.count) ? raw.count : null),
    views: firstNum(raw.views, raw.view_count),
    uses: firstNum(raw.uses, raw.uses_total),
  };
}

function mergeFields(live, fallback) {
  const a = compactProduct(live) || {};
  const b = fallback || {};
  const name = a.name && a.name !== a.slug ? a.name : (b.name || a.name || a.slug);
  const merged = compactProduct({
    slug: a.slug || b.slug,
    name,
    version: a.version || b.version || "",
    one_line: a.one_line || b.one_line || "",
    github: a.github || b.github || "",
    download: a.download || b.download || "",
    worker: a.worker || b.worker || "",
    worker_home: a.worker_home || b.worker_home || "",
    count: a.count || b.count || "",
    downloads: a.downloads != null ? a.downloads : b.downloads,
    views: a.views != null ? a.views : b.views,
    uses: a.uses != null ? a.uses : b.uses,
  });
  if (!merged) return null;
  if (!merged.worker_home) merged.worker_home = workerHref(merged);
  if (!merged.count) merged.count = countHref(merged);
  return merged;
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
    worker: workerHref(p),
    invoke: invokeHref(product && product.invoke ? product : p),
    mcp: RUNTIME_PATH + "/mcp",
    fraggate: p.slug === "aziel-runtime" || p.slug === "fraggate" ? RUNTIME_PATH + "/v1/fraggate/list" : invokeHref(p),
    downloads: p.downloads != null ? p.downloads : null,
    views: p.views != null ? p.views : null,
    uses: p.uses != null ? p.uses : null,
    family: suiteFamily(p),
    author: AUTHOR,
  };
}

function mergeLiveOverFallback(live) {
  const fallbackBySlug = new Map(CATALOG_FALLBACK_PRODUCTS.map((p) => [p.slug, compactProduct(p)]));
  const out = [];
  const seen = new Set();
  for (const raw of live) {
    const slug = String((raw && raw.slug) || "").trim();
    if (!slug || slug === "aziel-runtime" || omitUntilWorker(slug) || seen.has(slug)) continue;
    const next = mergeFields(raw, fallbackBySlug.get(slug));
    if (!next) continue;
    seen.add(next.slug);
    out.push(next);
  }
  for (const base of CATALOG_FALLBACK_PRODUCTS) {
    if (seen.has(base.slug)) continue;
    const next = mergeFields(base, fallbackBySlug.get(base.slug));
    if (!next) continue;
    seen.add(next.slug);
    out.push(next);
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
  if (body.engines && typeof body.engines === "object") {
    buckets.push(Object.entries(body.engines).map(([slug, raw]) => (
      raw && typeof raw === "object" ? { slug, ...raw } : { slug }
    )));
  }
  const out = [];
  const seen = new Set();
  for (const list of buckets) {
    for (const raw of list) {
      const p = compactProduct(typeof raw === "string" ? { slug: raw } : raw);
      if (!p || seen.has(p.slug) || p.slug === "aziel-runtime" || omitUntilWorker(p.slug)) continue;
      seen.add(p.slug);
      out.push(p);
    }
  }
  return out;
}

export function parseCounterDoc(body) {
  if (body == null) return { downloads: null, views: null, uses: null };
  if (typeof body === "number") return { downloads: firstNum(body), views: null, uses: null };
  if (typeof body !== "object") return { downloads: null, views: null, uses: null };
  return {
    downloads: firstNum(body.downloads, body.total, body.download_count, !looksLikeUrl(body.count) ? body.count : null),
    views: firstNum(body.views, body.view_count),
    uses: firstNum(body.uses, body.uses_total),
  };
}

async function readJsonResponse(res) {
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
}

async function productsFromResponse(res) {
  const body = await readJsonResponse(res);
  if (!body) return { products: [], version: "" };
  return {
    products: productsFromCatalogDoc(body),
    version: body.version != null && body.version !== "" ? String(body.version) : "",
  };
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
        const parsed = await productsFromResponse(res);
        if (parsed.products.length) {
          return { products: mergeLiveOverFallback(parsed.products), source: "service-binding", version: parsed.version };
        }
      } catch { /* try next binding dest */ }
    }
    return { products: CATALOG_FALLBACK_PRODUCTS.map((p) => compactProduct(p)), source: "fallback", version: "" };
  }

  for (const [source, url] of [["origin", CATALOG_ORIGIN_URL], ["library", CATALOG_LIBRARY_URL]]) {
    try {
      const res = await fetchJson(httpFetch, url, timeoutMs);
      const parsed = await productsFromResponse(res);
      if (parsed.products.length) {
        return { products: mergeLiveOverFallback(parsed.products), source, version: parsed.version };
      }
    } catch { /* try next */ }
  }

  return { products: CATALOG_FALLBACK_PRODUCTS.map((p) => compactProduct(p)), source: "fallback", version: "" };
}

export async function attachCatalogCounters(products, env, deps = {}) {
  const incoming = Array.isArray(products) ? products.map((p) => ({ ...p })) : [];
  const seen = new Set(incoming.map((p) => p && p.slug).filter(Boolean));
  if (!seen.has(FRAGGATE_CARD.slug)) incoming.push({ ...FRAGGATE_CARD });
  const list = incoming.filter((p) => p && p.slug && !omitUntilWorker(p.slug));
  const httpFetch = deps.counterFetch || deps.fetch || globalThis.fetch;
  const timeoutMs = deps.timeoutMs != null ? deps.timeoutMs : 5000;
  let runtimeUses = firstNum(deps.runtimeUses);
  let fetched = 0;

  const hasBinding = !!(env && env.AZIEL_RUNTIME && typeof env.AZIEL_RUNTIME.fetch === "function");
  if (runtimeUses == null) {
    if (hasBinding) {
      for (const url of BINDING_USES_URLS) {
        try {
          const res = await env.AZIEL_RUNTIME.fetch(new Request(url, { method: "GET", headers: UA }));
          const body = await readJsonResponse(res);
          const n = parseCounterDoc(body).uses;
          if (n != null) {
            runtimeUses = n;
            break;
          }
        } catch { /* try next */ }
      }
    }
    if (runtimeUses == null && typeof httpFetch === "function") {
      try {
        const res = await fetchJson(httpFetch, CATALOG + CATALOG_USES_PATH, timeoutMs);
        const body = await readJsonResponse(res);
        runtimeUses = parseCounterDoc(body).uses;
      } catch { /* optional */ }
    }
  }

  await Promise.all(list.map(async (p) => {
    if (p.downloads != null && p.uses != null) {
      fetched += 1;
      return;
    }
    const url = countHref(p);
    if (!url || typeof httpFetch !== "function") return;
    try {
      const res = await fetchJson(httpFetch, url, timeoutMs);
      const parsed = parseCounterDoc(await readJsonResponse(res));
      if (p.downloads == null && parsed.downloads != null) p.downloads = parsed.downloads;
      if (p.views == null && parsed.views != null) p.views = parsed.views;
      if (p.uses == null && parsed.uses != null) p.uses = parsed.uses;
      if (parsed.downloads != null || parsed.views != null || parsed.uses != null) fetched += 1;
    } catch { /* optional */ }
  }));

  if (runtimeUses != null) {
    const runtime = list.find((p) => p.slug === "aziel-runtime");
    if (runtime && runtime.uses == null) runtime.uses = runtimeUses;
  }

  return { products: list, runtimeUses, countersFetched: fetched };
}

export function softwareSuite(products, extras = {}) {
  const incoming = Array.isArray(products) ? products.map(compactProduct).filter(Boolean) : [];
  const seen = new Set();
  const out = [];
  const push = (raw) => {
    const p = compactProduct(raw);
    if (!p || omitUntilWorker(p.slug) || seen.has(p.slug)) return;
    seen.add(p.slug);
    const card = {
      ...p,
      invoke: raw && raw.invoke ? raw.invoke : invokeHref(p),
      kernel: raw && raw.kernel,
      suite: !!(raw && raw.suite),
      worker_home: p.worker_home || workerHref(p),
      family: suiteFamily(p),
    };
    if (card.slug === "aziel-runtime") {
      if (extras.version) card.version = String(extras.version);
      if (extras.runtimeUses != null && card.uses == null) card.uses = extras.runtimeUses;
    }
    if (card.slug === "fraggate") {
      if (!card.download) card.download = FRAGGATE_CARD.download;
      if (!card.worker) card.worker = FRAGGATE_CARD.worker;
      if (!card.worker_home) card.worker_home = FRAGGATE_CARD.worker_home;
      if (!card.count) card.count = FRAGGATE_CARD.count;
      if (!card.github) card.github = FRAGGATE_CARD.github;
      if (!card.kernel) card.kernel = FRAGGATE_CARD.kernel;
      if (!card.invoke) card.invoke = FRAGGATE_CARD.invoke;
    }
    out.push(card);
  };
  push({ ...RUNTIME_CARD, uses: extras.runtimeUses != null ? extras.runtimeUses : RUNTIME_CARD.uses });
  for (const p of incoming) push(p);
  if (!seen.has(FRAGGATE_CARD.slug)) push(FRAGGATE_CARD);
  return sortSoftwareSuite(out);
}

export function catalogSlugList(products) {
  if (Array.isArray(products) && products.length) {
    return products.map((p) => p && p.slug).filter((slug) => slug && slug !== "aziel-runtime");
  }
  return CATALOG_SLUGS.slice();
}
