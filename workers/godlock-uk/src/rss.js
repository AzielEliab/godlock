/**
 * RSS 2.0 for https://godlock.uk/rss.xml.
 * Items are the standing public HTML pages plus public receipts (isolated=0).
 * pubDate is the receipt created_utc only. Standing pages have no invented date.
 * Author: Aziel Eliab.
 */
import { hideInternalDetermination } from "./publicCopy.js";
import {
  AUTHOR,
  AZIEL_ELIAB_PATH,
  AZIEL_HANDLES_PATH,
  CANON_HOST,
  DOORS_PATH,
  DONATE_PATH,
  GODLOCK_SITE_BLURB,
  IDENTITY_ANSWER,
  REASON_PATH,
  RECEIPTS_PATH,
  RSS_PATH,
  RUNTIME_PATH,
  SITE,
  SOFTWARE_PATH,
  VERIFY_PATH,
  WHO_PATH,
  defaultDescription,
  documentTitle,
} from "./seo.js";

export const RSS_RECEIPT_LIMIT = 50;
export const RSS_SELF = CANON_HOST + RSS_PATH;

const STANDING_PAGES = [
  { title: "GodLock", kind: "home", path: "/" },
  { title: "How GodLock is scored", kind: "reason", path: REASON_PATH },
  { title: "Softwares", kind: "software", path: SOFTWARE_PATH },
  { title: "Ecosystem / Doors", kind: "doors", path: DOORS_PATH },
  { title: "Aziel Runtime", kind: "runtime", path: RUNTIME_PATH },
  { title: "Receipts", kind: "receipts", path: RECEIPTS_PATH },
  { title: "Verify", kind: "verify", path: VERIFY_PATH },
  { title: "Donate", kind: "donate", path: DONATE_PATH },
  { title: "Aziel Eliab", kind: "aziel", path: AZIEL_ELIAB_PATH },
  { title: "Aziel", kind: "handles", path: AZIEL_HANDLES_PATH },
  { title: "Who is Aziel Eliab", kind: "who", path: WHO_PATH, description: IDENTITY_ANSWER },
];

export function xmlEscape(value) {
  return String(value == null ? "" : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function collapse(value) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
}

export function rssTitle(value, fallback) {
  const text = collapse(value);
  const base = text || collapse(fallback) || SITE;
  if (base.length <= 180) return base;
  return base.slice(0, 179).trimEnd() + "…";
}

/** RFC 822. Empty when the source is missing or not a real timestamp. */
export function rssDate(iso) {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "";
  return new Date(ms).toUTCString();
}

function absolute(path) {
  if (!path || path === "/") return CANON_HOST + "/";
  return CANON_HOST + path;
}

function standingItems() {
  return STANDING_PAGES.map((page) => {
    const link = absolute(page.path);
    const description = page.description || defaultDescription(page.kind);
    return {
      title: page.kind === "who" ? page.title : documentTitle(page.title, page.kind),
      link,
      guid: link,
      description: hideInternalDetermination(description),
      creator: AUTHOR,
      category: "",
      pubDate: "",
    };
  });
}

function receiptItems(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const kept = [];
  for (const row of list) {
    if (!row || row.id == null || String(row.id).trim() === "") continue;
    if (!(row.isolated === false || row.isolated === 0)) continue;
    const id = String(row.id);
    const link = CANON_HOST + "/receipt/" + encodeURIComponent(id);
    const question = row.challenge_text != null ? String(row.challenge_text) : "";
    const summary = hideInternalDetermination(row.summary || "").trim();
    const parts = [];
    if (question.trim()) parts.push(question.trim());
    if (summary && summary !== question.trim()) parts.push(summary);
    if (!parts.length) parts.push("Public GodLock.uk receipt " + id + ".");
    kept.push({
      title: rssTitle(question, "Receipt " + id),
      link,
      guid: link,
      description: parts.join("\n\n"),
      creator: "",
      category: collapse(row.label),
      pubDate: rssDate(row.created_utc),
      sort: Date.parse(row.created_utc),
    });
  }
  kept.sort((a, b) => {
    const as = Number.isFinite(a.sort) ? a.sort : -1;
    const bs = Number.isFinite(b.sort) ? b.sort : -1;
    return bs - as;
  });
  return kept.slice(0, RSS_RECEIPT_LIMIT);
}

function itemXml(item) {
  const lines = [
    "    <item>",
    "      <title>" + xmlEscape(item.title) + "</title>",
    "      <link>" + xmlEscape(item.link) + "</link>",
    "      <guid isPermaLink=\"true\">" + xmlEscape(item.guid) + "</guid>",
  ];
  if (item.pubDate) lines.push("      <pubDate>" + xmlEscape(item.pubDate) + "</pubDate>");
  if (item.category) lines.push("      <category>" + xmlEscape(item.category) + "</category>");
  if (item.creator) lines.push("      <dc:creator>" + xmlEscape(item.creator) + "</dc:creator>");
  lines.push("      <description>" + xmlEscape(item.description) + "</description>");
  lines.push("    </item>");
  return lines.join("\n");
}

export function rssXml(rows) {
  const receipts = receiptItems(rows);
  const dated = receipts.find((item) => item.pubDate);
  const description = hideInternalDetermination(
    GODLOCK_SITE_BLURB + " Public pages and public receipts. Isolated receipts are omitted. Author " + AUTHOR + ".",
  );
  const lines = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\">",
    "  <channel>",
    "    <title>" + xmlEscape(SITE) + "</title>",
    "    <link>" + xmlEscape(CANON_HOST + "/") + "</link>",
    "    <atom:link href=\"" + xmlEscape(RSS_SELF) + "\" rel=\"self\" type=\"application/rss+xml\"/>",
    "    <description>" + xmlEscape(description) + "</description>",
    "    <language>en-gb</language>",
    "    <copyright>" + xmlEscape(AUTHOR) + "</copyright>",
    "    <dc:creator>" + xmlEscape(AUTHOR) + "</dc:creator>",
  ];
  if (dated) lines.push("    <lastBuildDate>" + xmlEscape(dated.pubDate) + "</lastBuildDate>");
  lines.push("    <generator>" + xmlEscape(SITE) + "</generator>");
  for (const item of receipts) lines.push(itemXml(item));
  for (const item of standingItems()) lines.push(itemXml(item));
  lines.push("  </channel>");
  lines.push("</rss>");
  lines.push("");
  return lines.join("\n");
}

export async function publicRssRows(env) {
  if (!env || !env.DB || typeof env.DB.prepare !== "function") return [];
  try {
    const res = await env.DB.prepare(
      "SELECT id, created_utc, challenge_text, label, summary, isolated FROM receipts WHERE isolated=0 ORDER BY created_utc DESC LIMIT ?",
    ).bind(RSS_RECEIPT_LIMIT).all();
    return res && res.results ? res.results : [];
  } catch {
    return [];
  }
}
