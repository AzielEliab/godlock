import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  destFromRuntimePath,
  isRuntimeRequest,
  rewriteOriginUrls,
  rewriteLocation,
  rewriteRuntimeBody,
  handleRuntimeRoot,
  RUNTIME_ORIGIN,
} from "./src/runtimeRoot.js";
import {
  bucketRuntimePath,
  shouldCountRuntimeUse,
  USES_KEY_TOTAL,
} from "./src/runtimeUses.js";
import { PUBLIC_RUNTIME, LIBRARY_RUNTIME, CATALOG, RUNTIME_PATH } from "./src/seo.js";
import { softwareBody, topNav } from "./src/ui.js";
import worker from "./src/index.js";

function mockDbEnv(extra) {
  const stmt = {
    bind() { return stmt; },
    async first() { return null; },
    async all() { return { results: [] }; },
    async run() { return { success: true }; },
  };
  return {
    DB: {
      prepare() { return stmt; },
      async batch() { return []; },
    },
    MESH_PROBE_ORIGIN: false,
    ...(extra || {}),
  };
}

function mockKv() {
  const store = new Map();
  return {
    async get(key) {
      return store.has(key) ? store.get(key) : null;
    },
    async put(key, val) {
      store.set(key, String(val));
    },
    store,
  };
}

function runtimeEnv(handler, extra) {
  return mockDbEnv({
    AZIEL_RUNTIME: {
      fetch: handler,
    },
    ...(extra || {}),
  });
}

describe("runtime path mapping", () => {
  it("strips /runtime for origin dest and treats the door as /", () => {
    assert.equal(destFromRuntimePath("/runtime", ""), "/");
    assert.equal(destFromRuntimePath("/runtime/", ""), "/");
    assert.equal(destFromRuntimePath("/runtime/v1/health", ""), "/v1/health");
    assert.equal(destFromRuntimePath("/runtime/v1/fraggate/list", ""), "/v1/fraggate/list");
    assert.equal(destFromRuntimePath("/runtime/v1/mesh", ""), "/v1/mesh");
    assert.equal(destFromRuntimePath("/runtime/v1/mesh/status", ""), "/v1/mesh/status");
    assert.equal(destFromRuntimePath("/runtime/v1/mesh/nodes", ""), "/v1/mesh/nodes");
    assert.equal(destFromRuntimePath("/runtime/v1/mesh/join", ""), "/v1/mesh/join");
    assert.equal(destFromRuntimePath("/runtime/openapi.json", ""), "/openapi.json");
    assert.equal(destFromRuntimePath("/runtime/mcp", ""), "/mcp");
    assert.equal(destFromRuntimePath("/runtime/llms.txt", ""), "/llms.txt");
    assert.equal(destFromRuntimePath("/software", ""), null);
    assert.equal(isRuntimeRequest("/runtime"), true);
    assert.equal(isRuntimeRequest("/runtime/v1/skill"), true);
    assert.equal(isRuntimeRequest("/software"), false);
  });

  it("rewrites origin locs to godlock.uk/runtime and keeps related hosts", () => {
    const src = "Host: https://aziel-runtime.vibelock.workers.dev/v1/runtime.json";
    const out = rewriteOriginUrls(src);
    assert.equal(out, "Host: https://godlock.uk/runtime/v1/runtime.json");
    assert.equal(
      rewriteLocation("https://aziel-runtime.vibelock.workers.dev/openapi.json"),
      "https://godlock.uk/runtime/openapi.json",
    );
    assert.equal(rewriteLocation("/v1/skill"), "/runtime/v1/skill");
    const html = rewriteRuntimeBody(
      `<!doctype html><html><head><title>Aziel Eliab Runtime</title>
<meta name="description" content="1.6.8 FragGate door">
<link rel="canonical" href="https://aziel-runtime.vibelock.workers.dev/">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"SoftwareApplication","name":"Aziel Eliab Runtime","url":"https://aziel-runtime.vibelock.workers.dev/","sameAs":["https://www.azielcorpuslibrary.net/runtime"]}]}</script>
</head><body><p>1.6.8 FragGate</p><a href="/v1/health">health</a></body></html>`,
      "text/html",
    );
    assert.match(html, /1\.6\.8 FragGate/);
    assert.match(html, /href="https:\/\/godlock\.uk\/runtime\/"/);
    assert.match(html, /href="\/runtime\/v1\/health"/);
    assert.match(html, /godlock-runtime-chrome/);
    assert.match(html, /godlock-runtime-dist/);
    assert.match(html, />Official Runtime</);
    assert.match(html, />Source on GitHub</);
    assert.match(html, />Try on Glama</);
    assert.match(html, /Part of the Aziel Eliab ecosystem/);
    assert.match(html, /href="https:\/\/www\.azieleliab\.com\/"[^>]*>Official site</);
    assert.match(html, /href="https:\/\/glama\.ai\/mcp\/servers\/AzielEliab\/aziel-runtime"[^>]*>Try on Glama</);
    assert.match(html, />Documentation\/Architecture</);
    assert.match(html, /href="https:\/\/glama\.ai\/mcp\/servers\/AzielEliab\/aziel-runtime"[^>]*>Try on Glama</);
    assert.match(html, /background:#c9a227[^"]*"[^>]*>Try on Glama</);
    assert.match(html, /background:transparent[^"]*"[^>]*>Official Runtime</);
    assert.match(html, /href="https:\/\/glama\.ai\/mcp\/servers\/AzielEliab\/aziel-runtime"/);
    assert.match(html, /href="https:\/\/github\.com\/AzielEliab\/aziel-runtime\/tree\/main\/docs\/2\.0"/);
    assert.match(html, />Runtime</);
    assert.match(html, /www\.azielcorpuslibrary\.net\/runtime/);
    assert.match(html, /aziel-runtime\.vibelock\.workers\.dev/);
    assert.doesNotMatch(html, /Specified Fit|INTERNAL_CRITERIA/i);
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.ok(ld["@graph"].some((n) => n["@type"] === "Person" && n["@id"] === "https://www.azieleliab.com/#aziel"));
    assert.ok(ld["@graph"].some((n) => n.author && n.author["@id"] === "https://www.azieleliab.com/#aziel"));
    assert.match(html, /rel="canonical" href="https:\/\/godlock\.uk\/runtime\/"/);
  });
});

describe("runtime proxy", () => {
  it("proxies the live door HTML and authority JSON through the service binding", async () => {
    const env = runtimeEnv(async (req) => {
      const u = new URL(req.url);
      if (u.pathname === "/" || u.pathname === "") {
        return new Response(
          `<!doctype html><html><head><title>Aziel Eliab Runtime</title>
<meta name="description" content="1.6.8 widens the public FragGate door">
<link rel="canonical" href="${RUNTIME_ORIGIN}/"></head>
<body><p class="lead"><strong>1.6.8</strong> FragGate</p></body></html>`,
          { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
        );
      }
      if (u.pathname === "/v1/fraggate/list") {
        return new Response(JSON.stringify({ ok: true, live_count: 26, door: "fraggate", version: "1.6.8" }), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
      if (u.pathname === "/v1/health") {
        return new Response(JSON.stringify({ ok: true, version: "1.6.8", door: "fraggate", skill: "/v1/skill" }), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
      if (u.pathname === "/sitemap.xml") {
        return new Response(
          `<?xml version="1.0"?><urlset><url><loc>${RUNTIME_ORIGIN}/v1/runtime.json</loc></url></urlset>`,
          { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } },
        );
      }
      return new Response(JSON.stringify({ error: "not found", path: u.pathname }), { status: 404 });
    });

    const door = await worker.fetch(new Request("https://godlock.uk/runtime"), env);
    assert.equal(door.status, 200);
    const html = await door.text();
    assert.match(html, /1\.6\.8/);
    assert.match(html, /FragGate/);
    assert.doesNotMatch(html, /engine-runtime 1\.4\.0/);
    assert.match(html, /href="\/runtime"/);
    assert.equal(door.headers.get("X-Aziel-Runtime-Via"), "service-binding");
    assert.equal(door.headers.get("X-Aziel-Runtime-Root"), PUBLIC_RUNTIME);

    const list = await worker.fetch(new Request("https://godlock.uk/runtime/v1/fraggate/list"), env);
    assert.equal(list.status, 200);
    const body = await list.json();
    assert.equal(body.live_count, 26);
    assert.equal(body.godlock_runtime, PUBLIC_RUNTIME);
    assert.equal(body.library_runtime, LIBRARY_RUNTIME);
    assert.ok(body.sameAs.includes(CATALOG + "/"));

    const health = await worker.fetch(new Request("https://godlock.uk/runtime/v1/health"), env);
    const hj = await health.json();
    assert.equal(hj.version, "1.6.8");
    assert.equal(hj.skill, "/runtime/v1/skill");

    const sm = await worker.fetch(new Request("https://godlock.uk/runtime/sitemap.xml"), env);
    const xml = await sm.text();
    assert.match(xml, /https:\/\/godlock\.uk\/runtime\/v1\/runtime\.json/);
    assert.doesNotMatch(xml, /aziel-runtime\.vibelock\.workers\.dev\/v1\/runtime\.json/);
  });

  it("does not expose specified-fit internals on the proxied door", async () => {
    const env = runtimeEnv(async () => new Response(
      "<html><body>1.6.8 FragGate</body></html>",
      { headers: { "Content-Type": "text/html" } },
    ));
    const res = await handleRuntimeRoot(
      new Request("https://godlock.uk/runtime"),
      new URL("https://godlock.uk/runtime"),
      env,
    );
    const html = await res.text();
    assert.doesNotMatch(html, /Specified Fit|INTERNAL_CRITERIA|bootstrap lock|weighing framework/i);
    assert.match(html, /Author Aziel Eliab|GodLock|FragGate|1\.6\.8/);
  });
});

describe("runtime API use tracker", () => {
  it("counts FragGate / MCP / session / pull / v1 API and skips SEO, uses, and GET health/ready", () => {
    assert.equal(shouldCountRuntimeUse("POST", "/v1/fraggate/call"), true);
    assert.equal(shouldCountRuntimeUse("GET", "/v1/fraggate/list"), true);
    assert.equal(shouldCountRuntimeUse("POST", "/mcp"), true);
    assert.equal(shouldCountRuntimeUse("POST", "/v1/session/open"), true);
    assert.equal(shouldCountRuntimeUse("GET", "/v1/pull/godlock"), true);
    assert.equal(shouldCountRuntimeUse("GET", "/v1/skill"), true);
    assert.equal(shouldCountRuntimeUse("POST", "/p/azclce/score"), true);
    assert.equal(shouldCountRuntimeUse("GET", "/openapi.json"), true);
    assert.equal(shouldCountRuntimeUse("GET", "/v1/uses"), false);
    assert.equal(shouldCountRuntimeUse("GET", "/v1/health"), false);
    assert.equal(shouldCountRuntimeUse("HEAD", "/v1/ready"), false);
    assert.equal(shouldCountRuntimeUse("GET", "/llms.txt"), false);
    assert.equal(shouldCountRuntimeUse("GET", "/cite.json"), false);
    assert.equal(shouldCountRuntimeUse("GET", "/sitemap.xml"), false);
    assert.equal(shouldCountRuntimeUse("GET", "/"), false);
    assert.equal(shouldCountRuntimeUse("OPTIONS", "/mcp"), false);
    assert.equal(shouldCountRuntimeUse("POST", "/v1/health"), true);
    assert.equal(bucketRuntimePath("/v1/session/abc123/exec"), "/v1/session/*/exec");
  });

  it("intercepts GET /runtime/v1/uses locally and does not increment that read", async () => {
    const kv = mockKv();
    let originUsesHits = 0;
    const env = runtimeEnv(async (req) => {
      const u = new URL(req.url);
      if (u.pathname === "/v1/uses") {
        originUsesHits += 1;
        return new Response(JSON.stringify({ ok: true, host: "aziel-runtime", uses: 9, author: "Aziel Eliab" }), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
      return new Response(JSON.stringify({ ok: true, proxied: u.pathname }), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }, { RUNTIME_USES: kv });

    const res = await worker.fetch(new Request("https://godlock.uk/runtime/v1/uses"), env);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("X-Aziel-Runtime-Via"), "godlock.uk");
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.host, "godlock.uk");
    assert.equal(body.via, "godlock.uk");
    assert.equal(body.uses, 0);
    assert.deepEqual(body.by_path, {});
    assert.deepEqual(body.recent, []);
    assert.equal(body.author, "Aziel Eliab");
    assert.equal(body.kind, "runtime-host");
    assert.equal(body.origin && body.origin.uses, 9);
    assert.equal(originUsesHits, 1);
    assert.equal(kv.store.get(USES_KEY_TOTAL), undefined);

    const head = await worker.fetch(new Request("https://godlock.uk/runtime/v1/uses", { method: "HEAD" }), env);
    assert.equal(head.status, 200);
    assert.equal(kv.store.get(USES_KEY_TOTAL), undefined);
  });

  it("increments KV on proxied API traffic, stamps the origin request, and skips health/SEO", async () => {
    const kv = mockKv();
    const seen = [];
    const env = runtimeEnv(async (req) => {
      seen.push({ method: req.method, path: new URL(req.url).pathname, via: req.headers.get("X-Aziel-Runtime-Via") });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }, { RUNTIME_USES: kv });

    const api = await worker.fetch(new Request("https://godlock.uk/runtime/v1/fraggate/list"), env);
    assert.equal(api.status, 200);
    assert.equal(api.headers.get("X-Aziel-Runtime-Via"), "service-binding");
    assert.equal(seen[0].via, "godlock.uk");
    assert.equal(seen[0].path, "/v1/fraggate/list");

    await worker.fetch(new Request("https://godlock.uk/runtime/mcp", { method: "POST", body: "{}", headers: { "Content-Type": "application/json" } }), env);
    await worker.fetch(new Request("https://godlock.uk/runtime/v1/health"), env);
    await worker.fetch(new Request("https://godlock.uk/runtime/llms.txt"), env);
    await worker.fetch(new Request("https://godlock.uk/runtime/v1/uses"), env);

    assert.equal(parseInt(kv.store.get(USES_KEY_TOTAL), 10), 2);
    const uses = await (await worker.fetch(new Request("https://godlock.uk/runtime/v1/uses"), env)).json();
    assert.equal(uses.uses, 2);
    assert.equal(uses.by_path["/v1/fraggate/list"], 1);
    assert.equal(uses.by_path["/mcp"], 1);
    assert.equal(uses.author, "Aziel Eliab");
    assert.ok(Array.isArray(uses.recent) && uses.recent.length === 2);
  });

  it("does not change GodLock product Uses on the receipt ledger", async () => {
    const kv = mockKv();
    const env = runtimeEnv(async () => new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }), { RUNTIME_USES: kv });
    await worker.fetch(new Request("https://godlock.uk/runtime/v1/fraggate/call", { method: "POST", body: "{}", headers: { "Content-Type": "application/json" } }), env);
    const stats = await worker.fetch(new Request("https://godlock.uk/stats"), env);
    const body = await stats.json();
    assert.equal(body.uses, 0);
    assert.equal(parseInt(kv.store.get(USES_KEY_TOTAL), 10), 1);
  });
});

describe("software CTA and nav", () => {
  it("offers Official Runtime distribution on the runtime card and Invoke via Runtime on catalog cards", () => {
    const html = softwareBody({ products: [] });
    assert.match(html, /<h2 class="soft-heading">Downloadable software<\/h2>\s*<div class="soft-grid">/);
    assert.match(html, /class="button" href="https:\/\/glama\.ai\/mcp\/servers\/AzielEliab\/aziel-runtime">Try on Glama<\/a>/);
    assert.match(html, /class="button ghost" href="\/runtime">Official Runtime<\/a>/);
    assert.match(html, /href="https:\/\/github\.com\/AzielEliab\/aziel-runtime">Source on GitHub<\/a>/);
    assert.match(html, /href="https:\/\/github\.com\/AzielEliab\/aziel-runtime\/tree\/main\/docs\/2\.0">Documentation\/Architecture<\/a>/);
    assert.doesNotMatch(html, /glama\.ai\/mcp\/servers\/@[A-Za-z0-9_-]+/);
    assert.match(html, /Invoke via Runtime/);
    assert.match(html, /href="\/runtime"/);
    assert.match(html, /FragGate/);
    const nav = topNav("/software");
    assert.match(nav, /href="\/runtime">Runtime<\/a>/);
    assert.equal(RUNTIME_PATH, "/runtime");
  });
});
