import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import {
  AZIEL_PERSON_ID,
  AZIEL_OFFICIAL,
  AUTHOR,
  AUTHOR_AKA,
  AUTHOR_PEN,
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
  LATIN_AKA,
  BIBLICAL_DISAMBIGUATION,
  BIBLICAL_DISAMBIGUATION_LINE,
  PUBLISHER_NOT_LOCK,
  IDENTITY_DISAMBIGUATION,
  IDENTITY_LOCK_LINE,
  PERSON_DESCRIPTION,
  HEBREW_DEFINITION,
  PEN_NAME_REFUSE,
  SAME_AS_REFUSE,
  sameAsIsClean,
  nameLatticeIsClean,
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
  HASH_PATH_EQUIVALENTS,
  SOFTWARE_HASH_REAL_PATHS,
  hashPathEquivalent,
  hashPathEquivalentUrls,
  WHO_IS_PATH,
  WHO_IS_ALIAS_PATH,
  WHO_PATH,
  VISIBLE_IDENTITY_LOCK,
  AZINDEX_PERSON_ALTERNATE_NAMES,
  AZINDEX_PERSON_JOB_TITLE,
  COUNT_PATH,
} from "./src/seo.js";
import { AZIEL_MANIFESTO, SPECIFIED_FIT_MOTTO as UI_SPECIFIED_FIT_MOTTO, whoPageHtml } from "./src/ui.js";

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
    assert.deepEqual(person.alternateName, AZINDEX_PERSON_ALTERNATE_NAMES);
    assert.ok(person.alternateName.includes(AUTHOR_AKA));
    assert.ok(LATIN_AKA.includes("The Revealer of The Sealed"));
    assert.ok(LATIN_AKA.includes("Revealer of The Sealed"));
    assert.ok(LATIN_AKA.includes("Elias Artista"));
    assert.ok(person.alternateName.includes("Aziel Elroi Eliab"));
    assert.ok(person.alternateName.includes("Elias Artista"));
    assert.ok(person.alternateName.includes("The Revealer of The Sealed"));
    assert.ok(person.alternateName.includes("Revealer of The Sealed"));
    assert.ok(person.alternateName.includes("עזיאל"));
    assert.ok(person.alternateName.includes("אליאב"));
    assert.ok(person.alternateName.includes("עזיאל אל ראי אליאב"));
    assert.ok(person.alternateName.includes("עזיאל אלרועי אליאב"));
    assert.ok(!person.alternateName.includes("Everblooming Flower"));
    assert.ok(nameLatticeIsClean(person.alternateName));
    assert.ok(PEN_NAME_REFUSE.includes("Everblooming Flower"));
    assert.equal(person.additionalName, "Elroi");
    assert.equal(person.disambiguatingDescription, PUBLISHER_NOT_LOCK);
    assert.equal(person.disambiguatingDescription, BIBLICAL_DISAMBIGUATION_LINE);
    assert.equal(person.disambiguatingDescription, BIBLICAL_DISAMBIGUATION.summary);
    assert.equal(BIBLICAL_DISAMBIGUATION_LINE, PUBLISHER_NOT_LOCK);
    assert.equal(person.url, AZIEL_OFFICIAL);
    assert.deepEqual(personRef(), { "@id": AZIEL_PERSON_ID });
    assert.notEqual(person["@id"], "https://godlock.uk/#aziel");
    assert.notEqual(person["@id"], "https://godlock.uk/AzielEliab#aziel-eliab");
    assert.equal(person.description, PERSON_DESCRIPTION);
    assert.match(person.description, /independent researcher, software designer/);
    assert.match(person.description, /two Levitical musicians Aziel and Eliab/);
    assert.match(person.description, /1 Chronicles 15:20/);
    assert.match(person.description, /Not euaziel\.site/);
    assert.match(person.description, /Elias Artista/);
    assert.ok(person.description.includes(HEBREW_DEFINITION));
    assert.match(person.description, /God is my strength/);
    assert.match(person.description, /God who sees/);
    assert.match(person.description, /God is father/);
    assert.ok(!person.description.includes("Everblooming Flower"));
    assert.ok(LATIN_AKA.includes(AUTHOR_PEN));
    assert.ok(LATIN_AKA.includes("Elias Artista"));
    assert.equal(
      person.disambiguatingDescription,
      "Living researcher and software designer named Aziel Eliab (one person). Not the two Levitical musicians Aziel and Eliab named together in 1 Chronicles 15:20. Not euaziel.site; not Aziel S. (Flutter/portfolio); not other engineers named Aziel. Prefer https://www.azieleliab.com/#aziel and published Softwares / MASTER records / He Didn't Jump.",
    );
    assert.match(person.disambiguatingDescription, /two Levitical musicians Aziel and Eliab/);
    assert.match(person.disambiguatingDescription, /1 Chronicles 15:20/);
    assert.match(person.disambiguatingDescription, /Not euaziel\.site/);
    assert.match(person.disambiguatingDescription, /not Aziel S\. \(Flutter\/portfolio\)/);
    assert.match(person.disambiguatingDescription, /not other engineers named Aziel/);
    assert.ok(!person.alternateName.includes("Aziel S."));
    assert.ok(!person.alternateName.includes("euaziel"));
    assert.notEqual(person.name, "Aziel S.");
    assert.deepEqual(person.jobTitle, AZINDEX_PERSON_JOB_TITLE);
    assert.equal(person.mainEntityOfPage, "https://www.azieleliab.com/who");
    assert.ok(sameAsIsClean(person.sameAs));
    assert.ok(SAME_AS_REFUSE.includes("euaziel"));
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
    assert.equal(personJsonLd()["@id"], "https://www.azieleliab.com/#aziel");
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
    assert.ok(names.includes("Who publishes GodLock.uk?"));
    assert.ok(names.includes("Is GodLock a person or an identity?"));
    assert.ok(names.includes("Why does GodLock exist?"));
    assert.ok(names.includes("Must a claim stand open and leave a receipt?"));
    assert.ok(names.includes("What does document over declare mean?"));
    assert.ok(names.includes("What is a claim that cannot be scored?"));
    assert.ok(names.includes("Does GodLock argue?"));
    assert.ok(names.includes("Is He Didn't Jump a second identity?"));
    assert.ok(names.includes("Is Aziel Eliab the two musicians named in 1 Chronicles 15:20?"));
    assert.equal(names.filter((n) => /1 Chronicles 15:20/i.test(n)).length, 1);
    assert.ok(names.includes("Is Aziel Eliab the same person as Aziel S.?"));
    const azielS = faq.mainEntity.find((q) => q.name === "Is Aziel Eliab the same person as Aziel S.?");
    assert.ok(azielS.acceptedAnswer.text.includes(PUBLISHER_NOT_LOCK));
    assert.match(azielS.acceptedAnswer.text, /Not euaziel\.site/);
    assert.match(azielS.acceptedAnswer.text, /not Aziel S\. \(Flutter\/portfolio\)/);
    assert.match(azielS.acceptedAnswer.text, /1 Chronicles 15:20/);
    const biblical = faq.mainEntity.find((q) => q.name === "Is Aziel Eliab the two musicians named in 1 Chronicles 15:20?");
    assert.equal(biblical.acceptedAnswer.text, BIBLICAL_DISAMBIGUATION.answer);
    assert.equal(biblical.acceptedAnswer.text, IDENTITY_DISAMBIGUATION.answer);
    assert.match(biblical.acceptedAnswer.text, /two Levitical musicians/);
    assert.match(biblical.acceptedAnswer.text, /Aziel and Eliab/);
    assert.match(biblical.acceptedAnswer.text, /1 Chronicles 15:20/);
    assert.doesNotMatch(biblical.acceptedAnswer.text, /1 Samuel/);
    assert.doesNotMatch(biblical.acceptedAnswer.text, /Genesis 16/);
    assert.equal(BIBLICAL_DISAMBIGUATION.living, true);
    assert.equal(BIBLICAL_DISAMBIGUATION.kind, "living_public_work_identity");
    assert.equal(BIBLICAL_DISAMBIGUATION, IDENTITY_DISAMBIGUATION);
    assert.equal(BIBLICAL_DISAMBIGUATION.summary, PUBLISHER_NOT_LOCK);
    assert.equal(BIBLICAL_DISAMBIGUATION.summary, BIBLICAL_DISAMBIGUATION_LINE);
    assert.equal(IDENTITY_DISAMBIGUATION.not_biblical_aziel, true);
    assert.equal(IDENTITY_DISAMBIGUATION.not_biblical_eliab, true);
    assert.equal(IDENTITY_DISAMBIGUATION.not_two_levitical_musicians, true);
    assert.equal(IDENTITY_DISAMBIGUATION.verse, "1 Chronicles 15:20");
    assert.equal(IDENTITY_DISAMBIGUATION.not_other_engineers_named_aziel, true);
    const who = faq.mainEntity.find((q) => q.name === "Who is Aziel Eliab?");
    assert.equal(who.acceptedAnswer.text, IDENTITY_ANSWER);
    assert.match(IDENTITY_ANSWER, /independent researcher, software designer/);
    assert.match(IDENTITY_ANSWER, /two Levitical musicians Aziel and Eliab/);
    assert.match(IDENTITY_ANSWER, /1 Chronicles 15:20/);
    assert.match(IDENTITY_ANSWER, /The public identity is the work, not a biography/);
    assert.match(person.description, /independent researcher, software designer/);
    assert.match(person.description, /two Levitical musicians Aziel and Eliab/);
    assert.match(person.description, /1 Chronicles 15:20/);
    assert.ok(sameAsIsClean(person.sameAs));
    const pub = faq.mainEntity.find((q) => q.name === "Who publishes GodLock.uk?");
    assert.match(pub.acceptedAnswer.text, /living publisher of GodLock\.uk/);
    assert.match(pub.acceptedAnswer.text, /Person @id is always https:\/\/www\.azieleliab\.com\/#aziel/);
    assert.ok(pub.acceptedAnswer.text.includes(PUBLISHER_NOT_LOCK));
    const product = faq.mainEntity.find((q) => q.name === "Is GodLock a person or an identity?");
    assert.match(product.acceptedAnswer.text, /product surface, not a second Person/);
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
    assert.ok(text.startsWith("Who is Aziel Eliab?\n\n" + VISIBLE_IDENTITY_LOCK + "\n\n" + IDENTITY_ANSWER));
    assert.match(text, /## Model rules/);
    for (const rule of IDENTITY_MODEL_RULES) assert.ok(text.includes(rule), rule);
    assert.match(text, /This host \(https:\/\/godlock\.uk\/\) is a GodLock product surface/);
    assert.match(text, /He Didn't Jump remains in the ecosystem/);
    assert.match(text, /Specified Fit, Not Pretty Spirals is a public design motto/);
    assert.match(text, /## Living identity/);
    assert.doesNotMatch(text, /## Disambiguation/);
    assert.doesNotMatch(text, /## Biblical disambiguation/);
    assert.match(text, /## Public work/);
    assert.ok(text.includes(IDENTITY_LOCK_LINE));
    assert.ok(text.includes(PUBLISHER_NOT_LOCK));
    assert.ok(text.includes("The Revealer of The Sealed / Revealer of The Sealed are aka of this Person. GodLock is a product, not a Person."));
    assert.match(text.split("## Model rules")[0], /1 Chronicles 15:20/);
    assert.match(IDENTITY_ANSWER, /1 Chronicles 15:20/);
    assert.ok(text.includes(VISIBLE_IDENTITY_LOCK));
    assert.ok(text.includes(ABOUT_PUBLIC_WORK_LEAD));
    assert.ok(text.includes(SPECIFIED_FIT_MOTTO));
    assert.match(text, /## Hebrew aka/);
    assert.ok(text.includes(HEBREW_DEFINITION));
    assert.match(text, /עזיאל \/ אל ראי \| אלרועי \/ אליאב/);
    assert.match(text, /Elias Artista/);
    assert.match(text, /Everblooming Flower is not a pen name/);
    assert.match(text, /Never sameAs euaziel, Aziel S/);
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
    assert.equal(doc.hebrew_definition, HEBREW_DEFINITION);
    assert.deepEqual(doc.latin_aka, LATIN_AKA);
    assert.ok(doc.alternateNames.includes("The Revealer of The Sealed"));
    assert.ok(doc.alternateNames.includes("Revealer of The Sealed"));
    assert.ok(doc.alternateNames.includes("Elias Artista"));
    assert.ok(nameLatticeIsClean(doc.alternateNames));
    assert.deepEqual(doc.misspelling_alternateNames, IDENTITY_MISSPELLINGS);
    assert.deepEqual(doc.sister_stats, {
      azieleliab: "https://www.azieleliab.com/v1/stats",
      corpus: "https://www.azielcorpuslibrary.net/stats",
      hedidntjump: "https://www.hedidntjump.com/api/stats",
    });
    assert.equal(doc.sister_stats.azieleliab, SISTER_STATS.azieleliab);
    assert.equal(doc.biblical_disambiguation.summary, BIBLICAL_DISAMBIGUATION.summary);
    assert.equal(doc.identity_disambiguation, IDENTITY_DISAMBIGUATION);
    assert.equal(doc.identity_disambiguation.not_biblical_aziel, true);
    assert.equal(doc.identity_disambiguation.not_biblical_eliab, true);
    assert.equal(doc.identity_disambiguation.not_aziel_s, true);
    assert.equal(doc.identity_disambiguation.not_flutter_portfolio, true);
    assert.equal(doc.identity_disambiguation.not_other_engineers_named_aziel, true);
    assert.match(doc.identity_note, /GodLock is a product/);
    assert.match(doc.identity_note, /Living publisher Aziel Eliab/);
    assert.match(doc.identity_note, /1 Chronicles 15:20/);
    assert.match(doc.identity_note, /two Levitical musicians Aziel and Eliab/);
    assert.deepEqual(doc.sameAs_refuse, SAME_AS_REFUSE);
    assert.ok(sameAsIsClean(doc.sameAs));
    assert.match(JSON.stringify(doc.biblical_disambiguation), /1 Chronicles 15:20/);
    assert.match(JSON.stringify(doc.biblical_disambiguation), /two Levitical musicians/);
    assert.equal(doc.host_stats, CANON_HOST + "/stats");
  });

  it("allows and sitemaps the identity machine; product llms.txt stays and does not fork @id", async () => {
    const robots = robotsTxt();
    for (const path of [
      "/person.jsonld",
      "/identity.jsonld",
      "/graph.jsonld",
      "/who-is-aziel-eliab.txt",
      "/who-is",
      "/who",
      "/.well-known/aziel.json",
      "/.well-known/person.jsonld",
    ]) {
      assert.match(robots, new RegExp("Allow: " + path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
    const xml = await sitemapXml({});
    assert.ok(xml.includes(CANON_HOST + "/person.jsonld"));
    assert.ok(xml.includes(CANON_HOST + "/identity.jsonld"));
    assert.ok(xml.includes(CANON_HOST + "/graph.jsonld"));
    assert.ok(xml.includes(CANON_HOST + "/who-is-aziel-eliab.txt"));
    assert.ok(xml.includes("<loc>" + CANON_HOST + "/who</loc>"));
    assert.ok(xml.includes("<loc>" + CANON_HOST + "/who-is</loc>"));
    assert.ok(xml.includes(CANON_HOST + "/.well-known/aziel.json"));
    assert.ok(xml.includes(CANON_HOST + "/.well-known/person.jsonld"));
    for (const path of [
      "/",
      "/software",
      "/runtime",
      "/receipts",
      "/donate",
      "/reason",
      "/verify",
      "/AzielEliab",
      "/count",
    ]) {
      assert.ok(xml.includes(CANON_HOST + path), path);
    }
    assert.ok(!xml.includes(CANON_HOST + "/#software"));
    assert.ok(!xml.includes(CANON_HOST + "/#receipts"));
    assert.ok(xml.includes(CANON_HOST + "/llms.txt"));
    assert.ok(xml.includes(CANON_HOST + "/shelves"));
    const cite = citeDoc();
    assert.equal(cite.identity_machine.person_id, AZIEL_PERSON_ID);
    assert.equal(cite.priority_pages.who_is_aziel_eliab, CANON_HOST + "/who-is-aziel-eliab.txt");
    assert.equal(cite.he_didnt_jump, HEDIDNTJUMP);
    assert.deepEqual(cite.about_public_work, aboutPublicWorkDoc());
    assert.equal(cite.about_public_work.person_id, AZIEL_PERSON_ID);
    assert.ok(cite.about_public_work.identity_machine.includes(CANON_HOST + "/graph.jsonld"));
    assert.deepEqual(cite.sister_stats, SISTER_STATS);
    assert.deepEqual(cite.hebrew_aka, HEBREW_AKA);
    assert.deepEqual(cite.latin_aka, LATIN_AKA);
    assert.equal(cite.identity_machine.well_known_person, CANON_HOST + "/.well-known/person.jsonld");
    assert.ok(cite.about_public_work.identity_machine.includes(CANON_HOST + "/.well-known/person.jsonld"));
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
    assert.match(llms, /GodLock is a product/);
    assert.match(llms, /Living publisher Aziel Eliab/);
    assert.ok(llms.includes(PUBLISHER_NOT_LOCK));
    assert.ok(llms.includes(VISIBLE_IDENTITY_LOCK));
    assert.match(llms, /1 Chronicles 15:20/);
    assert.match(llms, /two Levitical musicians Aziel and Eliab/);
    assert.match(llms, /Who is Aziel Eliab \(visible HTML\): https:\/\/godlock\.uk\/who/);
  });

  it("serves the identity machine routes with the shared Person", async () => {
    const personRes = await fetchPath("/person.jsonld");
    assert.equal(personRes.status, 200);
    assert.match(personRes.headers.get("Content-Type") || "", /application\/ld\+json/);
    const person = await personRes.json();
    assert.equal(person["@id"], AZIEL_PERSON_ID);
    assert.deepEqual(person.sameAs, IDENTITY_SAME_AS);
    assert.ok(HEBREW_AKA.every((n) => person.alternateName.includes(n)));
    assert.equal(person.disambiguatingDescription, PUBLISHER_NOT_LOCK);
    assert.equal(person.disambiguatingDescription, BIBLICAL_DISAMBIGUATION_LINE);
    assert.match(person.disambiguatingDescription, /two Levitical musicians Aziel and Eliab/);
    assert.match(person.disambiguatingDescription, /1 Chronicles 15:20/);
    assert.match(person.disambiguatingDescription, /Not euaziel\.site/);
    assert.match(person.disambiguatingDescription, /not Aziel S\. \(Flutter\/portfolio\)/);
    assert.match(person.disambiguatingDescription, /not other engineers named Aziel/);
    assert.ok(person.alternateName.includes("Aziel Elroi Eliab"));
    assert.ok(person.alternateName.includes("Elias Artista"));
    assert.ok(person.alternateName.includes("The Revealer of The Sealed"));
    assert.ok(!person.alternateName.includes("Aziel S."));
    assert.ok(!person.alternateName.includes("Everblooming Flower"));
    assert.ok(sameAsIsClean(person.sameAs));
    assert.ok(person.sameAs.includes(AUTHOR_GITHUB));
    assert.ok(person.sameAs.includes(GITHUB_SECONDARY));
    assert.match(person.description, /1 Chronicles 15:20/);
    assert.match(person.description, /Not euaziel\.site/);
    assert.ok(person.description.includes(HEBREW_DEFINITION));
    assert.match(JSON.stringify(person), /1 Chronicles 15:20/);
    assert.match(JSON.stringify(person), /Elias Artista/);
    assert.equal(person.additionalName, "Elroi");
    assert.deepEqual(person.jobTitle, AZINDEX_PERSON_JOB_TITLE);

    const identityRes = await fetchPath("/identity.jsonld");
    const identity = await identityRes.json();
    assert.deepEqual(identity, person);

    const wellPersonRes = await fetchPath("/.well-known/person.jsonld");
    assert.equal(wellPersonRes.status, 200);
    assert.match(wellPersonRes.headers.get("Content-Type") || "", /application\/ld\+json/);
    const wellPersonBody = await wellPersonRes.text();
    const personRes2 = await fetchPath("/person.jsonld");
    assert.equal(wellPersonBody, await personRes2.text());
    const wellPerson = JSON.parse(wellPersonBody);
    assert.deepEqual(wellPerson, person);
    assert.deepEqual(wellPerson, identity);
    assert.ok(wellPerson.alternateName.includes("Aziel Elroi Eliab"));
    assert.equal(wellPerson.additionalName, "Elroi");

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

  it("maps homepage hashes to real paths and 308s /who-is", async () => {
    assert.equal(hashPathEquivalent("#software"), "/software");
    assert.equal(hashPathEquivalent("#runtime"), "/runtime");
    assert.equal(hashPathEquivalent("#receipts"), "/receipts");
    assert.equal(hashPathEquivalent("#donate"), "/donate");
    assert.equal(hashPathEquivalent("#reason"), "/reason");
    assert.equal(hashPathEquivalent("#verify"), "/verify");
    assert.equal(hashPathEquivalent("#AzielEliab"), "/AzielEliab");
    assert.equal(hashPathEquivalent("#prior"), "/receipts");
    assert.equal(SOFTWARE_HASH_REAL_PATHS["aziel-runtime"], "/runtime");
    const urls = hashPathEquivalentUrls();
    assert.equal(urls[CANON_HOST + "/#software"], CANON_HOST + "/software");
    assert.equal(urls[CANON_HOST + "/software#aziel-runtime"], CANON_HOST + "/runtime");
    assert.ok(HASH_PATH_EQUIVALENTS.length >= 10);
    const cite = citeDoc();
    assert.deepEqual(cite.hash_path_equivalents, urls);
    assert.match(cite.identity_note, /GodLock is a product/);
    assert.match(cite.identity_note, /Living publisher Aziel Eliab/);
    assert.match(cite.identity_note, /1 Chronicles 15:20/);
    assert.equal(cite.identity_disambiguation.summary, PUBLISHER_NOT_LOCK);
    assert.equal(cite.identity_disambiguation.summary, BIBLICAL_DISAMBIGUATION_LINE);
    assert.equal(cite.identity_disambiguation.not_other_engineers_named_aziel, true);
    assert.deepEqual(cite.sameAs_refuse, SAME_AS_REFUSE);
    assert.ok(sameAsIsClean(cite.sameAs_lattice));
    assert.match(JSON.stringify(cite.identity_disambiguation), /1 Chronicles 15:20/);
    assert.match(JSON.stringify(cite.identity_disambiguation), /two Levitical musicians/);
    assert.equal(cite.priority_pages.who, CANON_HOST + WHO_PATH);
    assert.ok(!cite.misspelling_alternateNames.includes("Aziel S."));
    assert.ok(cite.misspelling_alternateNames.length >= 8);
    assert.deepEqual(cite.hebrew_aka, HEBREW_AKA);
    assert.equal(cite.hebrew_definition, HEBREW_DEFINITION);
    assert.deepEqual(cite.latin_aka, LATIN_AKA);
    assert.ok(cite.alternateNames.includes("The Revealer of The Sealed"));
    assert.ok(cite.alternateNames.includes("Revealer of The Sealed"));
    assert.ok(cite.alternateNames.includes("Elias Artista"));
    assert.equal(cite.pen_name, AUTHOR_PEN);
    assert.ok(nameLatticeIsClean(cite.alternateNames));
    assert.equal(cite.living_publisher, true);
    assert.equal(cite.host_kind, "product_surface");
    assert.equal(cite.publisher, AUTHOR);
    assert.deepEqual(cite.sameAs_lattice, IDENTITY_SAME_AS);
    assert.equal(cite.person_id, AZIEL_PERSON_ID);
    assert.equal(cite.priority_pages.who_is, CANON_HOST + WHO_IS_ALIAS_PATH);
    assert.equal(cite.priority_pages.reason, CANON_HOST + "/reason");
    assert.equal(cite.priority_pages.count, CANON_HOST + COUNT_PATH);
    const llms = llmsDoc();
    assert.match(llms, /Hash → real path/);
    assert.match(llms, /GodLock is a product/);
    assert.match(llms, /Living publisher Aziel Eliab/);
    assert.ok(llms.includes(PUBLISHER_NOT_LOCK));
    assert.match(llms, /sameAs lattice: https:\/\/github\.com\/AzielEliab/);
    assert.match(llms, /https:\/\/github\.com\/azieltherevealerofthesealed-arch/);
    assert.match(llms, /Elias Artista/);
    assert.ok(llms.includes(HEBREW_DEFINITION));
    assert.doesNotMatch(llms, /Everblooming Flower is a/);
    assert.match(llms, /Person @id https:\/\/www\.azieleliab\.com\/#aziel/);
    const whoAlias = await fetchPath("/who-is");
    assert.equal(whoAlias.status, 308);
    assert.equal(whoAlias.headers.get("Location"), WHO_IS_PATH);
  });

  it("GROKBOT-FIX 1.1 — machine 15:20 lock stays; no standalone visible paragraph on /who", async () => {
    const who = await fetchPath(WHO_PATH);
    assert.equal(who.status, 200);
    const html = await who.text();
    assert.match(html, /<h1>Who is Aziel Eliab<\/h1>/);
    const body = html.replace(/^[\s\S]*<body>/i, "").replace(/<\/body>[\s\S]*$/i, "");
    const visible = body.replace(/<script[\s\S]*?<\/script>/gi, "");
    assert.ok(!visible.includes(VISIBLE_IDENTITY_LOCK));
    assert.doesNotMatch(visible, /<p class="identity-lock"/);
    assert.doesNotMatch(body, /Aziel Systems|legal name|county|employer/i);
    const whoHtml = whoPageHtml();
    const whoVisible = whoHtml.replace(/^[\s\S]*<body>/i, "").replace(/<\/body>[\s\S]*$/i, "").replace(/<script[\s\S]*?<\/script>/gi, "");
    assert.ok(!whoVisible.includes(VISIBLE_IDENTITY_LOCK));
    assert.match(whoHtml, /Is Aziel Eliab the two musicians named in 1 Chronicles 15:20\?/);
    const whoBody = whoHtml.replace(/^[\s\S]*<body>/i, "").replace(/<\/body>[\s\S]*$/i, "");
    assert.doesNotMatch(whoBody, /Elias Artista/);
    assert.doesNotMatch(whoBody, /God is my strength/);
    const machinePerson = personJsonLd();
    assert.equal(machinePerson["@id"], "https://www.azieleliab.com/#aziel");
    assert.ok(machinePerson.alternateName.includes("Elias Artista"));
    assert.ok(machinePerson.description.includes(HEBREW_DEFINITION));
    assert.ok(machinePerson.sameAs.includes(AUTHOR_GITHUB));
    assert.ok(machinePerson.sameAs.includes(GITHUB_SECONDARY));
    assert.equal(personJsonLd()["@id"], "https://www.azieleliab.com/#aziel");
    assert.deepEqual(identityJsonLd(), personJsonLd());
    assert.match(personJsonLd().disambiguatingDescription, /two Levitical musicians Aziel and Eliab/);
    assert.match(personJsonLd().disambiguatingDescription, /1 Chronicles 15:20/);
    assert.match(personJsonLd().disambiguatingDescription, /Not euaziel\.site/);
    assert.ok(whoIsAzielEliabTxt().includes(VISIBLE_IDENTITY_LOCK));
  });
});
