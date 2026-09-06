import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";

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
    for (const [name, text] of [
      ["index", html],
      ["skill", skill],
      ["openapi", openapi],
      ["example", example],
      ["health", health],
    ]) {
      assert.equal(/\bABAD\b/.test(text), false, name + " still has user-facing ABAD");
    }
  });
});
