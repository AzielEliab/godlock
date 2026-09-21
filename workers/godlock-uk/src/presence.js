/**
 * Heartbeat presence + Uses tally helpers.
 * Site Live Nodes = distinct human sessions with a heartbeat inside PRESENCE_TTL_MS.
 * Bots, crawlers, health-checks, and machine/API paths do not invent viewers.
 * Same human/bot clock as Views (homepage GET) and Downloads (tracker classify).
 * Public Nodes, when suite mesh is on, come from Worker /v1/mesh
 * (human mesh users + cited human uses). Public Live Nodes are mesh presence
 * plus these site viewers until runtime aggregates them (see alignLiveNodes).
 * Never Softwares / software_nodes.
 * Uses = ledger SUBMIT + ISOLATE only (real submissions on the receipt ledger).
 * Heartbeats and page views do not increment Uses. Author: Aziel Eliab.
 */

export const PRESENCE_TTL_MS = 5 * 60 * 1000;
export const PRESENCE_CLEANUP_MS = 15 * 60 * 1000;

/** Same threshold as download-tracker classify.js. Score 0 = not computed. */
export const BOT_SCORE_THRESHOLD = 30;

const HEALTHCHECK_UA = /cf-healthchecks|cloudflare-healthchecks|uptimerobot|pingdom|betteruptime|better uptime|betterstack|healthcheck|health-check|health_check|kube-probe|googlehc|amazon-route53-health-check|aws-healthcheck|elb-healthchecker|statuscake|site24x7|freshping|uptime-kuma|uptime kuma|newrelicsynthetics|datadog\/synthetics|smokeping|nodeping|paessler|prtg/i;

const CRAWLER_UA = /Googlebot|Google-Extended|Google-InspectionTool|AdsBot-Google|APIs-Google|Mediapartners-Google|Storebot-Google|bingbot|BingPreview|msnbot|GPTBot|ChatGPT|OAI-SearchBot|ClaudeBot|Claude-Search|Claude-Web|anthropic-ai|Perplexity|Applebot|Amazonbot|DuckDuck|DuckAssist|Bytespider|CCBot|cohere|Yandex|Baiduspider|Slurp|FacebookBot|facebookexternalhit|Meta-External|YouBot|MistralAI|Cloudflare-AI-Search|Firecrawl|Imagesift|TikTokSpider|peer39|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|WhatsApp|redditbot|Pinterestbot|Embedly|ia_archiver|archive.org_bot|Semrush|Ahrefs|DotBot|MJ12bot|PetalBot|Sogou|Exabot|SeznamBot|Screaming Frog|DataForSeo|HeadlessChrome|Lighthouse|PageSpeed|GTmetrix/i;

const LIBRARY_UA = /curl\/|wget\/|python-requests|python-urllib|aiohttp\/|httpx\/|go-http-client|libwww-perl|okhttp|node-fetch|undici|axios\/|postmanruntime|insomnia\//i;

const MACHINE_PATHS = new Set([
  "/count", "/stats", "/health", "/mesh",
  "/robots.txt", "/sitemap.xml", "/cite.json", "/llms.txt", "/ai.txt",
  "/openapi.json", "/mcp.json", "/person.jsonld", "/identity.jsonld", "/graph.jsonld",
  "/help", "/help.txt", "/HELP.txt", "/addendum.txt",
]);

export function liveNodeCountFromDb(dbCount, justTouched) {
  const n = Number(dbCount);
  const count = Number.isFinite(n) ? Math.max(0, n) : 0;
  if (justTouched && count < 1) return 1;
  return count;
}

/**
 * Uses = ledgered SUBMIT/ISOLATE, floored by a durable metadata snapshot.
 * Receipts or a leftover `uses` field without ledger/metadataUses do not count.
 * metadataUses is the parent-wipe floor (never reset views/downloads/KV).
 */
export function usesCountFromLedger({ ledgerSubmits, metadataUses } = {}) {
  const l = Number(ledgerSubmits);
  const m = Number(metadataUses);
  const ledger = Number.isFinite(l) && l >= 0 ? l : 0;
  const meta = Number.isFinite(m) && m >= 0 ? m : 0;
  return Math.max(ledger, meta);
}

export function presenceCutoff(nowMs = Date.now()) {
  return {
    sinceMs: nowMs - PRESENCE_TTL_MS,
    sinceIso: new Date(nowMs - PRESENCE_TTL_MS).toISOString(),
    cleanupMs: nowMs - PRESENCE_CLEANUP_MS,
    cleanupIso: new Date(nowMs - PRESENCE_CLEANUP_MS).toISOString(),
  };
}

export function readRequestUserAgent(request) {
  if (!request || !request.headers || typeof request.headers.get !== "function") return "";
  return String(request.headers.get("User-Agent") || request.headers.get("user-agent") || "");
}

/**
 * Human website viewer only. Empty UA, crawlers, CLI libraries, health-checks,
 * and Cloudflare verifiedBot / score<=30 are not viewers. Do not invent bots.
 */
export function isHumanSiteViewer(request) {
  if (!request) return false;
  const ua = readRequestUserAgent(request);
  if (!ua.trim()) return false;
  if (HEALTHCHECK_UA.test(ua) || CRAWLER_UA.test(ua) || LIBRARY_UA.test(ua)) return false;
  const bm = request.cf && request.cf.botManagement;
  if (bm && typeof bm === "object") {
    if (bm.verifiedBot === true) return false;
    const score = typeof bm.score === "number" && Number.isFinite(bm.score) && bm.score > 0
      ? Math.floor(bm.score)
      : null;
    if (score != null && score <= BOT_SCORE_THRESHOLD) return false;
  }
  return true;
}

export function isMachinePresencePath(path) {
  const p = String(path || "").replace(/\/+$/, "") || "/";
  if (MACHINE_PATHS.has(p)) return true;
  if (p.startsWith("/v1/") || p.startsWith("/runtime")) return true;
  if (p.startsWith("/.well-known/")) return true;
  if (p.startsWith("/help/")) return true;
  if (p.startsWith("/donate/qr/")) return true;
  if (/\.(json|txt|xml|png|svg|ico|webmanifest|jsonld)$/i.test(p)) return true;
  return false;
}

/**
 * Site presence clock — same beat as Views/Downloads chrome refresh.
 * POST /heartbeat (homepage JS, 25s) and human HTML GETs count.
 * JSON/API GETs and machine paths do not.
 */
export function isSitePresencePath(path, method, { jsonGet } = {}) {
  const m = String(method || "GET").toUpperCase();
  const p = String(path || "").replace(/\/+$/, "") || "/";
  if (m === "POST" && (p === "/heartbeat" || p === "/submit" || p === "/")) return true;
  if (m !== "GET") return false;
  if (jsonGet) return false;
  if (isMachinePresencePath(p)) return false;
  return true;
}
