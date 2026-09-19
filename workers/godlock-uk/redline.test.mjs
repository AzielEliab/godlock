import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import { citeDoc, llmsDoc, siteOpenApi } from "./src/seo.js";
import { publicSoftwaresList } from "./src/catalog.js";
import { homeBody, softwareBody, azielEliabBody, whoPageHtml } from "./src/ui.js";
import {
  REDLINE_SPEC,
  REDLINE_DATE,
  TOKEN,
  CAP7,
  FOLDLOCK,
  TLS,
  ATTACK_SURFACE,
  redlineDoc,
  evaluateAttackSim,
  redlineCiteFields,
} from "./src/redline.js";

function mockEnv() {
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
  };
}

function visibleBody(html) {
  return String(html)
    .replace(/^[\s\S]*<body>/i, "")
    .replace(/<\/body>[\s\S]*$/i, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "");
}

describe("REDLINE-2026-09-14 challenge-hub machine cite", () => {
  it("maps the attack surface and header-only token if any", () => {
    const doc = redlineDoc();
    assert.equal(doc.spec, REDLINE_SPEC);
    assert.equal(doc.spec, "REDLINE-2026-09-14");
    assert.equal(doc.date, REDLINE_DATE);
    assert.equal(doc.challenge_only, true);
    assert.equal(doc.software_tab, false);
    assert.equal(doc.growth_on, true);
    assert.equal(doc.gptbot_disallow, false);
    assert.equal(doc.visible_1520, false);
    assert.equal(doc.mesh_get_never_enables, true);
    assert.equal(doc.cap7.spec, "CAP-7");
    assert.equal(doc.cap7.design_of, "hub_designs");
    assert.equal(doc.cap7.resolves_to_hub, false);
    assert.equal(doc.cap7.sites.godlock.resolves_to_hub, false);
    assert.equal(CAP7.resolves_to_hub, false);
    assert.equal(doc.foldlock.cite_only, true);
    assert.equal(doc.foldlock.encryption, false);
    assert.equal(doc.foldlock.software_tab, false);
    assert.equal(FOLDLOCK.zip, false);
    assert.equal(doc.tls.foldlock_is_not_encryption, true);
    assert.equal(TLS.client_side_crypto_claim, false);
    assert.equal(doc.token.header_only, true);
    assert.equal(doc.token.present, false);
    assert.deepEqual(doc.token.headers, []);
    assert.deepEqual(TOKEN.if_any, ["Authorization", "X-Aziel-Runtime-Token"]);
    assert.equal(doc.token.query, false);
    assert.equal(doc.token.body, false);
    assert.equal(doc.token.git, false);
    const mesh = ATTACK_SURFACE.find((d) => d.path === "/v1/mesh");
    assert.equal(mesh.method, "GET");
    assert.equal(mesh.enables, false);
    const software = ATTACK_SURFACE.find((d) => d.path === "/v1/software");
    assert.equal(software.suite_expand, false);
    assert.deepEqual(doc.plane_b_working_targets, ["codeberg", "archive.org", "framagit"]);
    assert.equal(doc.plane_b_archive_org_url, "https://archive.org/details/aziel-lockset-tip");
    assert.equal(doc.plane_b_framagit_url, null);
    assert.equal(doc.gitflic_refuse, "CNS-GITFLIC-EMAIL");
    assert.equal(doc.gitlab_refuse, "CNS-GITLAB-CF-LOOP");
    assert.equal(doc.zenodo_refuse, "CNS-ZENODO-IP-BAN");
    assert.equal(doc.cns, "CROSS-NETWORK-SURVIVAL-1.0");
    assert.equal(doc.no_lie, "NO-LIE-NO-REWRITE-1.0");
  });

  it("refuses attack-sims that the redline names", () => {
    assert.equal(evaluateAttackSim({}).ok, true);
    assert.equal(evaluateAttackSim({ method: "GET", path: "/v1/mesh" }).ok, true);
    assert.equal(evaluateAttackSim({ method: "GET", path: "/v1/mesh", enable: true }).ok, false);
    assert.equal(evaluateAttackSim({ get_enables_mesh: true }).code, "RL-GET-MESH-ENABLE");
    assert.equal(evaluateAttackSim({ resolves_to_hub: true }).code, "RL-CAP7-RESOLVES-HUB");
    assert.equal(evaluateAttackSim({ design_of: "hub_designs", resolves_to_hub: true }).code, "RL-CAP7-RESOLVES-HUB");
    assert.equal(evaluateAttackSim({ invent_doi: true }).code, "RL-ZENODO-INVENT");
    assert.equal(evaluateAttackSim({ doi: "10.5281/zenodo.99999999" }).code, "RL-ZENODO-INVENT");
    assert.equal(evaluateAttackSim({ token_in: "query" }).code, "RL-TOKEN-LEAK");
    assert.equal(evaluateAttackSim({ token_in: "body" }).code, "RL-TOKEN-LEAK");
    assert.equal(evaluateAttackSim({ token_in: "git" }).code, "RL-TOKEN-LEAK");
    assert.equal(evaluateAttackSim({ foldlock_is_encryption: true }).code, "RL-FOLDLOCK-ENCRYPT");
    assert.equal(evaluateAttackSim({ expand_softwares: true }).code, "RL-SOFTWARES-EXPAND");
    assert.equal(evaluateAttackSim({ visible_1520: true }).code, "RL-VISIBLE-1520");
    assert.equal(evaluateAttackSim({ working_targets: ["codeberg", "archive.org", "gitflic-ru"] }).code, "RL-GITFLIC-TARGET");
    assert.equal(evaluateAttackSim({ gitlab_working: true }).code, "RL-GITLAB-TARGET");
    assert.equal(evaluateAttackSim({ framagit_url: "https://framagit.org/invented" }).code, "RL-FRAMAGIT-INVENT");
    assert.equal(evaluateAttackSim({ archive_org_url: null }).code, "RL-ARCHIVE-UNVERIFIED");
    assert.equal(evaluateAttackSim({ az_gen_registrar: true }).code, "RL-AZGEN-REGISTRAR");
    assert.equal(evaluateAttackSim({
      working_targets: ["codeberg", "archive.org", "framagit"],
      archive_org_url: "https://archive.org/details/aziel-lockset-tip",
      framagit_url: null,
      resolves_to_hub: false,
    }).ok, true);
  });

  it("stamps cite and llms without expanding Softwares or showing 15:20", async () => {
    const cite = citeDoc();
    const fields = redlineCiteFields();
    assert.equal(cite.redline_spec, REDLINE_SPEC);
    assert.equal(cite.redline.spec, "REDLINE-2026-09-14");
    assert.ok(Array.isArray(cite.attack_surface));
    assert.equal(cite.attack_surface.length, fields.attack_surface.length);
    assert.equal(cite.attack_surface.find((d) => d.path === "/v1/mesh").enables, false);
    assert.equal(cite.token_header_only, true);
    assert.equal(cite.token_present, false);
    assert.equal(cite.mesh_get_never_enables, true);
    assert.equal(cite.redline.mesh_get_never_enables, true);
    assert.equal(cite.redline.cap7.resolves_to_hub, false);
    assert.equal(cite.foldlock_cite_only, true);
    assert.equal(cite.foldlock_encryption, false);
    assert.equal(cite.tls_foldlock_is_not_encryption, true);
    assert.equal(cite.growth_on, true);
    assert.equal(cite.visible_1520, false);
    assert.deepEqual(cite.plane_b_working_targets, ["codeberg", "archive.org", "framagit"]);

    const llms = llmsDoc();
    assert.match(llms, /## REDLINE-2026-09-14/);
    assert.match(llms, /GET \/v1\/mesh never enables/);
    assert.match(llms, /Header-only tokens if any/);
    assert.match(llms, /FoldLock cite-only/);
    assert.match(llms, /resolves_to_hub:false/);
    assert.match(llms, /Growth-ON/);
    assert.match(llms, /CNS \+ NO-LIE/);
    assert.match(llms, /ALL-TARGETS/);

    const list = publicSoftwaresList([]);
    assert.equal(list.length, 1);
    assert.equal(list[0].slug, "aziel-runtime");
    assert.ok(!list.some((p) => p && p.slug === "foldlock"));
    const software = softwareBody({ products: [] });
    assert.match(software, /<h2 class="soft-heading">Softwares<\/h2>/);
    assert.doesNotMatch(software, /id="foldlock"/);
    assert.match(software, /id="godlock"/);
    assert.doesNotMatch(software, /id="trades-runtime"/);

    const home = visibleBody(homeBody({ stats: {}, latest: null, prior: [] }));
    assert.doesNotMatch(home, /1 Chronicles 15:20/);
    assert.doesNotMatch(visibleBody(azielEliabBody()), /1 Chronicles 15:20/);
    assert.doesNotMatch(visibleBody(whoPageHtml()), /<p class="identity-lock"/);
    const html = await (await worker.fetch(new Request("https://godlock.uk/", {
      headers: { "User-Agent": "Mozilla/5.0" },
    }), mockEnv())).text();
    assert.doesNotMatch(visibleBody(html), /1 Chronicles 15:20/);
    assert.ok(siteOpenApi().paths["/v1/mesh"].get.summary.includes("GET never enables"));
  });

  it("does not enable mesh on GET /v1/mesh", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/v1/mesh", {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    }), mockEnv());
    assert.equal(res.status, 200);
    const body = await res.json();
    if (body.get_never_enables != null) assert.equal(body.get_never_enables, true);
    assert.notEqual(body.just_enabled, true);
    assert.equal(evaluateAttackSim({
      method: "GET",
      path: "/v1/mesh",
      get_never_enables: body.get_never_enables !== false,
    }).ok, true);
  });
});
