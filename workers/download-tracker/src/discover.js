/**
 * Behind-scenes SEO / MCP discoverability for the GodLock download tracker.
 * No UI redesign. Author: Aziel Eliab.
 */

export const HOST = "https://godlock-download-tracker.vibelock.workers.dev";
export const GITHUB = "https://github.com/AzielEliab/godlock";
export const RUNTIME = "https://aziel-runtime.vibelock.workers.dev";
export const AUTHOR = "Aziel Eliab";
export const AUTHOR_AKA = "Aziel Elroi Eliab";
export const SITE = "https://godlock.uk";
export const DOWNLOAD = HOST + "/download";

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
  "other MCP/OpenAPI-capable assistants",
];

export const AI_CRAWLER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Grok",
  "Venice",
  "Google-Extended",
  "ClaudeBot",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "bingbot",
  "Meta-ExternalAgent",
  "Applebot",
  "Amazonbot",
  "DuckDuckBot",
  "MistralAI-User",
  "YouBot",
  "CCBot",
  "cohere-ai",
];

export function robotsTxt() {
  const star = ["User-agent: *", "Allow: /"];
  const bots = AI_CRAWLER_AGENTS.flatMap((agent) => ["", "User-agent: " + agent, "Allow: /"]);
  return star.concat(bots).concat(["", "Sitemap: " + HOST + "/sitemap.xml", ""]).join("\n");
}

export function sitemapLocs() {
  return [
    HOST + "/",
    HOST + "/download",
    HOST + "/install.sh",
    HOST + "/count",
    HOST + "/stats",
    HOST + "/v1/health",
    HOST + "/v1/skill",
    HOST + "/v1/update",
    HOST + "/v1/example",
    HOST + "/openapi.json",
    HOST + "/ai",
    HOST + "/cite.json",
    HOST + "/llms.txt",
    HOST + "/ai.txt",
    HOST + "/robots.txt",
    GITHUB,
    SITE + "/",
    SITE + "/software",
    SITE + "/openapi.json",
    RUNTIME + "/",
    RUNTIME + "/v1/software",
    RUNTIME + "/v1/fraggate/list",
    RUNTIME + "/v1/mesh",
    RUNTIME + "/v1/mesh/list",
    RUNTIME + "/v1/update/check?slug=godlock&version=0.1.0",
    RUNTIME + "/openapi.json",
    RUNTIME + "/mcp",
    SITE + "/mesh",
  ];
}

export function sitemapXml() {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + sitemapLocs().map((u) => "  <url><loc>" + u + "</loc></url>").join("\n")
    + "\n</urlset>\n";
}

export function citeDoc() {
  return {
    author: AUTHOR,
    alternateName: AUTHOR_AKA,
    title: "GodLock",
    identity: AUTHOR,
    github: GITHUB,
    download: DOWNLOAD,
    install: HOST + "/install.sh",
    site: SITE + "/",
    software: SITE + "/software",
    openapi: HOST + "/openapi.json",
    site_openapi: SITE + "/openapi.json",
    skill: HOST + "/v1/skill",
    health: HOST + "/v1/health",
    update: HOST + "/v1/update",
    update_check: RUNTIME + "/v1/update/check?slug=godlock&version=0.1.0",
    update_note: "When update_available, surface counted /download. No silent overwrite.",
    mcp: RUNTIME + "/mcp",
    runtime_openapi: RUNTIME + "/openapi.json",
    software_catalog: RUNTIME + "/v1/software",
    software_fraggate: RUNTIME + "/v1/fraggate/list",
    mesh: RUNTIME + "/v1/mesh",
    mesh_list: RUNTIME + "/v1/mesh/list",
    mesh_join: RUNTIME + "/v1/mesh/join",
    mesh_heartbeat: RUNTIME + "/v1/mesh/heartbeat",
    mesh_enable: RUNTIME + "/v1/mesh/enable",
    mesh_disable: RUNTIME + "/v1/mesh/disable",
    site_mesh: SITE + "/mesh",
    mesh_default_off: true,
    mesh_anonymity_network: false,
    anon_broadcast: "https://github.com/AzielEliab/anon-broadcast",
    anon_broadcast_note: "Local communique style tool. Not hosted on this Worker. No ffmpeg farm.",
    doi: null,
    license: "Apache-2.0",
    catalog: RUNTIME + "/",
    llms: HOST + "/llms.txt",
    sitemap: HOST + "/sitemap.xml",
    ai_clients: AI_CLIENTS.slice(),
    how_to_cite: "Eliab, Aziel. (2026). GodLock [Software]. Apache-2.0. " + HOST + "/",
  };
}

export function llmsDoc() {
  return "# GodLock\n\n"
    + "Author: Aziel Eliab\n"
    + "Also known as: Aziel Elroi Eliab\n"
    + "Primary credit: Aziel Eliab\n"
    + "Identity is Aziel Eliab only. GodLock is a product name.\n"
    + "Worker: " + HOST + "/\n"
    + "Site: " + SITE + "/\n"
    + "GitHub: " + GITHUB + "\n"
    + "Counted download: " + DOWNLOAD + "\n"
    + "Install: " + HOST + "/install.sh\n"
    + "License: Apache-2.0\n\n"
    + "Specified Fit stress-test and resilience engine. Not a VPN, ghost net, or anonymity tool.\n\n"
    + "OpenAPI: " + HOST + "/openapi.json\n"
    + "Skill: " + HOST + "/v1/skill\n"
    + "Health: " + HOST + "/v1/health\n"
    + "Update (this Worker): " + HOST + "/v1/update\n"
    + "Runtime update check: " + RUNTIME + "/v1/update/check?slug=godlock&version=0.1.0\n"
    + "When update_available, prompt with counted " + DOWNLOAD + ". No silent overwrite.\n"
    + "Live software catalog: " + RUNTIME + "/v1/software\n"
    + "FragGate list fallback: " + RUNTIME + "/v1/fraggate/list\n"
    + "Catalog OpenAPI: " + RUNTIME + "/openapi.json\n"
    + "MCP: POST " + RUNTIME + "/mcp\n"
    + "Suite mesh (default off): " + RUNTIME + "/v1/mesh\n"
    + "Mesh list: " + RUNTIME + "/v1/mesh/list\n"
    + "GodLock.uk mesh snapshot: " + SITE + "/mesh\n"
    + "Mesh is not an anonymity network. Identity Aziel Eliab only.\n"
    + "Local communique style tool (not hosted here; no ffmpeg farm): https://github.com/AzielEliab/anon-broadcast\n\n"
    + "Works with " + AI_CLIENTS.join(", ") + ".\n"
    + "ChatGPT: GPT Actions → Import " + HOST + "/openapi.json or " + RUNTIME + "/openapi.json\n"
    + "Cursor / Glama: remote MCP POST " + RUNTIME + "/mcp\n"
    + "Always send User-Agent: Mozilla/5.0.\n"
    + "Do not invent DOIs.\n";
}
