import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import {
  softwareApiDoc,
  publicSoftwaresList,
  publicSoftwaresHtmlList,
} from "./src/catalog.js";
import {
  WHITESTONE_ADDENDUM,
  WHITESTONE_URL,
  SOFTWARE_SSOT,
  SOFTWARE_SSOT_FALLBACK,
  SOFTWARE_HUB_LOCAL_NOTE,
  citeDoc,
  llmsDoc,
  OFFICIAL_SOFTWARES,
} from "./src/seo.js";
import { softwareBody, suiteSoftwaresSsotPointer } from "./src/ui.js";
import { helpDoc } from "./src/help.js";

function mockEnv() {
  const stmt = {
    bind() { return stmt; },
    async first() { return null; },
    async all() { return { results: [] }; },
    async run() { return { success: true }; },
  };
  return {
    DB: { prepare() { return stmt; }, async batch() { return []; } },
    MESH_PROBE_ORIGIN: false,
  };
}

describe("GodLock Softwares Whitestone via Worker SSoT", () => {
  it("keeps hub-local /v1/software off the suite catalog and cites Whitestone on Worker SSoT", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/v1/software"), mockEnv());
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.source, "godlock-uk");
    assert.equal(body.hub_local, true);
    assert.equal(body.cloned_suite, false);
    assert.equal(body.prefer_worker_ssot, true);
    assert.equal(body.fraggate_list_fallback_only, true);
    assert.equal(body.catalog_ssot, SOFTWARE_SSOT);
    assert.equal(body.catalog_origin, SOFTWARE_SSOT);
    assert.equal(body.catalog_fallback, SOFTWARE_SSOT_FALLBACK);
    assert.equal(body.official_softwares, OFFICIAL_SOFTWARES);
    assert.equal(body.product_count, 1);
    assert.ok(body.products.every((p) => p.slug === "aziel-runtime"));
    assert.ok(!body.products.some((p) => p.slug === "whitestone"));
    assert.ok(!body.products.some((p) => p.slug === "godlock"));
    assert.equal(body.whitestone.slug, "whitestone");
    assert.equal(body.whitestone.engine, false);
    assert.equal(body.whitestone.fraggate, false);
    assert.equal(body.whitestone.door, "none");
    assert.equal(body.whitestone.catalog, SOFTWARE_SSOT);
    assert.equal(body.whitestone.catalog_same_origin, "https://godlock.uk/runtime/v1/software");
    assert.equal(body.whitestone.not_a_godlock_softwares_card, true);
    assert.equal(body.whitestone.not_a_fraggate_door, true);
    assert.equal(body.whitestone.invent_door_ops, false);
    assert.match(body.software_note, /hub-local/);
    assert.match(body.software_note, /not the suite catalog/);
  });

  it("does not invent a FragGate door for Whitestone", () => {
    const api = softwareApiDoc([], { source: "godlock-uk" });
    assert.equal(api.whitestone.fraggate, false);
    assert.equal(api.whitestone.door, "none");
    assert.doesNotMatch(JSON.stringify(api.whitestone), /fraggate_describe|fraggate_call|\/v1\/fraggate\/describe/);
    assert.doesNotMatch(WHITESTONE_ADDENDUM, /\/v1\/fraggate\/|fraggate_describe|fraggate_call/);
    assert.match(WHITESTONE_ADDENDUM, /never invent door ops/);
    assert.ok(WHITESTONE_ADDENDUM.includes(WHITESTONE_URL));
    assert.ok(WHITESTONE_ADDENDUM.includes(SOFTWARE_SSOT));
    assert.ok(WHITESTONE_ADDENDUM.includes("https://godlock.uk/runtime/v1/software"));
    assert.match(WHITESTONE_ADDENDUM, /FragGate list is fallback only/);
    assert.match(WHITESTONE_ADDENDUM, /Not a FragGate door/);
    assert.equal(publicSoftwaresList([]).every((p) => p.slug === "aziel-runtime"), true);
    assert.deepEqual(publicSoftwaresHtmlList([]).map((p) => p.slug), ["godlock", "aziel-runtime"]);
  });

  it("points Softwares HTML and help at Worker SSoT without a Whitestone card", () => {
    const html = softwareBody({ products: [] });
    assert.match(html, /Suite Softwares catalog \(Worker SSoT\)/);
    assert.match(html, /href="https:\/\/aziel-runtime\.vibelock\.workers\.dev\/v1\/software"/);
    assert.match(html, /href="\/runtime\/v1\/software"/);
    assert.match(html, /FragGate list is fallback only/);
    assert.doesNotMatch(html, /Whitestone/);
    assert.doesNotMatch(html, /id="whitestone"/);
    assert.match(suiteSoftwaresSsotPointer(), /Worker SSoT/);
    const help = helpDoc();
    assert.match(help, /hub-local/);
    assert.ok(help.includes(SOFTWARE_SSOT));
    assert.ok(help.includes("https://godlock.uk/runtime/v1/software"));
    assert.match(help, /FragGate list fallback only/);
    assert.match(SOFTWARE_HUB_LOCAL_NOTE, /Worker GET/);
    const cite = citeDoc();
    assert.equal(cite.software_hub_local, true);
    assert.equal(cite.software_ssot, SOFTWARE_SSOT);
    assert.equal(cite.software_fraggate_fallback_only, true);
    assert.equal(cite.whitestone_catalog, SOFTWARE_SSOT);
    assert.equal(cite.whitestone_fraggate, false);
    assert.equal(cite.whitestone_godlock_softwares_html_card, false);
    const llms = llmsDoc();
    assert.match(llms, /\/v1\/software JSON is hub-local/);
    assert.ok(llms.includes(SOFTWARE_SSOT));
    assert.ok(llms.includes(WHITESTONE_ADDENDUM));
  });
});
