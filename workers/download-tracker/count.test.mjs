import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import { checkGodlockUpdate, compareVersions, parseUpdateDoc } from "./src/update.js";
import { citeDoc, llmsDoc, robotsTxt, sitemapXml } from "./src/discover.js";

function mockEnv(initial = {}) {
  const store = { ...initial };
  return {
    store,
    DOWNLOADS: {
      async get(key) {
        return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
      },
      async put(key, value) {
        store[key] = String(value);
      },
      async list() {
        return {
          keys: Object.keys(store).map((name) => ({ name })),
          list_complete: true,
        };
      },
    },
    ASSETS: {
      async fetch() {
        return new Response("missing", { status: 404 });
      },
    },
  };
}

async function fetchPath(env, path, method = "GET") {
  return worker.fetch(new Request("https://godlock-download-tracker.vibelock.workers.dev" + path, { method }), env);
}

describe("GET /count", () => {
  it("returns sibling schema {project, views, downloads, total} without resetting KV", async () => {
    const env = mockEnv({
      "godlock|__views__": "12",
      "godlock|AzielEliab|godlock|main|0": "40",
      "godlock|ForkOwner|godlock|main|1": "3",
    });
    const before = { ...env.store };

    const res = await fetchPath(env, "/count");
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body, {
      project: "godlock",
      views: 12,
      downloads: 43,
      total: 43,
    });
    assert.equal(body.total, body.downloads);
    assert.notEqual(body.total, body.views + body.downloads);
    assert.deepEqual(env.store, before);
  });

  it("does not increment views or downloads", async () => {
    const env = mockEnv({
      "godlock|__views__": "7",
      "godlock|AzielEliab|godlock|main|0": "2",
    });
    await fetchPath(env, "/count");
    await fetchPath(env, "/count");
    const again = await (await fetchPath(env, "/count")).json();
    assert.deepEqual(again, { project: "godlock", views: 7, downloads: 2, total: 2 });
    assert.equal(env.store["godlock|__views__"], "7");
    assert.equal(env.store["godlock|AzielEliab|godlock|main|0"], "2");
  });

  it("excludes the views key from the download tally", async () => {
    const env = mockEnv({
      "godlock|__views__": "99",
      "godlock|AzielEliab|godlock|main|0": "1",
    });
    const body = await (await fetchPath(env, "/count")).json();
    assert.equal(body.views, 99);
    assert.equal(body.downloads, 1);
    assert.equal(body.total, 1);
  });

  it("GET /stats includes views and downloads without writing KV", async () => {
    const env = mockEnv({
      "godlock|__views__": "5",
      "godlock|AzielEliab|godlock|main|0": "8",
    });
    const before = { ...env.store };
    const stats = await (await fetchPath(env, "/stats")).json();
    assert.equal(stats.views, 5);
    assert.equal(stats.downloads, 8);
    assert.equal(stats.total, 8);
    assert.deepEqual(env.store, before);
  });
});

describe("user-facing ABAD leftovers", () => {
  it("keeps ABAD out of HTML, skill, OpenAPI, and example copy", async () => {
    const env = mockEnv({
      "godlock|__views__": "1",
      "godlock|AzielEliab|godlock|main|0": "1",
    });
    const html = await (await fetchPath(env, "/")).text();
    const skill = await (await fetchPath(env, "/v1/skill")).text();
    const openapi = await (await fetchPath(env, "/openapi.json")).text();
    const example = await (await fetchPath(env, "/v1/example")).text();
    const health = await (await fetchPath(env, "/v1/health")).text();
    const llms = await (await fetchPath(env, "/llms.txt")).text();
    const cite = await (await fetchPath(env, "/cite.json")).text();
    const robots = await (await fetchPath(env, "/robots.txt")).text();
    const sitemap = await (await fetchPath(env, "/sitemap.xml")).text();
    for (const [name, text] of [
      ["index", html],
      ["skill", skill],
      ["openapi", openapi],
      ["example", example],
      ["health", health],
      ["llms", llms],
      ["cite", cite],
      ["robots", robots],
      ["sitemap", sitemap],
    ]) {
      assert.equal(/\bABAD\b/.test(text), false, name + " still has user-facing ABAD");
    }
  });
});

describe("SEO / MCP discoverability", () => {
  it("serves robots, sitemap, llms, cite, and openapi without incrementing KV", async () => {
    const env = mockEnv({
      "godlock|__views__": "3",
      "godlock|AzielEliab|godlock|main|0": "4",
    });
    const before = { ...env.store };
    const robots = await (await fetchPath(env, "/robots.txt")).text();
    const sitemap = await (await fetchPath(env, "/sitemap.xml")).text();
    const llms = await (await fetchPath(env, "/llms.txt")).text();
    const cite = await (await fetchPath(env, "/cite.json")).json();
    const spec = await (await fetchPath(env, "/openapi.json")).json();
    assert.match(robots, /User-agent: GPTBot\nAllow: \//);
    assert.match(robots, /Sitemap: https:\/\/godlock-download-tracker\.vibelock\.workers\.dev\/sitemap\.xml/);
    assert.match(sitemap, /\/v1\/update/);
    assert.match(sitemap, /\/llms\.txt/);
    assert.match(sitemap, /aziel-runtime\.vibelock\.workers\.dev\/v1\/software/);
    assert.match(sitemap, /aziel-runtime\.vibelock\.workers\.dev\/v1\/mesh/);
    assert.match(sitemap, /godlock\.uk\/mesh/);
    assert.match(llms, /Live software catalog/);
    assert.match(llms, /Suite mesh \(default off\)/);
    assert.match(llms, /QNM-BUILD-1\.0 rollup/);
    assert.match(llms, /anon-broadcast is not a publish path on godlock\.uk/);
    assert.match(llms, /no silent overwrite/i);
    assert.equal(cite.author, "Aziel Eliab");
    assert.equal(cite.identity, "Aziel Eliab");
    assert.match(cite.update_check, /\/v1\/update\/check\?slug=godlock/);
    assert.ok(spec.paths["/v1/update"]);
    assert.deepEqual(env.store, before);
    assert.equal(robotsTxt().includes("GPTBot"), true);
    assert.ok(sitemapXml().includes("/cite.json"));
    assert.equal(citeDoc().software_catalog, "https://aziel-runtime.vibelock.workers.dev/v1/software");
    assert.equal(citeDoc().mesh, "https://aziel-runtime.vibelock.workers.dev/v1/mesh");
    assert.equal(citeDoc().mesh_spec, "QNM-BUILD-1.0");
    assert.equal(citeDoc().mesh_default_off, true);
    assert.equal(citeDoc().mesh_node_gate, false);
    assert.equal(citeDoc().mesh_auto_heal, false);
    assert.equal(citeDoc().anon_broadcast, "https://github.com/AzielEliab/anon-broadcast");
    assert.equal(citeDoc().anon_broadcast_publish_path, false);
    assert.match(llmsDoc(), /FragGate list fallback/);
  });
});

describe("update check", () => {
  it("parses runtime update_available and never marks forced", async () => {
    assert.equal(compareVersions("0.2.0", "0.1.0"), 1);
    const parsed = parseUpdateDoc({ version: "0.2.0", download: "https://godlock-download-tracker.vibelock.workers.dev/download" }, "0.1.0");
    assert.equal(parsed.update_available, true);
    assert.equal(parsed.forced, false);
    const checked = await checkGodlockUpdate({
      version: "0.1.0",
      fetch: async (url) => {
        assert.match(String(url), /\/v1\/update\/check\?slug=godlock&version=0\.1\.0/);
        return new Response(JSON.stringify({
          update_available: true,
          latest: "0.2.0",
          download: "https://godlock-download-tracker.vibelock.workers.dev/download",
        }), { headers: { "Content-Type": "application/json" } });
      },
    });
    assert.equal(checked.update_available, true);
    assert.equal(checked.forced, false);
    assert.match(checked.prompt, /Counted download/);
  });

  it("GET /v1/update surfaces a prompt and counted download", async () => {
    const env = mockEnv();
    const realFetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
      if (String(url).includes("/v1/update/check")) {
        return new Response(JSON.stringify({
          update_available: true,
          latest: "0.2.0",
          download: "https://godlock-download-tracker.vibelock.workers.dev/download",
        }), { headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
    };
    try {
      const res = await fetchPath(env, "/v1/update");
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.update_available, true);
      assert.equal(body.forced, false);
      assert.match(body.download, /\/download$/);
      assert.match(body.prompt, /no silent overwrite/i);
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});
