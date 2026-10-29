import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hashReceipt } from "./src/engine.js";
import {
  LATTICE_AGGREGATE_SCOPE,
  LATTICE_POLICY,
  PRIMARY_TARGET,
  SECONDARY_TARGET,
  latticeOfflineSecondary,
  latticePrimary,
  planLattice,
  pullLocal,
  wrapLedgerEntry,
  handleLatticeHttp,
} from "./src/lattice.js";
import {
  boundHeadline,
  factorAveragePercent,
  dualMeshPercent,
  scoreAgainst,
  UNCERTAINTY_FLOOR,
  UNCERTAINTY_CAP,
} from "./src/debateScore.js";
import worker from "./src/index.js";

const D = "a".repeat(64);
const E = "b".repeat(64);

describe("headline is the six-factor average", () => {
  const six = {
    physics: 0.1,
    linguistics: 0.1,
    bayesian: 0.1,
    truth_formula: 0.1,
    clce: 0.1,
    spre: 0.1,
  };

  it("averages applicable factors and does not use the triad product", () => {
    assert.equal(factorAveragePercent(six), 25);
    assert.equal(factorAveragePercent({
      physics: 0.9, linguistics: 0.9, bayesian: 0.9, truth_formula: 0.9, clce: 0.9, spre: 0.9,
    }), 75);
    assert.equal(factorAveragePercent({ physics: 0.4, linguistics: 0.6, bayesian: null, truth_formula: null, clce: null, spre: null }), 50);
    assert.equal(boundHeadline(10), UNCERTAINTY_FLOOR);
    assert.equal(boundHeadline(90), 100 - UNCERTAINTY_FLOOR);
    assert.equal(100 - boundHeadline(10), UNCERTAINTY_CAP);
    assert.equal(100 - boundHeadline(90), UNCERTAINTY_FLOOR);
  });

  it("meshes provenance with debate, then scores that pair against the triad", () => {
    assert.equal(dualMeshPercent(40, 80), 60);
    assert.deepEqual(scoreAgainst(60, 40), { paired: 50, gap: 20 });
  });
});

describe("bidirectional lattice", () => {
  it("keeps live, auto-update, RF, and sat off, and does not treat Cap-7 as ICANN", () => {
    assert.equal(LATTICE_POLICY.live, false);
    assert.equal(LATTICE_POLICY.auto_update, false);
    assert.equal(LATTICE_POLICY.rf, false);
    assert.equal(LATTICE_POLICY.sat, false);
    assert.equal(LATTICE_POLICY.cap7_is_icann, false);
    assert.equal(LATTICE_POLICY.spend, false);
    assert.equal(LATTICE_POLICY.primary_target, PRIMARY_TARGET);
    assert.equal(LATTICE_POLICY.secondary_target, SECONDARY_TARGET);
  });

  it("pins the offline secondary hash and the username tie-break", () => {
    const off = latticeOfflineSecondary(D, "aziel");
    assert.equal(off, "7e1ea25d11c9c05dbb7844a69f83456fa56c7dbc67cadb913b16459e6e7a1a85");
    const primary = latticePrimary(D, "0".repeat(64));
    const block = planLattice({ document_hash: D, offline: true, username: "ada", rows: [] });
    assert.equal(block.offline, true);
    assert.equal(block.username, "ada");
    assert.notEqual(block.username, "godlock");
    assert.equal(block.primary, primary);
    assert.equal(Object.prototype.hasOwnProperty.call(block, "position"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(block, "tiebreak"), false);
  });

  it("wraps after the ledger hash and pulls that entry_hash back without rebuilding from zero", async () => {
    const sql = [];
    const env = {
      LATTICE_MODE: "online",
      DB: {
        prepare(q) {
          sql.push(String(q));
          const stmt = {
            bind() { return stmt; },
            async all() { return { results: [] }; },
            async first() { return null; },
            async run() { return { success: true }; },
          };
          return stmt;
        },
        async batch() { return []; },
      },
    };
    const entry = { entry_hash: E, sequence: 4, action: "SUBMIT" };
    const wrapped = await wrapLedgerEntry(env, entry);
    assert.equal(wrapped.ok, true);
    assert.equal(wrapped.live, false);
    assert.equal(wrapped.code, "LATTICE-LOCAL");
    assert.equal(wrapped.remote.called, false);
    assert.equal(wrapped.remote.code, "LATTICE-REMOTE-SKIPPED");
    assert.equal(wrapped.remote.published, false);
    assert.notEqual(wrapped.code, "LATTICE-WRAP-PULL");
    assert.equal(wrapped.direction.wrap, true);
    assert.equal(wrapped.direction.pull, true);
    assert.equal(wrapped.target, PRIMARY_TARGET);
    assert.equal(wrapped.lattice.offline, false);
    assert.equal(wrapped.lattice.username, null);
    assert.equal(wrapped.pull.entry_hash, E);
    assert.equal(wrapped.pull.rebuilt_from_zero, false);
    assert.equal(wrapped.position, 1);
    assert.equal(wrapped.lattice.position, undefined);
    const pulled = await pullLocal(env, E);
    assert.equal(pulled.entry_hash, E);
    assert.ok(sql.some((q) => q.includes("lattice-pull")));
    assert.ok(sql.every((q) => !/FROM ledger/i.test(q)));
    const receipt = {
      id: "r",
      created_utc: "2026-10-29T00:00:00.000Z",
      text_sha256: "aa",
      label: "Headline",
      summary: "s",
      explanation: "e",
      score_before: 50,
      score_after: 50,
      residual: 50,
      isolated: 0,
    };
    const before = hashReceipt(receipt);
    receipt.position = wrapped.position;
    assert.equal(hashReceipt(receipt), before);
  });

  it("writes offline to aziel-corpus and tie-breaks the submitting user onto aziel-runtime once", async () => {
    const env = { LATTICE_MODE: "offline" };
    const entry = { entry_hash: D };
    const missing = await wrapLedgerEntry(env, entry);
    assert.equal(missing.ok, false);
    assert.equal(missing.code, "LATTICE-USERNAME-ABSENT");
    assert.equal(missing.written, false);
    const offline = await wrapLedgerEntry(env, entry, { username: "ada" });
    assert.equal(offline.target, SECONDARY_TARGET);
    assert.equal(offline.lattice.offline, true);
    assert.equal(offline.lattice.username, "ada");
    assert.notEqual(offline.lattice.username, "godlock");
    assert.equal(offline.pull.ok, true);
    env.LATTICE_MODE = "sync";
    const synced = await wrapLedgerEntry(env, entry, { username: "ada" });
    assert.equal(synced.ok, true);
    assert.equal(synced.target, PRIMARY_TARGET);
    assert.equal(synced.lattice.offline, false);
    assert.equal(synced.lattice.username, null);
    assert.equal(synced.lattice.tiebreak.status, "synced");
    assert.equal(synced.lattice.tiebreak.offline_secondary, offline.lattice.secondary);
    const again = await wrapLedgerEntry(env, entry, { username: "ada" });
    assert.equal(again.ok, false);
    assert.equal(again.code, "LATTICE-DOUBLE");
    assert.equal(again.written, false);
    assert.equal(again.live, false);
  });

  it("pulls the same entry_hash back from the remote aggregate lattice", async () => {
    const store = new Map();
    const fetchImpl = async (url, init, target) => {
      const u = new URL(url);
      assert.ok(u.pathname === "/v1/lattice/wrap" || u.pathname === "/v1/lattice/pull");
      if (init && init.method === "POST") {
        const body = JSON.parse(init.body);
        assert.equal(body.aggregate, true);
        assert.equal(body.scope.users, "all");
        assert.equal(body.scope.mesh, "all");
        store.set(target + ":" + body.entry_hash, body);
        return { ok: true, status: 201, json: async () => ({ ok: true, entry_hash: body.entry_hash }) };
      }
      assert.equal(u.pathname, "/v1/lattice/pull");
      assert.equal(u.searchParams.get("aggregate"), "1");
      for (const [key, value] of Object.entries(LATTICE_AGGREGATE_SCOPE)) {
        assert.equal(u.searchParams.get(key), value);
      }
      const entry_hash = u.searchParams.get("entry_hash");
      const body = store.get(target + ":" + entry_hash);
      if (!body) return { ok: false, status: 404, json: async () => ({}) };
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          aggregate: true,
          scope: { ...LATTICE_AGGREGATE_SCOPE },
          rows: [body, { entry_hash: "c".repeat(64), position: 9 }],
        }),
      };
    };
    const env = { LATTICE_MODE: "online", LATTICE_REMOTE: "1" };
    const wrapped = await wrapLedgerEntry(env, { entry_hash: E }, { fetch: fetchImpl });
    assert.equal(wrapped.ok, true);
    assert.equal(wrapped.code, "LATTICE-WRAP-PULL");
    assert.equal(wrapped.remote.published, true);
    assert.equal(wrapped.remote.target, PRIMARY_TARGET);
    assert.equal(wrapped.remote_pull.ok, true);
    assert.equal(wrapped.remote_pull.entry_hash, E);
    assert.equal(wrapped.remote_pull.rebuilt_from_zero, false);
    assert.equal(store.get(PRIMARY_TARGET + ":" + E).position, wrapped.position);
    assert.equal(store.get(PRIMARY_TARGET + ":" + E).lattice.position, undefined);
  });

  it("does not call AZIEL_RUNTIME unless LATTICE_REMOTE is set", async () => {
    let calls = 0;
    const env = {
      LATTICE_MODE: "online",
      AZIEL_RUNTIME: {
        async fetch() {
          calls += 1;
          return new Response(JSON.stringify({ ok: true }), { status: 201 });
        },
      },
    };
    const wrapped = await wrapLedgerEntry(env, { entry_hash: E });
    assert.equal(calls, 0);
    assert.equal(wrapped.ok, true);
    assert.equal(wrapped.code, "LATTICE-LOCAL");
    assert.equal(wrapped.remote.published, false);
    assert.equal(wrapped.live, false);
  });

  it("fails closed when remote wrap or pull is a 404", async () => {
    const env = { LATTICE_MODE: "online", LATTICE_REMOTE: "1" };
    const fetchImpl = async () => ({ ok: false, status: 404, json: async () => ({ ok: false }) });
    const wrapped = await wrapLedgerEntry(env, { entry_hash: E }, { fetch: fetchImpl });
    assert.equal(wrapped.ok, false);
    assert.equal(wrapped.code, "LATTICE-REMOTE-MISS");
    assert.equal(wrapped.written, true);
    assert.equal(wrapped.live, false);
    assert.equal(wrapped.direction.pull, false);
    assert.notEqual(wrapped.code, "LATTICE-WRAP-PULL");
    assert.equal(wrapped.remote.published, false);
    const local = await pullLocal(env, E);
    assert.equal(local.entry_hash, E);
  });

  it("fails closed when the remote answers with a single-user silo", async () => {
    const env = { LATTICE_MODE: "online", LATTICE_REMOTE: "1" };
    const fetchImpl = async (url, init) => {
      if (init && init.method === "POST") {
        return { ok: true, status: 201, json: async () => ({ ok: true, entry_hash: E }) };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ ok: true, entry_hash: E, scope: { ...LATTICE_AGGREGATE_SCOPE, users: "ada" } }),
      };
    };
    const wrapped = await wrapLedgerEntry(env, { entry_hash: E }, { fetch: fetchImpl });
    assert.equal(wrapped.ok, false);
    assert.equal(wrapped.code, "LATTICE-SILO-REFUSED");
    assert.equal(wrapped.written, true);
    assert.equal(wrapped.live, false);
  });

  it("does not keep a memory row when the D1 position insert collides", async () => {
    const env = {
      LATTICE_MODE: "online",
      DB: {
        prepare() {
          const stmt = {
            bind() { return stmt; },
            async all() { return { results: [] }; },
            async first() { return { n: 3 }; },
            async run() { throw new Error("UNIQUE constraint failed: lattice_chain.position"); },
          };
          return stmt;
        },
      },
    };
    const wrapped = await wrapLedgerEntry(env, { entry_hash: E });
    assert.equal(wrapped.ok, false);
    assert.equal(wrapped.code, "LATTICE-POSITION-COLLISION");
    assert.equal(wrapped.written, false);
    assert.equal(wrapped.live, false);
    assert.equal(await pullLocal(env, E), null);
    assert.ok(!env.__latticeRows || env.__latticeRows.length === 0);
  });

  it("allocates the next position from the highest stored position", async () => {
    const env = { LATTICE_MODE: "online" };
    env.__latticeRows = [{ entry_hash: "c".repeat(64), position: 5, document_hash: "c".repeat(64), lattice: null }];
    const wrapped = await wrapLedgerEntry(env, { entry_hash: E });
    assert.equal(wrapped.ok, true);
    assert.equal(wrapped.position, 6);
    assert.equal(env.__latticeRows.length, 2);
  });

  it("refuses a public aggregate pull and lists rows only for the operator token", async () => {
    const secret = "test-operator-token";
    const env = { LATTICE_MODE: "offline", LATTICE_OPERATOR_TOKEN: secret };
    await wrapLedgerEntry(env, { entry_hash: D }, { username: "ada" });
    env.LATTICE_MODE = "online";
    await wrapLedgerEntry(env, { entry_hash: E }, { username: "bea" });
    const aggregateUrl = "https://godlock.uk/v1/lattice/pull?aggregate=1&users=all&sites=all&uses=all&hosts=all&access_points=all&nodes=all&mesh=all";
    const open = await handleLatticeHttp(new Request(aggregateUrl), env, "/v1/lattice/pull");
    assert.equal(open.status, 401);
    assert.equal(open.body.ok, false);
    assert.equal(open.body.live, false);
    assert.equal(open.body.code, "LATTICE-AGGREGATE-AUTH");
    assert.equal(open.body.rows, undefined);
    assert.equal(open.body.count, undefined);
    assert.equal(JSON.stringify(open.body).includes("ada"), false);
    assert.equal(JSON.stringify(open.body).includes("username"), false);

    const queryToken = await handleLatticeHttp(
      new Request(aggregateUrl + "&token=" + secret),
      env,
      "/v1/lattice/pull",
    );
    assert.equal(queryToken.status, 401);
    assert.equal(queryToken.body.rows, undefined);
    assert.equal(JSON.stringify(queryToken.body).includes("ada"), false);

    const wrong = await handleLatticeHttp(
      new Request(aggregateUrl, { headers: { Authorization: "Bearer not-the-token" } }),
      env,
      "/v1/lattice/pull",
    );
    assert.equal(wrong.status, 401);
    assert.equal(wrong.body.rows, undefined);

    const unset = await handleLatticeHttp(
      new Request(aggregateUrl, { headers: { "X-Aziel-Runtime-Token": secret } }),
      { ...env, LATTICE_OPERATOR_TOKEN: "" },
      "/v1/lattice/pull",
    );
    assert.equal(unset.status, 401);
    assert.equal(unset.body.rows, undefined);

    const scopeOnly = await handleLatticeHttp(
      new Request("https://godlock.uk/v1/lattice/pull?users=all&mesh=all"),
      env,
      "/v1/lattice/pull",
    );
    assert.equal(scopeOnly.status, 401);
    assert.equal(scopeOnly.body.code, "LATTICE-AGGREGATE-AUTH");
    assert.equal(scopeOnly.body.rows, undefined);

    const bearer = await handleLatticeHttp(
      new Request(aggregateUrl, { headers: { Authorization: "Bearer " + secret } }),
      env,
      "/v1/lattice/pull",
    );
    assert.equal(bearer.status, 200);
    assert.equal(bearer.body.ok, true);
    assert.equal(bearer.body.live, false);
    assert.equal(bearer.body.aggregate, true);
    assert.equal(bearer.body.silo, false);
    assert.equal(bearer.body.count, 2);
    assert.equal(bearer.body.rows[0].lattice.username, "ada");
    assert.equal(bearer.body.rows[1].entry_hash, E);

    const header = await handleLatticeHttp(
      new Request(aggregateUrl, { headers: { "X-Aziel-Runtime-Token": secret } }),
      env,
      "/v1/lattice/pull",
    );
    assert.equal(header.status, 200);
    assert.equal(header.body.rows[0].lattice.username, "ada");

    const door = await worker.fetch(new Request(aggregateUrl), env);
    assert.equal(door.status, 401);
    const doorBody = await door.json();
    assert.equal(doorBody.code, "LATTICE-AGGREGATE-AUTH");
    assert.equal(doorBody.live, false);
    assert.equal(doorBody.rows, undefined);
    assert.equal(JSON.stringify(doorBody).includes("ada"), false);

    const silo = await handleLatticeHttp(
      new Request("https://godlock.uk/v1/lattice/pull?users=ada"),
      env,
      "/v1/lattice/pull",
    );
    assert.equal(silo.status, 400);
    assert.equal(silo.body.ok, false);
    assert.equal(silo.body.code, "LATTICE-SILO-REFUSED");
    assert.equal(silo.body.rows, undefined);
    assert.equal(silo.body.live, false);
    assert.equal(JSON.stringify(silo.body).includes("ada"), false);
  });

  it("serves pull on godlock and refuses a public wrap", async () => {
    const env = { LATTICE_MODE: "online" };
    await wrapLedgerEntry(env, { entry_hash: E });
    const pull = await handleLatticeHttp(
      new Request("https://godlock.uk/v1/lattice/pull?entry_hash=" + E),
      env,
      "/v1/lattice/pull",
    );
    assert.equal(pull.status, 200);
    assert.equal(pull.body.entry_hash, E);
    assert.equal(pull.body.live, false);
    assert.equal(pull.body.rebuilt_from_zero, false);
    assert.equal(pull.body.lattice.position, undefined);
    const refused = await worker.fetch(new Request("https://godlock.uk/v1/lattice/wrap", { method: "POST" }), env);
    assert.equal(refused.status, 405);
    const body = await refused.json();
    assert.equal(body.live, false);
    assert.equal(body.code, "LATTICE-WRAP-INTERNAL");
  });
});

describe("wipe procedure stays retired", () => {
  it("does not leave a receipt or ledger DELETE path in the wipe note", () => {
    const note = readFileSync(new URL("../../docs/d1-receipt-wipe.md", import.meta.url), "utf8");
    assert.match(note, /retired/i);
    assert.doesNotMatch(note, /DELETE FROM receipts/i);
    assert.doesNotMatch(note, /DELETE FROM ledger/i);
    assert.doesNotMatch(note, /wrangler d1 execute/i);
  });
});
