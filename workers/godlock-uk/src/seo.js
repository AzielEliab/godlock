/** Crawl/index metadata for GodLock.uk. Author: Aziel Eliab. */
export const CANON_HOST = "https://godlock.uk";
export const FALLBACK_HOST = "https://godlock-uk.vibelock.workers.dev";
export const DOWNLOAD = "https://godlock-download-tracker.vibelock.workers.dev/download";
export const GITHUB = "https://github.com/AzielEliab/godlock";
export const CATALOG = "https://aziel-runtime.vibelock.workers.dev";
export const SITE = "GodLock";
export const AUTHOR = "Aziel Eliab";
export const BANNER = "GodLock public board. Not a VPN, not a mesh, not a tunnel. Author Aziel Eliab.";
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
  if (kind === "verify") return "Verify the GodLock.uk hash-chained archive. Author Aziel Eliab.";
  if (kind === "archive") return "Public hash-chain receipts for the GodLock.uk board. Author Aziel Eliab.";
  if (kind === "ask") return "Ask a question on the GodLock public board. Author Aziel Eliab.";
  if (kind === "thread") return "A GodLock.uk question or post with hash-chained replies. Author Aziel Eliab.";
  if (kind === "login") return "Log in to post on GodLock.uk. Author Aziel Eliab.";
  if (kind === "signup") return "Sign up to post on GodLock.uk. Author Aziel Eliab.";
  return "GodLock public board by Aziel Eliab. Read, ask, and reply. Every post is hash-chained. Not a VPN, not a mesh, not a tunnel.";
}

function jsonLd(title, path, kind, description) {
  const url = CANON_HOST + (path || "/");
  const org = { "@type": "Person", "name": AUTHOR, "url": CANON_HOST + "/" };
  const website = { "@type": "WebSite", "name": SITE, "url": CANON_HOST + "/", "description": description, "author": org };
  const software = {
    "@type": "SoftwareApplication",
    "name": SITE,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "url": CANON_HOST + "/",
    "author": org,
    "license": "https://www.apache.org/licenses/LICENSE-2.0",
  };
  const board = {
    "@type": "DiscussionForumPosting",
    "headline": title,
    "url": url,
    "author": org,
    "isAccessibleForFree": true,
  };
  return { "@context": "https://schema.org", "@graph": [website, software, board, org] };
}

export function headMeta(opts) {
  const title = opts.title || SITE;
  const path = opts.path || "/";
  const kind = opts.kind || "";
  const description = opts.description || defaultDescription(kind);
  const url = CANON_HOST + path;
  const ld = jsonLd(title, path, kind, description);
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
    "Allow: /q/",
    "Allow: /ask",
    "Allow: /archive",
    "Allow: /verify",
    "Allow: /health",
    "Allow: /receipt/",
    "Allow: /cite.json",
    "Allow: /llms.txt",
    "Allow: /login",
    "Disallow: /logout",
    "Disallow: /signup",
    "Sitemap: " + CANON_HOST + "/sitemap.xml",
    "",
  ].join("\n");
}

export async function sitemapXml(env) {
  const locs = [
    CANON_HOST + "/",
    CANON_HOST + "/ask",
    CANON_HOST + "/archive",
    CANON_HOST + "/verify",
    CANON_HOST + "/health",
    CANON_HOST + "/cite.json",
    CANON_HOST + "/llms.txt",
    CANON_HOST + "/login",
    GITHUB,
    DOWNLOAD,
  ];
  try {
    const rows = (await env.DB.prepare(
      "SELECT id FROM posts WHERE kind IN ('question','post') ORDER BY created_utc DESC LIMIT 200"
    ).all()).results || [];
    for (const r of rows) locs.push(CANON_HOST + "/q/" + encodeURIComponent(r.id));
  } catch {
    /* empty db is fine */
  }
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
    archive: CANON_HOST + "/archive",
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
    + "## Public HTML (User-Agent Mozilla/5.0)\n\n"
    + "- Home: " + CANON_HOST + "/\n"
    + "- Ask: " + CANON_HOST + "/ask\n"
    + "- Archive: " + CANON_HOST + "/archive\n"
    + "- Verify: " + CANON_HOST + "/verify\n"
    + "- Health: " + CANON_HOST + "/health\n"
    + "- Cite: " + CANON_HOST + "/cite.json\n\n"
    + "Anyone can view. Signup is required to post. Posts are append-only and hash-chained.\n";
}
