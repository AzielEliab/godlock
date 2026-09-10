/**
 * GodLock hosted runtime (Cloudflare Worker).
 * Ports Specified Fit / GodLock engagement scoring and ephemeral receipts from the Python core.
 * NOT an anonymity network. No IP hiding. Logical GodLock receipts only.
 */
import { checkGodlockUpdate, updateCheckUrl, COUNTED_DOWNLOAD } from "./update.js";

function runtimeCors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function runtimeJson(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...runtimeCors() },
  });
}

async function sha256Hex(bytes) {
  const data = bytes instanceof Uint8Array ? bytes : new TextEncoder().encode(String(bytes));
  const dig = await crypto.subtle.digest("SHA-256", data);
  const arr = new Uint8Array(dig);
  let out = "";
  for (let i = 0; i < arr.length; i++) out += arr[i].toString(16).padStart(2, "0");
  return out;
}

async function readJsonBody(request) {
  const ct = (request.headers.get("content-type") || "").toLowerCase();
  if (request.method === "GET" || request.method === "HEAD") return {};
  const text = await request.text();
  if (!text || !text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    const err = new Error("JSON body required");
    err.status = 400;
    throw err;
  }
}

function utcNow() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

const MAJOR_AI_CLIENTS = [
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

function aiHowTo(base) {
  const openapi = base + "/openapi.json";
  const health = base + "/v1/health";
  return {
    clients: MAJOR_AI_CLIENTS,
    chatgpt_actions: [
      "Open GPT Editor → Actions → Import from URL",
      "Paste " + openapi,
      "Authentication: None",
      "Allow GET /v1/health and the listed POST /v1 routes",
      "Test GET /v1/health, then a sample POST from the spec",
    ],
    grok_xai_tools: [
      "Add an HTTP / OpenAPI tool pointing at " + openapi,
      "Or register GET /v1/health, GET /openapi.json, and the product POSTs",
      "No API key. CORS is *",
    ],
    venice_http_tools: [
      "Add an HTTP tool with method, URL, and JSON body from " + openapi,
      "Start with GET " + health,
      "Then call the product POST listed in the spec",
    ],
    claude_anthropic: [
      "Add an OpenAPI or HTTP tool / custom connector pointing at " + openapi,
      "Authentication: None. CORS is *",
    ],
    cursor_glama_mcp: [
      "Add an MCP server: POST https://godlock.uk/runtime/mcp (or https://aziel-runtime.vibelock.workers.dev/mcp)",
      "Suite mesh (QNM-BUILD-1.0, default off; live|locked|isolated counts only; no Node Gate; no auto-heal). QNS-CD-1.0 photon QNS1 packet transfer is a hub cite / Worker mesh cross-map only (local qnsd in https://github.com/AzielEliab/qnm-node; runtime cites in https://github.com/AzielEliab/aziel-runtime; not a Softwares-tab product; no public qnsd proxy): GET https://godlock.uk/runtime/v1/mesh/status and GET /runtime/v1/mesh/nodes (GET never enables). POST /runtime/v1/mesh/{join|heartbeat|leave|enable|disable}",
      "Or import " + openapi + " if the client prefers OpenAPI",
    ],
    openapi_or_http_tools: [
      "Perplexity, Microsoft Copilot / Bing, Google Gemini / Vertex, Mistral, Meta AI, Apple Intelligence surfaces, Amazon Q tooling, DuckAssist, You.com, Cohere, and other OpenAPI/HTTP hosts: import " + openapi + " or call the listed GET/POST routes",
      "Start with GET " + health,
      "Authentication: None. Always send User-Agent: Mozilla/5.0",
    ],
    mcp_catalog: "https://godlock.uk/runtime/mcp",
    mcp_catalog_origin: "https://aziel-runtime.vibelock.workers.dev/mcp",
    mesh: "https://godlock.uk/runtime/v1/mesh",
    notes: [
      "GET /download still serves the gzip tarball and increments the counter.",
      "/v1, /openapi.json, and /ai do not increment DOWNLOADS.",
    ],
  };
}

const PRODUCT = "godlock";
const EXAMPLE_PAYLOAD = {
  "text": "Specified Fit is not a spiral proof."
};

const SKILL_MARKDOWN = "---\nname: GodLock\ndescription: Use when calling GodLock hosted /v1 or installing the local package. Author Aziel Eliab.\n---\n\n# GodLock\n\nGodLock is a product name (Specified Fit stress-test and resilience engine). Not a VPN, ghost net, or anonymity tool. Author: Aziel Eliab.\n\n**Identity:** Aziel Eliab only. GodLock is a **product name**, not an identity label.\n\nAlways send `User-Agent: Mozilla/5.0`. Cloudflare Workers may 403 an empty agent.\n\n## How to use (3 steps)\n\n1. `curl -fsSL https://godlock-download-tracker.vibelock.workers.dev/install.sh | bash`\n2. `godlock ui`\n3. Open http://127.0.0.1:8080 and tap **Record**, **Verify**, **Import JSON**, or **Export JSON**.\n\n`godlock doctor` prints PASS or FAIL in plain words.\n\n## Call these URLs\n\n- Worker OpenAPI: https://godlock-download-tracker.vibelock.workers.dev/openapi.json\n- Catalog OpenAPI: https://aziel-runtime.vibelock.workers.dev/openapi.json\n- MCP: `POST https://aziel-runtime.vibelock.workers.dev/mcp`\n- Live skill (this markdown): `GET https://godlock-download-tracker.vibelock.workers.dev/v1/skill`\n\nOps (do **not** increment downloads or views):\n\n| Method | Path | What |\n|--------|------|------|\n| GET | `/v1/health` | Liveness. Does not increment downloads. |\n| GET | `/v1/skill` | This markdown. Does not increment downloads. |\n| GET | `/v1/update` | Online update check (prompt + counted /download if update_available). Never silent overwrite. |\n| POST | `/v1/score` | Specified Fit / GodLock engagement score. Advisory. Not a VPN. |\n| POST | `/v1/submit` | Ephemeral logical receipt. Not anonymity. |\n\nWorks with ChatGPT (GPT Actions / OpenAI), Grok (xAI), Venice, Claude (Anthropic), Cursor (MCP), Glama (MCP), Perplexity, Microsoft Copilot / Bing, Google Gemini / Vertex, Mistral, Meta AI, Apple Intelligence surfaces, Amazon Q tooling, DuckAssist, You.com, Cohere, and other MCP/OpenAPI-capable assistants. ChatGPT: GPT Actions. Grok: import OpenAPI as a custom tool. Venice: HTTP tools. Claude: OpenAPI / custom connector. Cursor and Glama: MCP. Others: the same OpenAPI or MCP catalog.\n\n## Example\n\n```bash\ncurl -s -A 'Mozilla/5.0' https://godlock-download-tracker.vibelock.workers.dev/v1/health\ncurl -s -A 'Mozilla/5.0' https://godlock-download-tracker.vibelock.workers.dev/v1/skill\ncurl -s -A 'Mozilla/5.0' -X POST https://godlock-download-tracker.vibelock.workers.dev/v1/score \\\n  -H 'content-type: application/json' \\\n  -d '{\"text\":\"Specified Fit is not a spiral proof\"}'\n```\n\nCounted download (gzip HTTP 200, no 302): https://godlock-download-tracker.vibelock.workers.dev/download?asset=godlock-0.1.0.tar.gz\nGitHub: https://github.com/AzielEliab/godlock\n\n## Update check (no silent overwrite)\n\nWhen online, call `GET https://aziel-runtime.vibelock.workers.dev/v1/update/check?slug=godlock&version=0.1.0` (this Worker: `GET https://godlock-download-tracker.vibelock.workers.dev/v1/update`). If `update_available`, prompt with the counted download `https://godlock-download-tracker.vibelock.workers.dev/download`. Do not overwrite the local package.\nLive software catalog: `GET https://aziel-runtime.vibelock.workers.dev/v1/software` (fallback `GET /v1/fraggate/list`).\nSuite mesh (QNM-BUILD-1.0, default off; live|locked|isolated counts only; no Node Gate; no auto-heal; not an anonymity network). **QNS-CD-1.0** photon QNS1 packet transfer is a hub cite / Worker mesh cross-map only — local qnsd in https://github.com/AzielEliab/qnm-node; runtime cites + catalog field in https://github.com/AzielEliab/aziel-runtime; AZInterface pair custody. Not a Softwares-tab product. No public qnsd proxy. `GET https://godlock.uk/runtime/v1/mesh/status` · `GET https://godlock.uk/runtime/v1/mesh/nodes` · `GET https://godlock.uk/mesh`. GET never enables. MCP/FragGate mesh ops via `POST https://godlock.uk/runtime/mcp` or same-origin `/runtime/v1/mesh/{join|heartbeat|leave|enable|disable}`.\nanon-broadcast is not a publish path on godlock.uk. Local communique style tool (not hosted on this Worker; no ffmpeg farm): https://github.com/AzielEliab/anon-broadcast\n\n## Catalog + local UI\n\nAuthor: **Aziel Eliab**. Honest scope: Offline Specified Fit / GodLock score. Not a VPN and not an anonymity network. GodLock is a product name. Public reasoning: Specified Fit, Not Pretty Spirals.\n\n- Catalog product: https://aziel-runtime.vibelock.workers.dev/p/godlock/\n- Catalog OpenAPI: https://aziel-runtime.vibelock.workers.dev/openapi.json\n- Catalog MCP: `POST https://aziel-runtime.vibelock.workers.dev/mcp`\n- This Worker skill: `GET https://godlock-download-tracker.vibelock.workers.dev/v1/skill`\n- This Worker OpenAPI: https://godlock-download-tracker.vibelock.workers.dev/openapi.json\n- Sample payload: `GET https://godlock-download-tracker.vibelock.workers.dev/v1/example`\n\nLocal UI: **Import JSON file** (`type=file`) and **Export JSON**. Then `godlock doctor`.\n\nWorks with ChatGPT (GPT Actions / OpenAI), Grok (xAI), Venice, Claude (Anthropic), Cursor (MCP), Glama (MCP), Perplexity, Microsoft Copilot / Bing, Google Gemini / Vertex, Mistral, Meta AI, Apple Intelligence surfaces, Amazon Q tooling, DuckAssist, You.com, Cohere, and other MCP/OpenAPI-capable assistants. Import catalog or Worker OpenAPI as GPT Actions, a Grok custom tool, Claude/Gemini/Copilot/Mistral/Meta/Cohere/Amazon Q/Perplexity HTTP or OpenAPI tools, Venice HTTP tools, or Cursor/Glama MCP.\n";
const VERSION = "0.1.0";
const BASE = "https://godlock-download-tracker.vibelock.workers.dev";
const BANNER = "NOT an anonymity network. No IP hiding. Logical GodLock receipts only. Not a VPN, proxy, or Tor hop.";
const MOTTO = "GodLock does not argue. It records, analyzes, hardens, and grows.";
const JEEVES_MODEL = "godlock-jeeves-heuristic-0.1";
const MAX_TEXT = 32768;
const GRID_SIZE = 25;
const NODE_PREFIX = "grid";
const WEIGHTS = {
  aziel_sequence: 3.0,
  phi: 2.0,
  sqrt2: 2.0,
  flower_of_life: 2.5,
  corkscrew: 2.0,
  specified_fit: 3.0,
  merged_rule: 1.5,
};
const PATTERNS = {
  aziel_sequence: [/aziel\s+sequence/i, /aziel[-_]?seq(?:uence)?/i],
  phi: [/\bphi\b/i, /golden\s+ratio/i, /φ/, /\b1\.618\d*\b/],
  sqrt2: [/sqrt\s*\(?\s*2/i, /√\s*2/, /square\s+root\s+of\s+2/i, /\b1\.414\d*\b/],
  flower_of_life: [/flower\s+of\s+life/i, /vesica\s+piscis/i],
  corkscrew: [/corkscrew/i],
  // ABAD tokens stay as an internal engagement heuristic only — not user-facing copy.
  specified_fit: [/specified\s+fit/i, /specified\s+complexity/i, /functionally\s+specified/i, /\babad\b/i, /a\s*[-–—]\s*b\s*[-–—]\s*a\s*[-–—]\s*d/i, /\ba\s*-\s*b\s*-\s*a\s*-\s*d\b/i],
};

function withBanner(obj) {
  return { banner: BANNER, motto: MOTTO, anonymity_network: false, ip_hiding: false, proxy: false, vpn: false, tor: false, ...obj };
}

function scoreEngagement(text, extraKeywords) {
  if (!text) return { score: 0.0, hits: [] };
  const hits = [];
  let score = 0.0;
  for (const [family, patterns] of Object.entries(PATTERNS)) {
    if (patterns.some((p) => p.test(text))) {
      hits.push(family);
      score += WEIGHTS[family];
    }
    for (const p of patterns) p.lastIndex = 0;
  }
  const extras = extraKeywords || [];
  const low = text.toLowerCase();
  for (const kw of extras) {
    if (kw && low.includes(String(kw).toLowerCase())) {
      const tag = "merged_rule:" + kw;
      if (!hits.includes(tag)) {
        hits.push(tag);
        score += WEIGHTS.merged_rule;
      }
    }
  }
  return { score: Math.round(score * 10000) / 10000, hits };
}

function nodeName(i) {
  const n = i + 1;
  return NODE_PREFIX + "-" + String(n).padStart(2, "0");
}

function airlockPair() {
  const buf = new Uint32Array(2);
  crypto.getRandomValues(buf);
  const ingressIdx = buf[0] % GRID_SIZE;
  let egressIdx = buf[1] % GRID_SIZE;
  if (egressIdx === ingressIdx) egressIdx = (egressIdx + 1) % GRID_SIZE;
  return { ingress_node: nodeName(ingressIdx), egress_node: nodeName(egressIdx) };
}

function canonicalReceiptPayload(id, timestamp, ingress, egress, text) {
  const body = {
    egress_node: egress,
    id,
    ingress_node: ingress,
    text,
    timestamp,
  };
  const keys = Object.keys(body).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + JSON.stringify(body[k])).join(",") + "}";
}

function jeevesHeuristic(receipt, engagement) {
  const families = engagement.hits.filter((h) => !String(h).startsWith("merged_rule:"));
  let suggested;
  let notes;
  if (families.length) {
    suggested = "Harden Specified Fit / GodLock-score coverage for: " + families.join(", ") + ". Require an explicit " + families[0] + " check in the active rules.";
    notes = "Heuristic engagement score=" + engagement.score + ". Families present in the counter-argument are treated as the surface that should be hardened. Not a language model.";
  } else {
    suggested = "Add a rule requiring the counter-argument to engage at least one GodLock-score family (Specified Fit, Aziel Sequence, phi, sqrt(2), Flower of Life, corkscrew).";
    notes = "Heuristic engagement score=" + engagement.score + ". No Specified Fit family hit. Suggested rule is a keyword floor, not a proof.";
  }
  return {
    receipt_id: receipt.id,
    suggested_hardening: suggested,
    model: JEEVES_MODEL,
    notes,
    engagement,
  };
}

function openapiDoc() {
  return {
    openapi: "3.1.0",
    info: {
      title: "GodLock Runtime API",
      version: VERSION,
      summary: MOTTO,
      description: BANNER,
    },
    servers: [{ url: BASE }],
    paths: {
            "/v1/example": { get: { operationId: "godlockExample", summary: "Sample JSON payload. Does not increment downloads.", responses: { "200": { description: "OK" } } } },
      "/v1/health": { get: { operationId: "godlockHealth", summary: "Liveness", responses: { "200": { description: "OK" } } } },
      "/v1/update": { get: { operationId: "godlockUpdateCheck", summary: "Online update check. Prompt + counted /download when update_available. Never silent overwrite.", responses: { "200": { description: "OK" } } } },
      "/llms.txt": { get: { operationId: "godlockLlms", summary: "LLM/crawler brief", responses: { "200": { description: "OK" } } } },
      "/cite.json": { get: { operationId: "godlockCite", summary: "Citation record", responses: { "200": { description: "OK" } } } },
      "/v1/score": {
        post: {
          operationId: "godlockScore",
          summary: "Specified Fit / GodLock engagement score for text (heuristic, not a proof)",
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["text"], properties: { text: { type: "string" } } } } } },
          responses: { "200": { description: "Score plus hits" } },
        },
      },
      "/v1/submit": {
        post: {
          operationId: "godlockSubmit",
          summary: "Mint an ephemeral logical GodLock receipt. Not stored. Not an anonymity network.",
          requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["text"], properties: { text: { type: "string" } } } } } },
          responses: { "200": { description: "Ephemeral receipt + Jeeves heuristic" } },
        },
      },
    },
  };
}

async function handleScore(body) {
  const text = body && body.text != null ? String(body.text) : "";
  if (!text.trim()) return runtimeJson(withBanner({ ok: false, error: "text is required" }), 400);
  if (text.length > MAX_TEXT) return runtimeJson(withBanner({ ok: false, error: "text too large", max: MAX_TEXT }), 413);
  const engagement = scoreEngagement(text);
  return runtimeJson(withBanner({ ok: true, product: PRODUCT, engagement, durable: false }));
}

async function handleSubmit(body) {
  const text = body && body.text != null ? String(body.text).trim() : "";
  if (!text) return runtimeJson(withBanner({ ok: false, error: "text is required" }), 400);
  if (text.length > MAX_TEXT) return runtimeJson(withBanner({ ok: false, error: "text too large", max: MAX_TEXT }), 413);
  const pair = airlockPair();
  const id = crypto.randomUUID();
  const timestamp = utcNow();
  const payload = canonicalReceiptPayload(id, timestamp, pair.ingress_node, pair.egress_node, text);
  const digest = await sha256Hex(payload);
  const receipt = {
    id,
    timestamp,
    ingress_node: pair.ingress_node,
    egress_node: pair.egress_node,
    text,
    hash: digest,
  };
  const engagement = scoreEngagement(text);
  const analysis = jeevesHeuristic(receipt, engagement);
  return runtimeJson(withBanner({
    ok: true,
    product: PRODUCT,
    receipt,
    jeeves_analysis: analysis,
    engagement,
    durable: false,
    stored: false,
    note: "Ephemeral receipt for this response only. Logical grid nodes are names, not IPs. No durable anonymity.",
  }));
}

export async function handleRuntime(request, url, env) {
  const path = url.pathname;
  if (path === "/v1/health" && request.method === "GET") {
    return runtimeJson(withBanner({
      ok: true,
      author: "Aziel Eliab",
      product: PRODUCT,
      version: VERSION,
      update_check: BASE + "/v1/update",
      runtime_update_check: updateCheckUrl(VERSION),
      download: COUNTED_DOWNLOAD,
      software_catalog: "https://aziel-runtime.vibelock.workers.dev/v1/software",
      software_fraggate: "https://aziel-runtime.vibelock.workers.dev/v1/fraggate/list",
    }));
  }
  if ((path === "/v1/update" || path === "/v1/update/") && request.method === "GET") {
    const checked = await checkGodlockUpdate({ version: VERSION, fetch: globalThis.fetch });
    return runtimeJson(withBanner({
      ok: true,
      product: PRODUCT,
      version: VERSION,
      update: checked,
      update_available: !!(checked && checked.update_available),
      download: (checked && checked.download) || COUNTED_DOWNLOAD,
      prompt: (checked && checked.prompt) || "",
      forced: false,
      note: "Prompt only. Counted /download when update_available. No silent overwrite.",
    }));
  }
  if ((path === "/v1/example" || path === "/v1/example/") && (request.method === "GET" || request.method === "HEAD")) {
    return runtimeJson({
      ok: true,
      product: PRODUCT,
      author: "Aziel Eliab",
      example: EXAMPLE_PAYLOAD,
      note: "Sample payload only. Does not increment downloads.",
    });
  }


  if (path === "/v1/skill" && request.method === "GET") {
    return new Response(SKILL_MARKDOWN, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-KV-Increment": "false",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (path === "/openapi.json" && request.method === "GET") return runtimeJson(openapiDoc());
  if (path === "/ai" && request.method === "GET") {
    return runtimeJson(withBanner({
      product: PRODUCT,
      title: "Use with major AI clients",
      openapi: BASE + "/openapi.json",
      health: BASE + "/v1/health",
      update: BASE + "/v1/update",
      runtime_update_check: updateCheckUrl(VERSION),
      download: COUNTED_DOWNLOAD,
      software_catalog: "https://aziel-runtime.vibelock.workers.dev/v1/software",
      ...aiHowTo(BASE),
    }));
  }
  if (path === "/v1" && request.method === "GET") {
    return runtimeJson(withBanner({ product: PRODUCT, endpoints: ["GET /v1/health", "GET /v1/update", "POST /v1/score", "POST /v1/submit", "GET /openapi.json", "GET /ai", "GET /llms.txt", "GET /cite.json"] }));
  }
  if (path === "/v1/score" && request.method === "POST") {
    let body = {};
    try { body = await readJsonBody(request); } catch (e) { return runtimeJson(withBanner({ ok: false, error: e.message }), e.status || 400); }
    return handleScore(body);
  }
  if (path === "/v1/submit" && request.method === "POST") {
    let body = {};
    try { body = await readJsonBody(request); } catch (e) { return runtimeJson(withBanner({ ok: false, error: e.message }), e.status || 400); }
    return handleSubmit(body);
  }
  if (path === "/v1/score" || path === "/v1/submit") return runtimeJson(withBanner({ error: "method not allowed" }), 405);
  if (path.startsWith("/v1/")) return runtimeJson(withBanner({ error: "not found", product: PRODUCT }), 404);
  return null;
}
