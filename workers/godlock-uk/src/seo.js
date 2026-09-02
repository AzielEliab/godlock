/** Crawl/index metadata for GodLock.uk. Author: Aziel Eliab. */
export const CANON_HOST = "https://godlock.uk";
export const FALLBACK_HOST = "https://godlock-uk.vibelock.workers.dev";
export const DOWNLOAD = "https://godlock-download-tracker.vibelock.workers.dev/download";
export const DOWNLOAD_STATS = "https://godlock-download-tracker.vibelock.workers.dev/stats";
export const GITHUB = "https://github.com/AzielEliab/godlock";
export const CATALOG = "https://aziel-runtime.vibelock.workers.dev";
export const SITE = "GodLock";
export const AUTHOR = "Aziel Eliab";
export const BANNER = "Public HTTPS engine. Mesh is not on this surface. Author Aziel Eliab.";
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

export function defaultDescription(kind) {
  if (kind === "verify") return "Verify the GodLock.uk hash-chained ledger. Author Aziel Eliab.";
  if (kind === "receipt") return "A GodLock.uk receipt. Append-only. Author Aziel Eliab.";
  return "GodLock public HTTPS stress-test engine by Aziel Eliab. Submit a challenge, including intelligent-design disputes. Answers open with Yes, No, Let's review, or Interesting. Not a mesh.";
}

function jsonLd(title, path, description) {
  const url = CANON_HOST + (path || "/");
  const org = { "@type": "Person", name: AUTHOR, url: CANON_HOST + "/" };
  const website = { "@type": "WebSite", name: SITE, url: CANON_HOST + "/", description, author: org };
  const software = {
    "@type": "SoftwareApplication",
    name: SITE,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: CANON_HOST + "/",
    author: org,
    license: "https://www.apache.org/licenses/LICENSE-2.0",
  };
  return { "@context": "https://schema.org", "@graph": [website, software, org] };
}

export function headMeta(opts) {
  const title = opts.title || SITE;
  const path = opts.path || "/";
  const kind = opts.kind || "";
  const description = opts.description || defaultDescription(kind);
  const url = CANON_HOST + path;
  const ld = jsonLd(title, path, description);
  const ldOpen = "<" + "script type=" + Q + "application/ld+json" + Q + ">";
  const ldClose = "</" + "script>";
  return [
    meta("description", description),
    meta("robots", "index,follow"),
    meta("googlebot", "index,follow"),
    meta("author", AUTHOR),
    linkRel("canonical", url),
    prop("og:title", title + " — " + SITE),
    prop("og:description", description),
    prop("og:type", "website"),
    prop("og:url", url),
    prop("og:site_name", SITE),
    meta("twitter:card", "summary"),
    meta("twitter:title", title + " — " + SITE),
    meta("twitter:description", description),
    linkRel("alternate", "/cite.json", " type=" + Q + "application/json" + Q),
    linkRel("alternate", "/llms.txt", " type=" + Q + "text/plain" + Q),
    ldOpen + JSON.stringify(ld) + ldClose,
  ].join("");
}

export function robotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "Allow: /verify",
    "Allow: /health",
    "Allow: /receipt/",
    "Allow: /cite.json",
    "Allow: /llms.txt",
    "Sitemap: " + CANON_HOST + "/sitemap.xml",
    "",
  ].join("\n");
}

export async function sitemapXml(env) {
  const locs = [
    CANON_HOST + "/",
    CANON_HOST + "/verify",
    CANON_HOST + "/health",
    CANON_HOST + "/cite.json",
    CANON_HOST + "/llms.txt",
    GITHUB,
    DOWNLOAD,
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
    title: SITE,
    site: CANON_HOST + "/",
    github: GITHUB,
    download: DOWNLOAD,
    verify: CANON_HOST + "/verify",
    health: CANON_HOST + "/health",
    license: "Apache-2.0",
    catalog: CATALOG + "/",
    limitation: BANNER,
    how_to_cite: "Eliab, Aziel. (2026). GodLock [Software]. Apache-2.0. " + CANON_HOST + "/",
  };
}

export function llmsDoc() {
  return "# GodLock\n\n"
    + "Author: Aziel Eliab\n"
    + "Site: " + CANON_HOST + "/\n"
    + "GitHub: " + GITHUB + "\n"
    + "Download: " + DOWNLOAD + "\n"
    + "License: Apache-2.0\n\n"
    + BANNER + "\n\n"
    + "GodLock is a product name, not an identity. Identity is Aziel Eliab only.\n\n"
    + "Public HTTPS stress-test engine. Submit a challenge. Answers open with Yes, No, Let's review, or Interesting.\n"
    + "Intelligent-design disputes are processed under the same rules. Mesh is not on this surface.\n";
}
