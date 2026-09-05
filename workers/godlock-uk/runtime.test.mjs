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
    ...(extra || {}),
  };
}

function runtimeEnv(handler) {
  return mockDbEnv({
    AZIEL_RUNTIME: {
      fetch: handler,
    },
  });
}

describe("runtime path mapping", () => {
  it("strips /runtime for origin dest and treats the door as /", () => {
    assert.equal(destFromRuntimePath("/runtime", ""), "/");
    assert.equal(destFromRuntimePath("/runtime/", ""), "/");
    assert.equal(destFromRuntimePath("/runtime/v1/health", ""), "/v1/health");
    assert.equal(destFromRuntimePath("/runtime/v1/fraggate/list", ""), "/v1/fraggate/list");
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
<meta name="description" content="1.6.2 FragGate door">
<link rel="canonical" href="https://aziel-runtime.vibelock.workers.dev/">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"SoftwareApplication","name":"Aziel Eliab Runtime","url":"https://aziel-runtime.vibelock.workers.dev/","sameAs":["https://www.azielcorpuslibrary.net/runtime"]}]}</script>
</head><body><p>1.6.2 FragGate</p><a href="/v1/health">health</a></body></html>`,
      "text/html",
    );
    assert.match(html, /1\.6\.2 FragGate/);
    assert.match(html, /href="https:\/\/godlock\.uk\/runtime\/"/);
    assert.match(html, /href="\/runtime\/v1\/health"/);
    assert.match(html, /godlock-runtime-chrome/);
    assert.match(html, />Runtime</);
    assert.match(html, /www\.azielcorpuslibrary\.net\/runtime/);
    assert.match(html, /aziel-runtime\.vibelock\.workers\.dev/);
    assert.doesNotMatch(html, /Specified Fit|INTERNAL_CRITERIA/i);
  });
});

describe("runtime proxy", () => {
  it("proxies the live door HTML and authority JSON through the service binding", async () => {
    const env = runtimeEnv(async (req) => {
      const u = new URL(req.url);
      if (u.pathname === "/" || u.pathname === "") {
        return new Response(
          `<!doctype html><html><head><title>Aziel Eliab Runtime</title>
<meta name="description" content="1.6.2 widens the public FragGate door">
<link rel="canonical" href="${RUNTIME_ORIGIN}/"></head>
<body><p class="lead"><strong>1.6.2</strong> FragGate</p></body></html>`,
          { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
        );
      }
      if (u.pathname === "/v1/fraggate/list") {
        return new Response(JSON.stringify({ ok: true, live_count: 26, door: "fraggate", version: "1.6.2" }), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
      if (u.pathname === "/v1/health") {
        return new Response(JSON.stringify({ ok: true, version: "1.6.2", door: "fraggate", skill: "/v1/skill" }), {
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
    assert.match(html, /1\.6\.2/);
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
    assert.equal(hj.version, "1.6.2");
    assert.equal(hj.skill, "/runtime/v1/skill");

    const sm = await worker.fetch(new Request("https://godlock.uk/runtime/sitemap.xml"), env);
    const xml = await sm.text();
    assert.match(xml, /https:\/\/godlock\.uk\/runtime\/v1\/runtime\.json/);
    assert.doesNotMatch(xml, /aziel-runtime\.vibelock\.workers\.dev\/v1\/runtime\.json/);
  });

  it("does not expose specified-fit internals on the proxied door", async () => {
    const env = runtimeEnv(async () => new Response(
      "<html><body>1.6.2 FragGate</body></html>",
      { headers: { "Content-Type": "text/html" } },
    ));
    const res = await handleRuntimeRoot(
      new Request("https://godlock.uk/runtime"),
      new URL("https://godlock.uk/runtime"),
      env,
    );
    const html = await res.text();
    assert.doesNotMatch(html, /Specified Fit|INTERNAL_CRITERIA|bootstrap lock|weighing framework/i);
    assert.match(html, /Author Aziel Eliab|GodLock|FragGate|1\.6\.2/);
  });
});

describe("software CTA and nav", () => {
  it("offers Invoke via Runtime next to the catalog", () => {
    const html = softwareBody({ products: [] });
    assert.match(html, /Invoke via Runtime/);
    assert.match(html, /href="\/runtime"/);
    assert.match(html, /FragGate/);
    const nav = topNav("/software");
    assert.match(nav, /href="\/runtime">Runtime<\/a>/);
    assert.equal(RUNTIME_PATH, "/runtime");
  });
});
