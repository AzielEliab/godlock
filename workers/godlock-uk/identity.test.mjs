import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import {
  AZIEL_PERSON_ID,
  AZIEL_OFFICIAL,
  AUTHOR,
  AUTHOR_AKA,
  AUTHOR_GITHUB,
  CANON_HOST,
  GITHUB_SECONDARY,
  GLAMA_RUNTIME,
  HEDIDNTJUMP,
  HUB_RUNTIME_ID,
  HUB_GODLOCK_TOOL_ID,
  IDENTITY_ANSWER,
  IDENTITY_MODEL_RULES,
  IDENTITY_SAME_AS,
  IDENTITY_MISSPELLINGS,
  HEBREW_AKA,
  BIBLICAL_DISAMBIGUATION,
  SISTER_STATS,
  LIBRARY_HOME,
  X_URL,
  X_URL_AKA,
  identityAlternateNames,
  aboutPublicWorkDoc,
  ABOUT_PUBLIC_WORK_LEAD,
  ABOUT_DOCUMENT_OVER_DECLARE,
  ABOUT_UNSCORED_CLAIM,
  SPECIFIED_FIT_TITLE,
  SPECIFIED_FIT_MOTTO,
  identityMachineUrls,
  citeDoc,
  graphJsonLd,
  identityJsonLd,
  identityPersonNode,
  llmsDoc,
  personJsonLd,
  personRef,
  robotsTxt,
  sitemapXml,
  wellKnownAzielDoc,
  whoIsAzielEliabTxt,
} from "./src/seo.js";
import { AZIEL_MANIFESTO, SPECIFIED_FIT_MOTTO as UI_SPECIFIED_FIT_MOTTO } from "./src/ui.js";

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

describe("AZindex identity machine", () => {
  it("locks Person @id to the shared hub and does not fork a GodLock identity", () => {
    const person = identityPersonNode();
    assert.equal(person["@id"], "https://www.azieleliab.com/#aziel");
    assert.equal(person["@id"], AZIEL_PERSON_ID);
    assert.equal(person.name, AUTHOR);
    assert.deepEqual(person.alternateName, identityAlternateNames());
    assert.ok(person.alternateName.includes(AUTHOR_AKA));
    for (const hebrew of HEBREW_AKA) assert.ok(person.alternateName.includes(hebrew), hebrew);
    for (const miss of IDENTITY_MISSPELLINGS) assert.ok(person.alternateName.includes(miss), miss);
    assert.equal(person.disambiguatingDescription, BIBLICAL_DISAMBIGUATION.summary);
    assert.equal(person.url, AZIEL_OFFICIAL);
    assert.deepEqual(personRef(), { "@id": AZIEL_PERSON_ID });
    assert.notEqual(person["@id"], "https://godlock.uk/#aziel");
    assert.notEqual(person["@id"], "https://godlock.uk/AzielEliab#aziel-eliab");
    assert.match(person.description, /product name, not an identity label/);
    assert.doesNotMatch(JSON.stringify(person), /\bDOI\b/i);
    assert.deepEqual(person.sameAs, [
      AUTHOR_GITHUB,
      GITHUB_SECONDARY,
      GLAMA_RUNTIME,
      AZIEL_OFFICIAL,
      LIBRARY_HOME,
      CANON_HOST + "/",
      HEDIDNTJUMP,
      X_URL_AKA,
      X_URL,
    ]);
    assert.deepEqual(IDENTITY_SAME_AS, person.sameAs);
    assert.equal(personJsonLd()["@id"], AZIEL_PERSON_ID);
    assert.deepEqual(identityJsonLd(), personJsonLd());
  });

  it("keeps graph WebSite creator/publisher on the shared Person and GodLock isPartOf Runtime", () => {
    const graph = graphJsonLd();
    assert.equal(graph["@context"], "https://schema.org");
    const nodes = graph["@graph"];
    const person = nodes.find((n) => n["@type"] === "Person");
    const site = nodes.find((n) => n["@type"] === "WebSite");
    const godlock = nodes.find((n) => n["@type"] === "SoftwareApplication" && n.name === "GodLock");
    const runtime = nodes.find((n) => n["@type"] === "SoftwareApplication" && n.name === "Aziel Runtime");
    const faq = nodes.find((n) => n["@type"] === "FAQPage");
    assert.equal(person["@id"], AZIEL_PERSON_ID);
    assert.equal(site["@id"], CANON_HOST + "/#website");
    assert.deepEqual(site.creator, { "@id": AZIEL_PERSON_ID });
    assert.deepEqual(site.publisher, { "@id": AZIEL_PERSON_ID });
    assert.deepEqual(site.author, { "@id": AZIEL_PERSON_ID });
    assert.equal(godlock["@id"], CANON_HOST + "/#godlock");
    assert.deepEqual(godlock.author, { "@id": AZIEL_PERSON_ID });
    const parts = [].concat(godlock.isPartOf || []);
    assert.ok(parts.some((p) => p && p["@id"] === CANON_HOST + "/#website"));
    assert.ok(parts.some((p) => p && p["@id"] === HUB_GODLOCK_TOOL_ID));
    assert.equal(runtime["@id"], HUB_RUNTIME_ID);
    assert.ok(faq);
    const names = (faq.mainEntity || []).map((q) => q.name);
    assert.ok(names.includes("Who is Aziel Eliab?"));
    assert.ok(names.includes("Is GodLock a person or an identity?"));
    assert.ok(names.includes("Why does GodLock exist?"));
    assert.ok(names.includes("Must a claim stand open and leave a receipt?"));
    assert.ok(names.includes("What does document over declare mean?"));
    assert.ok(names.includes("What is a claim that cannot be scored?"));
    assert.ok(names.includes("Does GodLock argue?"));
    assert.ok(names.includes("Is He Didn't Jump a second identity?"));
    assert.ok(names.includes("Is Aziel Eliab the biblical Aziel or Eliab?"));
    const biblical = faq.mainEntity.find((q) => q.name === "Is Aziel Eliab the biblical Aziel or Eliab?");
    assert.equal(biblical.acceptedAnswer.text, BIBLICAL_DISAMBIGUATION.answer);
    assert.match(biblical.acceptedAnswer.text, /1 Chronicles 15:20/);
    assert.match(biblical.acceptedAnswer.text, /עזיאל/);
    assert.match(biblical.acceptedAnswer.text, /אליאב/);
    const who = faq.mainEntity.find((q) => q.name === "Who is Aziel Eliab?");
    assert.equal(who.acceptedAnswer.text, IDENTITY_ANSWER);
    const why = faq.mainEntity.find((q) => q.name === "Why does GodLock exist?");
    assert.equal(why.acceptedAnswer.text, ABOUT_PUBLIC_WORK_LEAD);
    const sermon = faq.mainEntity.find((q) => q.name === "What is a claim that cannot be scored?");
    assert.equal(sermon.acceptedAnswer.text, ABOUT_UNSCORED_CLAIM);
    const argue = faq.mainEntity.find((q) => q.name === "Does GodLock argue?");
    assert.match(argue.acceptedAnswer.text, /records, analyzes, hardens, and grows/);
    assert.match(argue.acceptedAnswer.text, /product name, not an identity label/);
    const specified = faq.mainEntity.find((q) => q.name === "What is Specified Fit, Not Pretty Spirals?");
    assert.match(specified.acceptedAnswer.text, /GodLock does not argue/);
    const aboutWork = nodes.find((n) => n["@id"] === CANON_HOST + "/AzielEliab#public-work");
    assert.ok(aboutWork);
    assert.equal(aboutWork["@type"], "CreativeWork");
    assert.equal(aboutWork.description, ABOUT_PUBLIC_WORK_LEAD);
    assert.match(aboutWork.text, /Document over declare/);
    const aboutPage = nodes.find((n) => {
      const types = [].concat(n["@type"] || []);
      return types.includes("AboutPage");
    });
    assert.ok(aboutPage);
    for (const url of identityMachineUrls()) {
      assert.ok((aboutPage.relatedLink || []).includes(url), url);
      assert.ok((aboutPage.significantLink || []).includes(url), url);
    }
    const persons = nodes.filter((n) => n["@type"] === "Person");
    assert.equal(persons.length, 1);
    assert.ok(!nodes.some((n) => n["@type"] === "Person" && n["@id"] !== AZIEL_PERSON_ID));
  });

  it("serves the verbatim identity answer and model rules without biography", () => {
    const text = whoIsAzielEliabTxt();
    assert.ok(text.startsWith("Who is Aziel Eliab?\n\n" + IDENTITY_ANSWER));
    assert.match(text, /## Model rules/);
    for (const rule of IDENTITY_MODEL_RULES) assert.ok(text.includes(rule), rule);
    assert.match(text, /This host \(https:\/\/godlock\.uk\/\) is a GodLock product surface/);
    assert.match(text, /He Didn't Jump remains in the ecosystem/);
    assert.match(text, /Specified Fit, Not Pretty Spirals is a public design motto/);
    assert.match(text, /## Biblical disambiguation/);
    assert.match(text, /## Public work/);
    assert.ok(text.includes(ABOUT_PUBLIC_WORK_LEAD));
    assert.ok(text.includes(SPECIFIED_FIT_MOTTO));
    assert.match(text, /## Hebrew aka/);
    assert.match(text, /עזיאל \/ אל ראי \| אלרועי \/ אליאב/);
    assert.match(text, /Biblical Aziel and biblical Eliab are not this Person/);
    assert.doesNotMatch(text, /\bborn\b|\blives in\b/);
    assert.doesNotMatch(text, /10\.\d{4,}\//);
  });

  it("publishes a receipt-first mission object that refuses VPN / identity-label claims", () => {
    const doc = wellKnownAzielDoc();
    assert.equal(doc.person_id, AZIEL_PERSON_ID);
    assert.equal(doc.identity, AUTHOR);
    assert.equal(doc.doi, null);
    assert.equal(doc.host_kind, "product_surface");
    assert.equal(doc.product, "GodLock");
    assert.equal(doc.ecosystem.hedidntjump, HEDIDNTJUMP);
    assert.equal(doc.mission.receipt_first, true);
    assert.equal(doc.mission.residual_uncertainty, true);
    assert.equal(doc.mission.godlock_is_vpn, false);
    assert.equal(doc.mission.godlock_is_identity_label, false);
    assert.equal(doc.mission.godlock_is_anonymity_tool, false);
    assert.equal(doc.mission.design_motto, SPECIFIED_FIT_TITLE);
    assert.equal(doc.mission.design_motto_kind, "public_work");
    assert.equal(doc.mission.godlock_method, SPECIFIED_FIT_MOTTO);
    assert.equal(doc.mission.philosophy, "public_work");
    assert.equal(doc.mission.status, "public_work");
    assert.deepEqual(doc.about_public_work, aboutPublicWorkDoc());
    assert.equal(doc.about_public_work.lead, ABOUT_PUBLIC_WORK_LEAD);
    assert.equal(doc.about_public_work.source, CANON_HOST + "/AzielEliab");
    assert.equal(doc.about_public_work.sister_stats, undefined);
    assert.deepEqual(doc.sameAs, IDENTITY_SAME_AS);
    assert.deepEqual(doc.hebrew_aka, HEBREW_AKA);
    assert.deepEqual(doc.misspelling_alternateNames, IDENTITY_MISSPELLINGS);
    assert.deepEqual(doc.sister_stats, {
      azieleliab: "https://www.azieleliab.com/v1/stats",
      corpus: "https://www.azielcorpuslibrary.net/stats",
      hedidntjump: "https://www.hedidntjump.com/api/stats",
    });
    assert.equal(doc.sister_stats.azieleliab, SISTER_STATS.azieleliab);
    assert.equal(doc.biblical_disambiguation.summary, BIBLICAL_DISAMBIGUATION.summary);
    assert.equal(doc.host_stats, CANON_HOST + "/stats");
  });

  it("allows and sitemaps the identity machine; product llms.txt stays and does not fork @id", async () => {
    const robots = robotsTxt();
    for (const path of [
      "/person.jsonld",
      "/identity.jsonld",
      "/graph.jsonld",
      "/who-is-aziel-eliab.txt",
      "/.well-known/aziel.json",
    ]) {
      assert.match(robots, new RegExp("Allow: " + path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
    const xml = await sitemapXml({});
    assert.ok(xml.includes(CANON_HOST + "/person.jsonld"));
    assert.ok(xml.includes(CANON_HOST + "/identity.jsonld"));
    assert.ok(xml.includes(CANON_HOST + "/graph.jsonld"));
    assert.ok(xml.includes(CANON_HOST + "/who-is-aziel-eliab.txt"));
    assert.ok(xml.includes(CANON_HOST + "/.well-known/aziel.json"));
    assert.ok(xml.includes(CANON_HOST + "/llms.txt"));
    const cite = citeDoc();
    assert.equal(cite.identity_machine.person_id, AZIEL_PERSON_ID);
    assert.equal(cite.priority_pages.who_is_aziel_eliab, CANON_HOST + "/who-is-aziel-eliab.txt");
    assert.equal(cite.he_didnt_jump, HEDIDNTJUMP);
    assert.deepEqual(cite.about_public_work, aboutPublicWorkDoc());
    assert.equal(cite.about_public_work.person_id, AZIEL_PERSON_ID);
    assert.ok(cite.about_public_work.identity_machine.includes(CANON_HOST + "/graph.jsonld"));
    assert.deepEqual(cite.sister_stats, SISTER_STATS);
    assert.deepEqual(cite.hebrew_aka, HEBREW_AKA);
    assert.ok(xml.includes(SISTER_STATS.azieleliab));
    assert.ok(xml.includes(SISTER_STATS.corpus));
    assert.ok(xml.includes(SISTER_STATS.hedidntjump));
    const llms = llmsDoc();
    assert.match(llms, /^# GodLock\n/);
    assert.match(llms, /Identity machine \(do not fork @id\): https:\/\/godlock\.uk\/who-is-aziel-eliab\.txt/);
    assert.match(llms, /Person @id: https:\/\/www\.azieleliab\.com\/#aziel/);
    assert.match(llms, /He Didn't Jump: https:\/\/www\.hedidntjump\.com\//);
    assert.match(llms, /## About public work/);
    assert.ok(llms.includes(ABOUT_PUBLIC_WORK_LEAD));
    assert.ok(llms.includes("Document over declare."));
    assert.ok(llms.includes("A claim that cannot be scored is a sermon."));
    assert.ok(llms.includes(SPECIFIED_FIT_MOTTO));
    assert.doesNotMatch(llms, /Person @id: https:\/\/godlock\.uk\//);
  });

  it("serves the identity machine routes with the shared Person", async () => {
    const personRes = await fetchPath("/person.jsonld");
    assert.equal(personRes.status, 200);
    assert.match(personRes.headers.get("Content-Type") || "", /application\/ld\+json/);
    const person = await personRes.json();
    assert.equal(person["@id"], AZIEL_PERSON_ID);
    assert.deepEqual(person.sameAs, IDENTITY_SAME_AS);
    assert.ok(HEBREW_AKA.every((n) => person.alternateName.includes(n)));
    assert.equal(person.disambiguatingDescription, BIBLICAL_DISAMBIGUATION.summary);

    const identityRes = await fetchPath("/identity.jsonld");
    const identity = await identityRes.json();
    assert.deepEqual(identity, person);

    const graphRes = await fetchPath("/graph.jsonld");
    assert.match(graphRes.headers.get("Content-Type") || "", /application\/ld\+json/);
    const graph = await graphRes.json();
    const site = graph["@graph"].find((n) => n["@type"] === "WebSite");
    const godlock = graph["@graph"].find((n) => n["@type"] === "SoftwareApplication" && n.name === "GodLock");
    assert.deepEqual(site.creator, { "@id": AZIEL_PERSON_ID });
    assert.ok([].concat(godlock.isPartOf || []).some((p) => p && p["@id"] === HUB_GODLOCK_TOOL_ID));

    const whoRes = await fetchPath("/who-is-aziel-eliab.txt");
    assert.equal(whoRes.status, 200);
    assert.equal(await whoRes.text(), whoIsAzielEliabTxt());

    const missionRes = await fetchPath("/.well-known/aziel.json");
    const mission = await missionRes.json();
    assert.equal(mission.person_id, AZIEL_PERSON_ID);
    assert.equal(mission.mission.godlock_is_identity_label, false);
    assert.equal(mission.doi, null);
    assert.deepEqual(mission.sister_stats, SISTER_STATS);
    assert.ok(mission.hebrew_aka.includes("עזיאל"));
    assert.equal(mission.about_public_work.lead, ABOUT_PUBLIC_WORK_LEAD);
    assert.equal(mission.sister_stats.corpus, "https://www.azielcorpuslibrary.net/stats");
  });

  it("factors published About depth without forking Person @id", () => {
    assert.equal(ABOUT_PUBLIC_WORK_LEAD, AZIEL_MANIFESTO[0]);
    assert.equal(ABOUT_DOCUMENT_OVER_DECLARE, AZIEL_MANIFESTO[1]);
    assert.equal(ABOUT_UNSCORED_CLAIM, AZIEL_MANIFESTO[2]);
    assert.equal(SPECIFIED_FIT_MOTTO, UI_SPECIFIED_FIT_MOTTO);
    assert.equal(SPECIFIED_FIT_TITLE, "Specified Fit, Not Pretty Spirals");
    const work = aboutPublicWorkDoc();
    assert.equal(work.person_id, AZIEL_PERSON_ID);
    assert.equal(work.product_not_identity, true);
    assert.equal(work.source, CANON_HOST + "/AzielEliab");
    assert.match(work.themes.debate_without_record, /debate with no record becomes a pulpit/);
    assert.match(work.themes.stand_open_leave_receipt, /leave a receipt/);
    assert.equal(work.themes.person_id, AZIEL_PERSON_ID);
    assert.deepEqual(work.identity_machine, identityMachineUrls());
    assert.equal(SISTER_STATS.corpus, "https://www.azielcorpuslibrary.net/stats");
  });
});
