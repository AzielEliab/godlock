import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import {
  AZIEL_PERSON_ID,
  CANON_HOST,
  INDEXNOW_KEY,
  INDEXNOW_KEY_PATH,
  INDEXNOW_WELL_KNOWN_PATH,
  indexNowKeyBody,
  robotsTxt,
  sitemapXml,
} from "./src/seo.js";

const AZIEL_INDEXNOW_KEY = "74f44bd8-2322-41ed-bbb0-23594a6646f8";
const HEDIDNTJUMP_INDEXNOW_KEY = "4241818f-5799-488c-9457-da724a30831c";

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

describe("godlock.uk IndexNow key", () => {
  it("serves a dedicated key whose file body equals the key and robots Allow the key paths", async () => {
    assert.equal(AZIEL_PERSON_ID, "https://www.azieleliab.com/#aziel");
    assert.match(INDEXNOW_KEY, /^[a-f0-9-]{8,128}$/);
    assert.notEqual(INDEXNOW_KEY, AZIEL_INDEXNOW_KEY);
    assert.notEqual(INDEXNOW_KEY, HEDIDNTJUMP_INDEXNOW_KEY);
    assert.equal(INDEXNOW_KEY_PATH, "/" + INDEXNOW_KEY + ".txt");
    assert.equal(INDEXNOW_WELL_KNOWN_PATH, "/.well-known/indexnow-key.txt");
    assert.equal(indexNowKeyBody().trim(), INDEXNOW_KEY);
    assert.equal(indexNowKeyBody(), INDEXNOW_KEY + "\n");

    const robots = robotsTxt();
    assert.match(robots, /User-agent: \*\nAllow: \/\nContent-Signal: search=yes, ai-input=yes, ai-train=yes/);
    assert.doesNotMatch(robots, /Disallow:/);
    assert.match(robots, /Allow: \/\.well-known\/indexnow-key\.txt/);
    assert.match(robots, new RegExp("Allow: /" + INDEXNOW_KEY.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\.txt"));
    assert.doesNotMatch(robots, new RegExp(AZIEL_INDEXNOW_KEY));
    assert.doesNotMatch(robots, new RegExp(HEDIDNTJUMP_INDEXNOW_KEY));

    const root = await fetchPath(INDEXNOW_KEY_PATH);
    const well = await fetchPath(INDEXNOW_WELL_KNOWN_PATH);
    assert.equal(root.status, 200);
    assert.equal(well.status, 200);
    assert.match(root.headers.get("Content-Type") || "", /^text\/plain/);
    assert.match(well.headers.get("Content-Type") || "", /^text\/plain/);
    const rootBody = await root.text();
    const wellBody = await well.text();
    assert.equal(rootBody, INDEXNOW_KEY + "\n");
    assert.equal(wellBody, INDEXNOW_KEY + "\n");
    assert.equal(rootBody.trim(), INDEXNOW_KEY);
    assert.equal(wellBody.trim(), INDEXNOW_KEY);
    assert.equal(rootBody, wellBody);

    const xml = await sitemapXml({});
    const today = new Date().toISOString().slice(0, 10);
    assert.ok(xml.includes("<loc>" + CANON_HOST + INDEXNOW_KEY_PATH + "</loc>"));
    assert.ok(xml.includes("<loc>" + CANON_HOST + INDEXNOW_WELL_KNOWN_PATH + "</loc>"));
    assert.doesNotMatch(xml, new RegExp("https://www\\.azieleliab\\.com/" + AZIEL_INDEXNOW_KEY));
    assert.doesNotMatch(xml, new RegExp("https://www\\.hedidntjump\\.com/" + HEDIDNTJUMP_INDEXNOW_KEY));
    const mods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
    assert.ok(mods.length > 0);
    for (const mod of mods) assert.equal(mod, today);

    const home = await fetchPath("/");
    assert.match(home.headers.get("Content-Type") || "", /text\/html/);
    const html = await home.text();
    assert.doesNotMatch(html, /IndexNow/);
    assert.doesNotMatch(html, new RegExp(INDEXNOW_KEY));
  });
});
