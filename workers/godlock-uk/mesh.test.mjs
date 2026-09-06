import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  QNM_SPEC,
  MESH_DEFAULT_OFF,
  MESH_ANONYMITY_NETWORK,
  MESH_NODE_GATE,
  MESH_AUTO_HEAL,
  MESH_OPS,
  MESH_PATH,
  MESH_LIST_PATH,
  MESH_JOIN_PATH,
  MESH_HEARTBEAT_PATH,
  MESH_ENABLE_PATH,
  MESH_DISABLE_PATH,
  PUBLIC_MESH,
  ANON_BROADCAST,
  emptyMesh,
  parseMeshDoc,
  publicMesh,
  meshStatusLine,
  alignLiveNodes,
  compactMeshNode,
  fetchMeshSnapshot,
  meshOpsDoc,
} from "./src/mesh.js";
import { destFromRuntimePath } from "./src/runtimeRoot.js";
import { AUTHOR } from "./src/seo.js";
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

describe("mesh contract", () => {
  it("documents join/heartbeat/list/enable/disable and stays default off", () => {
    assert.equal(QNM_SPEC, "QNM-BUILD-1.0");
    assert.equal(MESH_DEFAULT_OFF, true);
    assert.equal(MESH_ANONYMITY_NETWORK, false);
    assert.equal(MESH_NODE_GATE, false);
    assert.equal(MESH_AUTO_HEAL, false);
    assert.deepEqual(MESH_OPS, ["join", "heartbeat", "list", "enable", "disable"]);
    assert.equal(MESH_PATH, "/v1/mesh");
    assert.equal(MESH_LIST_PATH, "/v1/mesh/list");
    assert.equal(MESH_JOIN_PATH, "/v1/mesh/join");
    assert.equal(MESH_HEARTBEAT_PATH, "/v1/mesh/heartbeat");
    assert.equal(MESH_ENABLE_PATH, "/v1/mesh/enable");
    assert.equal(MESH_DISABLE_PATH, "/v1/mesh/disable");
    assert.equal(PUBLIC_MESH, "https://godlock.uk/runtime/v1/mesh");
    assert.equal(ANON_BROADCAST, "https://github.com/AzielEliab/anon-broadcast");
    assert.equal(destFromRuntimePath("/runtime/v1/mesh/list", ""), "/v1/mesh/list");
    assert.equal(destFromRuntimePath("/runtime/v1/mesh/join", ""), "/v1/mesh/join");
    const ops = meshOpsDoc();
    assert.equal(ops.spec, "QNM-BUILD-1.0");
    assert.equal(ops.default_off, true);
    assert.equal(ops.anonymity_network, false);
    assert.equal(ops.node_gate, false);
    assert.equal(ops.auto_heal, false);
    assert.equal(ops.rollup_shape, "live|locked|isolated counts only");
    assert.equal(ops.anon_broadcast_publish_path, false);
    assert.equal(ops.author, AUTHOR);
    assert.equal(ops.identity, AUTHOR);
    assert.match(ops.anon_broadcast_note, /no ffmpeg farm/i);
    assert.match(ops.anon_broadcast_note, /communique/i);
    assert.match(ops.anon_broadcast_note, /not a publish path on godlock\.uk/i);
  });
});

describe("parseMeshDoc", () => {
  it("fails closed to empty/disabled when the body is missing or a 404 hint", () => {
    const empty = emptyMesh();
    assert.equal(empty.enabled, false);
    assert.equal(empty.spec, "QNM-BUILD-1.0");
    assert.equal(empty.live_nodes, 0);
    assert.deepEqual(empty.rollup, { live: 0, locked: 0, isolated: 0 });
    assert.equal(empty.status, "off");
    assert.equal(empty.anonymity_network, false);
    assert.equal(empty.node_gate, false);
    assert.equal(empty.auto_heal, false);
    assert.equal(empty.author, "Aziel Eliab");
    assert.deepEqual(parseMeshDoc(null).enabled, false);
    assert.equal(parseMeshDoc({ error: "not found", hint: "GET /v1/software" }).enabled, false);
    assert.equal(parseMeshDoc({ error: "not found" }).live_nodes, 0);
    assert.equal(parseMeshDoc("nope").status, "unavailable");
  });

  it("reads enabled suite mesh Live Nodes from several shapes", () => {
    const listed = parseMeshDoc({
      enabled: true,
      live_nodes: 4,
      nodes: [{ id: "n1", product: "godlock" }, { id: "n2" }],
    });
    assert.equal(listed.enabled, true);
    assert.equal(listed.status, "on");
    assert.equal(listed.live_nodes, 4);
    assert.deepEqual(listed.rollup, { live: 4, locked: 0, isolated: 0 });
    assert.equal(listed.anonymity_network, false);
    assert.equal(listed.node_gate, false);

    const nested = parseMeshDoc({
      mesh: { enabled: true, count: 3, list: ["a", "b", "c"] },
    });
    assert.equal(nested.enabled, true);
    assert.equal(nested.live_nodes, 3);
    assert.deepEqual(nested.rollup, { live: 3, locked: 0, isolated: 0 });
    assert.equal(compactMeshNode("a").id, "a");

    const statusOn = parseMeshDoc({ status: "on", peers: [{ session_id: "s1", last_utc: "2026-09-06T00:00:00Z" }] });
    assert.equal(statusOn.enabled, true);
    assert.equal(statusOn.live_nodes, 1);
    assert.equal(compactMeshNode({ session_id: "s1" }).id, "s1");
  });

  it("keeps disabled docs at zero even if a stale count is present", () => {
    const off = parseMeshDoc({ enabled: false, live_nodes: 9, nodes: [{ id: "stale" }] });
    assert.equal(off.enabled, false);
    assert.equal(off.live_nodes, 0);
    assert.deepEqual(off.rollup, { live: 0, locked: 0, isolated: 0 });
    assert.equal(off.status, "off");
  });

  it("reads QNM-BUILD-1.0 live|locked|isolated counts and does not invent a peer-list rollup", () => {
    const qnm = parseMeshDoc({
      spec: "QNM-BUILD-1.0",
      enabled: true,
      rollup: { live: 2, locked: 1, isolated: 3 },
      nodes: [{ id: "peer-a" }, { id: "peer-b" }, { id: "peer-c" }],
    });
    assert.deepEqual(qnm.rollup, { live: 2, locked: 1, isolated: 3 });
    assert.equal(qnm.live_nodes, 2);
    assert.equal(qnm.node_gate, false);
    assert.equal(qnm.auto_heal, false);
    const pub = publicMesh(qnm);
    assert.equal(pub.spec, "QNM-BUILD-1.0");
    assert.deepEqual(pub.rollup, { live: 2, locked: 1, isolated: 3 });
    assert.equal(pub.nodes, undefined);
    assert.equal(pub.node_gate, false);
    assert.equal(pub.auto_heal, false);
  });
});

describe("alignLiveNodes", () => {
  it("uses site heartbeats while mesh is off", () => {
    assert.equal(alignLiveNodes({ siteLiveNodes: 3, mesh: emptyMesh(), visiting: true }), 3);
    assert.equal(alignLiveNodes({ siteLiveNodes: 0, mesh: { enabled: false, live_nodes: 9 }, visiting: true }), 0);
  });

  it("shows suite mesh rollup.live when mesh is enabled and never auto-heals a visiting floor", () => {
    assert.equal(alignLiveNodes({ siteLiveNodes: 1, mesh: { enabled: true, live_nodes: 6 }, visiting: false }), 6);
    assert.equal(alignLiveNodes({ siteLiveNodes: 0, mesh: { enabled: true, live_nodes: 0 }, visiting: true }), 0);
    assert.equal(alignLiveNodes({
      siteLiveNodes: 9,
      mesh: { enabled: true, rollup: { live: 2, locked: 4, isolated: 1 } },
      visiting: true,
    }), 2);
  });
});

describe("publicMesh and status line", () => {
  it("stamps identity and MCP doors", () => {
    const pub = publicMesh(parseMeshDoc({ enabled: true, live_nodes: 2, nodes: [{ id: "n1" }] }));
    assert.equal(pub.enabled, true);
    assert.equal(pub.live_nodes, 2);
    assert.deepEqual(pub.rollup, { live: 2, locked: 0, isolated: 0 });
    assert.equal(pub.nodes, undefined);
    assert.equal(pub.spec, "QNM-BUILD-1.0");
    assert.equal(pub.author, "Aziel Eliab");
    assert.equal(pub.identity, "Aziel Eliab");
    assert.equal(pub.mcp, "/runtime/mcp");
    assert.equal(pub.fraggate, "/runtime/v1/fraggate/call");
    assert.equal(pub.list, "https://godlock.uk/runtime/v1/mesh/list");
    assert.match(meshStatusLine(pub), /Suite mesh: on · live 2 · locked 0 · isolated 0/);
    assert.match(meshStatusLine(emptyMesh()), /Suite mesh: off \(default\)\. QNM-BUILD-1\.0/);
    assert.match(meshStatusLine(emptyMesh({ status: "unavailable" })), /unavailable/);
  });
});

describe("fetchMeshSnapshot", () => {
  it("uses the AZIEL_RUNTIME binding and ignores a 404 hint", async () => {
    const urls = [];
    const env = {
      AZIEL_RUNTIME: {
        async fetch(req) {
          urls.push(String(req && req.url));
          if (String(req && req.url).endsWith("/v1/mesh")) {
            return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
          }
          return new Response(JSON.stringify({
            enabled: true,
            live_nodes: 5,
            nodes: [{ id: "m1" }, { id: "m2" }, { id: "m3" }, { id: "m4" }, { id: "m5" }],
          }), { headers: { "Content-Type": "application/json" } });
        },
      },
    };
    const snap = await fetchMeshSnapshot(env, {
      fetch: async () => {
        throw new Error("binding present");
      },
    });
    assert.equal(snap.enabled, true);
    assert.equal(snap.live_nodes, 5);
    assert.equal(snap.source, "service-binding");
    assert.ok(urls[0].includes("/v1/mesh"));
  });

  it("probes HTTPS only when a fetch is injected and no binding is present", async () => {
    const urls = [];
    const snap = await fetchMeshSnapshot({}, {
      fetch: async (url) => {
        urls.push(String(url));
        return new Response(JSON.stringify({ status: "on", live_nodes: 2, nodes: [{ id: "h1" }, { id: "h2" }] }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    });
    assert.equal(snap.enabled, true);
    assert.equal(snap.live_nodes, 2);
    assert.equal(snap.source, "origin");
    assert.ok(urls[0].includes("/v1/mesh"));
  });

  it("does not stall Live Nodes on origin HTTPS when no binding is configured", async () => {
    let hits = 0;
    const real = globalThis.fetch;
    globalThis.fetch = async () => {
      hits += 1;
      throw new Error("should not hit global fetch");
    };
    try {
      const snap = await fetchMeshSnapshot({});
      assert.equal(snap.enabled, false);
      assert.equal(snap.status, "unavailable");
      assert.equal(hits, 0);
    } finally {
      globalThis.fetch = real;
    }
  });

  it("returns disabled fallback when runtime mesh routes are missing", async () => {
    const env = {
      AZIEL_RUNTIME: {
        async fetch() {
          return new Response(JSON.stringify({ error: "not found", hint: "GET /v1/software" }), { status: 404 });
        },
      },
    };
    const snap = await fetchMeshSnapshot(env, {
      fetch: async () => {
        throw new Error("binding present");
      },
    });
    assert.equal(snap.enabled, false);
    assert.equal(snap.live_nodes, 0);
    assert.equal(snap.status, "unavailable");
    assert.equal(snap.source, "fallback");
    assert.equal(snap.anonymity_network, false);
  });
});

describe("GodLock.uk mesh routes", () => {
  it("exposes /mesh and aligns Live Nodes when suite mesh is on", async () => {
    const env = mockDbEnv({
      AZIEL_RUNTIME: {
        async fetch(req) {
          const u = String(req && req.url);
          if (u.includes("/v1/mesh")) {
            return new Response(JSON.stringify({
              enabled: true,
              live_nodes: 7,
              nodes: [{ id: "suite-1" }],
              default_off: false,
            }), { headers: { "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
        },
      },
    });
    const mesh = await (await worker.fetch(new Request("https://godlock.uk/mesh"), env)).json();
    assert.equal(mesh.ok, true);
    assert.equal(mesh.spec, "QNM-BUILD-1.0");
    assert.equal(mesh.author, "Aziel Eliab");
    assert.equal(mesh.identity, "Aziel Eliab");
    assert.equal(mesh.anonymity_network, false);
    assert.equal(mesh.default_off, true);
    assert.equal(mesh.node_gate, false);
    assert.equal(mesh.auto_heal, false);
    assert.equal(mesh.mesh.enabled, true);
    assert.equal(mesh.live_nodes, 7);
    assert.deepEqual(mesh.rollup, { live: 7, locked: 0, isolated: 0 });
    assert.deepEqual(mesh.mesh.rollup, { live: 7, locked: 0, isolated: 0 });
    assert.equal(mesh.mesh.nodes, undefined);
    assert.equal(mesh.door, "https://godlock.uk/runtime/v1/mesh");
    assert.equal(mesh.anon_broadcast, "https://github.com/AzielEliab/anon-broadcast");
    assert.equal(mesh.anon_broadcast_publish_path, false);
    assert.match(mesh.anon_broadcast_note, /no ffmpeg farm/i);
    assert.match(mesh.anon_broadcast_note, /not a publish path on godlock\.uk/i);

    const stats = await (await worker.fetch(new Request("https://godlock.uk/stats"), env)).json();
    assert.equal(stats.live_nodes, 7);
    assert.equal(stats.mesh.enabled, true);
    assert.equal(stats.mesh.live_nodes, 7);
    assert.deepEqual(stats.mesh.rollup, { live: 7, locked: 0, isolated: 0 });

    const count = await (await worker.fetch(new Request("https://godlock.uk/count"), env)).json();
    assert.equal(count.live_nodes, 7);
    assert.equal(count.mesh_enabled, true);
    assert.equal(count.mesh_live_nodes, 7);
    assert.equal(count.mesh_locked, 0);
    assert.equal(count.mesh_isolated, 0);
  });

  it("does not auto-heal an empty enabled mesh to a visiting floor of 1", async () => {
    const env = mockDbEnv({
      AZIEL_RUNTIME: {
        async fetch(req) {
          const u = String(req && req.url);
          if (u.includes("/v1/mesh")) {
            return new Response(JSON.stringify({
              enabled: true,
              rollup: { live: 0, locked: 2, isolated: 1 },
            }), { headers: { "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
        },
      },
    });
    const stats = await (await worker.fetch(new Request("https://godlock.uk/"), env));
    const html = await stats.text();
    assert.match(html, /id="stat-live-nodes">0</);
    assert.match(html, /Suite mesh: on · live 0 · locked 2 · isolated 1/);
    assert.doesNotMatch(html, /id="node-gate"/);
    assert.doesNotMatch(html, /href="\/node-gate"/);
    const count = await (await worker.fetch(new Request("https://godlock.uk/count"), env)).json();
    assert.equal(count.live_nodes, 0);
    assert.equal(count.mesh_locked, 2);
    assert.equal(count.mesh_isolated, 1);
  });

  it("keeps site Live Nodes when mesh is missing or off", async () => {
    const env = mockDbEnv({
      AZIEL_RUNTIME: {
        async fetch() {
          return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
        },
      },
    });
    const stats = await (await worker.fetch(new Request("https://godlock.uk/stats"), env)).json();
    assert.equal(stats.mesh.enabled, false);
    assert.equal(stats.mesh.status, "unavailable");
    assert.ok(stats.live_nodes >= 0);
    assert.equal(stats.live_nodes, stats.site_live_nodes);
    const html = await (await worker.fetch(new Request("https://godlock.uk/"), env)).text();
    assert.match(html, /id="mesh-status"/);
    assert.match(html, /Suite mesh: off/);
    assert.match(html, /QNM-BUILD-1\.0/);
    assert.match(html, /Not an anonymity network/);
    assert.doesNotMatch(html, /id="node-gate"/);
    assert.doesNotMatch(html, /ffmpeg farm/);
  });
});
