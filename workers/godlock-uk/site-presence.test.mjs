import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import {
  SITE_PRESENCE_HOST,
  SITE_PRESENCE_KIND,
  SITE_PRESENCE_PATH,
  SITE_PRESENCE_ORIGIN,
  sitePresencePayload,
  postSitePresence,
} from "./src/sitePresence.js";

function mockDbEnv(extra) {
  const stmt = {
    bind() { return stmt; },
    async first() { return { n: 0 }; },
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

function meshGet() {
  return new Response(JSON.stringify({
    enabled: false,
    status: "unavailable",
  }), { status: 404, headers: { "Content-Type": "application/json" } });
}

describe("site presence payload", () => {
  it("posts host godlock.uk, integer viewers, and kind human-page", () => {
    assert.deepEqual(sitePresencePayload(12), {
      host: "godlock.uk",
      viewers: 12,
      kind: "human-page",
    });
    assert.equal(SITE_PRESENCE_HOST, "godlock.uk");
    assert.equal(SITE_PRESENCE_KIND, "human-page");
    assert.equal(SITE_PRESENCE_PATH, "/v1/mesh/site-presence");
    assert.deepEqual(sitePresencePayload("0"), { host: "godlock.uk", viewers: 0, kind: "human-page" });
  });

  it("does not invent a count for bad, fractional, negative, or over-cap viewers", () => {
    assert.equal(sitePresencePayload(null), null);
    assert.equal(sitePresencePayload(undefined), null);
    assert.equal(sitePresencePayload(true), null);
    assert.equal(sitePresencePayload(1.5), null);
    assert.equal(sitePresencePayload(-1), null);
    assert.equal(sitePresencePayload("12abc"), null);
    assert.equal(sitePresencePayload(10_001), null);
  });
});

describe("postSitePresence", () => {
  it("prefers the AZIEL_RUNTIME binding and sends the godlock.uk body", async () => {
    const calls = [];
    let originHits = 0;
    const env = {
      AZIEL_RUNTIME: {
        async fetch(req) {
          calls.push({
            method: req.method,
            url: String(req.url),
            body: await req.json(),
          });
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        },
      },
    };
    const result = await postSitePresence(env, 7, {
      fetch: async () => {
        originHits += 1;
        throw new Error("binding present");
      },
    });
    assert.equal(result.ok, true);
    assert.equal(result.posted, true);
    assert.equal(result.via, "service-binding");
    assert.equal(result.host, "godlock.uk");
    assert.equal(result.viewers, 7);
    assert.equal(originHits, 0);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, "POST");
    assert.match(calls[0].url, /\/v1\/mesh\/site-presence$/);
    assert.deepEqual(calls[0].body, { host: "godlock.uk", viewers: 7, kind: "human-page" });
  });

  it("uses the HTTPS origin when the service binding is absent", async () => {
    const calls = [];
    const result = await postSitePresence({}, 3, {
      probeOrigin: true,
      fetch: async (url, init) => {
        calls.push({ url: String(url), method: init.method, body: JSON.parse(init.body) });
        return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
      },
    });
    assert.equal(result.via, "origin");
    assert.equal(result.host, "godlock.uk");
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, "POST");
    assert.equal(calls[0].url, SITE_PRESENCE_ORIGIN + "/v1/mesh/site-presence");
    assert.deepEqual(calls[0].body, { host: "godlock.uk", viewers: 3, kind: "human-page" });
  });

  it("does not invent viewers when the POST fails", async () => {
    const result = await postSitePresence({
      AZIEL_RUNTIME: {
        async fetch() {
          throw new Error("binding down");
        },
      },
    }, 4);
    assert.equal(result.ok, false);
    assert.equal(result.posted, false);
    assert.equal(result.viewers, 4);
    const refused = await postSitePresence({
      AZIEL_RUNTIME: {
        async fetch() {
          return new Response(JSON.stringify({ ok: false, code: "MESH-SITE-HOST" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        },
      },
    }, 4);
    assert.equal(refused.ok, false);
    assert.equal(refused.posted, true);
    assert.equal(refused.viewers, 4);
  });
});

describe("godlock.uk worker site-presence", () => {
  it("POSTs the local human count without blocking the page", async () => {
    let release;
    const gate = new Promise((resolve) => { release = resolve; });
    const posts = [];
    const env = mockDbEnv({
      AZIEL_RUNTIME: {
        async fetch(req) {
          const url = String(req.url);
          if (req.method === "POST" && url.includes("/v1/mesh/site-presence")) {
            posts.push(await req.json());
            await gate;
            return new Response(JSON.stringify({ ok: false }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }
          return meshGet();
        },
      },
    });
    const pending = [];
    const resPromise = worker.fetch(
      new Request("https://godlock.uk/", { headers: { "User-Agent": "Mozilla/5.0" } }),
      env,
      { waitUntil(p) { pending.push(p); } },
    );
    const res = await Promise.race([
      resPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("page render blocked on site-presence")), 400)),
    ]);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /id="LiveNodes">1</);
    release();
    await Promise.all(pending);
    assert.equal(posts.length, 1);
    assert.deepEqual(posts[0], { host: "godlock.uk", viewers: 1, kind: "human-page" });
  });

  it("does not report a bot as a human viewer", async () => {
    const posts = [];
    const env = mockDbEnv({
      AZIEL_RUNTIME: {
        async fetch(req) {
          if (req.method === "POST") posts.push(await req.json());
          return meshGet();
        },
      },
    });
    const pending = [];
    const res = await worker.fetch(
      new Request("https://godlock.uk/", { headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" } }),
      env,
      { waitUntil(p) { pending.push(p); } },
    );
    assert.equal(res.status, 200);
    await Promise.all(pending);
    assert.equal(posts.length, 1);
    assert.deepEqual(posts[0], { host: "godlock.uk", viewers: 0, kind: "human-page" });
  });
});
