import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import { observationFromDocument } from "./src/runtimeObserve.js";
import { RUNTIME_GIT_SHA, RUNTIME_SOT, RUNTIME_VERSION_ID } from "./src/launchReady.js";
import {
  shelvesDoc,
  CODEBERG_TIP_PACK,
  LOCKSET_JSON_SHA256,
  LOCKSET_TIP,
  FRAMAGIT_DEPOSIT,
  FRAMAGIT_TIP_PACK_URL,
  PLANE_B_ALL_TARGETS,
  PLANE_B_WORKING_TARGETS,
  GITFLIC_REFUSE,
} from "./src/shelves.js";
import { memoryStore } from "./src/sotOutlet.js";

const LIVE_SHA = "5e6fc284868b4e87ae5782c85c6025dd912db5cc";
const LIVE_SHORT = "5e6fc284";
const LIVE_VID = "210395ed-89f2-4f0b-be4e-6f5a164652e4";
const SOURCE_DATE = "Tue, 10 Nov 2026 00:39:56 GMT";

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
    RUNTIME_CITE_CACHE: new Map(),
    RUNTIME_OBSERVE_TIMEOUT_MS: 40,
    RUNTIME_OBSERVE_TTL_MS: 60_000,
    RUNTIME_OBSERVE_NEGATIVE_TTL_MS: 15_000,
    ...extra,
  };
}

function healthDoc(extra = {}) {
  return {
    ok: true,
    author: "Aziel Eliab",
    identity: "Aziel Eliab",
    version: "2.0.0-rc1",
    git_sha: LIVE_SHA,
    version_id: LIVE_VID,
    ...extra,
  };
}

function jsonResponse(doc, status = 200, headers = {}) {
  return new Response(JSON.stringify(doc), {
    status,
    headers: { "content-type": "application/json", date: SOURCE_DATE, ...headers },
  });
}

function binding(handler, urls) {
  return {
    async fetch(req) {
      const url = String(req && req.url ? req.url : req);
      urls.push(url);
      return handler(req, url);
    },
  };
}

async function cite(env) {
  const res = await worker.fetch(new Request("https://godlock.uk/cite.json"), env);
  assert.equal(res.status, 200);
  return res.json();
}

describe("runtime cite observation", () => {
  it("publishes a current health observation distinct from the floor", async () => {
    const urls = [];
    let now = Date.parse("2026-11-10T00:40:00.000Z");
    const env = mockEnv({
      RUNTIME_NOW_MS: () => now,
      AZIEL_RUNTIME: binding(() => jsonResponse(healthDoc()), urls),
    });
    const body = await cite(env);
    assert.equal(body.runtime_sot_live, true);
    assert.equal(body.runtime_sot_status, "current");
    assert.equal(body.runtime_live.role, "live");
    assert.equal(body.runtime_live.git_sha, LIVE_SHA);
    assert.equal(body.runtime_live.git_sha_short, LIVE_SHORT);
    assert.equal(body.runtime_live.version_id, LIVE_VID);
    assert.equal(body.runtime_live.cite, "main " + LIVE_SHORT + " / 2.0.0-rc1");
    assert.equal(body.runtime_live.observed_at, "2026-11-10T00:40:00.000Z");
    assert.equal(body.runtime_live.source_date, SOURCE_DATE);
    assert.equal(body.runtime_live.matches_floor, false);
    assert.equal(body.runtime_observation.status, "current");
    assert.equal(body.runtime_observation.observed_at, "2026-11-10T00:40:00.000Z");
    assert.equal(body.runtime_floor.role, "floor");
    assert.equal(body.runtime_floor.live, false);
    assert.equal(body.runtime_floor.git_sha, RUNTIME_GIT_SHA);
    assert.equal(body.runtime_floor.version_id, RUNTIME_VERSION_ID);
    assert.equal(body.runtime_floor.read_at, "2026-10-30");
    assert.equal(body.runtime_floor.cite, RUNTIME_SOT);
    assert.equal(body.runtime_expected, null);
    assert.notEqual(body.runtime_live.git_sha, body.runtime_floor.git_sha);
    assert.notEqual(body.runtime_live.version_id, body.runtime_floor.version_id);

    now += 1000;
    const again = await cite(env);
    assert.equal(again.runtime_live.observed_at, "2026-11-10T00:40:00.000Z");
    const healthUrls = () => urls.filter((u) => u.includes("/v1/health"));
    assert.equal(healthUrls().length, 1);
    assert.ok(urls.every((u) => !u.includes("/v1/software") && !u.includes("/download") && !u.includes("/v1/mesh")));

    const html = await (await worker.fetch(new Request("https://godlock.uk/software", {
      headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
    }), env)).text();
    assert.match(html, new RegExp("SoT LIVE main " + LIVE_SHORT));
    assert.match(html, /2026-11-10T00:40:00.000Z/);
    assert.match(html, /SoT floor main ce673365/);
    assert.equal(healthUrls().length, 1);
  });

  it("keeps a stale observation from becoming the live tip", async () => {
    const urls = [];
    let now = Date.parse("2026-11-10T01:00:00.000Z");
    let fail = false;
    const env = mockEnv({
      RUNTIME_NOW_MS: () => now,
      AZIEL_RUNTIME: binding(() => {
        if (fail) throw new Error("origin down");
        return jsonResponse(healthDoc());
      }, urls),
    });
    const first = await cite(env);
    assert.equal(first.runtime_observation.status, "current");
    fail = true;
    now += 61_000;
    const stale = await cite(env);
    assert.equal(stale.runtime_observation.status, "stale");
    assert.equal(stale.runtime_observation.git_sha, LIVE_SHA);
    assert.equal(stale.runtime_observation.observed_at, "2026-11-10T01:00:00.000Z");
    assert.equal(stale.runtime_observation.refresh_status, "unavailable");
    assert.equal(stale.runtime_observation.refresh_attempted_at, "2026-11-10T01:01:01.000Z");
    assert.equal(stale.runtime_live, null);
    assert.equal(stale.runtime_git_sha, null);
    assert.equal(stale.runtime_sot_live, false);
    assert.equal(stale.runtime_sot_status, "stale");
    assert.equal(stale.runtime_floor.git_sha, RUNTIME_GIT_SHA);
    assert.equal(urls.filter((u) => u.includes("/v1/health")).length, 2);
    assert.ok(urls.every((u) => !u.includes("/v1/software") && !u.includes("/download")));
  });

  it("does not stamp the floor when health is unavailable", async () => {
    const urls = [];
    const env = mockEnv({
      AZIEL_RUNTIME: binding(() => {
        throw new Error("econnrefused");
      }, urls),
    });
    const body = await cite(env);
    assert.equal(body.runtime_observation.status, "unavailable");
    assert.equal(body.runtime_observation.git_sha, null);
    assert.equal(body.runtime_live, null);
    assert.equal(body.runtime_git_sha, null);
    assert.equal(body.runtime_sot, null);
    assert.equal(body.runtime_sot_live, false);
    assert.equal(body.runtime_floor.git_sha, RUNTIME_GIT_SHA);
    assert.notEqual(body.runtime_floor.git_sha, null);
    const html = await (await worker.fetch(new Request("https://godlock.uk/software", {
      headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
    }), env)).text();
    assert.match(html, /live tip not confirmed/);
    assert.doesNotMatch(html, /SoT LIVE/);
    assert.match(html, /ce673365/);
  });

  it("classifies an aborted health read as timeout and stamps no tip", async () => {
    const urls = [];
    const env = mockEnv({
      AZIEL_RUNTIME: binding((req) => new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve(jsonResponse(healthDoc())), 10_000);
        if (timer.unref) timer.unref();
        const fail = () => {
          clearTimeout(timer);
          const err = new Error("The operation was aborted");
          err.name = "AbortError";
          reject(err);
        };
        const signal = req && req.signal;
        if (signal) {
          if (signal.aborted) fail();
          else signal.addEventListener("abort", fail, { once: true });
        }
      }), urls),
    });
    const body = await cite(env);
    assert.equal(body.runtime_observation.status, "timeout");
    assert.equal(body.runtime_observation.code, "RUNTIME-OBSERVE-TIMEOUT");
    assert.equal(body.runtime_live, null);
    assert.equal(body.runtime_git_sha, null);
    assert.equal(body.runtime_sot_live, false);
    assert.equal(body.runtime_floor.version_id, RUNTIME_VERSION_ID);
    assert.ok(urls.some((u) => u.includes("/v1/health")));
  });

  it("refuses malformed health bodies, including the unexposed version id", async () => {
    const badSha = await cite(mockEnv({
      AZIEL_RUNTIME: binding(() => jsonResponse({ author: "Aziel Eliab", git_sha: "not-a-sha", version: "2.0.0-rc1" }), []),
    }));
    assert.equal(badSha.runtime_observation.status, "malformed");
    assert.equal(badSha.runtime_live, null);
    assert.equal(badSha.runtime_git_sha, null);
    assert.equal(badSha.runtime_floor.git_sha, RUNTIME_GIT_SHA);

    const notJson = await cite(mockEnv({
      AZIEL_RUNTIME: binding(() => new Response("nope", {
        status: 200,
        headers: { "content-type": "application/json" },
      }), []),
    }));
    assert.equal(notJson.runtime_observation.status, "malformed");
    assert.equal(notJson.runtime_live, null);

    const hidden = await cite(mockEnv({
      AZIEL_RUNTIME: binding(() => jsonResponse(healthDoc({ version_id: "105fa1ee" })), []),
    }));
    assert.equal(hidden.runtime_observation.status, "malformed");
    assert.equal(hidden.runtime_live, null);
    assert.equal(hidden.runtime_version_id, undefined);
    assert.equal(hidden.runtime_floor.version_id, RUNTIME_VERSION_ID);
    assert.doesNotMatch(JSON.stringify(hidden.runtime_live), /105fa1ee/);
    assert.doesNotMatch(JSON.stringify(hidden.runtime_git_sha), /105fa1ee/);
  });

  it("keeps a sealed expectation distinct from a failed live read", async () => {
    const env = mockEnv({ SOT_STORE: memoryStore() });
    const pushed = await (await worker.fetch(new Request("https://godlock.uk/v1/sot/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confirm: true,
        outlet_id: "godlock-uk",
        author: "Aziel Eliab",
        git_sha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        version: "2.0.0-rc1",
        version_id: "12345678-9abc-4def-8123-456789abcdef",
      }),
    }), env)).json();
    assert.equal(pushed.applied, true);
    env.AZIEL_RUNTIME = binding(() => new Response(null, { status: 503 }), []);
    const body = await cite(env);
    assert.equal(body.runtime_expected.git_sha, "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
    assert.equal(body.runtime_expected.live, false);
    assert.equal(body.runtime_expected.role, "expected");
    assert.equal(body.runtime_observation.status, "unavailable");
    assert.equal(body.runtime_live, null);
    assert.equal(body.runtime_git_sha, null);
    assert.notEqual(body.runtime_expected.git_sha, body.runtime_floor.git_sha);
  });

  it("classifies a non-object health document as malformed", () => {
    const obs = observationFromDocument(["nope"], { attempted_at: "2026-11-10T00:00:00.000Z" });
    assert.equal(obs.status, "malformed");
    assert.equal(obs.git_sha, null);
    assert.equal(obs.current, false);
  });
});

describe("cold shelf gates stay closed", () => {
  it("keeps Plane B slot and states the Framagit deposit without a URL", async () => {
    const doc = shelvesDoc();
    assert.equal(doc.independent_live_count, 1);
    assert.equal(doc.planes.A.status, "live");
    assert.equal(doc.planes.B.status, "slot");
    assert.equal(doc.planes.B.live_ready, false);
    assert.equal(doc.planes.B.refuse, PLANE_B_ALL_TARGETS);
    assert.deepEqual(doc.planes.B.working_targets, PLANE_B_WORKING_TARGETS.slice());
    assert.equal(doc.planes.B.hash_verify, "pass");
    assert.equal(doc.planes.C.live_ready, false);
    const framagit = doc.registry.shelves.find((s) => s.id === "plane-b-framagit-tip-pack");
    assert.equal(framagit.status, "slot");
    assert.equal(framagit.url, null);
    assert.equal(framagit.url, FRAMAGIT_TIP_PACK_URL);
    assert.equal(framagit.live_ready, false);
    assert.equal(framagit.refuse, "CNS-NO-FORGE-MIRROR");
    assert.equal(framagit.deposit, FRAMAGIT_DEPOSIT);
    assert.equal(framagit.deposit.live, false);
    assert.equal(framagit.deposit.url, null);
    assert.equal(framagit.deposit.pack_sha256, CODEBERG_TIP_PACK);
    assert.equal(framagit.deposit.lockset_sha256, LOCKSET_JSON_SHA256);
    assert.equal(framagit.deposit.lockset_tip, LOCKSET_TIP);
    assert.equal(framagit.deposit.sha256sums_lists_pack, false);
    assert.equal(framagit.deposit.zenodo, false);
    assert.equal(framagit.deposit.gitflic_is_target, false);
    assert.deepEqual(framagit.deposit.files, ["aziel-tip-pack.tar", "SHA256SUMS", "lockset.json", "verify-airgap.sh"]);
    const gitflic = doc.registry.shelves.find((s) => s.id === "plane-b-gitflic-ru-tip-pack");
    assert.equal(gitflic.status, "refused");
    assert.equal(gitflic.refuse, GITFLIC_REFUSE);
    const zenodo = doc.registry.shelves.find((s) => s.id === "plane-b-zenodo-tip-pack");
    assert.equal(zenodo.doi, null);
    assert.equal(zenodo.zenodo_live, false);
    assert.ok(!doc.live.includes("plane-b-codeberg-tip-pack"));
    assert.ok(!doc.live.includes("plane-b-framagit-tip-pack"));

    const res = await worker.fetch(new Request("https://godlock.uk/v1/shelves"), mockEnv());
    const served = await res.json();
    assert.equal(served.independent_live_count, 1);
    assert.equal(served.planes.B.live_ready, false);
    assert.equal(served.planes.B.refuse, "CNS-PLANE-B-ALL-TARGETS");
    const servedFramagit = served.registry.shelves.find((s) => s.id === "plane-b-framagit-tip-pack");
    assert.equal(servedFramagit.live_ready, false);
    assert.equal(servedFramagit.url, null);
    assert.equal(servedFramagit.deposit.pack_sha256, CODEBERG_TIP_PACK);
  });
});
