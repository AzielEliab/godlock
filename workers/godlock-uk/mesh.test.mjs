import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  QNM_SPEC,
  QNS_CD_SPEC,
  QNS_CD,
  MESH_NOTE,
  MESH_DEFAULT,
  MESH_DEFAULT_OFF,
  MESH_READONLY,
  MESH_ANONYMITY_NETWORK,
  MESH_NODE_GATE,
  MESH_AUTO_HEAL,
  MESH_OPS,
  MESH_PATH,
  MESH_STATUS_PATH,
  MESH_NODES_PATH,
  MESH_LIST_PATH,
  MESH_JOIN_PATH,
  MESH_LEAVE_PATH,
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
  alignPublicMeshSurface,
  compactMeshNode,
  parsePublicLiveNodes,
  LIVE_NODES_PLANE,
  LIVE_NODES_WORKER_VERSION_ID,
  LIVE_NODES_SOT,
  LIVE_NODES_NOTE,
  SOFTWARE_NODES_NOTE,
  isSoftwareWorkerNodeId,
  countsTowardListedLive,
  fetchMeshSnapshot,
  meshOpsDoc,
  isOriginMeshReadPath,
  isMeshDisablePath,
  originMeshWriteRefused,
  meshDisableRefused,
  hubMeshStatusDoc,
  ORIGIN_MESH_READ_PATHS,
  SPLIT_THE_WIRES,
  SPLIT_THE_WIRES_SPEC,
  SPLIT_THE_WIRES_LAW,
  COLD_COPY_SURVIVAL,
  COLD_COPY_SURVIVAL_SPEC,
  COLD_COPY_SURVIVAL_LAW,
  TIP_TICK_MIN_MS,
  TIP_TICK_MAX_MS,
  PAYLOAD_DWELL_S,
  evaluateSplitTheWires,
  evaluateColdCopySurvival,
  evaluateMeshLaw,
  phoenixBringsUkRefused,
  liveSyncRefused,
  serverPullEraseRefused,
  stampMeshLaw,
  REHEAL,
  REHEAL_SPEC,
  REHEAL_LAW,
  REHEAL_ALLOWED,
  REHEAL_FORBIDDEN,
  REHEAL_ACTION,
  evaluateReheal,
  rehealRefused,
  isMeshRehealPath,
  MESH_REHEAL_PATH,
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
    MESH_PROBE_ORIGIN: false,
    ...(extra || {}),
  };
}

describe("mesh contract", () => {
  it("documents read-only suite presence on and has no mesh-off function", () => {
    assert.equal(QNM_SPEC, "QNM-BUILD-1.0");
    assert.equal(QNS_CD_SPEC, "QNS-CD-1.0");
    assert.equal(QNS_CD.spec, "QNS-CD-1.0");
    assert.equal(QNS_CD.name, "photon QNS1 packet transfer");
    assert.equal(QNS_CD.kind, "hub-cite");
    assert.equal(QNS_CD.softwares_tab, false);
    assert.equal(QNS_CD.public_proxy, false);
    assert.equal(QNS_CD.qnsd_implemented_here, false);
    assert.equal(QNS_CD.node_gate, false);
    assert.equal(QNS_CD.default_off, true);
    assert.equal(QNS_CD.qnsd, "https://github.com/AzielEliab/qnm-node");
    assert.equal(QNS_CD.runtime, "https://github.com/AzielEliab/aziel-runtime");
    assert.equal(QNS_CD.pair_custody, "https://github.com/AzielEliab/azinterface");
    assert.match(MESH_NOTE, /QNS-CD-1\.0/);
    assert.match(MESH_NOTE, /photon QNS1 packet transfer/);
    assert.match(MESH_NOTE, /read-only suite presence/);
    assert.match(MESH_NOTE, /SPLIT THE WIRES/);
    assert.match(MESH_NOTE, /COLD-COPY SURVIVAL/);
    assert.match(MESH_NOTE, /REHEAL refuse/);
    assert.match(MESH_NOTE, /No neighbor talk-back-to-health/);
    assert.match(MESH_NOTE, /die-with-pull does not bring godlock\.uk back/);
    assert.doesNotMatch(MESH_NOTE, /default off/i);
    assert.equal(MESH_DEFAULT, "on");
    assert.equal(MESH_DEFAULT_OFF, false);
    assert.equal(MESH_READONLY, true);
    assert.equal(MESH_ANONYMITY_NETWORK, false);
    assert.equal(MESH_NODE_GATE, false);
    assert.equal(MESH_AUTO_HEAL, false);
    assert.deepEqual(MESH_OPS, ["status", "nodes", "join", "heartbeat", "leave", "enable"]);
    assert.ok(!MESH_OPS.includes("disable"));
    assert.equal(MESH_PATH, "/v1/mesh");
    assert.equal(MESH_STATUS_PATH, "/v1/mesh/status");
    assert.deepEqual(ORIGIN_MESH_READ_PATHS, ["/v1/mesh", "/v1/mesh/status"]);
    assert.equal(isOriginMeshReadPath("/v1/mesh"), true);
    assert.equal(isOriginMeshReadPath("/v1/mesh/status"), true);
    assert.equal(isOriginMeshReadPath("/v1/mesh/enable"), false);
    assert.equal(isMeshDisablePath("/v1/mesh/disable"), true);
    assert.equal(isMeshDisablePath("/runtime/v1/mesh/disable"), true);
    assert.equal(MESH_REHEAL_PATH, "/v1/mesh/reheal");
    assert.equal(isMeshRehealPath("/v1/mesh/reheal"), true);
    assert.equal(isMeshRehealPath("/runtime/v1/mesh/reheal"), true);
    assert.equal(isMeshRehealPath("/v1/mesh/status"), false);
    assert.equal(originMeshWriteRefused().get_never_enables, true);
    assert.equal(originMeshWriteRefused().enabled, false);
    assert.equal(originMeshWriteRefused().mesh_default, "on");
    assert.equal(originMeshWriteRefused().default_off, false);
    assert.equal(meshDisableRefused().code, "MESH-NO-DISABLE");
    assert.equal(meshDisableRefused().mesh_default, "on");
    assert.equal(meshDisableRefused().law, SPLIT_THE_WIRES);
    assert.equal(meshDisableRefused().cold_copy_survival, COLD_COPY_SURVIVAL);
    assert.equal(meshDisableRefused().reheal, REHEAL);
    assert.equal(meshDisableRefused().neighbor_talkback, false);
    assert.equal(meshDisableRefused().phoenix_brings_uk_back, false);
    assert.match(meshDisableRefused().note, /COLD-COPY SURVIVAL/);
    assert.match(meshDisableRefused().note, /REHEAL refuse/);
    assert.equal(originMeshWriteRefused().law, SPLIT_THE_WIRES);
    assert.equal(originMeshWriteRefused().live_sync, false);
    assert.equal(MESH_NODES_PATH, "/v1/mesh/nodes");
    assert.equal(MESH_LIST_PATH, "/v1/mesh/nodes");
    assert.equal(MESH_JOIN_PATH, "/v1/mesh/join");
    assert.equal(MESH_LEAVE_PATH, "/v1/mesh/leave");
    assert.equal(MESH_HEARTBEAT_PATH, "/v1/mesh/heartbeat");
    assert.equal(MESH_ENABLE_PATH, "/v1/mesh/enable");
    assert.equal(MESH_DISABLE_PATH, "/v1/mesh/disable");
    assert.equal(PUBLIC_MESH, "https://godlock.uk/runtime/v1/mesh");
    assert.equal(ANON_BROADCAST, "https://github.com/AzielEliab/anon-broadcast");
    assert.equal(destFromRuntimePath("/runtime/v1/mesh/status", ""), "/v1/mesh/status");
    assert.equal(destFromRuntimePath("/runtime/v1/mesh/nodes", ""), "/v1/mesh/nodes");
    assert.equal(destFromRuntimePath("/runtime/v1/mesh/join", ""), "/v1/mesh/join");
    const ops = meshOpsDoc();
    assert.equal(ops.spec, "QNM-BUILD-1.0");
    assert.equal(ops.qns_cd_spec, "QNS-CD-1.0");
    assert.equal(ops.qns_cd.spec, "QNS-CD-1.0");
    assert.equal(ops.qns_cd.public_proxy, false);
    assert.equal(ops.qns_cd.softwares_tab, false);
    assert.equal(ops.default_off, false);
    assert.equal(ops.mesh_default, "on");
    assert.equal(ops.readonly, true);
    assert.equal(ops.disable, undefined);
    assert.equal(ops.anonymity_network, false);
    assert.equal(ops.worker_hardware, false);
    assert.equal(ops.azvpn.https_ws, "REAL");
    assert.equal(ops.azvpn.wireguard, "SLOT");
    assert.equal(ops.azvpn.godlock_is_vpn, false);
    assert.equal(ops.node_gate, false);
    assert.equal(ops.auto_heal, false);
    assert.match(ops.rollup_shape, /human mesh users \+ cited human uses/);
    assert.match(ops.rollup_shape, /software_nodes separate/);
    assert.equal(ops.live_nodes_plane, "human-mesh-users-uses");
    assert.equal(ops.live_nodes_worker, "d7b63ac1");
    assert.equal(ops.live_nodes_sot, "aziel-runtime#151 LIVE Worker d7b63ac1");
    assert.match(ops.live_nodes_note, /human mesh users/);
    assert.match(ops.software_nodes_note, /never feed public Live Nodes/);
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
    assert.equal(empty.qns_cd.spec, "QNS-CD-1.0");
    assert.equal(empty.qns_cd.public_proxy, false);
    assert.match(empty.note, /QNS-CD-1\.0/);
    assert.equal(empty.live_nodes, 0);
    assert.equal(empty.live_nodes_plane, "human-mesh-users-uses");
    assert.equal(empty.software_nodes, 0);
    assert.deepEqual(empty.rollup, { live: 0, locked: 0, isolated: 0 });
    assert.equal(empty.status, "unavailable");
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
    assert.equal(off.status, "unavailable");
  });

  it("reads QNM-BUILD-1.0 live|locked|isolated counts and does not invent a peer-list rollup", () => {
    const liveOk = parseMeshDoc({
      ok: true,
      code: "MESH-OK",
      op: "status",
      enabled: true,
      bearers: ["suite-presence"],
      rollup: { live: 37, locked: 0, isolated: 0 },
      live_nodes: 37,
      products: ["godlock", "azhub", "azinterface"],
    });
    assert.equal(liveOk.enabled, true);
    assert.equal(liveOk.live_nodes, 37);
    assert.deepEqual(liveOk.rollup, { live: 37, locked: 0, isolated: 0 });

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
    assert.equal(pub.qns_cd.spec, "QNS-CD-1.0");
    assert.equal(pub.qns_cd.kind, "hub-cite");
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

  it("shows Worker live_nodes (human users+uses) when mesh is enabled and never auto-heals a visiting floor", () => {
    assert.equal(alignLiveNodes({ siteLiveNodes: 1, mesh: { enabled: true, live_nodes: 6 }, visiting: false }), 6);
    assert.equal(alignLiveNodes({ siteLiveNodes: 0, mesh: { enabled: true, live_nodes: 0 }, visiting: true }), 0);
    assert.equal(alignLiveNodes({
      siteLiveNodes: 9,
      mesh: { enabled: true, rollup: { live: 2, locked: 4, isolated: 1 } },
      visiting: true,
    }), 2);
  });

  it("never treats software_nodes or all-planes rollup.live as Live Nodes", () => {
    assert.equal(alignLiveNodes({
      siteLiveNodes: 9,
      mesh: {
        enabled: true,
        live_nodes: 3,
        software_nodes: 41,
        human_mesh_users: 1,
        human_uses: 2,
        rollup: {
          live: 41,
          locked: 0,
          isolated: 0,
          mesh: 3,
          software: { live: 41, locked: 0, isolated: 0 },
        },
      },
    }), 3);
    assert.equal(parsePublicLiveNodes({
      software_nodes: 41,
      rollup: { live: 41, locked: 0, isolated: 0, software: { live: 41 } },
    }), 0);
    assert.equal(parsePublicLiveNodes({
      human_mesh_users: 1,
      human_uses: 4,
      software_nodes: 41,
    }), 5);
  });
});

describe("Live Nodes human users+uses (aziel-runtime#151)", () => {
  it("reads Worker live_nodes / rollup.mesh and keeps Softwares on software_nodes", () => {
    assert.equal(LIVE_NODES_PLANE, "human-mesh-users-uses");
    assert.equal(LIVE_NODES_WORKER_VERSION_ID, "d7b63ac1");
    assert.equal(LIVE_NODES_SOT, "aziel-runtime#151 LIVE Worker d7b63ac1");
    assert.match(LIVE_NODES_NOTE, /human mesh users/);
    assert.match(LIVE_NODES_NOTE, /Not software_nodes/);
    assert.match(SOFTWARE_NODES_NOTE, /never feed public Live Nodes/);
    assert.equal(isSoftwareWorkerNodeId("godlock-worker"), true);
    assert.equal(isSoftwareWorkerNodeId("mesh_1_abc"), false);
    assert.equal(countsTowardListedLive({ id: "godlock-worker" }), false);
    assert.equal(countsTowardListedLive({ id: "n1" }), true);
    assert.equal(countsTowardListedLive({ id: "dl-1", kind: "instance" }), false);
    assert.equal(countsTowardListedLive({ id: "mesh_9_x", kind: "human" }), true);

    const doc = parseMeshDoc({
      ok: true,
      code: "MESH-OK",
      enabled: true,
      live_nodes: 3,
      live_nodes_plane: "human-mesh-users-uses",
      live_nodes_note: "human mesh users plus cited human uses",
      human_mesh_users: 1,
      human_uses: 2,
      human_uses_complete: true,
      software_nodes: 41,
      products: ["godlock", "azhub"],
      rollup: {
        live: 41,
        locked: 0,
        isolated: 0,
        mesh: 3,
        software: { live: 41, locked: 0, isolated: 0 },
        human: { live: 1, locked: 0, isolated: 0 },
      },
      nodes: [
        { id: "godlock-worker", product: "godlock", kind: "software" },
        { id: "mesh_1_human", kind: "human", bearer: "human" },
      ],
    });
    assert.equal(doc.live_nodes, 3);
    assert.equal(doc.software_nodes, 41);
    assert.equal(doc.human_mesh_users, 1);
    assert.equal(doc.human_uses, 2);
    assert.equal(doc.live_nodes_plane, "human-mesh-users-uses");
    assert.deepEqual(doc.rollup, { live: 41, locked: 0, isolated: 0 });

    const pub = publicMesh(doc);
    assert.equal(pub.live_nodes, 3);
    assert.equal(pub.software_nodes, 41);
    assert.equal(pub.live_nodes_plane, LIVE_NODES_PLANE);
    assert.match(pub.live_nodes_note, /human mesh users/);
    assert.equal(meshStatusLine(pub), "Suite mesh: on · live 3 · locked 0 · isolated 0");
    assert.equal(alignLiveNodes({ siteLiveNodes: 8, mesh: pub }), 3);
  });

  it("reads LIVE Worker d7b63ac1: live_nodes is human users+uses, not software_nodes 41", () => {
    const live = parseMeshDoc({
      ok: true,
      code: "MESH-OK",
      enabled: true,
      live_nodes: 27206,
      live_nodes_plane: "human-mesh-users-uses",
      human_mesh_users: 0,
      human_uses: 27206,
      human_uses_kv: true,
      human_uses_complete: true,
      human_uses_source: "uses.total",
      software_nodes: 41,
      live_nodes_components: {
        human_mesh_users: 0,
        human_uses: 27206,
        software_nodes_excluded: true,
        instance_nodes_excluded: true,
        invent_users: false,
      },
      rollup: {
        live: 41,
        locked: 0,
        isolated: 0,
        mesh: 27206,
        active: 41,
        inactive: 0,
        software: { live: 41, locked: 0, isolated: 0 },
        human: { live: 0, locked: 0, isolated: 0 },
        instances: { live: 0, locked: 0, isolated: 0 },
      },
    });
    assert.equal(live.live_nodes, 27206);
    assert.equal(live.human_mesh_users, 0);
    assert.equal(live.human_uses, 27206);
    assert.equal(live.software_nodes, 41);
    assert.equal(live.live_nodes_worker, "d7b63ac1");
    assert.deepEqual(live.rollup, { live: 41, locked: 0, isolated: 0 });
    assert.equal(alignLiveNodes({ siteLiveNodes: 2, mesh: live }), 27206);
    assert.equal(meshStatusLine(publicMesh(live)), "Suite mesh: on · live 27206 · locked 0 · isolated 0");
    assert.notEqual(live.live_nodes, live.software_nodes);
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
    assert.equal(pub.qns_cd.spec, "QNS-CD-1.0");
    assert.equal(pub.qns_cd.qnsd, "https://github.com/AzielEliab/qnm-node");
    assert.equal(pub.author, "Aziel Eliab");
    assert.equal(pub.identity, "Aziel Eliab");
    assert.equal(pub.mcp, "/runtime/mcp");
    assert.equal(pub.fraggate, "/runtime/v1/fraggate/call");
    assert.equal(pub.status, "on");
    assert.equal(pub.status_url, "https://godlock.uk/runtime/v1/mesh/status");
    assert.equal(pub.list, "https://godlock.uk/runtime/v1/mesh/nodes");
    assert.equal(pub.leave, "https://godlock.uk/runtime/v1/mesh/leave");
    assert.equal(meshStatusLine(pub), "Suite mesh: on · live 2 · locked 0 · isolated 0");
    assert.doesNotMatch(meshStatusLine(pub), /SPLIT THE WIRES|COLD-COPY SURVIVAL|REHEAL|anonymity network/);
    assert.equal(meshStatusLine(emptyMesh()), "Suite mesh: on · rollup unavailable");
    assert.equal(meshStatusLine({ enabled: false, status: "on" }), "Suite mesh: on");
    assert.doesNotMatch(meshStatusLine(emptyMesh()), /SPLIT THE WIRES|COLD-COPY SURVIVAL|REHEAL|die-with-pull|anonymity network/);
    assert.doesNotMatch(meshStatusLine(emptyMesh()), /\boff\b/);
    assert.equal(meshStatusLine(emptyMesh({ status: "unavailable" })), "Suite mesh: on · rollup unavailable");
    const stamped = alignPublicMeshSurface({
      enabled: true,
      live_nodes: 37,
      mesh_default: "off",
      mesh_default_off: true,
      default_off: true,
      disable: "https://godlock.uk/runtime/v1/mesh/disable",
      ops: ["status", "disable"],
      note: "Suite mesh default off. Remain-OFF.",
      display: { fields: [{ label: "mesh default", value: "off" }] },
    });
    assert.equal(stamped.mesh_default, "on");
    assert.equal(stamped.default_off, false);
    assert.equal(stamped.mesh_default_off, undefined);
    assert.equal(stamped.disable, undefined);
    assert.deepEqual(stamped.ops, ["status"]);
    assert.doesNotMatch(stamped.note, /default off|Remain-OFF/i);
    assert.equal(stamped.display.fields[0].value, "on");
    assert.equal(stamped.enabled, true);
    assert.equal(stamped.live_nodes, 37);
  });
});

describe("fetchMeshSnapshot", () => {
  it("uses the AZIEL_RUNTIME binding and ignores a 404 hint", async () => {
    const urls = [];
    const env = {
      AZIEL_RUNTIME: {
        async fetch(req) {
          urls.push(String(req && req.url));
          if (String(req && req.url).endsWith("/v1/mesh/list")) {
            return new Response(JSON.stringify({ ok: false, code: "MESH-NOT-FOUND", spec: "QNM-BUILD-1.0" }), { status: 404 });
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
    assert.ok(urls[0].includes("/v1/mesh/status"));
    assert.ok(urls.every((u) => !/\/v1\/mesh\/(enable|disable|join|heartbeat|leave|broadcast)/.test(u)));
  });

  it("prefers LIVE origin /v1/mesh/status over a stale binding rollup", async () => {
    const env = {
      AZIEL_RUNTIME: {
        async fetch() {
          return new Response(JSON.stringify({
            code: "MESH-OK",
            enabled: true,
            live_nodes: 2,
            rollup: { live: 2, locked: 0, isolated: 0 },
          }), { headers: { "Content-Type": "application/json" } });
        },
      },
    };
    const originUrls = [];
    const snap = await fetchMeshSnapshot(env, {
      fetch: async (url) => {
        originUrls.push(String(url));
        return new Response(JSON.stringify({
          ok: true,
          code: "MESH-OK",
          op: "status",
          enabled: true,
          bearers: ["suite-presence"],
          live_nodes: 37,
          rollup: { live: 37, locked: 0, isolated: 0 },
        }), { headers: { "Content-Type": "application/json" } });
      },
    });
    assert.equal(snap.enabled, true);
    assert.equal(snap.live_nodes, 37);
    assert.deepEqual(snap.rollup, { live: 37, locked: 0, isolated: 0 });
    assert.equal(snap.source, "origin");
    assert.ok(originUrls[0].includes("/v1/mesh/status"));
    assert.ok(originUrls.every((u) => !u.includes("/enable")));
  });

  it("skips MESH-NOT-FOUND /list and reads /status", async () => {
    const urls = [];
    const env = {
      AZIEL_RUNTIME: {
        async fetch(req) {
          const u = String(req && req.url);
          urls.push(u);
          if (u.includes("/v1/mesh/list")) {
            return new Response(JSON.stringify({
              ok: false,
              code: "MESH-NOT-FOUND",
              spec: "QNM-BUILD-1.0",
              hint: "GET /v1/mesh /status /nodes",
            }), { status: 404 });
          }
          if (u.includes("/v1/mesh/status")) {
            return new Response(JSON.stringify({
              ok: true,
              code: "MESH-OK",
              op: "status",
              enabled: true,
              live_nodes: 40,
              rollup: { live: 40, locked: 0, isolated: 0 },
            }), { headers: { "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
        },
      },
    };
    const snap = await fetchMeshSnapshot(env, {
      fetch: async () => {
        throw new Error("binding present");
      },
    });
    assert.equal(snap.enabled, true);
    assert.equal(snap.live_nodes, 40);
    assert.ok(urls.some((u) => u.includes("/v1/mesh/status")));
    assert.ok(!urls.some((u) => u.includes("/enable")));
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
    assert.equal(mesh.qns_cd.spec, "QNS-CD-1.0");
    assert.equal(mesh.qns_cd.public_proxy, false);
    assert.equal(mesh.qns_cd.softwares_tab, false);
    assert.equal(mesh.mesh.qns_cd.spec, "QNS-CD-1.0");
    assert.equal(mesh.author, "Aziel Eliab");
    assert.equal(mesh.identity, "Aziel Eliab");
    assert.equal(mesh.anonymity_network, false);
    assert.equal(mesh.default_off, false);
    assert.equal(mesh.mesh_default, "on");
    assert.equal(mesh.disable, undefined);
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

  it("aligns homepage Live Nodes to human users+uses and keeps Softwares off that pill", async () => {
    const env = mockDbEnv({
      AZIEL_RUNTIME: {
        async fetch(req) {
          const u = String(req && req.url);
          if (u.includes("/v1/mesh")) {
            return new Response(JSON.stringify({
              enabled: true,
              live_nodes: 3,
              live_nodes_plane: "human-mesh-users-uses",
              live_nodes_note: "human mesh users plus cited human uses",
              human_mesh_users: 1,
              human_uses: 2,
              software_nodes: 41,
              products: ["godlock", "azhub"],
              rollup: {
                live: 41,
                locked: 0,
                isolated: 0,
                mesh: 3,
                software: { live: 41, locked: 0, isolated: 0 },
              },
            }), { headers: { "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
        },
      },
    });
    const html = await (await worker.fetch(new Request("https://godlock.uk/"), env)).text();
    assert.match(html, /id="stat-live-nodes">3</);
    assert.match(html, /title="Human mesh users \+ cited human uses from Worker \/v1\/mesh\. Not Softwares\."/);
    assert.match(html, /Suite mesh: on · live 3 · locked 0 · isolated 0/);
    assert.doesNotMatch(html, /id="stat-live-nodes">41</);
    const stats = await (await worker.fetch(new Request("https://godlock.uk/stats"), env)).json();
    assert.equal(stats.live_nodes, 3);
    assert.equal(stats.mesh.live_nodes, 3);
    assert.equal(stats.mesh.software_nodes, 41);
    const count = await (await worker.fetch(new Request("https://godlock.uk/count"), env)).json();
    assert.equal(count.live_nodes, 3);
    assert.equal(count.mesh_live_nodes, 3);
    assert.equal(count.software_nodes, 41);
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
    const visibleMesh = html.replace(/<script[\s\S]*?<\/script>/gi, "");
    assert.doesNotMatch(visibleMesh, /SPLIT THE WIRES|COLD-COPY SURVIVAL|REHEAL refuse|Public HTTPS engine/);
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
    assert.match(html, /Suite mesh: on · rollup unavailable/);
    const visibleHome = html.replace(/<script[\s\S]*?<\/script>/gi, "");
    assert.doesNotMatch(visibleHome, /SPLIT THE WIRES|COLD-COPY SURVIVAL|REHEAL refuse|No neighbor talk-back-to-health/);
    assert.doesNotMatch(visibleHome, /QNM-BUILD-1\.0|QNS-CD-1\.0|Not an anonymity network|Public HTTPS engine/);
    assert.doesNotMatch(html, /Suite mesh: off/);
    assert.doesNotMatch(html, /id="node-gate"/);
    assert.doesNotMatch(html, /ffmpeg farm/);
  });
});

describe("GodLock.uk origin /v1/mesh proxies", () => {
  function meshEnv(extra) {
    return mockDbEnv({
      AZIEL_RUNTIME: {
        async fetch(req) {
          const u = String(req && req.url);
          const method = String((req && req.method) || "GET").toUpperCase();
          if (method !== "GET" && method !== "HEAD") {
            return new Response(JSON.stringify({ ok: false, error: "writes stay on runtime" }), { status: 405 });
          }
          if (u.includes("/v1/mesh/enable") || u.includes("/v1/mesh/join")) {
            return new Response(JSON.stringify({ ok: false, error: "GET never enables" }), { status: 404 });
          }
          if (u.includes("/v1/mesh")) {
            return new Response(JSON.stringify({
              ok: true,
              code: "MESH-OK",
              op: u.includes("/status") ? "status" : "mesh",
              enabled: true,
              default_off: true,
              get_never_enables: true,
              live_nodes: 11,
              rollup: { live: 11, locked: 0, isolated: 0 },
              author: "Aziel Eliab",
              identity: "Aziel Eliab",
            }), { headers: { "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
        },
      },
      ...(extra || {}),
    });
  }

  it("serves GET /v1/mesh and /v1/mesh/status for Live Nodes clients", async () => {
    const env = meshEnv();
    const status = await (await worker.fetch(new Request("https://godlock.uk/v1/mesh/status"), env)).json();
    assert.equal(status.ok, true);
    assert.equal(status.enabled, true);
    assert.equal(status.live_nodes, 11);
    assert.deepEqual(status.rollup, { live: 11, locked: 0, isolated: 0 });
    assert.equal(status.author, "Aziel Eliab");
    assert.equal(status.identity, "Aziel Eliab");
    assert.equal(status.mesh_default, "on");
    assert.equal(status.default_off, false);
    assert.equal(status.disable, undefined);
    assert.notEqual(status.get_never_enables, false);

    const mesh = await (await worker.fetch(new Request("https://godlock.uk/v1/mesh"), env)).json();
    assert.equal(mesh.ok, true);
    assert.equal(mesh.enabled, true);
    assert.equal(mesh.mesh_default, "on");
    assert.equal(mesh.author, "Aziel Eliab");
    assert.equal(mesh.identity, "Aziel Eliab");
  });

  it("refuses POST on apex mesh reads and never enables", async () => {
    const env = meshEnv();
    const denied = await worker.fetch(new Request("https://godlock.uk/v1/mesh/status", { method: "POST" }), env);
    assert.equal(denied.status, 405);
    const body = await denied.json();
    assert.equal(body.get_never_enables, true);
    assert.equal(body.enabled, false);
    assert.equal(body.default_off, false);
    assert.equal(body.mesh_default, "on");
    assert.equal(body.author, "Aziel Eliab");
    assert.equal(body.identity, "Aziel Eliab");

    const enable = await worker.fetch(new Request("https://godlock.uk/v1/mesh/enable", { method: "POST" }), env);
    assert.equal(enable.status, 404);

    const disable = await worker.fetch(new Request("https://godlock.uk/v1/mesh/disable", { method: "POST" }), env);
    assert.equal(disable.status, 405);
    const refused = await disable.json();
    assert.equal(refused.code, "MESH-NO-DISABLE");
    assert.equal(refused.mesh_default, "on");
    assert.doesNotMatch(JSON.stringify(refused), /Remain-OFF|default off/i);

    const runtimeDisable = await worker.fetch(new Request("https://godlock.uk/runtime/v1/mesh/disable", { method: "POST" }), env);
    assert.equal(runtimeDisable.status, 405);
    const runtimeRefused = await runtimeDisable.json();
    assert.equal(runtimeRefused.code, "MESH-NO-DISABLE");

    const reheal = await worker.fetch(new Request("https://godlock.uk/v1/mesh/reheal", { method: "POST" }), env);
    assert.equal(reheal.status, 405);
    const rehealBody = await reheal.json();
    assert.equal(rehealBody.code, "RH-NEIGHBOR-TALKBACK");
    assert.equal(rehealBody.reheal, REHEAL);
    assert.equal(rehealBody.neighbor_talkback, false);
    assert.deepEqual(rehealBody.forbidden, ["bodies", "diffs", "vote-to-fix"]);
    assert.match(rehealBody.error, /No neighbor talk-back-to-health/);
    assert.match(rehealBody.note, /Softwares stays Runtime-only/);

    const runtimeReheal = await worker.fetch(new Request("https://godlock.uk/runtime/v1/mesh/reheal", { method: "POST" }), env);
    assert.equal(runtimeReheal.status, 405);
    const runtimeRehealBody = await runtimeReheal.json();
    assert.equal(runtimeRehealBody.code, "RH-NEIGHBOR-TALKBACK");
  });

  it("falls back to a read-only ON hub snapshot when the runtime proxy is down", async () => {
    const env = mockDbEnv({
      AZIEL_RUNTIME: {
        async fetch() {
          return new Response("nope", { status: 502 });
        },
      },
    });
    const status = await (await worker.fetch(new Request("https://godlock.uk/v1/mesh/status"), env)).json();
    assert.equal(status.ok, true);
    assert.equal(status.get_never_enables, true);
    assert.equal(status.default_off, false);
    assert.equal(status.mesh_default, "on");
    assert.equal(status.mesh, "on");
    assert.equal(status.enabled, false);
    assert.equal(status.author, "Aziel Eliab");
    assert.equal(status.identity, "Aziel Eliab");
    assert.equal(status.spec, "QNM-BUILD-1.0");
    assert.deepEqual(status.rollup, { live: 0, locked: 0, isolated: 0 });
    const fallback = hubMeshStatusDoc({ mesh: emptyMesh(), site_live_nodes: 2 }, "/v1/mesh/status");
    assert.equal(fallback.enabled, false);
    assert.equal(fallback.get_never_enables, true);
    assert.equal(fallback.live_nodes, 0);
    assert.equal(fallback.law, SPLIT_THE_WIRES);
    assert.equal(fallback.cold_copy_survival, COLD_COPY_SURVIVAL);
    assert.equal(fallback.reheal, REHEAL);
    assert.equal(fallback.phoenix_brings_uk_back, false);
    assert.equal(status.law, SPLIT_THE_WIRES);
    assert.equal(status.cold_copy_survival, COLD_COPY_SURVIVAL);
    assert.equal(status.reheal, REHEAL);
    assert.match(status.note, /COLD-COPY SURVIVAL/);
    assert.match(status.note, /REHEAL refuse/);
  });
});

describe("SPLIT THE WIRES + COLD-COPY SURVIVAL mesh law", () => {
  it("locks tip/payload split, Phoenix local, and cold-copy survival", () => {
    assert.equal(SPLIT_THE_WIRES, "SPLIT THE WIRES");
    assert.equal(SPLIT_THE_WIRES_SPEC, "SPLIT-THE-WIRES-1.0");
    assert.equal(COLD_COPY_SURVIVAL, "COLD-COPY SURVIVAL");
    assert.equal(COLD_COPY_SURVIVAL_SPEC, "COLD-COPY-SURVIVAL-1.0");
    assert.equal(TIP_TICK_MIN_MS, 500);
    assert.equal(TIP_TICK_MAX_MS, 1000);
    assert.equal(PAYLOAD_DWELL_S, 777);
    assert.equal(SPLIT_THE_WIRES_LAW.sockets_share, false);
    assert.equal(SPLIT_THE_WIRES_LAW.phoenix.scope, "local");
    assert.equal(SPLIT_THE_WIRES_LAW.phoenix.brings_uk_back, false);
    assert.equal(SPLIT_THE_WIRES_LAW.phoenix.die_with_pull, true);
    assert.equal(SPLIT_THE_WIRES_LAW.payload.kind, "pull-only");
    assert.equal(SPLIT_THE_WIRES_LAW.payload.update, "proof-not-timer");
    assert.equal(SPLIT_THE_WIRES_LAW.equivocation, "ends-peer-not-chain");
    assert.equal(SPLIT_THE_WIRES_LAW.emit_last, "locally");
    assert.equal(SPLIT_THE_WIRES_LAW.partition, "no-auto-splice");
    assert.equal(SPLIT_THE_WIRES_LAW.heartbeat_loss, "not-poison");
    assert.equal(COLD_COPY_SURVIVAL_LAW.copies, "multiply");
    assert.equal(COLD_COPY_SURVIVAL_LAW.live_sync, false);
    assert.equal(COLD_COPY_SURVIVAL_LAW.tip_erase, "expensive");
    assert.equal(COLD_COPY_SURVIVAL_LAW.server_pull_erases_records, false);
    assert.equal(COLD_COPY_SURVIVAL_LAW.data_outlives_creators, true);
    assert.equal(SPLIT_THE_WIRES_LAW.author, AUTHOR);
    assert.equal(COLD_COPY_SURVIVAL_LAW.identity, AUTHOR);
    assert.equal(REHEAL, "REHEAL");
    assert.equal(REHEAL_SPEC, "REHEAL-1.0");
    assert.deepEqual(REHEAL_ALLOWED, ["live", "locked", "isolated", "tip-hash"]);
    assert.deepEqual(REHEAL_FORBIDDEN, ["bodies", "diffs", "vote-to-fix"]);
    assert.equal(REHEAL_ACTION, "isolate+drop-tether+local-phoenix");
    assert.equal(REHEAL_LAW.poisoned.recover, "own-last-good-tip+verified-trusted-pull");
    assert.equal(REHEAL_LAW.poisoned.or, "phoenix-WAIT");
    assert.equal(REHEAL_LAW.poisoned.neighbor_talkback, false);
    assert.equal(REHEAL_LAW.softwares, "runtime-only");
    assert.equal(REHEAL_LAW.author, AUTHOR);
  });

  it("refuses shared sockets, timer updates, Phoenix .uk restore, and live sync", () => {
    assert.equal(evaluateSplitTheWires({ shares_socket: true }).code, "STW-SHARED-SOCKET");
    assert.equal(evaluateSplitTheWires({ socket_1s: "same", socket_777s: "same" }).code, "STW-SHARED-SOCKET");
    assert.equal(evaluateSplitTheWires({ plane: "tip", tick_ms: 50 }).code, "STW-TIP-TICK");
    assert.equal(evaluateSplitTheWires({ plane: "tip", size: "variable" }).code, "STW-TIP-NOT-FIXED");
    assert.equal(evaluateSplitTheWires({ plane: "payload", push: true }).code, "STW-PUSH-PAYLOAD");
    assert.equal(evaluateSplitTheWires({ plane: "payload", update: "timer" }).code, "STW-TIMER-UPDATE");
    assert.equal(evaluateSplitTheWires({ plane: "payload", cite_prev: false }).code, "STW-CITE-FAIL-CLOSED");
    assert.equal(evaluateSplitTheWires({ plane: "payload", clock_desync: "yes" }).code, "STW-CLOCK-DESYNC");
    assert.equal(evaluateSplitTheWires({ plane: "payload", ambiguous: true }).code, "STW-AMBIGUOUS-ISOLATE");
    assert.equal(evaluateSplitTheWires({ equivocation: true, ends: "chain" }).code, "STW-EQUIVOCATION-CHAIN");
    assert.equal(evaluateSplitTheWires({ emit_last: "remote" }).code, "STW-EMIT-LAST-REMOTE");
    assert.equal(evaluateSplitTheWires({ bring_uk_back: true }).code, "STW-PHOENIX-UK");
    assert.equal(evaluateSplitTheWires({ auto_splice: true }).code, "STW-AUTO-SPLICE");
    assert.equal(evaluateSplitTheWires({ heartbeat_loss: true, poison: true }).code, "STW-LOSS-IS-POISON");
    assert.equal(evaluateSplitTheWires({ heartbeat_loss: true, apply_last_packet: true }).code, "STW-APPLY-LAST-PACKET");
    assert.equal(phoenixBringsUkRefused().code, "STW-PHOENIX-UK");
    assert.equal(phoenixBringsUkRefused().phoenix_brings_uk_back, false);
    assert.match(phoenixBringsUkRefused().error, /does not bring godlock\.uk back/);
    assert.equal(evaluateColdCopySurvival({ live_sync: true }).code, "CCS-LIVE-SYNC");
    assert.equal(evaluateColdCopySurvival({ single_live_copy: true }).code, "CCS-NO-MULTIPLY");
    assert.equal(evaluateColdCopySurvival({ erase_tip: true }).code, "CCS-ERASE-TIP");
    assert.equal(evaluateColdCopySurvival({ server_pull: true, erase_records: true }).code, "CCS-PULL-ERASES");
    assert.equal(evaluateColdCopySurvival({ creator_gone: true, erase_data: true }).code, "CCS-CREATOR-DEATH-ERASE");
    assert.equal(liveSyncRefused().code, "CCS-LIVE-SYNC");
    assert.equal(serverPullEraseRefused().code, "CCS-PULL-ERASES");
    assert.equal(evaluateMeshLaw({ live_sync: true }).code, "CCS-LIVE-SYNC");
    assert.equal(evaluateMeshLaw({ bring_uk_back: true }).code, "STW-PHOENIX-UK");
    assert.equal(evaluateReheal({ neighbor_talkback: true }).code, "RH-NEIGHBOR-TALKBACK");
    assert.equal(evaluateReheal({ talk_back_to_health: true }).code, "RH-NEIGHBOR-TALKBACK");
    assert.equal(evaluateReheal({ bodies: true }).code, "RH-BODIES");
    assert.equal(evaluateReheal({ diffs: true }).code, "RH-DIFFS");
    assert.equal(evaluateReheal({ vote_to_fix: true }).code, "RH-VOTE-TO-FIX");
    assert.equal(evaluateReheal({ share: ["bodies"] }).code, "RH-BODIES");
    assert.equal(evaluateReheal({ share: ["live", "locked", "isolated", "tip-hash", "payload"] }).code, "RH-FORBIDDEN-SHARE");
    assert.equal(evaluateReheal({ poisoned: true }).code, "RH-NO-OWN-TIP");
    assert.equal(evaluateReheal({ poisoned: true, keep_tether: true, own_last_good_tip: true, verified_trusted_pull: true }).code, "RH-KEEP-TETHER");
    assert.equal(evaluateReheal({ poisoned: true, isolate: false, own_last_good_tip: true, verified_trusted_pull: true }).code, "RH-NO-ISOLATE");
    assert.equal(evaluateReheal({ poisoned: true, phoenix: "remote", own_last_good_tip: true, verified_trusted_pull: true }).code, "RH-REMOTE-PHOENIX");
    assert.equal(evaluateReheal({ softwares_tab: true }).code, "RH-SOFTWARES-RUNTIME-ONLY");
    assert.equal(rehealRefused().code, "RH-NEIGHBOR-TALKBACK");
    assert.equal(rehealRefused().neighbor_talkback, false);
    assert.match(rehealRefused().error, /phoenix-WAIT/);
    assert.equal(evaluateMeshLaw({ neighbor_talkback: true }).code, "RH-NEIGHBOR-TALKBACK");
    assert.equal(evaluateReheal({
      poisoned: true,
      own_last_good_tip: true,
      verified_trusted_pull: true,
      share: ["live", "locked", "isolated", "tip-hash"],
    }).ok, true);
    assert.equal(evaluateReheal({
      poisoned: true,
      phoenix_wait: true,
      share: ["tip-hash"],
    }).ok, true);
    const ok = evaluateMeshLaw({
      plane: "tip",
      tick_ms: 750,
      carry: "presence+tip-hash",
      size: "fixed",
      emit_last: "locally",
    });
    assert.equal(ok.ok, true);
    assert.equal(ok.law, SPLIT_THE_WIRES);
    assert.equal(ok.cold_copy_survival, COLD_COPY_SURVIVAL);
  });

  it("stamps both laws on refuse/status even when mesh rollup is unavailable", () => {
    const empty = emptyMesh();
    assert.equal(empty.enabled, false);
    assert.equal(empty.law, SPLIT_THE_WIRES);
    assert.equal(empty.cold_copy_survival, COLD_COPY_SURVIVAL);
    assert.equal(empty.phoenix_brings_uk_back, false);
    assert.equal(empty.live_sync, false);
    assert.equal(empty.reheal, REHEAL);
    assert.equal(empty.neighbor_talkback, false);
    assert.equal(empty.softwares_runtime_only, true);
    assert.equal(empty.law_binds_when_off, true);
    assert.match(empty.note, /Cold copies multiply/);
    assert.match(empty.note, /No neighbor talk-back-to-health/);
    const pub = publicMesh(empty);
    assert.equal(pub.law, SPLIT_THE_WIRES);
    assert.equal(pub.cold_copy.copies, "multiply");
    assert.equal(pub.split_the_wires.phoenix.brings_uk_back, false);
    assert.equal(pub.reheal, REHEAL);
    assert.deepEqual(pub.reheal_forbidden, ["bodies", "diffs", "vote-to-fix"]);
    const stamped = stampMeshLaw({ ok: true, note: "rollup missing" });
    assert.match(stamped.note, /SPLIT THE WIRES/);
    assert.match(stamped.note, /COLD-COPY SURVIVAL/);
    assert.match(stamped.note, /REHEAL refuse/);
    const ops = meshOpsDoc();
    assert.equal(ops.phoenix_brings_uk_back, false);
    assert.equal(ops.server_pull_erases_records, false);
    assert.equal(ops.data_outlives_creators, true);
    assert.equal(ops.reheal, REHEAL);
    assert.equal(ops.softwares_runtime_only, true);
  });
});
