import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import {
  OUTLET_ID,
  SOT_AUTHORITY,
  SOT_BINDING_URL,
  SOT_CONFIRM_REQUIRED,
  SOT_DRY_RUN,
  SOT_UNREACHABLE,
  SOT_VERSION_ID_UNEXPOSED,
  UNEXPOSED_VERSION_ID,
  d1MetadataStore,
  memoryStore,
  parseSotDocument,
  runSotSync,
} from "./src/sotOutlet.js";
import { floorRuntimeCite, RUNTIME_GIT_SHA, RUNTIME_SOT } from "./src/launchReady.js";
import { siteOpenApi } from "./src/seo.js";

const NEXT_SHA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const NEXT_VERSION = "9.9.9-test";
const EXPOSED_VERSION_ID = "cafebabe";

function nextDoc(extra = {}) {
  return {
    ok: true,
    author: "Aziel Eliab",
    identity: "Aziel Eliab",
    version: NEXT_VERSION,
    git_sha: NEXT_SHA,
    count: 42,
    software: [
      { slug: "godlock", name: "GodLock" },
      { slug: "askjeeves", name: "Ask Jeeves" },
    ],
    ...extra,
  };
}

function mockEnv(extra = {}) {
  const stmt = {
    bind() { return stmt; },
    async first() { return null; },
    async all() { return { results: [] }; },
    async run() { return { success: true }; },
  };
  return {
    DB: { prepare() { return stmt; }, async batch() { return []; } },
    MESH_PROBE_ORIGIN: false,
    ...extra,
  };
}

function jsonResponse(doc, status = 200) {
  return new Response(JSON.stringify(doc), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function recordingFetch(doc, urls, status = 200) {
  return async (url) => {
    const href = String(url);
    urls.push(href);
    if (href.includes("/download")) throw new Error("download counter path touched");
    return jsonResponse(doc, status);
  };
}

async function post(env, path, body) {
  return worker.fetch(new Request("https://godlock.uk" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify(body),
  }), env);
}

describe("godlock-uk SoT mesh outlet", () => {
  it("publishes the pull/push contract on GET /v1/sot", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/v1/sot"), mockEnv());
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.outlet_id, OUTLET_ID);
    assert.equal(body.op, "sot_sync");
    assert.equal(body.spec, "SOT-SYNC-1.0");
    assert.equal(body.author, "Aziel Eliab");
    assert.equal(body.identity, "Aziel Eliab");
    assert.equal(body.authority, SOT_AUTHORITY);
    assert.equal(body.pull.path, "/v1/sot/sync");
    assert.equal(body.pull.method, "POST");
    assert.match(body.pull.reads, /GET \/v1\/software/);
    assert.match(body.pull.reads, /Never GET \/download/);
    assert.equal(body.push.path, "/v1/sot/push");
    assert.equal(body.push.outlet_id, "godlock-uk");
    assert.equal(body.gate.missing, SOT_CONFIRM_REQUIRED);
    assert.match(body.gate.dry_run, /Preview/);
    assert.match(body.gate.confirm, /consent/);
    assert.equal(body.unreachable.keep, "last-known");
    assert.equal(body.unreachable.status, "unreachable");
    assert.equal(body.godlock_first, true);
    assert.equal(body.full_softwares_mirror, false);
    assert.equal(body.ask_jeeves_softwares_peer, false);
    assert.equal(body.download_counters_touched, false);
    assert.match(body.version_id_policy, /105fa1ee/);
    assert.equal(body.current.cite, RUNTIME_SOT);
    assert.equal(body.current.status, "floor");
    assert.equal(body.current.version_id, null);
    const alias = await (await worker.fetch(new Request("https://godlock.uk/v1/sot/sync"), mockEnv())).json();
    assert.equal(alias.outlet_id, OUTLET_ID);
    const openapi = siteOpenApi();
    assert.ok(openapi.paths["/v1/sot"]);
    assert.ok(openapi.paths["/v1/sot/sync"].post);
    assert.ok(openapi.paths["/v1/sot/push"].post);
  });

  it("refuses a pull that is neither dry_run nor confirm, and does not fetch", async () => {
    const urls = [];
    const env = mockEnv({ SOT_STORE: memoryStore(), SOT_FETCH: recordingFetch(nextDoc(), urls) });
    const res = await post(env, "/v1/sot/sync", {});
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.ok, false);
    assert.equal(body.code, SOT_CONFIRM_REQUIRED);
    assert.equal(body.applied, false);
    assert.equal(body.mutated, false);
    assert.equal(body.receipt, null);
    assert.equal(body.download_counters_touched, false);
    assert.deepEqual(urls, []);
  });

  it("dry_run previews a pull and leaves the floor cite in place", async () => {
    const urls = [];
    const store = memoryStore();
    const env = mockEnv({ SOT_STORE: store, SOT_FETCH: recordingFetch(nextDoc(), urls) });
    const res = await post(env, "/v1/sot/sync", { dry_run: true });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.code, SOT_DRY_RUN);
    assert.equal(body.dry_run, true);
    assert.equal(body.applied, false);
    assert.equal(body.receipt, null);
    assert.equal(body.would.git_sha, NEXT_SHA);
    assert.equal(body.would.git_sha_short, "aaaaaaa");
    assert.equal(body.would.version, NEXT_VERSION);
    assert.equal(body.would.cite, "main aaaaaaa / " + NEXT_VERSION);
    assert.equal(body.would.cards_applied, 0);
    assert.equal(body.software_cards_applied, 0);
    assert.equal(body.download_counters_touched, false);
    assert.equal(body.version_id_claimed, false);
    assert.deepEqual(urls, [SOT_AUTHORITY]);
    const current = await (await worker.fetch(new Request("https://godlock.uk/v1/sot"), env)).json();
    assert.equal(current.current.git_sha, RUNTIME_GIT_SHA);
    assert.equal(current.receipt, null);
  });

  it("confirm pull updates cite strings, seals a receipt, and does not invent cards", async () => {
    const urls = [];
    const env = mockEnv({ SOT_STORE: memoryStore(), SOT_FETCH: recordingFetch(nextDoc(), urls) });
    const res = await post(env, "/v1/sot/sync", { confirm: true, outlet_id: "godlock-uk" });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.applied, true);
    assert.equal(body.status, "live");
    assert.equal(body.cite.git_sha, NEXT_SHA);
    assert.equal(body.cite.git_sha_short, "aaaaaaa");
    assert.equal(body.cite.version, NEXT_VERSION);
    assert.equal(body.cite.version_id, null);
    assert.equal(body.receipt.outlet_id, "godlock-uk");
    assert.equal(body.receipt.action, "sot-sync");
    assert.equal(body.receipt.download_counters_touched, false);
    assert.equal(body.receipt.software_cards_applied, 0);
    assert.equal(body.receipt.author, "Aziel Eliab");
    assert.equal(body.receipt.previous_hash, "0".repeat(64));
    assert.equal(body.receipt.entry_hash.length, 64);
    assert.equal(body.software_cards_applied, 0);
    assert.equal(body.ask_jeeves_softwares_peer, false);
    assert.ok(!urls.some((u) => u.includes("/download")));

    const cite = await (await worker.fetch(new Request("https://godlock.uk/cite.json"), env)).json();
    assert.equal(cite.runtime_git_sha, NEXT_SHA);
    assert.equal(cite.runtime_git_sha_short, "aaaaaaa");
    assert.equal(cite.runtime_version, NEXT_VERSION);
    assert.equal(cite.runtime_sot, "main aaaaaaa / " + NEXT_VERSION);
    assert.equal(cite.runtime_sot_live, true);
    assert.equal(cite.runtime_version_id, undefined);
    assert.equal(cite.identity, "Aziel Eliab");
    assert.doesNotMatch(JSON.stringify(cite), new RegExp(UNEXPOSED_VERSION_ID));

    const software = await (await worker.fetch(new Request("https://godlock.uk/v1/software"), env)).json();
    assert.equal(software.runtime_git_sha_short, "aaaaaaa");
    assert.equal(software.runtime_version, NEXT_VERSION);
    assert.equal(software.product_count, 1);
    assert.equal(software.suite_count, 1);
    assert.equal(software.cloned_suite, false);
    assert.deepEqual(software.products.map((p) => p.slug), ["aziel-runtime"]);
    assert.ok(!software.products.some((p) => p.slug === "askjeeves"));

    const html = await (await worker.fetch(new Request("https://godlock.uk/software", {
      headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
    }), env)).text();
    assert.match(html, /main aaaaaaa \/ 9\.9\.9-test/);
    assert.match(html, /id="godlock"/);
    assert.ok(html.indexOf('id="godlock"') < html.indexOf('id="aziel-runtime"'));
    assert.doesNotMatch(html, /Ask Jeeves/);
    assert.doesNotMatch(html, new RegExp(UNEXPOSED_VERSION_ID));

    const llms = await (await worker.fetch(new Request("https://godlock.uk/llms.txt"), env)).text();
    assert.match(llms, /SoT LIVE: main aaaaaaa \/ 9\.9\.9-test/);
    assert.doesNotMatch(llms, /Ask Jeeves/);
  });

  it("chains a second confirm receipt and prefers the service binding", async () => {
    const httpsUrls = [];
    const bindingUrls = [];
    const env = mockEnv({
      SOT_STORE: memoryStore(),
      AZIEL_RUNTIME: {
        async fetch(req) {
          bindingUrls.push(String(req.url));
          return jsonResponse(nextDoc());
        },
      },
      SOT_FETCH: recordingFetch(nextDoc({ version: "should-not-apply" }), httpsUrls),
    });
    const first = await (await post(env, "/v1/sot/sync", { confirm: true })).json();
    const secondDoc = nextDoc({
      git_sha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      version: "9.9.8-test",
    });
    env.AZIEL_RUNTIME = {
      async fetch(req) {
        bindingUrls.push(String(req.url));
        return jsonResponse(secondDoc);
      },
    };
    const second = await (await post(env, "/v1/sot/sync", { confirm: true })).json();
    assert.equal(second.receipt.previous_hash, first.receipt.entry_hash);
    assert.equal(second.cite.git_sha_short, "bbbbbbb");
    assert.equal(second.cite.version, "9.9.8-test");
    assert.deepEqual(httpsUrls, []);
    assert.ok(bindingUrls.every((u) => u.includes("/v1/software") && !u.includes("/download")));
    assert.ok(bindingUrls.includes(SOT_BINDING_URL) || bindingUrls.some((u) => u.startsWith(SOT_BINDING_URL)));
  });

  it("push confirm updates the cite and ignores software cards", async () => {
    const env = mockEnv({ SOT_STORE: memoryStore() });
    const res = await post(env, "/v1/sot/push", {
      op: "sot_sync",
      outlet_id: "godlock-uk",
      ...nextDoc(),
      confirm: true,
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.applied, true);
    assert.equal(body.direction, "push");
    assert.equal(body.software_cards_applied, 0);
    assert.equal(body.cite.observed_count, 42);
    const software = await (await worker.fetch(new Request("https://godlock.uk/v1/software"), env)).json();
    assert.deepEqual(software.products.map((p) => p.slug), ["aziel-runtime"]);
    assert.equal(software.cloned_suite, false);
  });

  it("refuses unexposed version_id 105fa1ee and a foreign identity", async () => {
    const env = mockEnv({ SOT_STORE: memoryStore() });
    const refused = await (await post(env, "/v1/sot/push", {
      confirm: true,
      git_sha: NEXT_SHA,
      version: NEXT_VERSION,
      version_id: UNEXPOSED_VERSION_ID,
      author: "Aziel Eliab",
    })).json();
    assert.equal(refused.ok, false);
    assert.equal(refused.code, SOT_VERSION_ID_UNEXPOSED);
    assert.equal(refused.version_id_claimed, false);
    assert.equal(refused.applied, false);
    const current = await (await worker.fetch(new Request("https://godlock.uk/v1/sot"), env)).json();
    assert.equal(current.current.git_sha, RUNTIME_GIT_SHA);
    assert.equal(current.current.version_id, null);
    assert.doesNotMatch(current.current.cite, /105fa1ee/);

    const identity = await (await post(env, "/v1/sot/push", {
      confirm: true,
      git_sha: NEXT_SHA,
      version: NEXT_VERSION,
      author: "Someone Else",
    })).json();
    assert.equal(identity.code, "SOT-IDENTITY");
    assert.equal(identity.identity, "Aziel Eliab");

    const mismatch = await (await post(env, "/v1/sot/push", {
      confirm: true,
      outlet_id: "other-hub",
      git_sha: NEXT_SHA,
      version: NEXT_VERSION,
    })).json();
    assert.equal(mismatch.code, "SOT-OUTLET-MISMATCH");
  });

  it("keeps an exposed version_id that is not 105fa1ee", () => {
    const parsed = parseSotDocument({
      author: "Aziel Eliab",
      git_sha: NEXT_SHA,
      version: NEXT_VERSION,
      version_id: EXPOSED_VERSION_ID,
    });
    assert.equal(parsed.ok, true);
    assert.equal(parsed.cite.version_id, EXPOSED_VERSION_ID);
    assert.match(parsed.cite.cite, new RegExp("version_id " + EXPOSED_VERSION_ID));
    const omitted = parseSotDocument({ author: "Aziel Eliab", git_sha: NEXT_SHA, version: NEXT_VERSION });
    assert.equal(omitted.cite.version_id, null);
    assert.doesNotMatch(omitted.cite.cite, /version_id/);
  });

  it("unreachable pull keeps the last-known cite and says so", async () => {
    const urls = [];
    const env = mockEnv({
      SOT_STORE: memoryStore(),
      SOT_FETCH: async (url) => {
        urls.push(String(url));
        throw new Error("origin down");
      },
    });
    const preview = await (await post(env, "/v1/sot/sync", { dry_run: true })).json();
    assert.equal(preview.status, "unreachable");
    assert.equal(preview.applied, false);
    assert.equal(preview.receipt, null);
    assert.equal(preview.kept, "last-known");
    assert.equal(preview.live, false);
    assert.match(preview.note, /Last-known cite kept/);
    assert.equal(preview.would.git_sha, floorRuntimeCite().git_sha);

    const applied = await (await post(env, "/v1/sot/sync", { confirm: true })).json();
    assert.equal(applied.code, SOT_UNREACHABLE);
    assert.equal(applied.applied, false);
    assert.equal(applied.cite_changed, false);
    assert.equal(applied.live, false);
    assert.equal(applied.kept, "last-known");
    assert.equal(applied.honest, true);
    assert.equal(applied.cite.git_sha, RUNTIME_GIT_SHA);
    assert.equal(applied.cite.version, "2.0.0-rc1");
    assert.equal(applied.receipt.status, "unreachable");
    assert.equal(applied.receipt.download_counters_touched, false);
    assert.ok(urls.every((u) => u === SOT_AUTHORITY));

    const cite = await (await worker.fetch(new Request("https://godlock.uk/cite.json"), env)).json();
    assert.equal(cite.runtime_git_sha, RUNTIME_GIT_SHA);
    assert.equal(cite.runtime_sot, RUNTIME_SOT);
    assert.equal(cite.runtime_sot_live, false);
    assert.equal(cite.runtime_sot_status, "unreachable");
    const llms = await (await worker.fetch(new Request("https://godlock.uk/llms.txt"), env)).text();
    assert.match(llms, /SoT last-known: main 231b02f \/ 2\.0\.0-rc1/);
    assert.doesNotMatch(llms, /SoT LIVE:/);
  });

  it("persists through the D1 metadata store", async () => {
    const rows = new Map();
    const stmt = {
      sql: "",
      args: [],
      bind(...args) { this.args = args; return this; },
      async first() {
        if (this.sql.includes("SELECT value")) {
          return rows.has(this.args[0]) ? { value: rows.get(this.args[0]) } : null;
        }
        return null;
      },
      async run() {
        if (this.sql.includes("INSERT INTO metadata(key, value)")) rows.set(this.args[0], this.args[1]);
        return { success: true };
      },
    };
    const env = {
      DB: {
        prepare(sql) { stmt.sql = sql; stmt.args = []; return stmt; },
        async batch() { return []; },
      },
    };
    const store = d1MetadataStore(env);
    const result = await runSotSync({
      direction: "push",
      body: { confirm: true, ...nextDoc() },
      env,
      store,
    });
    assert.equal(result.applied, true);
    const again = await store.get("sot_outlet");
    assert.equal(again.cite.git_sha_short, "aaaaaaa");
    const cite = await (await worker.fetch(new Request("https://godlock.uk/cite.json"), env)).json();
    assert.equal(cite.runtime_git_sha_short, "aaaaaaa");
  });
});
