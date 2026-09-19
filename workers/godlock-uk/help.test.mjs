import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import { helpDoc, HELP_PATHS, isHelpPath } from "./src/help.js";
import { robotsTxt, sitemapXml, siteOpenApi, CANON_HOST, GODLOCK_SITE_BLURB, AZIEL_PERSON_ID } from "./src/seo.js";
import { softwareBody } from "./src/ui.js";

function mockEnv() {
  const stmt = {
    bind() {
      return stmt;
    },
    async first() {
      return null;
    },
    async all() {
      return { results: [] };
    },
    async run() {
      return { success: true };
    },
  };
  return {
    DB: {
      prepare() {
        return stmt;
      },
      async batch() {
        return [];
      },
    },
    MESH_PROBE_ORIGIN: false,
  };
}

async function fetchPath(path) {
  return worker.fetch(new Request("https://godlock.uk" + path), mockEnv());
}

const FORBIDDEN_HELP = [
  "THIS IS NOT",
  "What this is not",
  "what not to say",
  "blocked from",
  "CNS-ZENODO-IP-BAN",
  "Operator IP banned",
  "product, not identity",
  "Not a second FragGate door",
];

describe("human help / addendum text", () => {
  it("lists the help aliases and builds positive copy", () => {
    assert.deepEqual(HELP_PATHS, ["/help.txt", "/HELP.txt", "/addendum.txt", "/help/README.txt", "/help"]);
    for (const path of HELP_PATHS) assert.equal(isHelpPath(path), true);
    const text = helpDoc();
    assert.match(text, /GodLock\.uk — human help/);
    assert.ok(text.includes(GODLOCK_SITE_BLURB));
    assert.ok(text.includes(AZIEL_PERSON_ID));
    assert.match(text, /How to verify/);
    assert.match(text, /https:\/\/godlock\.uk\/verify/);
    assert.match(text, /https:\/\/godlock\.uk\/receipts/);
    assert.match(text, /GodLock-first/);
    assert.match(text, /https:\/\/godlock\.uk\/software/);
    assert.match(text, /https:\/\/www\.azieleliab\.com\/software/);
    assert.match(text, /https:\/\/godlock\.uk\/llms\.txt/);
    assert.match(text, /https:\/\/godlock\.uk\/ai\.txt/);
    assert.match(text, /https:\/\/godlock\.uk\/cite\.json/);
    assert.match(text, /Growth-ON/);
    assert.match(text, /Never invent/);
    assert.match(text, /NO-LIE/);
    for (const phrase of FORBIDDEN_HELP) {
      assert.doesNotMatch(text, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), phrase);
    }
  });

  it("serves the same body on each help alias", async () => {
    const expected = helpDoc();
    for (const path of HELP_PATHS) {
      const res = await fetchPath(path);
      assert.equal(res.status, 200, path);
      assert.match(res.headers.get("Content-Type") || "", /text\/plain/);
      assert.equal(await res.text(), expected, path);
    }
  });

  it("lists help paths on robots, sitemap, and OpenAPI without changing Softwares chrome", async () => {
    const robots = robotsTxt();
    for (const path of HELP_PATHS) {
      assert.match(robots, new RegExp("Allow: " + path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
    const xml = await sitemapXml({});
    for (const path of HELP_PATHS) {
      assert.ok(xml.includes("<loc>" + CANON_HOST + path + "</loc>"), path);
    }
    const spec = siteOpenApi();
    assert.ok(spec.paths["/help.txt"]);
    assert.ok(spec.paths["/HELP.txt"]);
    assert.ok(spec.paths["/addendum.txt"]);
    assert.ok(spec.paths["/help/README.txt"]);
    assert.ok(spec.paths["/help"]);
    const html = softwareBody({ products: [] });
    assert.match(html, /<h2 class="soft-heading">Softwares<\/h2>\s*<div class="soft-grid">/);
    assert.doesNotMatch(html, />Help</);
    assert.doesNotMatch(html, /href="\/help\.txt"/);
  });
});
