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
export const BANNER = "Public HTTPS engine. QNM-BUILD-1.0. Suite mesh default off. Live|locked|isolated counts only. No Node Gate. No auto-heal. Not an anonymity network. Author Aziel Eliab.";
export const ANON_BROADCAST = "https://github.com/AzielEliab/anon-broadcast";
export const AZIEL_ELIAB_PATH = "/AzielEliab";
export const AZIEL_CORPUS_PATH = "/AzielCorpusLibrary";
export const REASON_PATH = "/reason";
export const SOFTWARE_PATH = "/software";
export const RUNTIME_PATH = "/runtime";
export const DONATE_PATH = "/donate";
export const DONATE_CANONICAL = "https://www.azieleliab.com/donate";
export const PUBLIC_RUNTIME = CANON_HOST + RUNTIME_PATH;
export const GITHUB_RUNTIME = "https://github.com/AzielEliab/aziel-runtime";
export const RUNTIME_NAME = "Aziel Runtime";
export const RUNTIME_SLUG = "aziel-runtime";
export const RUNTIME_VERSION = "1.6.15";
export const FRAGGATE_KERNEL = "https://github.com/AzielEliab/fraggate";
export const FRAGGATE_DOWNLOAD = "https://fraggate-download-tracker.vibelock.workers.dev/download";
export const FRAGGATE_WORKER = "https://fraggate-download-tracker.vibelock.workers.dev/";
export const FRAGGATE_COUNT = "https://fraggate-download-tracker.vibelock.workers.dev/count";
export const AZBROWSER_DOWNLOAD = "https://azbrowser-download-tracker.vibelock.workers.dev/download";
export const AZBROWSER_WORKER = "https://azbrowser-download-tracker.vibelock.workers.dev/";
export const AZBROWSER_COUNT = "https://azbrowser-download-tracker.vibelock.workers.dev/count";
export const AZNET_DOWNLOAD = "https://aznet-download-tracker.vibelock.workers.dev/download";
export const AZNET_WORKER = "https://aznet-download-tracker.vibelock.workers.dev/";
export const AZNET_COUNT = "https://aznet-download-tracker.vibelock.workers.dev/count";
export const AZNET_GITHUB = "https://github.com/AzielEliab/aznet";
export const AZHUB_DOWNLOAD = "https://azhub-download-tracker.vibelock.workers.dev/download";
export const AZHUB_WORKER = "https://azhub-download-tracker.vibelock.workers.dev/";
export const AZHUB_COUNT = "https://azhub-download-tracker.vibelock.workers.dev/count";
export const AZHUB_GITHUB = "https://github.com/AzielEliab/azhub";
export const AZINTERFACE_DOWNLOAD = "https://azinterface-download-tracker.vibelock.workers.dev/download";
export const AZINTERFACE_WORKER = "https://azinterface-download-tracker.vibelock.workers.dev/";
export const AZINTERFACE_COUNT = "https://azinterface-download-tracker.vibelock.workers.dev/count";
export const AZINTERFACE_GITHUB = "https://github.com/AzielEliab/azinterface";
export const AZCOHERENCE_DOWNLOAD = "https://azcoherence-download-tracker.vibelock.workers.dev/download";
export const AZCOHERENCE_WORKER = "https://azcoherence-download-tracker.vibelock.workers.dev/";
export const AZCOHERENCE_COUNT = "https://azcoherence-download-tracker.vibelock.workers.dev/count";
export const AZCOHERENCE_GITHUB = "https://github.com/AzielEliab/AZCoherence";
export const AZCOHERENCE_SLUG = "azcoherence";
export const AZCOHERENCE_NAME = "AZCoherence";
export const AZCOHERENCE_VERSION = "0.1.0";
export const AZCOHERENCE_PEER = "azclce";
export const AZCOHERENCE_ONE_LINE = "AZCoherence: second-pass triad coherence review (primary vs alternate → PASS/FLAG/NEUTRALIZE/REFUSE). Never invents evidence. Confidence ≠ truth. Not AKM-TRIAD.";

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
    givenName: "Aziel",
    familyName: "Eliab",
    alternateName: [AUTHOR_AKA],
    identifier: AUTHOR,
    url: CANON_HOST + AZIEL_ELIAB_PATH,
    image: SIGIL,
    jobTitle: "Author",
    hasOccupation: { "@type": "Occupation", name: "Author" },
    description: "Author of GodLock. Identity is Aziel Eliab only. Aziel Elroi Eliab is SEO alternateName only.",
    knowsAbout: [SITE, "FragGate", "Aziel Runtime"],
    sameAs: [LIBRARY_AZIEL, AUTHOR_GITHUB, GITHUB],
    mainEntityOfPage: CANON_HOST + AZIEL_ELIAB_PATH,
  };
}

/** Unique <title> / OG / Twitter strings. Home must not render "GodLock — GodLock". */
export function documentTitle(title, kind) {
  if (kind === "home" || title === SITE) return SITE + " by " + AUTHOR + " — Specified Fit, Not Pretty Spirals";
  if (kind === "software") return AUTHOR + " Softwares — " + SITE;
  if (kind === "aziel") return "About " + AUTHOR + " — " + SITE;
  if (kind === "reason") return "Specified Fit, Not Pretty Spirals — " + SITE;
  if (kind === "verify") return "Verify — " + SITE;
  if (kind === "donate") return "Donate — " + SITE;
  if (kind === "runtime") return "Aziel Runtime FragGate door — " + SITE;
  if (kind === "notfound") return "Not found — " + SITE;
  const raw = String(title || SITE).trim();
  if (new RegExp("\\b" + SITE + "\\b", "i").test(raw) && new RegExp(AUTHOR, "i").test(raw)) return raw;
  if (new RegExp("\\b" + SITE + "\\b", "i").test(raw)) return raw;
  return raw + " — " + SITE;
}

/** Softwares-tab slugs for sitemap anchors + CollectionPage ItemList. Not a second FragGate door. */
export const SOFTWARE_INDEX = [
  ["aziel-runtime", "Aziel Runtime"],
  ["fraggate", "FragGate"],
  ["4dmap", "4DMap"],
  ["embryolock", "EmbryoLock"],
  ["azchat", "AZChat"],
  ["vibelock", "VibeLock"],
  ["veillock", "VeilLock"],
  ["codelock", "CodeLock"],
  ["godlock", "GodLock"],
  ["shadowlock", "ShadowLock"],
  ["temporallock", "TemporalLock"],
  ["forgereceipts", "ForgeReceipts"],
  ["decisiongate", "DecisionGATE"],
  ["zsolver", "ZionPattern Solver"],
  ["azos", "AZ-OS"],
  ["glossafilter", "Glossa Filter"],
  ["miragegrid", "MirageGrid"],
  ["staticclock", "StaticClock"],
  ["chronolock", "ChronoLock"],
  ["postking", "Post-King Chess"],
  ["azclce", "AZ-CLCE"],
  ["azcoherence", "AZCoherence"],
  ["ark", "The ARK"],
  ["azai", "AZAI"],
  ["spectrallock", "SpectralLock"],
  ["azbot", "AZBot"],
  ["employeelock", "EmployeeLock"],
  ["foldlock", "FoldLock"],
  ["whistlelock", "WhistleLock"],
  ["trajectorylock", "TrajectoryLock"],
  ["mialock", "M.I.A.Lock"],
  ["azieltether", "AzielTether"],
  ["peacelock", "PeaceLock"],
  ["azmail", "AZMail"],
  ["azbrowser", "AZBrowser"],
  ["aznet", "AZNet"],
  ["azhub", "AZHub"],
  ["azinterface", "AZInterface"],
  ["aziel-corpus", "Aziel Digital Library"],
].map(([slug, name]) => ({ slug, name }));

export function softwareIndexItems(products) {
  const seen = new Set();
  const out = [];
  const push = (slug, name) => {
    const s = String(slug || "").trim();
    if (!s || seen.has(s)) return;
    seen.add(s);
    out.push({ slug: s, name: String(name || s) });
  };
  for (const p of SOFTWARE_INDEX) push(p.slug, p.name);
  for (const p of Array.isArray(products) ? products : []) push(p && p.slug, p && p.name);
  return out;
}

export function isIndexCrawler(ua) {
  return /Googlebot|Google-Extended|bingbot|GPTBot|ChatGPT|OAI-SearchBot|ClaudeBot|Claude-Search|Perplexity|Applebot|Amazonbot|DuckDuck|DuckAssist|Bytespider|CCBot|cohere|Yandex|Baiduspider|Slurp|FacebookBot|Meta-External|YouBot|MistralAI|Cloudflare-AI-Search|Firecrawl|Imagesift|TikTokSpider|peer39/i.test(String(ua || ""));
}

export function defaultDescription(kind) {
  if (kind === "verify") return hideInternalDetermination("Verify the public GodLock.uk hash-chained ledger. Append-only receipts. Author Aziel Eliab.");
  if (kind === "receipt") return hideInternalDetermination("A GodLock.uk receipt. Append-only. Author Aziel Eliab.");
  if (kind === "aziel") {
    return hideInternalDetermination(
      "About Aziel Eliab, author of GodLock. Specified Fit, Not Pretty Spirals. A debate with no record becomes a pulpit. Receipt, intelligent design stress-test. Identity is Aziel Eliab only. Aziel Elroi Eliab is SEO alternateName only.",
    );
  }
  if (kind === "reason") {
    return hideInternalDetermination(
      "Specified Fit, Not Pretty Spirals (Aziel Eliab). Functionally specified digital information plus a translation/reader system: the only observed adequate cause is intelligence. Pretty spirals and φ are not a proof. Score floor 33.3 · ceiling 99.7.",
    );
  }
  if (kind === "software") {
    return hideInternalDetermination(
      "Aziel Eliab Softwares on GodLock.uk. Live catalog Plain A–Z → Gate A–Z → Lock A–Z (Clock is not Lock): aziel-runtime (Aziel Runtime), FragGate, and every hosted card. Worker, GitHub, and /runtime tethers. Same completeness as the Digital Library Software hub. " + AI_CLIENTS_SENTENCE + " Author Aziel Eliab.",
    );
  }
  if (kind === "runtime") {
    return hideInternalDetermination(
      "Aziel Runtime (aziel-runtime) on GodLock.uk. Same-origin /runtime/* proxies the live catalog door. OpenAPI " + PUBLIC_RUNTIME + "/openapi.json · MCP POST " + PUBLIC_RUNTIME + "/mcp. Suite mesh (QNM-BUILD-1.0, default off; live|locked|isolated counts only): " + PUBLIC_RUNTIME + "/v1/mesh. API uses log: " + PUBLIC_RUNTIME + "/v1/uses (this door only; not GodLock product Uses). " + AI_CLIENTS_SENTENCE + " Author Aziel Eliab.",
    );
  }
  if (kind === "donate") {
    return hideInternalDetermination(
      "Donate. Nothing is free. This work has no corporate backer. No grant. No product that unlocks when you pay. Payment is not a key. Author Aziel Eliab. Same door " + DONATE_CANONICAL + ".",
    );
  }
  return hideInternalDetermination("GodLock public HTTPS stress-test engine by Aziel Eliab. Specified Fit, Not Pretty Spirals. Submit a challenge, including intelligent-design disputes. Answers open with Yes, No, Let's review, or Interesting. Same-origin Aziel Runtime door: " + PUBLIC_RUNTIME + " (aziel-runtime). Suite mesh default off (QNM-BUILD-1.0 live|locked|isolated counts only; no Node Gate; no auto-heal): " + PUBLIC_RUNTIME + "/v1/mesh. Not an anonymity network. anon-broadcast is not a publish path on godlock.uk. " + AI_CLIENTS_SENTENCE);
}

function defaultKeywords(kind) {
  if (kind === "aziel") return "Aziel Eliab, GodLock, Specified Fit, receipt, intelligent design stress-test, About Aziel Eliab";
  if (kind === "reason") return "Specified Fit, Not Pretty Spirals, Aziel Eliab, GodLock, code+reader";
  if (kind === "donate") return "Donate, Aziel Eliab, GodLock, Bitcoin, Ethereum, Litecoin, XRP, Dogecoin";
  if (kind === "software") {
    return "Aziel Eliab Softwares, GodLock.uk, FragGate, Aziel Runtime, catalog, Plain A-Z, Gate, Lock, download tracker";
  }
  if (kind === "runtime" || kind === "home") {
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
    name: RUNTIME_NAME,
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
    name: RUNTIME_NAME,
    url: PUBLIC_RUNTIME,
    documentation: PUBLIC_RUNTIME + "/openapi.json",
    provider: person,
    description: "aziel-runtime door. OpenAPI " + PUBLIC_RUNTIME + "/openapi.json. MCP POST " + PUBLIC_RUNTIME + "/mcp. API uses " + PUBLIC_RUNTIME + "/v1/uses.",
  };
}

function websiteNode(person, description) {
  return {
    "@type": "WebSite",
    "@id": CANON_HOST + "/#website",
    name: SITE,
    url: CANON_HOST + "/",
    description,
    inLanguage: "en",
    author: person,
    publisher: person,
  };
}

function godlockSoftwareNode(person) {
  return {
    "@type": "SoftwareApplication",
    "@id": CANON_HOST + "/#godlock",
    name: SITE,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: CANON_HOST + "/",
    description: hideInternalDetermination("GodLock public HTTPS stress-test engine by Aziel Eliab. Specified Fit, Not Pretty Spirals."),
    author: person,
    license: "https://www.apache.org/licenses/LICENSE-2.0",
    codeRepository: GITHUB,
    isPartOf: { "@id": CANON_HOST + "/#website" },
  };
}

function breadcrumbList(id, crumbs) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  };
}

function softwareItemList(products, person) {
  const items = softwareIndexItems(products);
  return {
    "@type": "ItemList",
    "@id": CANON_HOST + SOFTWARE_PATH + "#catalog",
    name: AUTHOR + " Softwares",
    description: "Plain A–Z → Gate A–Z → Lock A–Z catalog. Clock is not Lock. FragGate is the single door.",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: items.length,
    author: { "@id": person["@id"] },
    itemListElement: items.map((p, i) => {
      const url = CANON_HOST + SOFTWARE_PATH + "#" + p.slug;
      return {
        "@type": "ListItem",
        position: i + 1,
        url,
        name: p.name,
        item: {
          "@type": "SoftwareApplication",
          "@id": url,
          name: p.name,
          url,
          identifier: p.slug,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web",
          author: { "@id": person["@id"] },
          isPartOf: { "@id": CANON_HOST + SOFTWARE_PATH + "#catalog" },
        },
      };
    }),
  };
}

function jsonLd(title, path, description, kind, products) {
  const person = personNode();
  const website = websiteNode(person, description);
  const software = godlockSoftwareNode(person);
  const graph = [website, software, person];
  if (kind !== "aziel" && kind !== "reason" && kind !== "verify" && kind !== "receipt" && kind !== "donate" && kind !== "notfound") {
    graph.push(runtimeSoftwareNode(person), runtimeWebApiNode(person));
  }
  if (kind === "home") {
    graph.push({
      "@type": "WebPage",
      "@id": CANON_HOST + "/#webpage",
      name: documentTitle(title, kind),
      url: CANON_HOST + "/",
      description,
      isPartOf: { "@id": website["@id"] },
      about: [{ "@id": software["@id"] }, { "@id": person["@id"] }],
      author: person,
      publisher: person,
    });
  }
  if (kind === "software") {
    const list = softwareItemList(products, person);
    const crumbs = breadcrumbList(CANON_HOST + SOFTWARE_PATH + "#breadcrumb", [
      { name: SITE, item: CANON_HOST + "/" },
      { name: AUTHOR + " Softwares", item: CANON_HOST + SOFTWARE_PATH },
    ]);
    graph.push(list, crumbs, {
      "@type": "CollectionPage",
      "@id": CANON_HOST + SOFTWARE_PATH + "#page",
      name: AUTHOR + " Softwares",
      headline: AUTHOR + " Softwares catalog",
      url: CANON_HOST + SOFTWARE_PATH,
      description: defaultDescription("software"),
      inLanguage: "en",
      identifier: "aziel-eliab-softwares",
      keywords: defaultKeywords("software"),
      image: SIGIL,
      author: person,
      publisher: person,
      copyrightHolder: person,
      isPartOf: { "@id": website["@id"] },
      about: [{ "@id": person["@id"] }, { "@id": website["@id"] }],
      mainEntity: { "@id": list["@id"] },
      breadcrumb: { "@id": crumbs["@id"] },
      hasPart: { "@id": software["@id"] },
      relatedLink: [PUBLIC_RUNTIME, CANON_HOST + "/v1/software", LIBRARY_RUNTIME, CANON_HOST + AZIEL_ELIAB_PATH],
      significantLink: [PUBLIC_RUNTIME, CANON_HOST + "/v1/software", LIBRARY_RUNTIME],
      sameAs: [LIBRARY_RUNTIME],
    });
  }
  if (kind === "reason") {
    graph.push({
      "@type": "ScholarlyArticle",
      name: "Specified Fit, Not Pretty Spirals",
      url: CANON_HOST + REASON_PATH,
      author: person,
    });
  }
  if (kind === "aziel") {
    const crumbs = breadcrumbList(CANON_HOST + AZIEL_ELIAB_PATH + "#breadcrumb", [
      { name: SITE, item: CANON_HOST + "/" },
      { name: "About " + AUTHOR, item: CANON_HOST + AZIEL_ELIAB_PATH },
    ]);
    graph.push(crumbs, {
      "@type": ["AboutPage", "ProfilePage"],
      "@id": CANON_HOST + AZIEL_ELIAB_PATH + "#page",
      name: "About " + AUTHOR,
      headline: AUTHOR,
      url: CANON_HOST + AZIEL_ELIAB_PATH,
      description: defaultDescription("aziel"),
      inLanguage: "en",
      identifier: "about-aziel-eliab",
      keywords: defaultKeywords("aziel"),
      image: SIGIL,
      about: { "@id": person["@id"] },
      mainEntity: { "@id": person["@id"] },
      breadcrumb: { "@id": crumbs["@id"] },
      isPartOf: { "@id": website["@id"] },
      author: person,
      publisher: person,
      copyrightHolder: person,
      sameAs: [LIBRARY_AZIEL, AUTHOR_GITHUB],
      relatedLink: [LIBRARY_AZIEL, CANON_HOST + REASON_PATH, CANON_HOST + SOFTWARE_PATH, AUTHOR_GITHUB],
      significantLink: [LIBRARY_AZIEL, CANON_HOST + REASON_PATH, CANON_HOST + SOFTWARE_PATH],
      subjectOf: { "@type": "CreativeWork", name: "Specified Fit, Not Pretty Spirals", url: CANON_HOST + REASON_PATH },
      mentions: [
        { "@type": "CreativeWork", name: "Specified Fit, Not Pretty Spirals", url: CANON_HOST + REASON_PATH },
        { "@id": software["@id"] },
        { "@type": "CollectionPage", "@id": CANON_HOST + SOFTWARE_PATH + "#page", name: AUTHOR + " Softwares", url: CANON_HOST + SOFTWARE_PATH },
      ],
    });
  }
  if (kind === "verify") {
    graph.push({
      "@type": "WebPage",
      "@id": CANON_HOST + "/verify#page",
      name: documentTitle("Verify", "verify"),
      url: CANON_HOST + "/verify",
      description: defaultDescription("verify"),
      isPartOf: { "@id": website["@id"] },
      author: person,
    });
  }
  if (kind === "donate") {
    graph.push({
      "@type": "WebPage",
      name: "Donate",
      url: CANON_HOST + DONATE_PATH,
      author: person,
      sameAs: [DONATE_CANONICAL],
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function headMeta(opts) {
  const title = opts.title || SITE;
  const path = opts.path || "/";
  const kind = opts.kind || "";
  const indexable = opts.indexable !== false && kind !== "notfound";
  const docTitle = documentTitle(title, kind);
  const description = hideInternalDetermination(opts.description || defaultDescription(kind));
  const url = CANON_HOST + path;
  const ld = jsonLd(title, path, description, kind, opts.products);
  const ldOpen = "<" + "script type=" + Q + "application/ld+json" + Q + ">";
  const ldClose = "</" + "script>";
  const keywords = defaultKeywords(kind);
  const robots = indexable ? "index,follow" : "noindex,follow";
  const tags = [
    meta("description", description),
    meta("robots", robots),
    meta("googlebot", robots),
    meta("author", AUTHOR),
  ];
  if (keywords) tags.push(meta("keywords", keywords));
  tags.push(
    linkRel("canonical", url),
    prop("og:title", docTitle),
    prop("og:description", description),
    prop("og:type", kind === "aziel" ? "profile" : "website"),
    prop("og:url", url),
    prop("og:site_name", SITE),
    prop("og:locale", "en_GB"),
    prop("og:image", SIGIL),
    prop("og:image:alt", "Aziel Eliab sigil. Author Aziel Eliab."),
    meta("twitter:card", "summary"),
    meta("twitter:title", docTitle),
    meta("twitter:description", description),
    meta("twitter:image", SIGIL),
    meta("twitter:image:alt", "Aziel Eliab sigil. Author Aziel Eliab."),
    linkRel("alternate", "/cite.json", " type=" + Q + "application/json" + Q),
    linkRel("alternate", "/llms.txt", " type=" + Q + "text/plain" + Q),
    linkRel("alternate", "/ai.txt", " type=" + Q + "text/plain" + Q),
  );
  if (kind !== "aziel") {
    tags.push(
      linkRel("alternate", "/openapi.json", " type=" + Q + "application/json" + Q + " title=" + Q + "OpenAPI" + Q),
      linkRel("alternate", RUNTIME_PATH + "/openapi.json", " type=" + Q + "application/json" + Q + " title=" + Q + "Runtime OpenAPI" + Q),
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
  if (compact === "specifiedfit" || compact === "specifiedfitnotprettyspirals" || p === "/specified-fit") {
    return REASON_PATH;
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
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Googlebot-Video",
  "Google-InspectionTool",
  "Storebot-Google",
  "Google-Extended",
  "GoogleOther",
  "GoogleOther-Image",
  "Google-CloudVertexBot",
  "Google-Read-Aloud",
  "DuplexWeb-Google",
  "Cloudflare-AI-Search",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Claude-Web",
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
  "DuckAssist",
  "xAI",
  "xAI-Grok",
  "DeepSeekBot",
  "Qwenbot",
  "Kimi",
  "Moonshot",
  "BraveBot",
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
  "/reason",
  "/software",
  "/v1/software",
  "/runtime",
  "/runtime/",
  "/donate",
  "/AzielEliab",
  "/cite.json",
  "/llms.txt",
  "/ai.txt",
  "/openapi.json",
  "/receipt/",
  "/health",
  "/mesh",
];

export function robotsTxt() {
  const header = [
    "# GodLock.uk — open crawl for Google and AI search.",
    "# Author: Aziel Eliab. Also known as Aziel Elroi Eliab (alternateName only).",
    "# Content-Signal opens search + AI input + AI train.",
    "# Softwares HTML: /software. Catalog JSON: /v1/software (not a second FragGate door). Door: /runtime.",
    "",
  ];
  const star = [
    "User-agent: *",
    "Allow: /",
    "Content-Signal: search=yes, ai-input=yes, ai-train=yes",
  ].concat(PUBLIC_ALLOW.filter((p) => p !== "/").map((p) => "Allow: " + p));
  const bots = AI_CRAWLER_AGENTS.flatMap((agent) => ["", "User-agent: " + agent, "Allow: /"]);
  const maps = uniquePreserve([
    CANON_HOST + "/sitemap.xml",
    CATALOG + "/sitemap.xml",
    CATALOG + "/sitemap-index.xml",
    LIBRARY + "/sitemap.xml",
    "https://www.azieleliab.com/sitemap.xml",
    "https://godlock-download-tracker.vibelock.workers.dev/sitemap.xml",
  ].concat(SOFTWARE_INDEX.filter((p) => p.slug !== "aziel-runtime" && p.slug !== "aziel-corpus" && p.slug !== "azchat").map((p) => {
    return "https://" + p.slug + "-download-tracker.vibelock.workers.dev/sitemap.xml";
  })));
  return header.concat(star).concat(bots).concat([""]).concat(maps.map((u) => "Sitemap: " + u)).concat([""]).join("\n");
}

function sitemapUrl(loc, lastmod, changefreq, priority) {
  return [
    "  <url>",
    "    <loc>" + loc + "</loc>",
    "    <lastmod>" + lastmod + "</lastmod>",
    "    <changefreq>" + changefreq + "</changefreq>",
    "    <priority>" + priority + "</priority>",
    "  </url>",
  ].join("\n");
}

export async function sitemapXml(env, extras = {}) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const seen = new Set();
  const rows = [];
  const add = (loc, priority, changefreq) => {
    if (!loc || seen.has(loc)) return;
    seen.add(loc);
    rows.push(sitemapUrl(loc, lastmod, changefreq || "weekly", priority || "0.5"));
  };
  add(CANON_HOST + "/", "1.0", "daily");
  add(CANON_HOST + SOFTWARE_PATH, "0.95", "daily");
  add(CANON_HOST + AZIEL_ELIAB_PATH, "0.95", "weekly");
  add(CANON_HOST + "/verify", "0.85", "daily");
  add(CANON_HOST + DONATE_PATH, "0.7", "monthly");
  add(CANON_HOST + "/cite.json", "0.8", "weekly");
  add(CANON_HOST + "/llms.txt", "0.8", "weekly");
  add(CANON_HOST + "/ai.txt", "0.8", "weekly");
  add(CANON_HOST + REASON_PATH, "0.8", "weekly");
  add(CANON_HOST + "/v1/software", "0.7", "daily");
  add(CANON_HOST + "/openapi.json", "0.6", "weekly");
  add(CANON_HOST + "/robots.txt", "0.4", "weekly");
  add(CANON_HOST + "/health", "0.3", "daily");
  add(CANON_HOST + "/mesh", "0.4", "daily");
  add(DONATE_CANONICAL, "0.5", "monthly");
  add(PUBLIC_RUNTIME, "0.9", "daily");
  add(PUBLIC_RUNTIME + "/v1/software", "0.85", "daily");
  add(PUBLIC_RUNTIME + "/v1/fraggate/list", "0.8", "daily");
  add(PUBLIC_RUNTIME + "/v1/mesh", "0.5", "daily");
  add(PUBLIC_RUNTIME + "/v1/mesh/status", "0.45", "daily");
  add(PUBLIC_RUNTIME + "/v1/mesh/nodes", "0.45", "daily");
  add(PUBLIC_RUNTIME + "/v1/update/check", "0.5", "daily");
  add(PUBLIC_RUNTIME + "/v1/runtime.json", "0.6", "weekly");
  add(PUBLIC_RUNTIME + "/v1/uses", "0.4", "daily");
  add(PUBLIC_RUNTIME + "/openapi.json", "0.7", "weekly");
  add(PUBLIC_RUNTIME + "/llms.txt", "0.6", "weekly");
  add(PUBLIC_RUNTIME + "/cite.json", "0.6", "weekly");
  add(PUBLIC_RUNTIME + "/mcp", "0.7", "weekly");
  add(PUBLIC_RUNTIME + "/v1/skill", "0.6", "weekly");
  add(GITHUB, "0.5", "weekly");
  add(DOWNLOAD, "0.6", "weekly");
  add(LIBRARY + "/", "0.6", "weekly");
  add(LIBRARY_AZIEL, "0.7", "weekly");
  add(LIBRARY_RUNTIME, "0.6", "weekly");
  add(CATALOG + "/", "0.6", "daily");
  add(CATALOG + "/v1/software", "0.7", "daily");
  add(CATALOG + "/v1/fraggate/list", "0.6", "daily");
  add(CATALOG + "/v1/update/check", "0.4", "daily");
  add(CATALOG + "/v1/catalog.json", "0.5", "daily");
  for (const p of softwareIndexItems(extras.products)) {
    add(CANON_HOST + SOFTWARE_PATH + "#" + p.slug, "0.55", "weekly");
    add(PUBLIC_RUNTIME + "/v1/fraggate/describe?slug=" + encodeURIComponent(p.slug), "0.45", "weekly");
    add(PUBLIC_RUNTIME + "/v1/pull/" + encodeURIComponent(p.slug), "0.4", "weekly");
    if (p.slug !== "aziel-runtime" && p.slug !== "aziel-corpus" && p.slug !== "azchat") {
      add("https://" + p.slug + "-download-tracker.vibelock.workers.dev/", "0.35", "weekly");
    }
  }
  try {
    const recs = (await env.DB.prepare(
      "SELECT id FROM receipts WHERE isolated=0 ORDER BY created_utc DESC LIMIT 200"
    ).all()).results || [];
    for (const r of recs) add(CANON_HOST + "/receipt/" + encodeURIComponent(r.id), "0.3", "monthly");
  } catch { /* empty db is fine */ }
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + rows.join("\n")
    + "\n</urlset>\n";
}

export function citeDoc() {
  return {
    author: AUTHOR,
    identity: AUTHOR,
    identity_note: "Aziel Eliab only. Aziel Elroi Eliab is SEO alternateName only.",
    alternateName: AUTHOR_AKA,
    title: SITE,
    reasoning_spine: "Specified Fit, Not Pretty Spirals",
    site: CANON_HOST + "/",
    priority_pages: {
      home: CANON_HOST + "/",
      software: CANON_HOST + SOFTWARE_PATH,
      aziel_eliab: CANON_HOST + AZIEL_ELIAB_PATH,
      verify: CANON_HOST + "/verify",
      donate: CANON_HOST + DONATE_PATH,
      cite: CANON_HOST + "/cite.json",
      llms: CANON_HOST + "/llms.txt",
      ai: CANON_HOST + "/ai.txt",
      runtime: PUBLIC_RUNTIME,
    },
    software_html: CANON_HOST + SOFTWARE_PATH,
    software_api_note: "Thin SEO/catalog JSON on /v1/software. Not a second FragGate door. Door remains /runtime.",
    github: GITHUB,
    download: DOWNLOAD,
    verify: CANON_HOST + "/verify",
    donate: CANON_HOST + DONATE_PATH,
    donate_canonical: DONATE_CANONICAL,
    donate_spec: "AZL-DONATE-1.0",
    software: CANON_HOST + SOFTWARE_PATH,
    software_catalog: PUBLIC_RUNTIME + "/v1/software",
    software_catalog_origin: CATALOG + "/v1/software",
    software_fraggate: PUBLIC_RUNTIME + "/v1/fraggate/list",
    software_fraggate_origin: CATALOG + "/v1/fraggate/list",
    software_catalog_json: PUBLIC_RUNTIME + "/v1/catalog.json",
    software_suite: "Live aziel-runtime /v1/software (fallback /v1/fraggate/list). Aziel Runtime and FragGate are separate cards. GitHub and runtime drops refresh the tab without hand copy. Same completeness as the Digital Library Software hub. AZCoherence (azcoherence) is Plain A–Z with peer AZ-CLCE. Not AKM-TRIAD. FragGate single door.",
    software_api: CANON_HOST + "/v1/software",
    software_product_count: null,
    azcoherence: CANON_HOST + SOFTWARE_PATH + "#" + AZCOHERENCE_SLUG,
    azcoherence_name: AZCOHERENCE_NAME,
    azcoherence_slug: AZCOHERENCE_SLUG,
    azcoherence_version: AZCOHERENCE_VERSION,
    azcoherence_one_line: AZCOHERENCE_ONE_LINE,
    azcoherence_worker: AZCOHERENCE_WORKER,
    azcoherence_github: AZCOHERENCE_GITHUB,
    azcoherence_download: AZCOHERENCE_DOWNLOAD,
    azcoherence_runtime: PUBLIC_RUNTIME + "/v1/pull/" + AZCOHERENCE_SLUG,
    azcoherence_fraggate: PUBLIC_RUNTIME + "/v1/fraggate/describe?slug=" + AZCOHERENCE_SLUG,
    azcoherence_catalog: CATALOG + "/p/" + AZCOHERENCE_SLUG + "/",
    azcoherence_peer: AZCOHERENCE_PEER,
    azcoherence_note: "Second-pass triad coherence review. Peer AZ-CLCE (azclce). Not AKM-TRIAD. FragGate single door. Author Aziel Eliab.",
    openapi: CANON_HOST + "/openapi.json",
    update_check: CATALOG + "/v1/update/check?slug=godlock&version=0.1.0",
    update_download: DOWNLOAD,
    runtime: PUBLIC_RUNTIME,
    runtime_health: PUBLIC_RUNTIME + "/v1/health",
    runtime_manifest: PUBLIC_RUNTIME + "/v1/runtime.json",
    runtime_skill: PUBLIC_RUNTIME + "/v1/skill",
    runtime_fraggate: PUBLIC_RUNTIME + "/v1/fraggate/list",
    runtime_openapi: PUBLIC_RUNTIME + "/openapi.json",
    runtime_mcp: PUBLIC_RUNTIME + "/mcp",
    runtime_mesh: PUBLIC_RUNTIME + "/v1/mesh",
    runtime_mesh_status: PUBLIC_RUNTIME + "/v1/mesh/status",
    runtime_mesh_nodes: PUBLIC_RUNTIME + "/v1/mesh/nodes",
    runtime_mesh_list: PUBLIC_RUNTIME + "/v1/mesh/nodes",
    runtime_mesh_join: PUBLIC_RUNTIME + "/v1/mesh/join",
    runtime_mesh_heartbeat: PUBLIC_RUNTIME + "/v1/mesh/heartbeat",
    runtime_mesh_leave: PUBLIC_RUNTIME + "/v1/mesh/leave",
    runtime_mesh_enable: PUBLIC_RUNTIME + "/v1/mesh/enable",
    runtime_mesh_disable: PUBLIC_RUNTIME + "/v1/mesh/disable",
    mesh: CANON_HOST + "/mesh",
    mesh_spec: "QNM-BUILD-1.0",
    mesh_default_off: true,
    mesh_anonymity_network: false,
    mesh_node_gate: false,
    mesh_auto_heal: false,
    mesh_rollup: "live|locked|isolated counts only",
    anon_broadcast: ANON_BROADCAST,
    anon_broadcast_note: "Local communique style tool. Not a publish path on godlock.uk. Not hosted on this Worker. No ffmpeg farm.",
    anon_broadcast_publish_path: false,
    runtime_uses: PUBLIC_RUNTIME + "/v1/uses",
    runtime_uses_note: "Same-origin /runtime API tracker. Not GodLock product Uses (ledger SUBMIT/ISOLATE).",
    runtime_cite: PUBLIC_RUNTIME + "/cite.json",
    runtime_llms: PUBLIC_RUNTIME + "/llms.txt",
    runtime_origin: CATALOG + "/",
    runtime_library: LIBRARY_RUNTIME,
    sameAs: runtimeSameAs(),
    related: runtimeSameAs(),
    door: "fraggate",
    runtime_version: RUNTIME_VERSION,
    kernel: FRAGGATE_KERNEL,
    specified_fit: CANON_HOST + REASON_PATH,
    reason: CANON_HOST + REASON_PATH,
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
    + "Aziel Elroi Eliab is SEO alternateName only.\n"
    + "Specified Fit, Not Pretty Spirals: " + CANON_HOST + REASON_PATH + "\n"
    + "Aziel Eliab: " + CANON_HOST + AZIEL_ELIAB_PATH + "\n"
    + "\n## Priority pages\n\n"
    + "Home: " + CANON_HOST + "/\n"
    + "Softwares: " + CANON_HOST + SOFTWARE_PATH + "\n"
    + "About Aziel Eliab: " + CANON_HOST + AZIEL_ELIAB_PATH + "\n"
    + "Verify: " + CANON_HOST + "/verify\n"
    + "Donate: " + CANON_HOST + DONATE_PATH + "\n"
    + "Cite: " + CANON_HOST + "/cite.json\n"
    + "LLMs: " + CANON_HOST + "/llms.txt\n"
    + "AI: " + CANON_HOST + "/ai.txt\n"
    + "Catalog JSON (SEO proxy, not a FragGate door): " + CANON_HOST + "/v1/software\n"
    + "Runtime FragGate door: " + PUBLIC_RUNTIME + "\n"
    + "\n"
    + "Aziel Corpus Library: " + LIBRARY_AZIEL + "\n"
    + "Digital Library identity: " + LIBRARY_AZIEL + "\n"
    + "Aziel Corpus Library home: " + LIBRARY + "/\n"
    + "Software: " + CANON_HOST + SOFTWARE_PATH + "\n"
    + "Donate: " + CANON_HOST + DONATE_PATH + " (AZL-DONATE-1.0). Same door: " + DONATE_CANONICAL + "\n"
    + "Software lists the full live aziel-runtime catalog. Aziel Runtime (aziel-runtime) and FragGate are separate cards, matching Digital Library Software completeness. New catalog slugs are included automatically. AZBrowser, AZNet, AZHub, AZInterface, and AZCoherence are separate Plain cards (azbrowser-download-tracker, aznet-download-tracker, azhub-download-tracker, azinterface-download-tracker, azcoherence-download-tracker). Never nest AZHub with AZInterface. AZCoherence is peer to AZ-CLCE (azclce), not AKM-TRIAD. FragGate is its own Gate card (fraggate-download-tracker Download/Worker, A–Z with DecisionGATE). Each product is tethered to its Worker, GitHub, and /runtime. Sorted Plain A–Z → Gate A–Z → Lock A–Z (Clock is not Lock). GodLock, FragGate, and every true_engine_slug are hosted on this page.\n"
    + "AZCoherence (azcoherence): second-pass triad coherence review (primary vs alternate → PASS/FLAG/NEUTRALIZE/REFUSE). Never invents evidence. Confidence ≠ truth. Not AKM-TRIAD. Peer AZ-CLCE. FragGate single door. Author Aziel Eliab.\n"
    + "AZCoherence Worker: " + AZCOHERENCE_WORKER + "\n"
    + "AZCoherence GitHub: " + AZCOHERENCE_GITHUB + "\n"
    + "AZCoherence download: " + AZCOHERENCE_DOWNLOAD + "\n"
    + "AZCoherence runtime: " + PUBLIC_RUNTIME + "/v1/pull/" + AZCOHERENCE_SLUG + "\n"
    + "AZCoherence FragGate: " + PUBLIC_RUNTIME + "/v1/fraggate/describe?slug=" + AZCOHERENCE_SLUG + "\n"
    + "Software API: " + CANON_HOST + "/v1/software\n"
    + "Live software catalog: " + PUBLIC_RUNTIME + "/v1/software\n"
    + "Origin software: " + CATALOG + "/v1/software\n"
    + "FragGate list fallback: " + PUBLIC_RUNTIME + "/v1/fraggate/list\n"
    + "Catalog JSON: " + PUBLIC_RUNTIME + "/v1/catalog.json\n"
    + "Origin catalog: " + CATALOG + "/v1/catalog.json\n"
    + "OpenAPI: " + CANON_HOST + "/openapi.json\n"
    + "Update check: " + CATALOG + "/v1/update/check?slug=godlock&version=0.1.0 — when update_available, use counted " + DOWNLOAD + " (no silent overwrite).\n\n"
    + "## Runtime (FragGate door)\n\n"
    + "GodLock → Runtime. Same-origin Aziel Runtime (aziel-runtime) on GodLock.uk. One door — discover, route, refuse. Kernel: " + FRAGGATE_KERNEL + " (FG-0.1).\n"
    + "Door: " + PUBLIC_RUNTIME + "\n"
    + "Health: " + PUBLIC_RUNTIME + "/v1/health\n"
    + "Manifest: " + PUBLIC_RUNTIME + "/v1/runtime.json\n"
    + "Skill: " + PUBLIC_RUNTIME + "/v1/skill\n"
    + "FragGate list: " + PUBLIC_RUNTIME + "/v1/fraggate/list\n"
    + "OpenAPI: " + PUBLIC_RUNTIME + "/openapi.json\n"
    + "MCP: POST " + PUBLIC_RUNTIME + "/mcp\n"
    + "Suite mesh (default off): " + PUBLIC_RUNTIME + "/v1/mesh\n"
    + "QNM-BUILD-1.0 rollup: live|locked|isolated counts only. No Node Gate. No auto-heal.\n"
    + "GET /v1/mesh never enables. Display rollup only.\n"
    + "Mesh status: " + PUBLIC_RUNTIME + "/v1/mesh/status\n"
    + "Mesh nodes: " + PUBLIC_RUNTIME + "/v1/mesh/nodes\n"
    + "Mesh join / heartbeat / leave / enable / disable: POST " + PUBLIC_RUNTIME + "/v1/mesh/{join|heartbeat|leave|enable|disable}\n"
    + "Site mesh snapshot: " + CANON_HOST + "/mesh\n"
    + "Mesh is not an anonymity network. Identity Aziel Eliab only.\n"
    + "anon-broadcast is not a publish path on godlock.uk. Local communique style tool (not hosted here; no ffmpeg farm): " + ANON_BROADCAST + "\n"
    + "API uses (this door): " + PUBLIC_RUNTIME + "/v1/uses — KV-backed host log. Not GodLock product Uses on /stats.\n"
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
    + "Intelligent-design disputes are processed under the same rules. Suite mesh default off (QNM-BUILD-1.0). Not an anonymity network.\n"
    + "Do not invent DOIs.\n\n"
    + "Public HTML is Allow for User-agent * and named AI/search crawlers (GPTBot, ChatGPT-User, OAI-SearchBot, Venice, Grok, Google-Extended, GoogleOther, Google-CloudVertexBot, Claude*, Perplexity*, bingbot, Meta-External*, FacebookBot, facebookexternalhit, Applebot*, Amazonbot, DuckDuck*, MistralAI-User, YouBot, CCBot, cohere*, Diffbot, AI2Bot*, TikTokSpider, Baiduspider*, YandexBot, and others listed in /robots.txt).\n";
}

export function aiDoc() {
  return llmsDoc();
}

export function siteOpenApi() {
  return {
    openapi: "3.1.0",
    info: {
      title: "GodLock.uk",
      version: "0.1.0",
      summary: "Public HTTPS stress-test engine by Aziel Eliab.",
      description: hideInternalDetermination(
        "GodLock.uk public routes plus same-origin FragGate / MCP door. Software tab reads live " + CATALOG + "/v1/software (fallback /v1/fraggate/list). Suite mesh (QNM-BUILD-1.0, default off): GET " + PUBLIC_RUNTIME + "/v1/mesh. Public rollup is live|locked|isolated counts only. No Node Gate. No auto-heal. Not an anonymity network. anon-broadcast is not a publish path on godlock.uk. Update prompt: GET " + CATALOG + "/v1/update/check?slug=godlock&version=0.1.0 — when update_available, counted " + DOWNLOAD + " (no silent overwrite). Identity Aziel Eliab only.",
      ),
      contact: { name: AUTHOR, url: CANON_HOST + AZIEL_ELIAB_PATH },
      license: { name: "Apache-2.0", url: "https://www.apache.org/licenses/LICENSE-2.0" },
    },
    servers: [{ url: CANON_HOST }, { url: FALLBACK_HOST }],
    paths: {
      "/health": { get: { operationId: "godlockUkHealth", summary: "Liveness", responses: { "200": { description: "OK" } } } },
      "/software": { get: { operationId: "godlockUkSoftware", summary: "Live Aziel Eliab software suite (Plain → Gate → Lock)", responses: { "200": { description: "HTML or JSON" } } } },
      "/v1/software": { get: { operationId: "godlockUkSoftwareApi", summary: "Same-origin Softwares catalog (Plain A–Z includes AZCoherence; live catalog or local fallback)", responses: { "200": { description: "OK" } } } },
      "/donate": { get: { operationId: "godlockUkDonate", summary: "AZL-DONATE-1.0 door (static rails; no KV; payment is not a key)", responses: { "200": { description: "HTML or JSON" } } } },
      "/openapi.json": { get: { operationId: "godlockUkOpenApi", summary: "This OpenAPI document", responses: { "200": { description: "OK" } } } },
      "/cite.json": { get: { operationId: "godlockUkCite", summary: "Citation record", responses: { "200": { description: "OK" } } } },
      "/llms.txt": { get: { operationId: "godlockUkLlms", summary: "LLM/crawler brief", responses: { "200": { description: "OK" } } } },
      "/runtime/openapi.json": { get: { operationId: "godlockUkRuntimeOpenApi", summary: "Same-origin FragGate OpenAPI", responses: { "200": { description: "OK" } } } },
      "/runtime/mcp": { post: { operationId: "godlockUkRuntimeMcp", summary: "Same-origin FragGate MCP door", responses: { "200": { description: "OK" } } } },
      "/runtime/v1/software": { get: { operationId: "godlockUkRuntimeSoftware", summary: "Live software catalog proxy", responses: { "200": { description: "OK" } } } },
      "/runtime/v1/fraggate/list": { get: { operationId: "godlockUkRuntimeFraggateList", summary: "FragGate list fallback catalog", responses: { "200": { description: "OK" } } } },
      "/runtime/v1/mesh": { get: { operationId: "godlockUkRuntimeMesh", summary: "QNM-BUILD-1.0 suite mesh status (default off; live|locked|isolated counts only; GET never enables; no Node Gate; no auto-heal; not an anonymity network)", responses: { "200": { description: "OK or graceful empty/disabled" } } } },
      "/runtime/v1/mesh/status": { get: { operationId: "godlockUkRuntimeMeshStatus", summary: "LIVE QNM-BUILD-1.0 suite rollup (enabled?, bearers, live|locked|isolated). GET never enables.", responses: { "200": { description: "OK or graceful empty/disabled" } } } },
      "/runtime/v1/mesh/nodes": { get: { operationId: "godlockUkRuntimeMeshNodes", summary: "QNM roster with live|locked|isolated presence (5-minute TTL). Not a peer-list publish path. GET never enables.", responses: { "200": { description: "OK or graceful empty/disabled" } } } },
      "/runtime/v1/mesh/join": { post: { operationId: "godlockUkRuntimeMeshJoin", summary: "Join suite mesh (runtime proxy)", responses: { "200": { description: "OK or graceful empty/disabled" } } } },
      "/runtime/v1/mesh/heartbeat": { post: { operationId: "godlockUkRuntimeMeshHeartbeat", summary: "Suite mesh heartbeat (runtime proxy)", responses: { "200": { description: "OK or graceful empty/disabled" } } } },
      "/runtime/v1/mesh/enable": { post: { operationId: "godlockUkRuntimeMeshEnable", summary: "Enable suite mesh (runtime proxy; default off)", responses: { "200": { description: "OK or graceful empty/disabled" } } } },
      "/runtime/v1/mesh/disable": { post: { operationId: "godlockUkRuntimeMeshDisable", summary: "Disable suite mesh (runtime proxy)", responses: { "200": { description: "OK or graceful empty/disabled" } } } },
      "/mesh": { get: { operationId: "godlockUkMesh", summary: "GodLock.uk QNM-BUILD-1.0 mesh snapshot (live|locked|isolated counts only)", responses: { "200": { description: "OK" } } } },
      "/runtime/v1/update/check": { get: { operationId: "godlockUkRuntimeUpdateCheck", summary: "Client update check (prompt only; no silent overwrite)", responses: { "200": { description: "OK" } } } },
    },
  };
}
