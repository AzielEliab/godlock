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
export const SIGIL = LIBRARY + "/sigil.png";
export const SITE = "GodLock";
export const AUTHOR = "Aziel Eliab";
export const AUTHOR_AKA = "Aziel Elroi Eliab";
export const BANNER = "Public HTTPS engine. Mesh is not on this surface. Author Aziel Eliab.";
export const AZIEL_ELIAB_PATH = "/AzielEliab";
export const AZIEL_CORPUS_PATH = "/AzielCorpusLibrary";
export const SOFTWARE_PATH = "/software";
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
  if (kind === "corpus") {
    return hideInternalDetermination(
      "Aziel Corpus Library on GodLock — About Aziel Eliab and the public MASTER digital library. Primary credit Aziel Eliab.",
    );
  }
  if (kind === "software") {
    return hideInternalDetermination(
      "Downloadable Aziel Eliab software from the live aziel-runtime catalog. GodLock.uk is not a mesh. Author Aziel Eliab.",
    );
  }
  return hideInternalDetermination("GodLock public HTTPS stress-test engine by Aziel Eliab. Submit a challenge, including intelligent-design disputes. Answers open with Yes, No, Let's review, or Interesting. Not a mesh.");
}

function defaultKeywords(kind) {
  if (kind === "aziel") return "Aziel Eliab, GodLock, receipt, intelligent design stress-test";
  if (kind === "corpus") return "Aziel Eliab, Aziel Corpus Library, Aziel Digital Library, GodLock";
  return "";
}

function jsonLd(title, path, description, kind) {
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
  if (kind === "aziel") {
    graph.push({
      "@type": "ProfilePage",
      name: AUTHOR,
      url: CANON_HOST + AZIEL_ELIAB_PATH,
      mainEntity: { "@id": person["@id"] },
    });
  }
  if (kind === "corpus") {
    graph.push({
      "@type": "WebPage",
      name: title,
      url: CANON_HOST + AZIEL_CORPUS_PATH,
      about: { "@id": person["@id"] },
    });
    graph.push({
      "@type": "DigitalLibrary",
      name: "Aziel Digital Library",
      url: LIBRARY + "/",
      sameAs: [LIBRARY + "/", LIBRARY + "/AzielEliab"],
      creator: { "@id": person["@id"] },
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
    ldOpen + JSON.stringify(ld) + ldClose,
  );
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
  if (compact === "azielcorpuslibrary" && p !== AZIEL_CORPUS_PATH) {
    return AZIEL_CORPUS_PATH;
  }
  return "";
}

export const AI_CRAWLER_AGENTS = [
  "Google-Extended",
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
];

export const PUBLIC_ALLOW = [
  "/",
  "/verify",
  "/software",
  "/AzielEliab",
  "/AzielCorpusLibrary",
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
    CANON_HOST + AZIEL_ELIAB_PATH,
    CANON_HOST + AZIEL_CORPUS_PATH,
    CANON_HOST + "/health",
    CANON_HOST + "/cite.json",
    CANON_HOST + "/llms.txt",
    CANON_HOST + "/ai.txt",
    GITHUB,
    DOWNLOAD,
    LIBRARY + "/",
    LIBRARY_AZIEL,
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
    aziel_eliab: CANON_HOST + AZIEL_ELIAB_PATH,
    aziel_corpus_library: CANON_HOST + AZIEL_CORPUS_PATH,
    library: LIBRARY + "/",
    library_aziel_eliab: LIBRARY_AZIEL,
    health: CANON_HOST + "/health",
    license: "Apache-2.0",
    catalog: CATALOG + "/",
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
    + "Aziel Corpus Library: " + CANON_HOST + AZIEL_CORPUS_PATH + "\n"
    + "Digital Library identity: " + LIBRARY_AZIEL + "\n"
    + "Aziel Corpus Library home: " + LIBRARY + "/\n"
    + "Software: " + CANON_HOST + SOFTWARE_PATH + "\n\n"
    + "Public HTTPS stress-test engine. Submit a challenge. Answers open with Yes, No, Let's review, or Interesting.\n"
    + "Intelligent-design disputes are processed under the same rules. Mesh is not on this surface.\n"
    + "Do not invent DOIs.\n\n"
    + "Public HTML is Allow for User-agent * and named AI/search crawlers (Google-Extended, Claude*, Perplexity*, bingbot, Meta-External*, Applebot*, Amazonbot, DuckDuck*, MistralAI-User, YouBot, CCBot).\n";
}

export function aiDoc() {
  return llmsDoc();
}
