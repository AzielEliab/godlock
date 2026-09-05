/** Crawl/index metadata for GodLock.uk. Author: Aziel Eliab. */
import { hideInternalDetermination } from "./publicCopy.js";

export const CANON_HOST = "https://godlock.uk";
export const FALLBACK_HOST = "https://godlock-uk.vibelock.workers.dev";
export const DOWNLOAD = "https://godlock-download-tracker.vibelock.workers.dev/download";
export const DOWNLOAD_STATS = "https://godlock-download-tracker.vibelock.workers.dev/stats";
export const GITHUB = "https://github.com/AzielEliab/godlock";
export const AUTHOR_GITHUB = "https://github.com/AzielEliab";
export const CATALOG = "https://aziel-runtime.vibelock.workers.dev";
export const LIBRARY = "https://www.azielcorpuslibrary.net";
export const LIBRARY_AZIEL = LIBRARY + "/AzielEliab";
export const LIBRARY_RUNTIME = LIBRARY + "/runtime";
export const SIGIL = LIBRARY + "/sigil.png";
export const SITE = "GodLock";
export const AUTHOR = "Aziel Eliab";
export const AUTHOR_AKA = "Aziel Elroi Eliab";
export const BANNER = "Public HTTPS engine. Mesh is not on this surface. Author Aziel Eliab.";
export const AZIEL_ELIAB_PATH = "/AzielEliab";
export const AZIEL_CORPUS_PATH = "/AzielCorpusLibrary";
export const SOFTWARE_PATH = "/software";
export const RUNTIME_PATH = "/runtime";
export const PUBLIC_RUNTIME = CANON_HOST + RUNTIME_PATH;
export const GITHUB_RUNTIME = "https://github.com/AzielEliab/aziel-runtime";
export const RUNTIME_VERSION = "1.6.2";
export const FRAGGATE_KERNEL = "https://github.com/AzielEliab/fraggate";

export const AI_CLIENTS = [
  "ChatGPT (GPT Actions / OpenAI)",
  "Grok (xAI)",
  "Venice",
  "Claude (Anthropic)",
  "Cursor (MCP)",
  "Glama (MCP)",
  "Perplexity",
  "Microsoft Copilot / Bing",
  "Google Gemini / Vertex",
  "Mistral",
  "Meta AI",
  "Apple Intelligence surfaces",
  "Amazon Q tooling",
  "DuckAssist",
  "You.com",
  "Cohere",
];

export const AI_CLIENTS_SENTENCE =
  "Works with " + AI_CLIENTS.join(", ") + ", and other MCP/OpenAPI-capable assistants.";

const Q = String.fromCharCode(34);

function esc(s) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
  map[Q] = "&quot;";
  return String(s || "").replace(/[&<>\u0022]/g, (c) => map[c] || c);
}
function meta(name, content) {
  return "<meta name=" + Q + name + Q + " content=" + Q + esc(content) + Q + ">";
}
function prop(name, content) {
  return "<meta property=" + Q + name + Q + " content=" + Q + esc(content) + Q + ">";
}
function linkRel(rel, href, extra) {
  extra = extra || "";
  return "<link rel=" + Q + rel + Q + " href=" + Q + esc(href) + Q + extra + ">";
}

export function personNode() {
  return {
    "@type": "Person",
    "@id": CANON_HOST + AZIEL_ELIAB_PATH + "#aziel-eliab",
    name: AUTHOR,
    alternateName: [AUTHOR_AKA],
    url: CANON_HOST + AZIEL_ELIAB_PATH,
    sameAs: [LIBRARY_AZIEL, AUTHOR_GITHUB, GITHUB],
  };
}

export function defaultDescription(kind) {
  if (kind === "verify") return hideInternalDetermination("Verify the GodLock.uk hash-chained ledger. Author Aziel Eliab.");
  if (kind === "receipt") return hideInternalDetermination("A GodLock.uk receipt. Append-only. Author Aziel Eliab.");
  if (kind === "aziel") {
    return hideInternalDetermination(
      "Aziel Eliab on GodLock: a debate with no record becomes a pulpit. Receipt, intelligent design stress-test. Identity is Aziel Eliab only.",
    );
  }
  if (kind === "software") {
    return hideInternalDetermination(
      "Downloadable Aziel Eliab software from the live aziel-runtime catalog. Invoke via Runtime at " + PUBLIC_RUNTIME + " (FragGate " + RUNTIME_VERSION + "). " + AI_CLIENTS_SENTENCE + " GodLock.uk is not a mesh. Author Aziel Eliab.",
    );
  }
  if (kind === "runtime") {
    return hideInternalDetermination(
      "Aziel Eliab Runtime " + RUNTIME_VERSION + " FragGate door on GodLock.uk. Same-origin /runtime/* proxies the live engine-runtime. OpenAPI " + PUBLIC_RUNTIME + "/openapi.json · MCP POST " + PUBLIC_RUNTIME + "/mcp. " + AI_CLIENTS_SENTENCE + " Author Aziel Eliab.",
    );
  }
  return hideInternalDetermination("GodLock public HTTPS stress-test engine by Aziel Eliab. Submit a challenge, including intelligent-design disputes. Answers open with Yes, No, Let's review, or Interesting. Same-origin Runtime door: " + PUBLIC_RUNTIME + " (FragGate " + RUNTIME_VERSION + "). " + AI_CLIENTS_SENTENCE + " Not a mesh.");
}

function defaultKeywords(kind) {
  if (kind === "aziel") return "Aziel Eliab, GodLock, receipt, intelligent design stress-test";
  if (kind === "software" || kind === "runtime" || kind === "home") {
    return "GodLock, Aziel Eliab, Runtime, FragGate, MCP, OpenAPI, ChatGPT, Grok, Venice, Claude, Cursor, Glama, Perplexity, Copilot, Gemini, Mistral, Meta AI, Apple Intelligence, Amazon Q, DuckAssist, You.com, Cohere";
  }
  return "";
}

export function runtimeSameAs() {
  return [PUBLIC_RUNTIME, LIBRARY_RUNTIME, CATALOG + "/"];
}

export function runtimeSoftwareNode(person) {
  return {
    "@type": "SoftwareApplication",
    "@id": PUBLIC_RUNTIME + "#runtime",
    name: "Aziel Eliab Runtime",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Cloudflare Workers",
    softwareVersion: RUNTIME_VERSION,
    url: PUBLIC_RUNTIME,
    description: defaultDescription("runtime"),
    author: person,
    license: "https://www.apache.org/licenses/LICENSE-2.0",
    codeRepository: GITHUB_RUNTIME,
    sameAs: runtimeSameAs(),
  };
}

export function runtimeWebApiNode(person) {
  return {
    "@type": "WebAPI",
    "@id": PUBLIC_RUNTIME + "#webapi",
    name: "Aziel Eliab Runtime",
    url: PUBLIC_RUNTIME,
    documentation: PUBLIC_RUNTIME + "/openapi.json",
    provider: person,
    description: "FragGate " + RUNTIME_VERSION + " door. OpenAPI " + PUBLIC_RUNTIME + "/openapi.json. MCP POST " + PUBLIC_RUNTIME + "/mcp.",
  };
}

function jsonLd(_title, _path, description, kind) {
  const person = personNode();
  const website = { "@type": "WebSite", name: SITE, url: CANON_HOST + "/", description, author: person };
  const software = {
    "@type": "SoftwareApplication",
    name: SITE,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: CANON_HOST + "/",
    author: person,
    license: "https://www.apache.org/licenses/LICENSE-2.0",
  };
  const graph = [website, software, person];
  if (kind !== "aziel" && kind !== "verify" && kind !== "receipt") {
    graph.push(runtimeSoftwareNode(person), runtimeWebApiNode(person));
  }
  if (kind === "aziel") {
    graph.push({
      "@type": "ProfilePage",
      name: AUTHOR,
      url: CANON_HOST + AZIEL_ELIAB_PATH,
      mainEntity: { "@id": person["@id"] },
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function headMeta(opts) {
  const title = opts.title || SITE;
  const path = opts.path || "/";
  const kind = opts.kind || "";
  const description = hideInternalDetermination(opts.description || defaultDescription(kind));
  const url = CANON_HOST + path;
  const ld = jsonLd(title, path, description, kind);
  const ldOpen = "<" + "script type=" + Q + "application/ld+json" + Q + ">";
  const ldClose = "</" + "script>";
  const keywords = defaultKeywords(kind);
  const tags = [
    meta("description", description),
    meta("robots", "index,follow"),
    meta("googlebot", "index,follow"),
    meta("author", AUTHOR),
  ];
  if (keywords) tags.push(meta("keywords", keywords));
  tags.push(
    linkRel("canonical", url),
    prop("og:title", title + " — " + SITE),
    prop("og:description", description),
    prop("og:type", kind === "aziel" ? "profile" : "website"),
    prop("og:url", url),
    prop("og:site_name", SITE),
    prop("og:image", SIGIL),
    prop("og:image:alt", "Aziel Eliab sigil. Author Aziel Eliab."),
    meta("twitter:card", "summary"),
    meta("twitter:title", title + " — " + SITE),
    meta("twitter:description", description),
    meta("twitter:image", SIGIL),
    linkRel("alternate", "/cite.json", " type=" + Q + "application/json" + Q),
    linkRel("alternate", "/llms.txt", " type=" + Q + "text/plain" + Q),
    linkRel("alternate", "/ai.txt", " type=" + Q + "text/plain" + Q),
  );
  if (kind !== "aziel") {
    tags.push(
      linkRel("alternate", RUNTIME_PATH + "/openapi.json", " type=" + Q + "application/json" + Q + " title=" + Q + "OpenAPI" + Q),
      linkRel("alternate", RUNTIME_PATH + "/llms.txt", " type=" + Q + "text/plain" + Q),
    );
  }
  tags.push(ldOpen + JSON.stringify(ld) + ldClose);
  return tags.join("");
}

export function compactPath(path) {
  return String(path || "").replace(/[-_/]/g, "").toLowerCase();
}

export function permanentIdentityRedirect(path) {
  const p = String(path || "");
  const compact = compactPath(p);
  if (p === "/about" || p === "/aboutme" || (compact === "azieleliab" && p !== AZIEL_ELIAB_PATH)) {
    return AZIEL_ELIAB_PATH;
  }
  if (compact === "azielcorpuslibrary") {
    return LIBRARY_AZIEL;
  }
  return "";
}

function uniquePreserve(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    if (!item || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

export const AI_CRAWLER_AGENTS = uniquePreserve([
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Grok",
  "Venice",
  "Google-Extended",
  "GoogleOther",
  "Google-CloudVertexBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "bingbot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "Meta-WebIndexer",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "DuckDuckBot",
  "DuckAssistBot",
  "MistralAI-User",
  "YouBot",
  "CCBot",
  "cohere-ai",
  "cohere-training-data-crawler",
  "Diffbot",
  "AI2Bot",
  "AI2Bot-Dolma",
  "Timpibot",
  "Petalbot",
  "Bytespider",
  "Omgili",
  "Omgilibot",
  "FirecrawlAgent",
  "ImagesiftBot",
  "FacebookBot",
  "facebookexternalhit",
  "Meta-ExternalAds",
  "TikTokSpider",
  "Baiduspider",
  "Baiduspider-render",
  "Baiduspider-ai",
  "YandexBot",
  "PanguBot",
  "Kangaroo Bot",
  "Cotoyogi",
  "aiHitBot",
  "webzio-extended",
  "ICC-Crawler",
  "DataForSeoBot",
  "AwarioBot",
  "AwarioSmartBot",
  "AwarioRssBot",
  "Sentibot",
  "peer39_crawler",
  "Seekr",
  "Meltwater",
  "TurnitinBot",
  "Factset_spyderbot",
  "NeevaBot",
]);

export const PUBLIC_ALLOW = [
  "/",
  "/verify",
  "/software",
  "/runtime",
  "/runtime/",
  "/AzielEliab",
  "/cite.json",
  "/llms.txt",
  "/ai.txt",
  "/receipt/",
  "/health",
];

export function robotsTxt() {
  const star = ["User-agent: *"].concat(PUBLIC_ALLOW.map((p) => "Allow: " + p));
  const bots = AI_CRAWLER_AGENTS.flatMap((agent) => ["", "User-agent: " + agent, "Allow: /"]);
  return star.concat(bots).concat(["", "Sitemap: " + CANON_HOST + "/sitemap.xml", ""]).join("\n");
}

export async function sitemapXml(env) {
  const locs = [
    CANON_HOST + "/",
    CANON_HOST + "/verify",
    CANON_HOST + SOFTWARE_PATH,
    PUBLIC_RUNTIME,
    PUBLIC_RUNTIME + "/v1/runtime.json",
    PUBLIC_RUNTIME + "/openapi.json",
    PUBLIC_RUNTIME + "/llms.txt",
    PUBLIC_RUNTIME + "/cite.json",
    PUBLIC_RUNTIME + "/mcp",
    PUBLIC_RUNTIME + "/v1/skill",
    CANON_HOST + AZIEL_ELIAB_PATH,
    CANON_HOST + "/health",
    CANON_HOST + "/cite.json",
    CANON_HOST + "/llms.txt",
    CANON_HOST + "/ai.txt",
    GITHUB,
    DOWNLOAD,
    LIBRARY + "/",
    LIBRARY_AZIEL,
    LIBRARY_RUNTIME,
    CATALOG + "/",
  ];
  try {
    const rows = (await env.DB.prepare(
      "SELECT id FROM receipts WHERE isolated=0 ORDER BY created_utc DESC LIMIT 200"
    ).all()).results || [];
    for (const r of rows) locs.push(CANON_HOST + "/receipt/" + encodeURIComponent(r.id));
  } catch { /* empty db is fine */ }
  const lastmod = new Date().toISOString().slice(0, 10);
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + locs.map((u) => "  <url><loc>" + u + "</loc><lastmod>" + lastmod + "</lastmod></url>").join("\n")
    + "\n</urlset>\n";
}

export function citeDoc() {
  return {
    author: AUTHOR,
    alternateName: AUTHOR_AKA,
    title: SITE,
    site: CANON_HOST + "/",
    github: GITHUB,
    download: DOWNLOAD,
    verify: CANON_HOST + "/verify",
    software: CANON_HOST + SOFTWARE_PATH,
    runtime: PUBLIC_RUNTIME,
    runtime_health: PUBLIC_RUNTIME + "/v1/health",
    runtime_manifest: PUBLIC_RUNTIME + "/v1/runtime.json",
    runtime_skill: PUBLIC_RUNTIME + "/v1/skill",
    runtime_fraggate: PUBLIC_RUNTIME + "/v1/fraggate/list",
    runtime_openapi: PUBLIC_RUNTIME + "/openapi.json",
    runtime_mcp: PUBLIC_RUNTIME + "/mcp",
    runtime_cite: PUBLIC_RUNTIME + "/cite.json",
    runtime_llms: PUBLIC_RUNTIME + "/llms.txt",
    runtime_origin: CATALOG + "/",
    runtime_library: LIBRARY_RUNTIME,
    sameAs: runtimeSameAs(),
    related: runtimeSameAs(),
    door: "fraggate",
    runtime_version: RUNTIME_VERSION,
    kernel: FRAGGATE_KERNEL,
    aziel_eliab: CANON_HOST + AZIEL_ELIAB_PATH,
    aziel_corpus_library: LIBRARY_AZIEL,
    library: LIBRARY + "/",
    library_aziel_eliab: LIBRARY_AZIEL,
    health: CANON_HOST + "/health",
    license: "Apache-2.0",
    catalog: CATALOG + "/",
    ai_clients: AI_CLIENTS.concat(["other MCP/OpenAPI-capable assistants"]),
    limitation: hideInternalDetermination(BANNER),
    how_to_cite: "Eliab, Aziel. (2026). GodLock [Software]. Apache-2.0. " + CANON_HOST + "/",
  };
}

export function llmsDoc() {
  return "# GodLock\n\n"
    + "Author: Aziel Eliab\n"
    + "Also known as: Aziel Elroi Eliab\n"
    + "Primary credit: Aziel Eliab\n"
    + "Site: " + CANON_HOST + "/\n"
    + "GitHub: " + GITHUB + "\n"
    + "Download: " + DOWNLOAD + "\n"
    + "License: Apache-2.0\n\n"
    + hideInternalDetermination(BANNER) + "\n\n"
    + "GodLock is a product name, not an identity. Identity is Aziel Eliab only.\n"
    + "Aziel Eliab: " + CANON_HOST + AZIEL_ELIAB_PATH + "\n"
    + "Aziel Corpus Library: " + LIBRARY_AZIEL + "\n"
    + "Digital Library identity: " + LIBRARY_AZIEL + "\n"
    + "Aziel Corpus Library home: " + LIBRARY + "/\n"
    + "Software: " + CANON_HOST + SOFTWARE_PATH + "\n\n"
    + "## Runtime (FragGate door)\n\n"
    + "GodLock → Runtime. Same-origin Aziel Eliab Runtime " + RUNTIME_VERSION + " on GodLock.uk. One door — discover, route, refuse. Kernel: " + FRAGGATE_KERNEL + " (FG-0.1).\n"
    + "Door: " + PUBLIC_RUNTIME + "\n"
    + "Health: " + PUBLIC_RUNTIME + "/v1/health\n"
    + "Manifest: " + PUBLIC_RUNTIME + "/v1/runtime.json\n"
    + "Skill: " + PUBLIC_RUNTIME + "/v1/skill\n"
    + "FragGate list: " + PUBLIC_RUNTIME + "/v1/fraggate/list\n"
    + "OpenAPI: " + PUBLIC_RUNTIME + "/openapi.json\n"
    + "MCP: POST " + PUBLIC_RUNTIME + "/mcp\n"
    + "Cite: " + PUBLIC_RUNTIME + "/cite.json\n"
    + "LLMs: " + PUBLIC_RUNTIME + "/llms.txt\n"
    + "Library door: " + LIBRARY_RUNTIME + "\n"
    + "Origin: " + CATALOG + "/\n"
    + "sameAs: " + runtimeSameAs().join(" · ") + "\n\n"
    + AI_CLIENTS_SENTENCE + "\n"
    + "ChatGPT: GPT Actions → Import " + PUBLIC_RUNTIME + "/openapi.json\n"
    + "Grok / Venice / Claude / Gemini / Copilot / others: OpenAPI or MCP POST " + PUBLIC_RUNTIME + "/mcp\n"
    + "Cursor / Glama: remote MCP " + PUBLIC_RUNTIME + "/mcp\n\n"
    + "Public HTTPS stress-test engine. Submit a challenge. Answers open with Yes, No, Let's review, or Interesting.\n"
    + "Intelligent-design disputes are processed under the same rules. Mesh is not on this surface.\n"
    + "Do not invent DOIs.\n\n"
    + "Public HTML is Allow for User-agent * and named AI/search crawlers (GPTBot, ChatGPT-User, OAI-SearchBot, Venice, Grok, Google-Extended, GoogleOther, Google-CloudVertexBot, Claude*, Perplexity*, bingbot, Meta-External*, FacebookBot, facebookexternalhit, Applebot*, Amazonbot, DuckDuck*, MistralAI-User, YouBot, CCBot, cohere*, Diffbot, AI2Bot*, TikTokSpider, Baiduspider*, YandexBot, and others listed in /robots.txt).\n";
}

export function aiDoc() {
  return llmsDoc();
}
