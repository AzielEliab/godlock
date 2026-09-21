import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import {
  citeDoc,
  llmsDoc,
  aiDoc,
  robotsTxt,
  sitemapXml,
  siteOpenApi,
  personNode,
  personJsonLd,
  whoIsAzielEliabTxt,
  wellKnownAzielDoc,
  CANON_HOST,
} from "./src/seo.js";
import { page } from "./src/ui.js";
import {
  BAN_SURVIVAL,
  BAN_PLATFORMS,
  BAN_CALLING_NAME,
  SPORE,
  RE_COLD_STORE,
  SPORE_WORKER_VERSION_ID,
  SPORE_SOT,
  SPORE_PAPER,
  SPORE_FACES,
  SURVIVAL_TTL_MS,
  SURVIVAL_ORIGIN,
  SURVIVAL_LOCAL,
  SURVIVAL_LOCAL_JSON,
  MIRAGEGRID_WORKER,
  MIRAGEGRID_BRIDGE,
  FALLBACK_LIVE_DOORS,
  FALLBACK_PLATFORM_IDS,
  looksLikeSurvivalDoc,
  compactSurvivalSot,
  compactLiveDoors,
  compactSpore,
  compactReColdStore,
  fetchSurvivalSot,
  resetSurvivalCache,
  survivalCiteFields,
  survivalHubDoc,
  survivalLlmsSection,
} from "./src/survival.js";

function mockEnv(extra = {}) {
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
    ...extra,
  };
}

async function fetchPath(path, env) {
  return worker.fetch(new Request("https://godlock.uk" + path, {
    headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
  }), env || mockEnv());
}

function liveSot(over = {}) {
  return {
    spec: BAN_SURVIVAL,
    mode: "LIVE",
    author: "Aziel Eliab",
    identity: "Aziel Eliab",
    person_id: "https://www.azieleliab.com/#aziel",
    mutual_backup: true,
    lie_to_survive: false,
    second_door: false,
    visible_1520: false,
    live_doors: FALLBACK_LIVE_DOORS.slice(),
    platforms: {
      spec: BAN_PLATFORMS,
      all_live: true,
      native_app_store: false,
      calling_name: "Aziel Runtime",
      platforms: FALLBACK_PLATFORM_IDS.map((id) => ({ id, live: true })),
    },
    calling_name: {
      spec: BAN_CALLING_NAME,
      calling_name: "Aziel Runtime",
      calling_slug: "aziel-runtime",
      identity: "Aziel Eliab",
      rotated: false,
      identity_unchanged: true,
    },
    cap7_aznet: {
      factory: "miragegrid",
      resolves_to_hub: false,
      cite: { status: "live" },
      hosted_endpoints: { status: "slot", is_live_door: false },
      shuffle: { spec: "CAP7-SHUFFLE-1.0", hardcoded_single_host: false, site_count: 7 },
    },
    ...over,
  };
}

describe("BAN-SURVIVAL hub pull", () => {
  beforeEach(() => {
    resetSurvivalCache();
  });

  it("locks SoT URLs, TTL, Person, and MirageGrid Cap-7 Worker", () => {
    assert.equal(BAN_SURVIVAL, "BAN-SURVIVAL-1.0");
    assert.equal(SURVIVAL_TTL_MS, 60 * 1000);
    assert.equal(SURVIVAL_ORIGIN, "https://aziel-runtime.vibelock.workers.dev/v1/survival");
    assert.equal(SURVIVAL_LOCAL, "https://godlock.uk/survival");
    assert.equal(SURVIVAL_LOCAL_JSON, "https://godlock.uk/v1/survival");
    assert.equal(MIRAGEGRID_WORKER, "https://miragegrid.vibelock.workers.dev");
    assert.equal(MIRAGEGRID_BRIDGE, "https://miragegrid.vibelock.workers.dev/bridge");
    assert.deepEqual(FALLBACK_LIVE_DOORS.map((d) => d.id), [
      "workers-dev",
      "library-runtime",
      "author-runtime",
      "godlock-runtime",
    ]);
    assert.equal(FALLBACK_LIVE_DOORS.find((d) => d.id === "godlock-runtime").origin, "https://godlock.uk/runtime");
    const fields = survivalCiteFields();
    assert.equal(fields.mutual_backup, true);
    assert.equal(fields.platforms_all_live, true);
    assert.equal(fields.platforms_native_app_store, false);
    assert.equal(fields.calling_name, "Aziel Runtime");
    assert.equal(fields.calling_name_identity, "Aziel Eliab");
    assert.equal(fields.cap7_factory_worker, MIRAGEGRID_WORKER);
    assert.equal(fields.cap7_resolves_to_hub, false);
    assert.equal(fields.cap7_hosted_endpoints, "slot");
    assert.equal(fields.cap7_hosted_is_live_door, false);
    assert.deepEqual(fields.cap7_public_pair, ["azgrid", "azbooth"]);
    assert.deepEqual(fields.cap7_godlock_design_of, ["azcloak", "azstandby"]);
    assert.equal(fields.lie_to_survive, false);
    assert.equal(fields.visible_1520, false);
    assert.equal(fields.product_not_identity, true);
    assert.equal(fields.spore, SPORE);
    assert.equal(fields.spore_role, "failsafe");
    assert.equal(fields.spore_failsafe, true);
    assert.equal(fields.spore_last_resort, true);
    assert.equal(fields.spore_replaces_cold_shelves, false);
    assert.equal(fields.spore_replaces_ban_survival, false);
    assert.equal(fields.spore_software_tab, false);
    assert.equal(fields.spore_fraggate_slug, false);
    assert.deepEqual(fields.spore_faces, SPORE_FACES.slice());
    assert.equal(fields.spore_paper, SPORE_PAPER);
    assert.equal(fields.spore_worker, "a8f7fdc9");
    assert.equal(fields.spore_sot, "aziel-runtime#152 LIVE Worker a8f7fdc9");
    assert.equal(SPORE_WORKER_VERSION_ID, "a8f7fdc9");
    assert.equal(SPORE_SOT, "aziel-runtime#152 LIVE Worker a8f7fdc9");
    assert.equal(fields.re_cold_store_hook, RE_COLD_STORE);
    assert.equal(fields.re_cold_store_active, false);
    assert.equal(fields.re_cold_store_invent_destination, false);
    assert.deepEqual(fields.re_cold_store_destinations, []);
    assert.deepEqual(fields.survival_stack.map((row) => row.id), ["live-fronts", "cold-shelves", "spore"]);
    assert.equal(fields.survival_stack[2].role, "failsafe");
  });

  it("refuses invented live doors and forged identity on compact", () => {
    assert.equal(looksLikeSurvivalDoc({ spec: BAN_SURVIVAL, author: "Someone Else" }), false);
    assert.equal(looksLikeSurvivalDoc({ spec: BAN_SURVIVAL, author: "Aziel Eliab", lie_to_survive: true }), false);
    assert.equal(looksLikeSurvivalDoc({ spec: BAN_SURVIVAL, author: "Aziel Eliab", person_id: "https://godlock.uk/#godlock" }), false);
    assert.equal(looksLikeSurvivalDoc(liveSot()), true);
    const doors = compactLiveDoors([
      { id: "ghost", origin: "http://invented.example", status: "live" },
      { id: "banned", origin: "https://banned.example", status: "blocked" },
      { id: "workers-dev", origin: "https://aziel-runtime.vibelock.workers.dev", status: "live" },
    ]);
    assert.deepEqual(doors.map((d) => d.id), ["workers-dev"]);
    const compacted = compactSurvivalSot({
      ...liveSot(),
      calling_name: { calling_name: "Whitestone AI", rotated: true, identity: "Aziel Eliab" },
      platforms: { all_live: true, native_app_store: false, calling_name: "Whitestone AI" },
    });
    assert.equal(compacted.calling_name.calling_name, "Whitestone AI");
    assert.equal(compacted.calling_name.rotated, true);
    assert.equal(compacted.calling_name.identity, "Aziel Eliab");
    assert.equal(compacted.cap7_aznet.resolves_to_hub, false);
    assert.equal(compacted.lie_to_survive, false);
    assert.equal(compacted.visible_1520, false);
    assert.equal(compacted.spore.spec, SPORE);
    assert.equal(compacted.spore.failsafe, true);
    assert.equal(compacted.spore.replaces_cold_shelves, false);
    assert.equal(compacted.spore.software_tab, false);
    assert.equal(compacted.re_cold_store.hook, RE_COLD_STORE);
    assert.equal(compacted.re_cold_store.invent_destination, false);
    assert.deepEqual(compacted.re_cold_store.destinations, []);
  });

  it("cites SPORE failsafe + RE-COLD-STORE without inventing destinations or replacing shelves", () => {
    const forged = compactReColdStore({
      hook: "invented",
      active: true,
      shelves_failed: false,
      invent_destination: true,
      destinations: ["https://invented.example/shelf", "not-a-url"],
    });
    assert.equal(forged.hook, RE_COLD_STORE);
    assert.equal(forged.active, false);
    assert.equal(forged.invent_destination, false);
    assert.deepEqual(forged.destinations, []);
    const attested = compactReColdStore({
      active: true,
      shelves_failed: true,
      invent_destination: false,
      destinations: ["https://archive.org/details/aziel-lockset-tip", "ftp://nope"],
    });
    assert.equal(attested.active, true);
    assert.deepEqual(attested.destinations, ["https://archive.org/details/aziel-lockset-tip"]);
    const spore = compactSpore({
      spec: "not-spore",
      role: "replacement",
      failsafe: false,
      replaces_cold_shelves: true,
      software_tab: true,
      fraggate_slug: true,
      paper: "docs/designs/SPORE-1.0.md",
    });
    assert.equal(spore.spec, SPORE);
    assert.equal(spore.role, "failsafe");
    assert.equal(spore.failsafe, true);
    assert.equal(spore.replaces_cold_shelves, false);
    assert.equal(spore.software_tab, false);
    assert.equal(spore.fraggate_slug, false);
    assert.equal(spore.worker, "a8f7fdc9");
    assert.equal(spore.paper, SPORE_PAPER);
  });

  it("pulls /survival SoT via binding and caches the short TTL", async () => {
    let hits = 0;
    const env = mockEnv({
      AZIEL_RUNTIME: {
        fetch: async () => {
          hits += 1;
          return new Response(JSON.stringify(liveSot({
            calling_name: { calling_name: "Aziel Runtime", calling_slug: "aziel-runtime", rotated: false },
          })), { status: 200 });
        },
      },
    });
    const first = await fetchSurvivalSot(env, { probeOrigin: false });
    const second = await fetchSurvivalSot(env, { probeOrigin: false });
    assert.equal(first.pulled, true);
    assert.equal(first.source, "service-binding");
    assert.equal(first.mutual_backup, true);
    assert.equal(first.platforms.all_live, true);
    assert.equal(first.cap7_aznet.worker.worker, MIRAGEGRID_WORKER);
    assert.equal(first.cap7_aznet.resolves_to_hub, false);
    assert.equal(second.pulled, true);
    assert.equal(hits, 1);
    await fetchSurvivalSot(env, { probeOrigin: false, force: true });
    assert.equal(hits, 2);
  });

  it("falls back honestly when the pull misses — never invents a live door", async () => {
    const env = mockEnv({
      AZIEL_RUNTIME: {
        fetch: async () => new Response("nope", { status: 503 }),
      },
    });
    const doc = await fetchSurvivalSot(env, { probeOrigin: false, force: true });
    assert.equal(doc.pulled, false);
    assert.equal(doc.source, "fallback");
    assert.equal(doc.mutual_backup, true);
    assert.ok(doc.live_doors.some((d) => d.id === "godlock-runtime"));
    assert.equal(doc.cap7_aznet.hosted_endpoints.status, "slot");
    assert.equal(doc.lie_to_survive, false);
  });

  it("serves /survival and /v1/survival as a hub cite, not a second door", async () => {
    const res = await fetchPath("/survival");
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.kind, "hub_cite");
    assert.equal(body.spec, BAN_SURVIVAL);
    assert.equal(body.product, "GodLock");
    assert.equal(body.second_door, false);
    assert.equal(body.person_id, "https://www.azieleliab.com/#aziel");
    assert.equal(body.mutual_backup, true);
    assert.equal(body.platforms_all_live, true);
    assert.equal(body.calling_name.calling_name, "Aziel Runtime");
    assert.equal(body.cap7_factory_worker, MIRAGEGRID_WORKER);
    assert.equal(body.resolves_to_hub, false);
    assert.equal(body.visible_1520, false);
    assert.equal(body.product_not_identity, true);
    assert.equal(body.spore_spec, SPORE);
    assert.equal(body.spore_role, "failsafe");
    assert.equal(body.spore_failsafe, true);
    assert.equal(body.spore_replaces_cold_shelves, false);
    assert.equal(body.spore_software_tab, false);
    assert.equal(body.spore_worker, "a8f7fdc9");
    assert.equal(body.re_cold_store_hook, RE_COLD_STORE);
    assert.equal(body.re_cold_store_invent_destination, false);
    assert.deepEqual(body.re_cold_store.destinations, []);
    assert.match(body.note, /SPORE-1\.0/);
    assert.match(body.note, /RE-COLD-STORE/);
    assert.match(body.note, /Softwares blurbs untouched/);
    assert.match(body.note, /Lamb Lens/);
    assert.match(body.note, /NO-LIE/);
    assert.match(body.note, /GodLock is a challenge\/score product/);
    assert.match(body.note, /Identity is Aziel Eliab/);
    assert.match(res.headers.get("Cache-Control"), /max-age=60/);
    const alias = await fetchPath("/v1/survival");
    assert.equal(alias.status, 200);
    const aliasBody = await alias.json();
    assert.equal(aliasBody.spec, BAN_SURVIVAL);
    assert.equal(aliasBody.cap7_aznet.resolves_to_hub, false);
  });

  it("overlays live SoT on machine cite / llms without bloating HTML JSON-LD", async () => {
    const cite = citeDoc();
    assert.equal(cite.ban_survival, BAN_SURVIVAL);
    assert.equal(cite.mutual_backup, true);
    assert.equal(cite.platforms_all_live, true);
    assert.equal(cite.calling_name, "Aziel Runtime");
    assert.equal(cite.cap7_factory_worker, MIRAGEGRID_WORKER);
    assert.equal(cite.cap7_resolves_to_hub, false);
    assert.equal(cite.spore, SPORE);
    assert.equal(cite.spore_role, "failsafe");
    assert.equal(cite.spore_failsafe, true);
    assert.equal(cite.spore_replaces_cold_shelves, false);
    assert.equal(cite.spore_software_tab, false);
    assert.equal(cite.spore_worker, "a8f7fdc9");
    assert.equal(cite.re_cold_store_hook, RE_COLD_STORE);
    assert.equal(cite.re_cold_store_invent_destination, false);
    assert.equal(cite.priority_pages.survival, CANON_HOST + "/survival");
    assert.equal(cite.priority_pages.survival_sot, SURVIVAL_ORIGIN);
    assert.equal(cite.person_id, "https://www.azieleliab.com/#aziel");
    assert.equal(cite.visible_1520, false);

    const llms = llmsDoc();
    assert.match(llms, /## BAN-SURVIVAL/);
    assert.match(llms, /mutual backup/i);
    assert.match(llms, /platforms_all_live:true|all_live:true/);
    assert.match(llms, /Aziel Runtime/);
    assert.ok(llms.includes(MIRAGEGRID_WORKER));
    assert.match(llms, /resolves_to_hub: false/);
    assert.match(llms, /SPORE-1\.0/);
    assert.match(llms, /last-resort failsafe/);
    assert.match(llms, /RE-COLD-STORE/);
    assert.match(llms, /a8f7fdc9/);
    assert.match(llms, /Softwares blurbs untouched/);
    assert.match(llms, /No visible 15:20/);
    assert.equal(aiDoc(), llms);

    const who = whoIsAzielEliabTxt();
    assert.match(who, /BAN-SURVIVAL/);
    assert.ok(who.includes(MIRAGEGRID_WORKER));
    assert.match(who, /SPORE-1\.0/);
    assert.match(who, /RE-COLD-STORE/);
    assert.match(who, /a8f7fdc9/);
    assert.match(who, /Softwares blurbs untouched/);

    const mission = wellKnownAzielDoc();
    assert.equal(mission.ban_survival, BAN_SURVIVAL);
    assert.equal(mission.mutual_backup, true);
    assert.equal(mission.platforms_all_live, true);
    assert.equal(mission.calling_name, "Aziel Runtime");
    assert.equal(mission.cap7_factory_worker, MIRAGEGRID_WORKER);
    assert.equal(mission.cap7_resolves_to_hub, false);
    assert.equal(mission.spore, SPORE);
    assert.equal(mission.spore_role, "failsafe");
    assert.equal(mission.spore_worker, "a8f7fdc9");
    assert.equal(mission.re_cold_store_hook, RE_COLD_STORE);
    assert.equal(mission.visible_1520, false);

    const htmlPerson = personNode();
    const htmlJson = JSON.stringify(htmlPerson);
    assert.ok(htmlJson.length < 2500, "HTML-embedded Person must stay lean; was " + htmlJson.length);
    assert.doesNotMatch(htmlJson, /BAN-SURVIVAL|SPORE-1\.0|RE-COLD-STORE|miragegrid|calling_name|AZDOC-/);
    assert.equal(htmlPerson["@id"], "https://www.azieleliab.com/#aziel");

    const machine = personJsonLd();
    assert.ok(JSON.stringify(machine.knowsAbout).includes("AZDOC-"));
    assert.equal(machine["@id"], "https://www.azieleliab.com/#aziel");

    const html = page("GodLock", "<p>body</p>", { path: "/", kind: "home" });
    const visible = html.replace(/^[\s\S]*<body>/i, "").replace(/<\/body>[\s\S]*$/i, "").replace(/<script[\s\S]*?<\/script>/gi, "");
    assert.doesNotMatch(visible, /1 Chronicles 15:20/);
    assert.doesNotMatch(visible, /BAN-SURVIVAL/);
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const person = ld["@graph"].find((n) => n["@type"] === "Person");
    assert.ok(JSON.stringify(person).length < 2500);
    assert.doesNotMatch(JSON.stringify(person.knowsAbout || []), /AZDOC-/);
  });

  it("lists survival on robots, sitemap, and OpenAPI", async () => {
    const robots = robotsTxt();
    assert.match(robots, /Allow: \/survival\nAllow: \/v1\/survival/);
    assert.match(robots, /BAN-SURVIVAL-1\.0/);
    const xml = await sitemapXml({});
    assert.ok(xml.includes(CANON_HOST + "/survival"));
    assert.ok(xml.includes(CANON_HOST + "/v1/survival"));
    assert.ok(xml.includes(SURVIVAL_ORIGIN));
    const spec = siteOpenApi();
    assert.ok(spec.paths["/survival"]);
    assert.ok(spec.paths["/v1/survival"]);
    assert.match(spec.paths["/survival"].get.summary, /BAN-SURVIVAL/);
    assert.match(spec.paths["/survival"].get.summary, /hub cite/);
    assert.match(spec.paths["/survival"].get.summary, /SPORE-1\.0/);
    assert.match(spec.paths["/survival"].get.summary, /RE-COLD-STORE/);
  });

  it("keeps the llms section honest about SLOT hosted Cap-7 /mcp", () => {
    const section = survivalLlmsSection();
    assert.match(section, /Hosted Cap-7 \/mcp slot/);
    assert.match(section, /Never invent a live door/);
    assert.match(section, /SPORE-1\.0/);
    assert.match(section, /RE-COLD-STORE/);
    assert.match(section, /Softwares blurbs untouched/);
    assert.match(section, /GodLock is a challenge\/score product/);
    assert.match(section, /Identity is Aziel Eliab/);
    const hub = survivalHubDoc();
    assert.equal(hub.cap7_aznet.hosted_endpoints.status, "slot");
    assert.equal(hub.cap7_aznet.worker.status, "live");
    assert.equal(hub.cap7_aznet.worker.resolves_to_hub, false);
    assert.equal(hub.spore.spec, SPORE);
    assert.equal(hub.spore.failsafe, true);
    assert.equal(hub.re_cold_store.hook, RE_COLD_STORE);
    assert.deepEqual(hub.re_cold_store.destinations, []);
  });
});
