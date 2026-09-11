import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AZIEL_ELIAB_PATH,
  AZIEL_CORPUS_PATH,
  REASON_PATH,
  SOFTWARE_PATH,
  RUNTIME_PATH,
  DONATE_PATH,
  AZIEL_MANIFESTO,
  AZIEL_SIGNATURE,
  azielEliabBody,
  azielEliabText,
  page,
  topNav,
  ecosystemNav,
  CSS,
  softwareBody,
  homeBody,
  homeSoftwareLine,
} from "./src/ui.js";
import {
  robotsTxt,
  sitemapXml,
  citeDoc,
  llmsDoc,
  aiDoc,
  defaultDescription,
  headMeta,
  personNode,
  personRef,
  personLocalStub,
  ecosystemLinks,
  documentTitle,
  isIndexCrawler,
  permanentIdentityRedirect,
  CANON_HOST,
  LIBRARY_AZIEL,
  AUTHOR_GITHUB,
  GITHUB,
  AZIEL_PERSON_ID,
  AZIEL_OFFICIAL,
  LOCAL_PERSON_STUB_ID,
  AI_CRAWLER_AGENTS,
  AI_CLIENTS,
  AI_CLIENTS_SENTENCE,
  RUNTIME_VERSION,
  RUNTIME_ABSTRACT,
  GLAMA_RUNTIME,
  RUNTIME_DOCS_2_0,
  GITHUB_RUNTIME,
} from "./src/seo.js";
import worker, { publicPayload } from "./src/index.js";
import {
  CATALOG_FALLBACK_PRODUCTS,
  CATALOG_SLUGS,
  CATALOG_PRODUCT_COUNT,
  RUNTIME_CARD,
  FRAGGATE_CARD,
  AZNET_CARD,
  AZHUB_CARD,
  AZINTERFACE_CARD,
  AZCOHERENCE_CARD,
  softwareApiDoc,
  BINDING_CATALOG_URLS,
  BINDING_SOFTWARE_URLS,
  HTTPS_CATALOG_TRIES,
  SOFTWARE_JSON_PATH,
  FRAGGATE_LIST_PATH,
  EXTRA_SUITE_SLUGS,
  OMIT_UNTIL_WORKER_SLUGS,
  fetchCatalogProducts,
  attachCatalogCounters,
  loadCatalogForHtml,
  packedCatalogSnapshot,
  resetCatalogCache,
  SOFTWARE_HTML_CACHE_CONTROL,
  softwareSuite,
  productsFromCatalogDoc,
  suiteFamily,
  sortSoftwareSuite,
  parseCounterDoc,
  publicProduct,
  compactProduct,
  hubProductCopy,
  omitUntilWorker,
  stripRuntimeFragGateMash,
} from "./src/catalog.js";
import {
  FRAGGATE_DOWNLOAD, FRAGGATE_WORKER, AZBROWSER_DOWNLOAD, AZBROWSER_WORKER,
  AZNET_DOWNLOAD, AZNET_WORKER,
  AZHUB_DOWNLOAD, AZHUB_WORKER, AZINTERFACE_DOWNLOAD, AZINTERFACE_WORKER,
  AZCOHERENCE_DOWNLOAD, AZCOHERENCE_WORKER, AZCOHERENCE_GITHUB, AZCOHERENCE_SLUG,
} from "./src/seo.js";

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

describe("Aziel Eliab page chrome", () => {
  it("uses the corpus identity path /AzielEliab", () => {
    assert.equal(AZIEL_ELIAB_PATH, "/AzielEliab");
    assert.equal(AZIEL_CORPUS_PATH, "/AzielCorpusLibrary");
    assert.equal(REASON_PATH, "/reason");
    assert.equal(SOFTWARE_PATH, "/software");
    assert.equal(RUNTIME_PATH, "/runtime");
    assert.equal(DONATE_PATH, "/donate");
  });

  it("keeps the manifesto paragraphs and signature exactly", () => {
    assert.equal(AZIEL_MANIFESTO.length, 4);
    assert.equal(
      AZIEL_MANIFESTO[0],
      "I made this because a debate with no record becomes a pulpit, and a pulpit with no score becomes a private religion. Intelligent design was never the point by itself. The point was whether a claim could stand in the open, be answered, and leave something behind that was not just my voice.",
    );
    assert.equal(AZIEL_SIGNATURE, "— Aziel Eliab");
    const text = azielEliabText();
    assert.ok(text.endsWith("— Aziel Eliab\n"));
  });

  it("orders nav Engine | Reason | Software | Runtime | Verify | Donate | Aziel Eliab | Aziel Corpus Library", () => {
    const nav = topNav("/verify");
    assert.match(
      nav,
      /href="\/">Engine<\/a><span class="sep">\|<\/span><a href="\/reason">Reason<\/a><span class="sep">\|<\/span><a href="\/software">Software<\/a><span class="sep">\|<\/span><a href="\/runtime">Runtime<\/a><span class="sep">\|<\/span><a href="\/verify"/,
    );
    assert.match(
      nav,
      /href="\/verify"[^>]*>Verify<\/a><span class="sep">\|<\/span><a href="\/donate">Donate<\/a><span class="sep">\|<\/span><a href="\/AzielEliab" class="aziel">Aziel Eliab<\/a><span class="sep">\|<\/span><a href="https:\/\/www\.azielcorpuslibrary\.net\/AzielEliab" class="aziel">Aziel Corpus Library<\/a>/,
    );
    assert.match(CSS, /--royal:#6b3fa0/);
    assert.match(CSS, /--royal-deep:#4a2870/);
  });

  it("renders crawlable manifesto HTML with a Digital Library cross-link", () => {
    const html = page("Aziel Eliab", azielEliabBody(), { path: AZIEL_ELIAB_PATH, kind: "aziel" });
    assert.match(html, /<title>About Aziel Eliab — GodLock<\/title>/);
    assert.match(html, /name="robots" content="index,follow"/);
    assert.match(html, /rel="canonical" href="https:\/\/godlock\.uk\/AzielEliab"/);
    assert.match(html, /name="keywords" content="Aziel Eliab, GodLock, Specified Fit, receipt, intelligent design stress-test, About Aziel Eliab"/);
    assert.ok(html.includes(AZIEL_MANIFESTO[0]));
    assert.ok(html.includes("— Aziel Eliab"));
    assert.match(html, /href="https:\/\/www\.azielcorpuslibrary\.net\/AzielEliab">Aziel Eliab — Digital Library<\/a>/);
    const manifesto = html.match(/<section class="about-aziel"[\s\S]*?<\/section>/)[0];
    assert.doesNotMatch(manifesto, /MCP|OpenAPI|runtime_session|Workers AI/i);
    assert.doesNotMatch(azielEliabBody(), /MCP|OpenAPI|runtime_session|Workers AI/i);
    assert.match(html, /Part of the Aziel Eliab ecosystem/);
    assert.match(html, /href="https:\/\/glama\.ai\/mcp\/servers\/AzielEliab\/aziel-runtime">Try on Glama<\/a>/);
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const person = ld["@graph"].find((n) => n["@type"] === "Person");
    assert.equal(person["@id"], AZIEL_PERSON_ID);
    assert.equal(person.name, "Aziel Eliab");
    assert.deepEqual(person.alternateName, ["Aziel Elroi Eliab"]);
    assert.equal(person.url, AZIEL_OFFICIAL);
    assert.ok(person.sameAs.includes("https://godlock.uk/AzielEliab"));
    assert.ok(person.sameAs.includes(LIBRARY_AZIEL));
    assert.ok(person.sameAs.includes(AUTHOR_GITHUB));
    assert.ok(person.sameAs.includes(GITHUB));
    const about = ld["@graph"].find((n) => {
      const types = [].concat(n["@type"] || []);
      return types.includes("AboutPage");
    });
    assert.ok(about);
    assert.ok([].concat(about["@type"]).includes("AboutPage"));
    assert.ok([].concat(about["@type"]).includes("ProfilePage"));
    assert.equal(about.name, "About Aziel Eliab");
    assert.ok((about.relatedLink || []).includes(LIBRARY_AZIEL));
    assert.ok((about.relatedLink || []).includes(CANON_HOST + "/reason"));
    assert.ok((about.mentions || []).some((m) => m && m.name === "Specified Fit, Not Pretty Spirals"));
    assert.equal(person.identifier, "Aziel Eliab");
    assert.equal(person.givenName, "Aziel");
    assert.equal(person.familyName, "Eliab");
    assert.ok((person.knowsAbout || []).includes("GodLock"));
    assert.equal(about.identifier, "about-aziel-eliab");
    assert.ok((about.significantLink || []).includes(LIBRARY_AZIEL));
    assert.ok((about.mentions || []).some((m) => m && m["@id"] === "https://godlock.uk/software#page"));
    assert.ok(ld["@graph"].some((n) => n["@type"] === "BreadcrumbList"));
  });
});

describe("Aziel Eliab SEO surfaces", () => {
  it("describes the identity page", () => {
    assert.match(defaultDescription("aziel"), /Aziel Eliab/);
    const meta = headMeta({ title: "Aziel Eliab", path: "/AzielEliab", kind: "aziel" });
    assert.match(meta, /name="robots" content="index,follow"/);
    assert.match(meta, /og:title" content="About Aziel Eliab — GodLock"/);
    const person = personNode();
    assert.equal(person["@id"], AZIEL_PERSON_ID);
    assert.deepEqual(personRef(), { "@id": "https://www.azieleliab.com/#aziel" });
    assert.deepEqual(person.sameAs, [
      CANON_HOST + "/AzielEliab",
      LIBRARY_AZIEL,
      "https://www.azielcorpuslibrary.net/",
      AUTHOR_GITHUB,
      GITHUB,
    ]);
  });

  it("lists identity and library pages in robots, sitemap, cite, llms, and ai", async () => {
    const robots = robotsTxt();
    assert.match(robots, /Allow: \/AzielEliab/);
    assert.match(robots, /Allow: \/reason/);
    assert.match(robots, /Allow: \/donate/);
    assert.doesNotMatch(robots, /Allow: \/AzielCorpusLibrary/);
    assert.match(robots, /Allow: \/software/);
    assert.match(robots, /Allow: \/v1\/software/);
    assert.match(robots, /Allow: \/mesh/);
    assert.match(robots, /Allow: \/v1\/mesh\nAllow: \/v1\/mesh\/status/);
    assert.match(robots, /Allow: \/runtime\nAllow: \/runtime\//);
    assert.match(robots, /Allow: \/ai\.txt/);
    assert.match(robots, /Allow: \/openapi\.json/);
    assert.match(robots, /Content-Signal: search=yes, ai-input=yes, ai-train=yes/);
    assert.match(robots, /User-agent: Googlebot\nAllow: \//);
    assert.match(robots, /User-agent: Googlebot-Image\nAllow: \//);
    assert.match(robots, /User-agent: Googlebot-News\nAllow: \//);
    assert.match(robots, /User-agent: Claude-Web\nAllow: \//);
    assert.match(robots, /User-agent: xAI-Grok\nAllow: \//);
    assert.match(robots, /User-agent: DeepSeekBot\nAllow: \//);
    assert.match(robots, /User-agent: DuckAssist\nAllow: \//);
    assert.match(robots, /User-agent: Cloudflare-AI-Search\nAllow: \//);
    assert.match(robots, /Sitemap: https:\/\/aziel-runtime\.vibelock\.workers\.dev\/sitemap\.xml/);
    assert.match(robots, /User-agent: GPTBot\nAllow: \//);
    assert.match(robots, /User-agent: ChatGPT-User\nAllow: \//);
    assert.match(robots, /User-agent: OAI-SearchBot\nAllow: \//);
    assert.match(robots, /User-agent: Grok\nAllow: \//);
    assert.match(robots, /User-agent: Venice\nAllow: \//);
    assert.match(robots, /User-agent: Google-Extended\nAllow: \//);
    assert.match(robots, /User-agent: ClaudeBot\nAllow: \//);
    assert.match(robots, /User-agent: PerplexityBot\nAllow: \//);
    assert.match(robots, /User-agent: bingbot\nAllow: \//);
    assert.match(robots, /User-agent: FacebookBot\nAllow: \//);
    assert.match(robots, /User-agent: facebookexternalhit\nAllow: \//);
    assert.match(robots, /User-agent: Meta-ExternalAds\nAllow: \//);
    assert.match(robots, /User-agent: TikTokSpider\nAllow: \//);
    assert.match(robots, /User-agent: Baiduspider\nAllow: \//);
    assert.match(robots, /User-agent: YandexBot\nAllow: \//);
    assert.match(robots, /User-agent: NeevaBot\nAllow: \//);
    assert.equal(new Set(AI_CRAWLER_AGENTS).size, AI_CRAWLER_AGENTS.length);
    for (const agent of [
      "Googlebot",
      "Googlebot-Image",
      "Googlebot-News",
      "Googlebot-Video",
      "Google-Read-Aloud",
      "Claude-Web",
      "DuckAssist",
      "xAI",
      "xAI-Grok",
      "DeepSeekBot",
      "Qwenbot",
      "Kimi",
      "Moonshot",
      "BraveBot",
      "Cloudflare-AI-Search",
      "GPTBot",
      "ChatGPT-User",
      "OAI-SearchBot",
      "Grok",
      "Venice",
      "FacebookBot",
      "facebookexternalhit",
      "Meta-ExternalAds",
      "TikTokSpider",
      "Baiduspider",
      "Baiduspider-render",
      "Baiduspider-ai",
      "YandexBot",
      "PanguBot",
      "Kangaroo Bot",
      "Cotoyogi",
      "aiHitBot",
      "webzio-extended",
      "ICC-Crawler",
      "DataForSeoBot",
      "AwarioBot",
      "AwarioSmartBot",
      "AwarioRssBot",
      "Sentibot",
      "peer39_crawler",
      "Seekr",
      "Meltwater",
      "TurnitinBot",
      "Factset_spyderbot",
      "NeevaBot",
    ]) {
      assert.ok(AI_CRAWLER_AGENTS.includes(agent), agent);
    }
    for (const agent of AI_CRAWLER_AGENTS) {
      const block = "User-agent: " + agent + "\nAllow: /";
      assert.ok(robots.includes(block), agent);
      assert.equal(robots.split(block).length - 1, 1, "deduped " + agent);
    }
    const xml = await sitemapXml({});
    assert.ok(xml.includes(CANON_HOST + "/reason"));
    assert.ok(xml.includes(CANON_HOST + "/donate"));
    assert.ok(xml.includes("https://www.azieleliab.com/donate"));
    assert.ok(xml.includes(CANON_HOST + "/AzielEliab"));
    assert.ok(xml.includes("<changefreq>daily</changefreq>"));
    assert.ok(xml.includes("<priority>1.0</priority>"));
    assert.ok((xml.match(/<loc>/g) || []).length >= 80);
    assert.ok(xml.includes(CANON_HOST + "/software#fraggate"));
    assert.ok(xml.includes(CANON_HOST + "/software#peacelock"));
    assert.ok(xml.includes(CANON_HOST + "/software#4dmap"));
    assert.ok(xml.includes(CANON_HOST + "/software#embryolock"));
    assert.ok(xml.includes(CANON_HOST + "/software#azbrowser"));
    assert.ok(xml.includes(CANON_HOST + "/software#aznet"));
    assert.ok(xml.includes(CANON_HOST + "/software#azhub"));
    assert.ok(xml.includes(CANON_HOST + "/software#azinterface"));
    assert.ok(xml.includes(CANON_HOST + "/software#azcoherence"));
    assert.ok(xml.includes(CANON_HOST + "/software#azclce"));
    assert.ok(xml.includes(CANON_HOST + "/v1/software"));
    assert.ok(xml.includes(CANON_HOST + "/runtime"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/v1/runtime.json"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/v1/uses"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/openapi.json"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/llms.txt"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/cite.json"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/mcp"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/v1/software"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/v1/mesh"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/v1/mesh/status"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/v1/mesh/nodes"));
    assert.ok(!xml.includes(CANON_HOST + "/runtime/v1/mesh/list"));
    assert.ok(xml.includes(CANON_HOST + "/mesh"));
    assert.ok(xml.includes(CANON_HOST + "/v1/mesh"));
    assert.ok(xml.includes(CANON_HOST + "/v1/mesh/status"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/v1/fraggate/list"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/v1/update/check"));
    assert.ok(xml.includes("https://github.com/AzielEliab/aziel-runtime/tree/main/docs/2.0"));
    assert.ok(xml.includes("https://glama.ai/mcp/servers/AzielEliab/aziel-runtime"));
    assert.ok(xml.includes(CANON_HOST + "/openapi.json"));
    assert.ok(xml.includes("https://aziel-runtime.vibelock.workers.dev/v1/software"));
    assert.ok(xml.includes("https://www.azielcorpuslibrary.net/runtime"));
    assert.ok(!xml.includes(CANON_HOST + "/AzielCorpusLibrary"));
    assert.ok(xml.includes(LIBRARY_AZIEL));
    const cite = citeDoc();
    assert.equal(cite.specified_fit, CANON_HOST + "/reason");
    assert.equal(cite.reason, CANON_HOST + "/reason");
    assert.equal(cite.donate, CANON_HOST + "/donate");
    assert.equal(cite.donate_canonical, "https://www.azieleliab.com/donate");
    assert.equal(cite.donate_spec, "AZL-DONATE-1.0");
    assert.equal(cite.aziel_eliab, CANON_HOST + "/AzielEliab");
    assert.equal(cite.aziel_corpus_library, LIBRARY_AZIEL);
    assert.equal(cite.library_aziel_eliab, LIBRARY_AZIEL);
    assert.equal(cite.author, "Aziel Eliab");
    assert.equal(cite.author_id, AZIEL_PERSON_ID);
    assert.equal(cite.person_id, "https://www.azieleliab.com/#aziel");
    assert.equal(cite.official_site, AZIEL_OFFICIAL);
    assert.equal(cite.identity, "Aziel Eliab");
    assert.match(cite.identity_note, /alternateName only/);
    assert.equal(cite.reasoning_spine, "Specified Fit, Not Pretty Spirals");
    assert.equal(cite.software_html, CANON_HOST + "/software");
    assert.match(cite.software_api_note, /Not a second FragGate door/);
    assert.equal(cite.priority_pages.home, CANON_HOST + "/");
    assert.equal(cite.priority_pages.software, CANON_HOST + "/software");
    assert.equal(cite.priority_pages.aziel_eliab, CANON_HOST + "/AzielEliab");
    assert.equal(cite.priority_pages.verify, CANON_HOST + "/verify");
    assert.equal(cite.priority_pages.donate, CANON_HOST + "/donate");
    assert.equal(cite.priority_pages.runtime, CANON_HOST + "/runtime");
    assert.ok(cite.ai_clients.includes("ChatGPT (GPT Actions / OpenAI)"));
    assert.ok(cite.ai_clients.includes("Grok (xAI)"));
    assert.ok(cite.ai_clients.includes("Venice"));
    assert.ok(cite.ai_clients.includes("Claude (Anthropic)"));
    assert.ok(cite.ai_clients.includes("Cursor (MCP)"));
    assert.ok(cite.ai_clients.includes("other MCP/OpenAPI-capable assistants"));
    assert.ok(cite.ai_clients.length >= 16);
    assert.equal(cite.runtime, CANON_HOST + "/runtime");
    assert.equal(cite.runtime_id, "https://www.azieleliab.com/runtime#runtime");
    assert.equal(cite.runtime_parent, "https://www.azieleliab.com/runtime#runtime");
    assert.equal(cite.godlock_runtime_tool, "https://www.azieleliab.com/runtime#godlock");
    assert.deepEqual(cite.runtime_entity_sameAs, [
      "https://github.com/AzielEliab/aziel-runtime",
      "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime",
    ]);
    assert.equal(cite.runtime_version, "2.0.0-rc1");
    assert.equal(cite.runtime_version, RUNTIME_VERSION);
    assert.equal(cite.runtime_abstract, RUNTIME_ABSTRACT);
    assert.equal(cite.seo_abstract_leads, true);
    assert.equal(cite.runtime_official, CANON_HOST + "/runtime");
    assert.equal(cite.runtime_github, GITHUB_RUNTIME);
    assert.equal(cite.runtime_glama, GLAMA_RUNTIME);
    assert.equal(cite.runtime_glama, "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime");
    assert.match(cite.runtime_glama_note, /Not an invented Glama server UUID/);
    assert.equal(cite.runtime_docs, RUNTIME_DOCS_2_0);
    assert.match(cite.runtime_docs, /docs\/2\.0/);
    assert.ok(Array.isArray(cite.runtime_distribution));
    assert.deepEqual(cite.runtime_distribution.map((b) => b.label), [
      "Try on Glama",
      "Official Runtime",
      "Source on GitHub",
      "Documentation/Architecture",
    ]);
    assert.equal(cite.runtime_distribution[0].id, "glama");
    assert.equal(cite.runtime_distribution[0].primary, true);
    assert.equal(cite.runtime_distribution[1].id, "official");
    assert.notEqual(cite.runtime_distribution[1].primary, true);
    assert.equal(cite.runtime_openapi, CANON_HOST + "/runtime/openapi.json");
    assert.equal(cite.runtime_mcp, CANON_HOST + "/runtime/mcp");
    assert.equal(cite.runtime_mesh, CANON_HOST + "/runtime/v1/mesh");
    assert.equal(cite.runtime_mesh_status, CANON_HOST + "/runtime/v1/mesh/status");
    assert.equal(cite.runtime_mesh_nodes, CANON_HOST + "/runtime/v1/mesh/nodes");
    assert.equal(cite.runtime_mesh_list, CANON_HOST + "/runtime/v1/mesh/nodes");
    assert.equal(cite.mesh, CANON_HOST + "/mesh");
    assert.equal(cite.mesh_local, CANON_HOST + "/v1/mesh");
    assert.equal(cite.mesh_status_local, CANON_HOST + "/v1/mesh/status");
    assert.equal(cite.mesh_get_never_enables, true);
    assert.equal(cite.mesh_spec, "QNM-BUILD-1.0");
    assert.equal(cite.mesh_default_off, true);
    assert.equal(cite.mesh_anonymity_network, false);
    assert.equal(cite.mesh_node_gate, false);
    assert.equal(cite.mesh_auto_heal, false);
    assert.equal(cite.mesh_rollup, "live|locked|isolated counts only");
    assert.equal(cite.anon_broadcast, "https://github.com/AzielEliab/anon-broadcast");
    assert.equal(cite.anon_broadcast_publish_path, false);
    assert.match(cite.anon_broadcast_note, /not a publish path on godlock\.uk/i);
    assert.equal(cite.runtime_uses, CANON_HOST + "/runtime/v1/uses");
    assert.match(cite.runtime_uses_note, /Not GodLock product Uses/);
    assert.equal(cite.runtime_library, "https://www.azielcorpuslibrary.net/runtime");
    assert.ok(cite.sameAs.includes(CANON_HOST + "/runtime"));
    assert.equal(cite.door, "fraggate");
    assert.equal(cite.software_catalog, CANON_HOST + "/runtime/v1/software");
    assert.equal(cite.software_api, CANON_HOST + "/v1/software");
    assert.equal(cite.azcoherence, CANON_HOST + "/software#azcoherence");
    assert.equal(cite.azcoherence_name, "AZCoherence");
    assert.equal(cite.azcoherence_slug, "azcoherence");
    assert.equal(cite.azcoherence_worker, AZCOHERENCE_WORKER);
    assert.equal(cite.azcoherence_github, AZCOHERENCE_GITHUB);
    assert.equal(cite.azcoherence_download, AZCOHERENCE_DOWNLOAD);
    assert.equal(cite.azcoherence_runtime, CANON_HOST + "/runtime/v1/pull/azcoherence");
    assert.equal(cite.azcoherence_fraggate, CANON_HOST + "/runtime/v1/fraggate/describe?slug=azcoherence");
    assert.equal(cite.azcoherence_peer, "azclce");
    assert.match(cite.azcoherence_note, /Not AKM-TRIAD/);
    assert.equal(cite.software_fraggate, CANON_HOST + "/runtime/v1/fraggate/list");
    assert.equal(cite.openapi, CANON_HOST + "/openapi.json");
    assert.match(cite.update_check, /\/v1\/update\/check\?slug=godlock/);
    const llms = llmsDoc();
    assert.match(llms, /## Priority pages/);
    assert.match(llms, /Softwares: https:\/\/godlock\.uk\/software/);
    assert.match(llms, /About Aziel Eliab: https:\/\/godlock\.uk\/AzielEliab/);
    assert.match(llms, /Runtime FragGate door: https:\/\/godlock\.uk\/runtime/);
    assert.match(llms, /Catalog JSON \(SEO proxy, not a FragGate door\): https:\/\/godlock\.uk\/v1\/software/);
    assert.match(llms, /Specified Fit, Not Pretty Spirals: https:\/\/godlock\.uk\/reason/);
    assert.match(llms, /Donate: https:\/\/godlock\.uk\/donate \(AZL-DONATE-1\.0\)\. Same door: https:\/\/www\.azieleliab\.com\/donate/);
    assert.match(llms, /AZCoherence \(azcoherence\)/);
    assert.match(llms, /AZCoherence Worker: https:\/\/azcoherence-download-tracker\.vibelock\.workers\.dev\//);
    assert.match(llms, /AZCoherence GitHub: https:\/\/github\.com\/AzielEliab\/AZCoherence/);
    assert.match(llms, /AZCoherence runtime: https:\/\/godlock\.uk\/runtime\/v1\/pull\/azcoherence/);
    assert.match(llms, /AZCoherence FragGate: https:\/\/godlock\.uk\/runtime\/v1\/fraggate\/describe\?slug=azcoherence/);
    assert.match(llms, /Software API: https:\/\/godlock\.uk\/v1\/software/);
    assert.match(llms, /Not AKM-TRIAD/);
    assert.match(llms, /Live software catalog: https:\/\/godlock\.uk\/runtime\/v1\/software/);
    assert.match(llms, /FragGate list fallback: https:\/\/godlock\.uk\/runtime\/v1\/fraggate\/list/);
    assert.match(llms, /Aziel Eliab: https:\/\/godlock\.uk\/AzielEliab/);
    assert.match(llms, /Aziel Corpus Library: https:\/\/www\.azielcorpuslibrary\.net\/AzielEliab/);
    assert.doesNotMatch(llms, /Aziel Corpus Library: https:\/\/godlock\.uk\/AzielCorpusLibrary/);
    assert.match(llms, /## Runtime \(FragGate door\)/);
    assert.ok(llms.indexOf(RUNTIME_ABSTRACT) < llms.indexOf("Live version: 2.0.0-rc1"));
    assert.ok(llms.indexOf("## Runtime (FragGate door)") < llms.indexOf(RUNTIME_ABSTRACT));
    assert.match(llms, /Try on Glama: https:\/\/glama\.ai\/mcp\/servers\/AzielEliab\/aziel-runtime/);
    assert.match(llms, /Official Runtime: https:\/\/godlock\.uk\/runtime/);
    assert.match(llms, /Source on GitHub: https:\/\/github\.com\/AzielEliab\/aziel-runtime/);
    assert.match(llms, /Documentation\/Architecture: https:\/\/github\.com\/AzielEliab\/aziel-runtime\/tree\/main\/docs\/2\.0/);
    assert.ok(llms.indexOf("Try on Glama:") < llms.indexOf("Official Runtime:"));
    assert.doesNotMatch(llms, /glama\.ai\/mcp\/servers\/@[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+/);
    assert.match(llms, /Door: https:\/\/godlock\.uk\/runtime/);
    assert.match(llms, /OpenAPI: https:\/\/godlock\.uk\/runtime\/openapi\.json/);
    assert.match(llms, /MCP: POST https:\/\/godlock\.uk\/runtime\/mcp/);
    assert.match(llms, /Suite mesh \(default off\): https:\/\/godlock\.uk\/runtime\/v1\/mesh/);
    assert.match(llms, /GET \/v1\/mesh never enables/);
    assert.match(llms, /Same-origin mesh \(Live Nodes clients\): https:\/\/godlock\.uk\/v1\/mesh/);
    assert.match(llms, /Same-origin mesh status: https:\/\/godlock\.uk\/v1\/mesh\/status/);
    assert.match(llms, /Mesh status: https:\/\/godlock\.uk\/runtime\/v1\/mesh\/status/);
    assert.match(llms, /Mesh nodes: https:\/\/godlock\.uk\/runtime\/v1\/mesh\/nodes/);
    assert.match(llms, /QNM-BUILD-1\.0 rollup: live\|locked\|isolated counts only/);
    assert.match(llms, /No Node Gate/);
    assert.match(llms, /No auto-heal/);
    assert.match(llms, /anon-broadcast is not a publish path on godlock\.uk/);
    assert.match(llms, /Not an anonymity network/);
    assert.match(llms, /API uses \(this door\): https:\/\/godlock\.uk\/runtime\/v1\/uses/);
    assert.match(llms, /Library door: https:\/\/www\.azielcorpuslibrary\.net\/runtime/);
    assert.match(llms, /Works with ChatGPT \(GPT Actions \/ OpenAI\), Grok \(xAI\), Venice, Claude \(Anthropic\)/);
    assert.match(llms, /Cursor \(MCP\), Glama \(MCP\), Perplexity, Microsoft Copilot \/ Bing, Google Gemini \/ Vertex/);
    assert.match(llms, /GPTBot, ChatGPT-User, OAI-SearchBot, Venice, Grok, Google-Extended/);
    assert.doesNotMatch(llms, /Use with Grok, ChatGPT, Venice/);
    assert.equal(aiDoc(), llmsDoc());
    const openapiRes = await worker.fetch(new Request("https://godlock.uk/openapi.json"), mockEnv());
    assert.equal(openapiRes.status, 200);
    const spec = await openapiRes.json();
    assert.equal(spec.openapi, "3.1.0");
    assert.ok(spec.paths["/software"]);
    assert.ok(spec.paths["/v1/software"]);
    assert.ok(spec.paths["/donate"]);
    assert.ok(spec.paths["/runtime/v1/software"]);
    assert.ok(spec.paths["/v1/mesh"]);
    assert.ok(spec.paths["/v1/mesh/status"]);
    assert.ok(spec.paths["/runtime/v1/mesh"]);
    assert.ok(spec.paths["/runtime/v1/mesh/status"]);
    assert.ok(spec.paths["/runtime/v1/mesh/nodes"]);
    assert.ok(!spec.paths["/runtime/v1/mesh/list"]);
    assert.ok(spec.paths["/runtime/v1/mesh/join"]);
    assert.ok(spec.paths["/mesh"]);
    assert.ok(spec.paths["/runtime/v1/update/check"]);
    assert.doesNotMatch(JSON.stringify(spec), /\bABAD\b/);
  });

  it("308s about/kebab/case variants to the canonical identity paths", () => {
    assert.equal(permanentIdentityRedirect("/aziel-eliab"), "/AzielEliab");
    assert.equal(permanentIdentityRedirect("/azieleliab"), "/AzielEliab");
    assert.equal(permanentIdentityRedirect("/about"), "/AzielEliab");
    assert.equal(permanentIdentityRedirect("/aboutme"), "/AzielEliab");
    assert.equal(permanentIdentityRedirect("/AzielEliab"), "");
    assert.equal(permanentIdentityRedirect("/specified-fit"), "/reason");
    assert.equal(permanentIdentityRedirect("/specifiedfit"), "/reason");
    assert.equal(permanentIdentityRedirect("/reason"), "");
    assert.equal(permanentIdentityRedirect("/aziel-corpus-library"), LIBRARY_AZIEL);
    assert.equal(permanentIdentityRedirect("/AzielCorpusLibrary"), LIBRARY_AZIEL);
    assert.equal(permanentIdentityRedirect("/AzielCorpusLibrary/"), LIBRARY_AZIEL);
  });
});

describe("priority page SEO", () => {
  it("keeps unique titles and does not suffix GodLock twice", () => {
    assert.equal(documentTitle("GodLock", "home"), "GodLock by Aziel Eliab — Specified Fit, Not Pretty Spirals");
    assert.equal(documentTitle("Software", "software"), "Aziel Eliab Softwares — GodLock");
    assert.equal(documentTitle("Aziel Eliab", "aziel"), "About Aziel Eliab — GodLock");
    assert.equal(documentTitle("Verify", "verify"), "Verify — GodLock");
    assert.match(headMeta({ title: "GodLock", path: "/", kind: "home" }), /og:title" content="GodLock by Aziel Eliab — Specified Fit, Not Pretty Spirals"/);
    assert.match(headMeta({ title: "Software", path: "/software", kind: "software" }), /og:title" content="Aziel Eliab Softwares — GodLock"/);
    assert.doesNotMatch(headMeta({ title: "GodLock", path: "/", kind: "home" }), /GodLock — GodLock/);
  });

  it("marks 404s noindex and sends HTML /v1/software to the Softwares page", async () => {
    const missing = await worker.fetch(new Request("https://godlock.uk/no-such-route"), mockEnv());
    assert.equal(missing.status, 404);
    const missingHtml = await missing.text();
    assert.match(missingHtml, /name="robots" content="noindex,follow"/);
    assert.match(missingHtml, /<title>Not found — GodLock<\/title>/);
    const htmlCatalog = await worker.fetch(new Request("https://godlock.uk/v1/software", {
      headers: { Accept: "text/html" },
    }), mockEnv());
    assert.equal(htmlCatalog.status, 308);
    assert.equal(htmlCatalog.headers.get("Location"), "/software");
    assert.equal(isIndexCrawler("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"), true);
    assert.equal(isIndexCrawler("Mozilla/5.0"), false);
  });

  it("renders Softwares CollectionPage JSON-LD without changing chrome", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/software", {
      headers: { "User-Agent": "Googlebot" },
    }), mockEnv());
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /<title>Aziel Eliab Softwares — GodLock<\/title>/);
    assert.match(html, /rel="canonical" href="https:\/\/godlock\.uk\/software"/);
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const collection = ld["@graph"].find((n) => n["@type"] === "CollectionPage" && n.url === "https://godlock.uk/software" && n.name === "Aziel Eliab Softwares");
    assert.ok(collection);
    assert.equal(collection.identifier, "aziel-eliab-softwares");
    assert.ok((collection.significantLink || []).includes("https://godlock.uk/runtime"));
    assert.ok((collection.relatedLink || []).includes("https://godlock.uk/AzielEliab"));
    assert.ok(ld["@graph"].some((n) => n["@type"] === "BreadcrumbList"));
    const list = ld["@graph"].find((n) => n["@type"] === "ItemList");
    assert.ok(list);
    assert.ok(list.numberOfItems >= 30);
    assert.ok((list.itemListElement || []).some((it) => it.url === "https://godlock.uk/software#godlock"));
    assert.ok((list.itemListElement || []).some((it) => it.url === "https://godlock.uk/software#fraggate"));
    assert.ok((list.itemListElement || []).some((it) => it.item && it.item["@type"] === "SoftwareApplication" && it.item.identifier === "godlock"));
    assert.match(html, /<h2 class="soft-heading">Downloadable software<\/h2>/);
    assert.match(html, /name="keywords" content="Aziel Eliab Softwares, GodLock.uk/);
    const aboutMeta = headMeta({ title: "Aziel Eliab", path: "/AzielEliab", kind: "aziel" });
    assert.doesNotMatch(aboutMeta, /Aziel Eliab Softwares, GodLock.uk/);
    assert.doesNotMatch(html, /<title>GodLock — GodLock<\/title>/);
    assert.doesNotMatch(html, /<title>Aziel Eliab — GodLock<\/title>/);
  });
});

describe("homepage stays a natural argument surface", () => {
  it("puts Specified Fit on the spine and does not coach a paste-block", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/"), mockEnv());
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Specified Fit, Not Pretty Spirals/);
    assert.match(html, /Functionally specified digital information joined to a translation \/ reader system/);
    assert.match(html, /href="\/reason">Read the brief</);
    assert.match(html, /Answers open with Yes, No, Let's review, or Interesting/);
    assert.match(html, /GodLock records a receipt\. It does not sermonize/);
    assert.match(html, /Works with ChatGPT \(GPT Actions \/ OpenAI\), Grok \(xAI\), Venice, Claude \(Anthropic\)/);
    assert.match(html, /Cursor \(MCP\), Glama \(MCP\), Perplexity/);
    assert.match(html, /other MCP\/OpenAPI-capable assistants/);
    assert.match(html, /href="\/runtime">Runtime<\/a>/);
    assert.match(html, /<h2>Software<\/h2>/);
    assert.match(html, /id="software"/);
    assert.match(html, /href="\/software#azcoherence">AZCoherence<\/a>/);
    assert.match(html, /href="\/software#azclce">AZ-CLCE<\/a>/);
    assert.match(html, /href="\/v1\/software">Software API<\/a>/);
    assert.match(html, /id="mesh-status"/);
    assert.match(html, /Suite mesh: off/);
    assert.match(html, /QNM-BUILD-1\.0/);
    assert.doesNotMatch(html, /id="node-gate"/);
    assert.match(html, /Not an anonymity network/);
    assert.match(html, /<title>GodLock by Aziel Eliab — Specified Fit, Not Pretty Spirals<\/title>/);
    assert.doesNotMatch(html, /<title>GodLock — GodLock<\/title>/);
    const homeLd = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.ok(homeLd["@graph"].some((n) => n["@type"] === "WebSite" && n["@id"] === "https://godlock.uk/#website"));
    assert.ok(homeLd["@graph"].some((n) => n["@type"] === "SoftwareApplication" && n.name === "GodLock" && n["@id"] === "https://godlock.uk/#godlock"));
    assert.ok(homeLd["@graph"].some((n) => n["@type"] === "WebAPI" && n.documentation === "https://godlock.uk/runtime/openapi.json"));
    assert.ok(homeLd["@graph"].some((n) => n["@type"] === "SoftwareApplication" && n.name === "Aziel Runtime" && n["@id"] === "https://www.azieleliab.com/runtime#runtime" && n.softwareVersion === "2.0.0-rc1" && (n.sameAs || []).includes("https://github.com/AzielEliab/aziel-runtime") && (n.sameAs || []).includes("https://glama.ai/mcp/servers/AzielEliab/aziel-runtime") && !(n.sameAs || []).includes("https://www.azielcorpuslibrary.net/runtime")));
    assert.doesNotMatch(html, /Use with Grok, ChatGPT, Venice/);
    assert.doesNotMatch(html, /INTERNAL_CRITERIA|bootstrap lock|paste-block|how the argument works/i);
    assert.doesNotMatch(html, /\bABAD\b/);
  });

  it("does not serve the internal operator brief", async () => {
    for (const path of ["/internal", "/internal/", "/internal/SPECIFIED_FIT.md"]) {
      const res = await worker.fetch(new Request("https://godlock.uk" + path), mockEnv());
      assert.equal(res.status, 404, path);
      const html = await res.text();
      assert.doesNotMatch(html, /Steel claim|INTERNAL_CRITERIA|bootstrap lock|how the argument works/i);
      assert.doesNotMatch(html, /Layer A Detection|S without R/);
    }
  });
});

describe("major AI client list", () => {
  it("names the full public client set, not the Grok/ChatGPT/Venice triad alone", () => {
    assert.ok(AI_CLIENTS.includes("ChatGPT (GPT Actions / OpenAI)"));
    assert.ok(AI_CLIENTS.includes("Grok (xAI)"));
    assert.ok(AI_CLIENTS.includes("Venice"));
    assert.ok(AI_CLIENTS.includes("Claude (Anthropic)"));
    assert.ok(AI_CLIENTS.includes("Cursor (MCP)"));
    assert.ok(AI_CLIENTS.includes("Glama (MCP)"));
    assert.ok(AI_CLIENTS.includes("Perplexity"));
    assert.ok(AI_CLIENTS.includes("Microsoft Copilot / Bing"));
    assert.ok(AI_CLIENTS.includes("Google Gemini / Vertex"));
    assert.ok(AI_CLIENTS.includes("Mistral"));
    assert.ok(AI_CLIENTS.includes("Meta AI"));
    assert.ok(AI_CLIENTS.includes("Apple Intelligence surfaces"));
    assert.ok(AI_CLIENTS.includes("Amazon Q tooling"));
    assert.ok(AI_CLIENTS.includes("DuckAssist"));
    assert.ok(AI_CLIENTS.includes("You.com"));
    assert.ok(AI_CLIENTS.includes("Cohere"));
    assert.equal(AI_CLIENTS.length, 16);
    assert.match(AI_CLIENTS_SENTENCE, /other MCP\/OpenAPI-capable assistants/);
    const software = softwareBody({ products: [] });
    assert.match(software, /<h2 class="soft-heading">Downloadable software<\/h2>\s*<div class="soft-grid">/);
    assert.doesNotMatch(software, /Works with ChatGPT \(GPT Actions \/ OpenAI\)/);
    assert.doesNotMatch(software, /Use with Grok, ChatGPT, Venice/);
    const home = homeBody({ stats: {}, latest: null, prior: [] });
    assert.match(home, /Works with ChatGPT \(GPT Actions \/ OpenAI\)/);
    assert.match(home, /href="\/software#azcoherence">AZCoherence<\/a>/);
    const homeLine = homeSoftwareLine({ products: [] });
    assert.match(homeLine, /href="\/software#azcoherence">AZCoherence<\/a>/);
    assert.match(homeLine, /href="\/software#aznet">AZNet<\/a>/);
    const softwareMeta = defaultDescription("software");
    assert.ok(softwareMeta.startsWith("Aziel Runtime is not merely an API orchestrator"));
    assert.match(softwareMeta, /2\.0\.0-rc1/);
    assert.match(softwareMeta, /Claude \(Anthropic\)/);
    assert.ok(defaultDescription("runtime").startsWith("Aziel Runtime is not merely an API orchestrator"));
    assert.match(defaultDescription("runtime"), /2\.0\.0-rc1/);
    assert.match(defaultDescription("runtime"), /GET \/v1\/mesh never enables/);
    const softwareHead = headMeta({ title: "Software", path: "/software", kind: "software" });
    assert.match(softwareHead, /Claude \(Anthropic\), Cursor \(MCP\), Glama \(MCP\), Perplexity/);
    assert.match(softwareHead, /name="keywords" content="Aziel Eliab Softwares, GodLock.uk/);
    assert.match(headMeta({ title: "GodLock", path: "/", kind: "home" }), /Claude, Cursor, Glama, Perplexity/);
  });
});

describe("Aziel Corpus Library off-site", () => {
  it("points the nav tab at the live library identity URL", () => {
    const nav = topNav("/");
    assert.match(nav, /href="https:\/\/www\.azielcorpuslibrary\.net\/AzielEliab" class="aziel">Aziel Corpus Library<\/a>/);
    assert.doesNotMatch(nav, /href="\/AzielCorpusLibrary"/);
    assert.match(nav, /href="\/AzielEliab" class="aziel">Aziel Eliab<\/a>/);
  });

  it("serves that absolute library href from the homepage", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/"), mockEnv());
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /href="https:\/\/www\.azielcorpuslibrary\.net\/AzielEliab" class="aziel">Aziel Corpus Library<\/a>/);
    assert.match(html, /href="\/AzielEliab" class="aziel">Aziel Eliab<\/a>/);
    assert.doesNotMatch(html, /<h1>About Aziel<\/h1>/);
    assert.doesNotMatch(html, /Who\? Does not matter\./);
  });
});

describe("Aziel Eliab routes", () => {
  it("serves the manifesto at /AzielEliab", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/AzielEliab"), mockEnv());
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /<title>About Aziel Eliab — GodLock<\/title>/);
    assert.match(html, /index,follow/);
    assert.ok(html.includes(AZIEL_MANIFESTO[3]));
    assert.match(html, /Specified Fit, Not Pretty Spirals/);
    assert.match(html, /class="aziel current"/);
  });

  it("308s the kebab path to /AzielEliab", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/aziel-eliab"), mockEnv());
    assert.equal(res.status, 308);
    assert.equal(res.headers.get("Location"), "/AzielEliab");
  });

  it("returns JSON when asked", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/AzielEliab?format=json"), mockEnv());
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.author, "Aziel Eliab");
    assert.equal(body.path, "/AzielEliab");
    assert.ok(body.text.includes("The receipt is the argument that survives the speaker."));
  });

  it("308s /AzielCorpusLibrary off-site to the live library", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/AzielCorpusLibrary"), mockEnv());
    assert.equal(res.status, 308);
    assert.equal(res.headers.get("Location"), "https://www.azielcorpuslibrary.net/AzielEliab");
    const html = await res.text();
    assert.doesNotMatch(html, /<title>Aziel Corpus Library — GodLock<\/title>/);
    assert.doesNotMatch(html, /<h1>About Aziel<\/h1>/);
  });

  it("308s /AzielCorpusLibrary/ and kebab aliases off-site", async () => {
    for (const path of ["/AzielCorpusLibrary/", "/aziel-corpus-library", "/azielcorpuslibrary"]) {
      const res = await worker.fetch(new Request("https://godlock.uk" + path), mockEnv());
      assert.equal(res.status, 308, path);
      assert.equal(res.headers.get("Location"), "https://www.azielcorpuslibrary.net/AzielEliab", path);
    }
  });
});

describe("Specified Fit /reason", () => {
  it("serves the public brief", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/reason"), mockEnv());
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /<title>Specified Fit, Not Pretty Spirals — GodLock<\/title>/);
    assert.match(html, /Functionally specified digital information joined to a translation \/ reader system/);
    assert.match(html, /A\. Detection/);
    assert.match(html, /D\. GodLock as method/);
    assert.doesNotMatch(html, /\bABAD\b/);
    assert.doesNotMatch(html, /INTERNAL_CRITERIA|bootstrap lock/i);
  });

  it("308s /specified-fit to /reason", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/specified-fit"), mockEnv());
    assert.equal(res.status, 308);
    assert.equal(res.headers.get("Location"), "/reason");
  });

  it("returns JSON when asked", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/reason?format=json"), mockEnv());
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.author, "Aziel Eliab");
    assert.equal(body.path, "/reason");
    assert.equal(body.title, "Specified Fit, Not Pretty Spirals");
    assert.match(body.text, /Functionally specified digital information/);
  });
});

function softCardIds(html) {
  return [...String(html).matchAll(/<article class="soft-card[^"]*" id="([^"]+)"/g)].map((m) => m[1]);
}

function softCardH3s(html) {
  return [...String(html).matchAll(/<article class="soft-card[\s\S]*?<h3>([^<]+)<\/h3>/g)].map((m) => m[1]);
}

describe("Software page hosts the full aziel-runtime catalog", () => {
  it("keeps a snapshot fallback that is not a 27-only cap, plus the aziel-runtime / FragGate card", () => {
    assert.ok(CATALOG_PRODUCT_COUNT >= 28, "snapshot floor " + CATALOG_PRODUCT_COUNT);
    assert.equal(CATALOG_SLUGS.length, CATALOG_PRODUCT_COUNT);
    assert.ok(CATALOG_SLUGS.includes("godlock"));
    assert.ok(CATALOG_SLUGS.includes("peacelock"));
    assert.ok(CATALOG_SLUGS.includes("azmail"));
    assert.ok(CATALOG_SLUGS.includes("azbrowser"));
    assert.ok(CATALOG_SLUGS.includes("aznet"));
    assert.ok(CATALOG_SLUGS.includes("azhub"));
    assert.ok(CATALOG_SLUGS.includes("azinterface"));
    assert.ok(!CATALOG_SLUGS.includes("aziel-runtime"));
    assert.equal(RUNTIME_CARD.slug, "aziel-runtime");
    assert.equal(RUNTIME_CARD.name, "Aziel Runtime");
    assert.match(RUNTIME_CARD.one_line, /FragGate/);
    assert.doesNotMatch(RUNTIME_CARD.one_line, /runtime\s+\d+\.\d+(?:\.\d+)?\s+FragGate/i);
    assert.doesNotMatch(RUNTIME_CARD.name, /FragGate/);
    assert.equal(FRAGGATE_CARD.slug, "fraggate");
    assert.equal(FRAGGATE_CARD.download, FRAGGATE_DOWNLOAD);
    assert.equal(FRAGGATE_CARD.worker, FRAGGATE_WORKER);
    assert.ok(EXTRA_SUITE_SLUGS.includes("embryolock"));
    const suite = softwareSuite(CATALOG_FALLBACK_PRODUCTS);
    assert.ok(suite.length >= CATALOG_PRODUCT_COUNT);
    assert.equal(suite[0].slug, "aziel-runtime");
    assert.equal(suite.find((p) => p.slug === "fraggate").family, "gate");
    assert.equal(suite.find((p) => p.slug === "azbrowser").family, "plain");
    assert.equal(suite.find((p) => p.slug === "aznet").family, "plain");
    assert.equal(suite.find((p) => p.slug === "azhub").family, "plain");
    assert.equal(suite.find((p) => p.slug === "azinterface").family, "plain");
    for (const slug of CATALOG_SLUGS) {
      assert.ok(suite.some((p) => p.slug === slug), slug);
    }
    const slugs = suite.map((p) => p.slug);
    assert.ok(slugs.indexOf("azcoherence") < slugs.indexOf("azhub"), "Plain A–Z: AZCoherence before AZHub");
    assert.ok(slugs.indexOf("azbrowser") < slugs.indexOf("azhub"), "Plain A–Z: AZBrowser before AZHub");
    assert.ok(slugs.indexOf("azhub") < slugs.indexOf("azinterface"), "Plain A–Z: AZHub before AZInterface");
    assert.ok(slugs.indexOf("azinterface") < slugs.indexOf("aznet"), "Plain A–Z: AZInterface before AZNet");
    assert.ok(slugs.indexOf("aznet") < slugs.indexOf("decisiongate"), "AZNet stays in Plain, before Gate");
    const decision = slugs.indexOf("decisiongate");
    const frag = slugs.indexOf("fraggate");
    const firstLock = suite.findIndex((p) => p.family === "lock");
    assert.ok(decision >= 0 && frag >= 0 && firstLock >= 0);
    assert.ok(decision < frag, "Gate A–Z: DecisionGATE before FragGate");
    assert.ok(frag < firstLock, "FragGate sits before the Lock section");
  });

  it("sorts Plain → Gate → Lock and does not treat Clock as Lock", () => {
    assert.equal(suiteFamily({ slug: "azai" }), "plain");
    assert.equal(suiteFamily({ slug: "staticclock", name: "StaticClock" }), "plain");
    assert.equal(suiteFamily({ slug: "decisiongate" }), "gate");
    assert.equal(suiteFamily({ slug: "godlock" }), "lock");
    assert.equal(suiteFamily({ slug: "chronolock" }), "lock");
    assert.equal(suiteFamily({ slug: "peacelock" }), "lock");
    assert.equal(suiteFamily({ slug: "aziel-runtime" }), "extra");
    assert.equal(suiteFamily({ slug: "embryolock" }), "extra");
    assert.equal(suiteFamily({ slug: "fraggate" }), "gate");
    assert.equal(suiteFamily({ slug: "azbrowser" }), "plain");
    assert.equal(suiteFamily({ slug: "aznet" }), "plain");
    assert.equal(suiteFamily({ slug: "azhub" }), "plain");
    assert.equal(suiteFamily({ slug: "azinterface" }), "plain");
    assert.equal(suiteFamily({ slug: "azcoherence" }), "plain");
    const ordered = sortSoftwareSuite([
      { slug: "godlock", name: "GodLock" },
      { slug: "staticclock", name: "StaticClock" },
      { slug: "decisiongate", name: "DecisionGATE" },
      { slug: "azai", name: "AZAI" },
      { slug: "embryolock", name: "EmbryoLock" },
    ]).map((p) => p.slug);
    assert.deepEqual(ordered, ["embryolock", "azai", "staticclock", "decisiongate", "godlock"]);
    const suite = softwareSuite([
      { slug: "godlock", name: "GodLock" },
      { slug: "staticclock", name: "StaticClock" },
      { slug: "decisiongate", name: "DecisionGATE" },
      { slug: "azai", name: "AZAI" },
    ]);
    assert.deepEqual(suite.map((p) => p.slug), ["aziel-runtime", "azai", "azcoherence", "azhub", "azinterface", "aznet", "staticclock", "decisiongate", "fraggate", "godlock"]);
    assert.equal(suite.find((p) => p.slug === "staticclock").family, "plain");
    assert.equal(suite.find((p) => p.slug === "godlock").family, "lock");
  });

  it("auto-includes live catalog slugs the snapshot does not know yet", async () => {
    const live = CATALOG_FALLBACK_PRODUCTS.concat([
      { slug: "nextlock", name: "NextLock", version: "0.1.0", one_line: "Future live engine. Author Aziel Eliab.", github: "https://github.com/AzielEliab/nextlock", download: "https://nextlock-download-tracker.vibelock.workers.dev/download" },
    ]);
    const env = {
      ...mockEnv(),
      AZIEL_RUNTIME: {
        async fetch() {
          return new Response(JSON.stringify({ products: live }), { headers: { "Content-Type": "application/json" } });
        },
      },
    };
    const fetched = await fetchCatalogProducts(env, {
      fetch: async () => {
        throw new Error("binding present");
      },
    });
    assert.ok(fetched.products.some((p) => p.slug === "peacelock"));
    assert.ok(fetched.products.some((p) => p.slug === "azmail"));
    assert.ok(fetched.products.some((p) => p.slug === "azbrowser"));
    assert.ok(fetched.products.some((p) => p.slug === "nextlock"));
    assert.ok(fetched.products.length > CATALOG_PRODUCT_COUNT);
    const html = softwareBody({ products: fetched.products });
    const ids = softCardIds(html);
    assert.ok(ids.includes("azmail"));
    assert.ok(ids.includes("azbrowser"));
    assert.ok(ids.includes("nextlock"));
    assert.ok(ids.includes("peacelock"));
    assert.match(html, /data-family="plain"/);
    assert.match(html, /id="nextlock"[^>]*data-family="lock"/);
    assert.match(html, /href="\/runtime\/v1\/pull\/nextlock">Invoke via Runtime<\/a>/);
    assert.match(html, /href="https:\/\/nextlock-download-tracker\.vibelock\.workers\.dev\/">Worker<\/a>/);
  });

  it("renders catalog cards with Worker, GitHub, Runtime, MCP, and counters when present", () => {
    const html = softwareBody({
      products: CATALOG_FALLBACK_PRODUCTS.map((p) => (
        p.slug === "godlock" ? { ...p, downloads: 40, uses: 7 } : p
      )),
      extras: { runtimeUses: 42 },
    });
    const ids = softCardIds(html);
    const names = softCardH3s(html);
    assert.ok(ids.length >= CATALOG_PRODUCT_COUNT, "cards " + ids.length);
    assert.ok(names.length >= CATALOG_PRODUCT_COUNT, "h3 " + names.length);
    assert.ok(names.includes("GodLock"));
    assert.ok(names.includes("Aziel Runtime"));
    assert.ok(!names.includes("Aziel Eliab Runtime"));
    assert.ok(names.includes("AZHub"));
    assert.ok(names.includes("AZInterface"));
    assert.ok(ids.includes("aziel-runtime"));
    assert.ok(ids.includes("fraggate"));
    assert.ok(ids.includes("godlock"));
    assert.ok(ids.includes("azbrowser"));
    assert.ok(ids.includes("aznet"));
    assert.ok(ids.includes("azhub"));
    assert.ok(ids.includes("azinterface"));
    assert.ok(ids.includes("azcoherence"));
    assert.ok(ids.includes("azclce"));
    assert.ok(ids.includes("peacelock"));
    for (const slug of CATALOG_SLUGS) {
      assert.ok(ids.includes(slug), slug);
      assert.match(html, new RegExp('id="' + slug + '"'));
    }
    assert.match(html, /class="button" href="https:\/\/glama\.ai\/mcp\/servers\/AzielEliab\/aziel-runtime">Try on Glama<\/a>/);
    assert.match(html, /class="button ghost" href="\/runtime">Official Runtime<\/a>/);
    assert.match(html, /href="https:\/\/github\.com\/AzielEliab\/aziel-runtime">Source on GitHub<\/a>/);
    assert.match(html, /href="https:\/\/github\.com\/AzielEliab\/aziel-runtime\/tree\/main\/docs\/2\.0">Documentation\/Architecture<\/a>/);
    assert.doesNotMatch(html, /glama\.ai\/mcp\/servers\/@[A-Za-z0-9_-]+/);
    assert.match(html, /href="\/runtime\/v1\/pull\/godlock">Invoke via Runtime<\/a>/);
    assert.match(html, /href="\/runtime\/mcp">MCP<\/a>/);
    assert.match(html, /href="https:\/\/godlock-download-tracker\.vibelock\.workers\.dev\/download">Download<\/a>/);
    assert.match(html, /href="https:\/\/godlock-download-tracker\.vibelock\.workers\.dev\/">Worker<\/a>/);
    assert.match(html, /href="https:\/\/fraggate-download-tracker\.vibelock\.workers\.dev\/download">Download<\/a>/);
    assert.match(html, /href="https:\/\/fraggate-download-tracker\.vibelock\.workers\.dev\/">Worker<\/a>/);
    assert.match(html, /href="https:\/\/azbrowser-download-tracker\.vibelock\.workers\.dev\/download">Download<\/a>/);
    assert.match(html, /href="https:\/\/azbrowser-download-tracker\.vibelock\.workers\.dev\/">Worker<\/a>/);
    assert.match(html, /href="https:\/\/aznet-download-tracker\.vibelock\.workers\.dev\/download">Download<\/a>/);
    assert.match(html, /href="https:\/\/aznet-download-tracker\.vibelock\.workers\.dev\/">Worker<\/a>/);
    assert.match(html, /href="https:\/\/azhub-download-tracker\.vibelock\.workers\.dev\/download">Download<\/a>/);
    assert.match(html, /href="https:\/\/azhub-download-tracker\.vibelock\.workers\.dev\/">Worker<\/a>/);
    assert.match(html, /href="https:\/\/azinterface-download-tracker\.vibelock\.workers\.dev\/download">Download<\/a>/);
    assert.match(html, /href="https:\/\/azinterface-download-tracker\.vibelock\.workers\.dev\/">Worker<\/a>/);
    assert.match(html, /href="https:\/\/github\.com\/AzielEliab\/godlock">GitHub<\/a>/);
    assert.match(html, /href="https:\/\/github\.com\/AzielEliab\/fraggate">FragGate<\/a>/);
    assert.match(html, /40 downloads/);
    assert.match(html, /7 uses/);
    assert.match(html, /42 uses/);
    assert.match(html, /<h2 class="soft-heading">Downloadable software<\/h2>\s*<div class="soft-grid">/);
    assert.doesNotMatch(html, /<h2>Runtime<\/h2>/);
    assert.doesNotMatch(html, /Full Aziel Eliab suite/);
    assert.doesNotMatch(html, /catalog engines plus/);
    assert.doesNotMatch(html, /Suite: <a href="#aziel-runtime">/);
    assert.doesNotMatch(html, /runtime\s+\d+\.\d+(?:\.\d+)?\s+FragGate/i);
    assert.doesNotMatch(html, /href="https:\/\/github\.com\/AzielEliab\/anon-broadcast"/);
    assert.match(topNav("/software"), /href="\/runtime">Runtime<\/a>/);
    assert.match(html, /Specified Fit \/ GodLock score/);
    assert.doesNotMatch(html, /INTERNAL_CRITERIA|bootstrap lock/i);
    assert.doesNotMatch(html, /\bABAD\b/);
    const extras = new Set([...EXTRA_SUITE_SLUGS, FRAGGATE_CARD.slug]);
    const invented = ids.filter((id) => !extras.has(id) && !CATALOG_SLUGS.includes(id));
    assert.deepEqual(invented, []);
    const pub = publicProduct({ slug: "godlock", name: "GodLock", downloads: 40, github: "https://github.com/AzielEliab/godlock", download: "https://godlock-download-tracker.vibelock.workers.dev/download" });
    assert.equal(pub.family, "lock");
    assert.equal(pub.worker, "https://godlock-download-tracker.vibelock.workers.dev/");
    assert.equal(pub.invoke, "/runtime/v1/pull/godlock");
    assert.equal(pub.mcp, "/runtime/mcp");
  });

  it("falls back to the snapshot when live catalog fetch fails", async () => {
    const fetched = await fetchCatalogProducts({}, {
      fetch: async () => {
        throw new Error("offline");
      },
    });
    assert.equal(fetched.source, "fallback");
    assert.equal(fetched.products.length, CATALOG_PRODUCT_COUNT);
    assert.deepEqual(fetched.products.map((p) => p.slug), CATALOG_SLUGS);
  });

  it("parses products or an alternate catalog list", () => {
    const fromCatalog = productsFromCatalogDoc({
      catalog: CATALOG_FALLBACK_PRODUCTS.map((p) => ({ slug: p.slug, name: p.name })),
    });
    assert.equal(fromCatalog.length, CATALOG_PRODUCT_COUNT);
    assert.ok(fromCatalog.some((p) => p.slug === "godlock" && p.name === "GodLock"));
    const fromProducts = productsFromCatalogDoc({ products: CATALOG_FALLBACK_PRODUCTS });
    assert.equal(fromProducts.length, CATALOG_PRODUCT_COUNT);
    const fromEntries = productsFromCatalogDoc({
      entries: [{ slug: "godlock", name: "GodLock", description: "Specified Fit / GodLock score. Not a VPN and not an anonymity network." }],
    });
    assert.equal(fromEntries[0].slug, "godlock");
    assert.match(fromEntries[0].one_line, /Specified Fit \/ GodLock score/);
  });

  it("prefers the AZIEL_RUNTIME service binding over HTTPS", async () => {
    const urls = [];
    let httpsHits = 0;
    const env = {
      ...mockEnv(),
      AZIEL_RUNTIME: {
        async fetch(req) {
          urls.push(String(req && req.url));
          return new Response(JSON.stringify({
            catalog: CATALOG_FALLBACK_PRODUCTS.map((p) => ({ ...p, one_line: "bound " + p.slug })),
          }), { headers: { "Content-Type": "application/json" } });
        },
      },
    };
    const fetched = await fetchCatalogProducts(env, {
      fetch: async () => {
        httpsHits += 1;
        throw new Error("should not hit HTTPS");
      },
    });
    assert.equal(fetched.source, "service-binding");
    assert.equal(httpsHits, 0);
    assert.ok(urls.includes("https://aziel-runtime/v1/software"));
    assert.deepEqual(BINDING_CATALOG_URLS[0], "https://aziel-runtime/v1/software");
    assert.deepEqual(BINDING_SOFTWARE_URLS[0], "https://aziel-runtime" + SOFTWARE_JSON_PATH);
    assert.equal(HTTPS_CATALOG_TRIES[0][0], "software");
    assert.equal(HTTPS_CATALOG_TRIES[1][0], "fraggate-list");
    assert.equal(fetched.products.length, CATALOG_PRODUCT_COUNT);
    assert.equal(fetched.products.find((p) => p.slug === "godlock").one_line, "bound godlock");
  });

  it("falls through from empty /v1/software to fraggate/list entries", async () => {
    const urls = [];
    const env = {
      ...mockEnv(),
      AZIEL_RUNTIME: {
        async fetch(req) {
          const u = String(req && req.url);
          urls.push(u);
          if (u.includes(SOFTWARE_JSON_PATH)) {
            return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
          }
          if (u.includes(FRAGGATE_LIST_PATH)) {
            return new Response(JSON.stringify({
              entries: CATALOG_FALLBACK_PRODUCTS.map((p) => ({
                slug: p.slug,
                name: p.name,
                description: "listed " + p.slug,
              })),
            }), { headers: { "Content-Type": "application/json" } });
          }
          return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
        },
      },
    };
    const fetched = await fetchCatalogProducts(env, {
      fetch: async () => {
        throw new Error("binding present");
      },
    });
    assert.ok(urls[0].includes("/v1/software"));
    assert.ok(urls.some((u) => u.includes("/v1/fraggate/list")));
    assert.equal(fetched.source, "service-binding");
    assert.equal(fetched.products.find((p) => p.slug === "godlock").one_line, "listed godlock");
  });

  it("HTTPS prefers /v1/software then fraggate/list", async () => {
    const urls = [];
    const fetched = await fetchCatalogProducts({}, {
      fetch: async (url) => {
        urls.push(String(url));
        if (String(url).includes("/v1/software")) {
          return new Response(JSON.stringify({
            software: CATALOG_FALLBACK_PRODUCTS.map((p) => ({ ...p, one_line: "https " + p.slug })),
          }), { headers: { "Content-Type": "application/json" } });
        }
        throw new Error("should stop after software");
      },
    });
    assert.equal(fetched.source, "software");
    assert.equal(urls.length, 1);
    assert.ok(urls[0].endsWith("/v1/software"));
    assert.equal(fetched.products.find((p) => p.slug === "peacelock").one_line, "https peacelock");
  });

  it("does not use HTTPS when the service binding is present but empty", async () => {
    let httpsHits = 0;
    const fetched = await fetchCatalogProducts({
      ...mockEnv(),
      AZIEL_RUNTIME: {
        async fetch() {
          return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
        },
      },
    }, {
      fetch: async () => {
        httpsHits += 1;
        throw new Error("binding present — skip HTTPS");
      },
    });
    assert.equal(httpsHits, 0);
    assert.equal(fetched.source, "fallback");
    assert.equal(fetched.products.length, CATALOG_PRODUCT_COUNT);
  });

  it("serves the full suite from GET /software even when origin fetch is empty", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/software"), mockEnv());
    assert.equal(res.status, 200);
    const html = await res.text();
    const ids = softCardIds(html);
    const names = softCardH3s(html);
    assert.ok(ids.length >= CATALOG_PRODUCT_COUNT, "live-or-fallback cards " + ids.length);
    assert.ok(names.length >= CATALOG_PRODUCT_COUNT, "soft-card h3 names " + names.length);
    assert.ok(names.includes("GodLock"));
    for (const slug of CATALOG_SLUGS) assert.ok(ids.includes(slug), slug);
    assert.ok(ids.includes("aziel-runtime"));
    assert.ok(ids.includes("fraggate"));
    assert.ok(ids.includes("azbrowser"));
    assert.ok(ids.includes("aznet"));
    assert.ok(ids.includes("azhub"));
    assert.ok(ids.includes("azinterface"));
    assert.ok(ids.includes("azcoherence"));
    assert.ok(ids.includes("azclce"));
    assert.ok(ids.includes("peacelock"));
    assert.match(html, /<title>Aziel Eliab Softwares — GodLock<\/title>/);
    assert.match(html, /href="\/runtime">Runtime<\/a>/);
    assert.match(html, /Invoke via Runtime/);
    assert.match(html, /class="button" href="https:\/\/glama\.ai\/mcp\/servers\/AzielEliab\/aziel-runtime">Try on Glama<\/a>/);
    assert.match(html, /class="button ghost" href="\/runtime">Official Runtime<\/a>/);
    assert.match(html, /Try on Glama/);
    assert.match(html, /Documentation\/Architecture/);
    assert.match(html, /<h2 class="soft-heading">Downloadable software<\/h2>\s*<div class="soft-grid">/);
    assert.match(res.headers.get("Cache-Control") || "", /s-maxage=300/);
    assert.match(html, /aziel-runtime \(Aziel Runtime\)/);
    assert.match(html, /href="\/runtime\/mcp">MCP<\/a>/);
    assert.match(html, /QNM-BUILD-1\.0/);
    assert.doesNotMatch(html, /<h2>Runtime<\/h2>/);
    assert.doesNotMatch(html, /every live aziel-runtime catalog engine plus aziel-runtime \/ FragGate/);
    assert.doesNotMatch(html, /catalog engines plus/);
    assert.doesNotMatch(html, /Suite: <a href="#aziel-runtime">/);
    assert.doesNotMatch(html, /runtime\s+\d+\.\d+(?:\.\d+)?\s+FragGate/i);
    assert.doesNotMatch(html, /Aziel Eliab Runtime \d+\.\d+(?:\.\d+)? FragGate/);
    assert.doesNotMatch(html, /href="https:\/\/github\.com\/AzielEliab\/anon-broadcast"/);
    assert.match(html, /Worker<\/a>/);
    assert.doesNotMatch(html, /Catalog unavailable/);
    assert.match(html, /Specified Fit \/ GodLock score/);
    assert.doesNotMatch(html, /INTERNAL_CRITERIA/i);
    assert.doesNotMatch(html, /\bABAD\b/);
    const jsonRes = await worker.fetch(new Request("https://godlock.uk/software?format=json"), mockEnv());
    const body = await jsonRes.json();
    assert.equal(body.author, "Aziel Eliab");
    assert.equal(body.sort, "plain-gate-lock");
    assert.equal(body.clock_is_not_lock, true);
    assert.equal(body.catalog, "https://godlock.uk/runtime/v1/software");
    assert.equal(body.catalog_origin, "https://aziel-runtime.vibelock.workers.dev/v1/software");
    assert.equal(body.catalog_fraggate, "https://godlock.uk/runtime/v1/fraggate/list");
    assert.ok(body.product_count >= CATALOG_PRODUCT_COUNT);
    assert.ok(body.suite_count >= CATALOG_PRODUCT_COUNT);
    assert.ok(body.products.some((p) => p.slug === "godlock" && p.invoke === "/runtime/v1/pull/godlock" && p.worker && p.mcp === "/runtime/mcp"));
    assert.ok(body.products.some((p) => p.slug === "aziel-runtime" && p.invoke === "/runtime"));
    assert.ok(body.products.some((p) => p.slug === "fraggate" && p.download === FRAGGATE_DOWNLOAD && p.worker === FRAGGATE_WORKER && p.family === "gate"));
    assert.ok(body.products.some((p) => p.slug === "azbrowser" && p.download === AZBROWSER_DOWNLOAD && p.worker === AZBROWSER_WORKER && p.family === "plain"));
    assert.ok(body.products.some((p) => p.slug === "aznet" && p.download === AZNET_DOWNLOAD && p.worker === AZNET_WORKER && p.family === "plain"));
    assert.ok(body.products.some((p) => p.slug === "azhub" && p.download === AZHUB_DOWNLOAD && p.worker === AZHUB_WORKER && p.family === "plain"));
    assert.ok(body.products.some((p) => p.slug === "azinterface" && p.download === AZINTERFACE_DOWNLOAD && p.worker === AZINTERFACE_WORKER && p.family === "plain"));
    assert.ok(body.products.some((p) => p.slug === "azcoherence" && p.download === AZCOHERENCE_DOWNLOAD && p.worker === AZCOHERENCE_WORKER && p.family === "plain" && p.github === AZCOHERENCE_GITHUB));
    const listed = body.products.map((p) => p.slug);
    assert.ok(listed.indexOf("azclce") < listed.indexOf("azbrowser"));
    assert.ok(listed.indexOf("azbrowser") < listed.indexOf("azcoherence"));
    assert.ok(listed.indexOf("azcoherence") < listed.indexOf("azhub"));
    assert.ok(listed.indexOf("azhub") < listed.indexOf("azinterface"));
    assert.ok(listed.indexOf("azinterface") < listed.indexOf("aznet"));
    assert.ok(listed.indexOf("aznet") < listed.indexOf("decisiongate"));
    assert.ok(listed.indexOf("decisiongate") < listed.indexOf("fraggate"));
    assert.ok(listed.indexOf("fraggate") < body.products.findIndex((p) => p.family === "lock"));
    assert.ok(body.products.some((p) => p.slug === "peacelock"));
    const families = body.products.map((p) => p.family);
    const firstLock = families.indexOf("lock");
    const lastPlain = families.lastIndexOf("plain");
    const gate = families.indexOf("gate");
    assert.ok(lastPlain < gate || gate < 0);
    assert.ok(gate < firstLock || gate < 0);
    assert.equal(body.products.find((p) => p.slug === "staticclock").family, "plain");
    const cite = await (await worker.fetch(new Request("https://godlock.uk/cite.json"), mockEnv())).json();
    assert.ok(cite.software_slugs.includes("godlock"));
    assert.ok(cite.software_slugs.includes("aziel-runtime"));
    assert.ok(cite.software_slugs.includes("fraggate"));
    assert.ok(cite.software_slugs.includes("azbrowser"));
    assert.ok(cite.software_slugs.includes("aznet"));
    assert.ok(cite.software_slugs.includes("azhub"));
    assert.ok(cite.software_slugs.includes("azinterface"));
    assert.ok(cite.software_slugs.includes("azcoherence"));
    assert.ok(cite.software_slugs.includes("azclce"));
    assert.ok(cite.software_slugs.includes("peacelock"));
    assert.ok(cite.software_slugs.length >= CATALOG_PRODUCT_COUNT);
    assert.ok(cite.software_product_count >= CATALOG_PRODUCT_COUNT);
    const llms = llmsDoc();
    assert.match(llms, /Software lists the full live aziel-runtime catalog/);
    assert.match(defaultDescription("software"), /aziel-runtime \(Aziel Runtime\)/);
    assert.doesNotMatch(defaultDescription("software"), /runtime\s+\d+\.\d+(?:\.\d+)?\s+FragGate/i);
    assert.doesNotMatch(defaultDescription("runtime"), /runtime\s+\d+\.\d+(?:\.\d+)?\s+FragGate/i);
  });

  it("renders Softwares HTML from the packed catalog without waiting on a slow upstream", async () => {
    resetCatalogCache();
    const packed = packedCatalogSnapshot();
    assert.equal(packed.source, "packed");
    assert.ok(packed.products.length >= CATALOG_PRODUCT_COUNT);
    let hung = 0;
    const env = {
      ...mockEnv(),
      AZIEL_RUNTIME: {
        async fetch() {
          hung += 1;
          await new Promise(() => { /* never resolve — HTML must not wait */ });
          return new Response("{}", { headers: { "Content-Type": "application/json" } });
        },
      },
    };
    const started = Date.now();
    const res = await worker.fetch(new Request("https://godlock.uk/software", {
      headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
    }), env);
    const elapsed = Date.now() - started;
    assert.equal(res.status, 200);
    assert.ok(elapsed < 1500, "HTML blocked on upstream for " + elapsed + "ms");
    assert.match(res.headers.get("Cache-Control") || "", /s-maxage=300/);
    assert.equal(SOFTWARE_HTML_CACHE_CONTROL.includes("s-maxage=300"), true);
    const html = await res.text();
    assert.match(html, /<h2 class="soft-heading">Downloadable software<\/h2>\s*<div class="soft-grid">/);
    assert.match(html, /<title>Aziel Eliab Softwares — GodLock<\/title>/);
    assert.match(html, /name="description" content="Aziel Runtime is not merely an API orchestrator/);
    assert.match(html, /Aziel Eliab Softwares catalog/);
    assert.doesNotMatch(html, /<h2>Runtime<\/h2>/);
    assert.doesNotMatch(html, /Full Aziel Eliab suite/);
    const ids = softCardIds(html);
    assert.ok(ids.includes("godlock"));
    assert.ok(ids.includes("azcoherence"));
    const cached = await loadCatalogForHtml(env);
    assert.ok(cached.products.length >= CATALOG_PRODUCT_COUNT);
    assert.equal(hung, 0);
  });

  it("serves GET /v1/software with AZCoherence in Plain A–Z even from the local fallback", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/v1/software"), mockEnv());
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.author, "Aziel Eliab");
    assert.equal(body.identity, "Aziel Eliab");
    assert.equal(body.via, "/v1/software");
    assert.equal(body.html, "https://godlock.uk/software");
    assert.equal(body.aziel_eliab, "https://godlock.uk/AzielEliab");
    assert.equal(body.door, "fraggate");
    assert.equal(body.seo_proxy, true);
    assert.equal(body.not_a_second_fraggate_door, true);
    assert.equal(body.runtime_version, "2.0.0-rc1");
    assert.equal(body.runtime_glama, "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime");
    assert.equal(body.runtime_docs, "https://github.com/AzielEliab/aziel-runtime/tree/main/docs/2.0");
    assert.ok(body.runtime_distribution.some((b) => b.label === "Official Runtime" && b.href === "https://godlock.uk/runtime"));
    assert.equal(body.runtime_distribution[0].label, "Try on Glama");
    assert.equal(body.runtime_distribution[0].href, "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime");
    assert.equal(body.runtime_distribution[0].primary, true);
    assert.equal(body.sort, "plain-gate-lock");
    assert.ok(body.products.some((p) => p.slug === "azcoherence" && p.family === "plain" && p.worker === AZCOHERENCE_WORKER && p.github === AZCOHERENCE_GITHUB && p.download === AZCOHERENCE_DOWNLOAD && p.invoke === "/runtime/v1/pull/azcoherence"));
    assert.ok(body.software.some((p) => p.slug === "azcoherence" && p.name === "AZCoherence" && p.family === "plain"));
    assert.ok(body.software.some((p) => p.slug === "azclce"));
    const names = body.software.filter((p) => p.family === "plain").map((p) => p.name);
    assert.ok(names.indexOf("AZ-CLCE") < names.indexOf("AZCoherence"));
    assert.ok(names.indexOf("AZCoherence") < names.indexOf("AZHub"));
    const mapped = compactProduct({
      slug: "azcoherence",
      name: "AZCoherence",
      download_url: AZCOHERENCE_DOWNLOAD,
      worker_home: AZCOHERENCE_WORKER,
      worker: "azcoherence-download-tracker",
      github: AZCOHERENCE_GITHUB,
      one_line: AZCOHERENCE_CARD.one_line,
    });
    assert.equal(mapped.download, AZCOHERENCE_DOWNLOAD);
    assert.equal(mapped.worker, "");
    assert.equal(mapped.worker_home, AZCOHERENCE_WORKER);
    const api = softwareApiDoc([], { source: "fallback" });
    assert.ok(api.products.some((p) => p.slug === AZCOHERENCE_SLUG));
    assert.equal(omitUntilWorker("azcoherence"), false);
  });

  it("parses uses and download counters when the Worker publishes them", async () => {
    assert.deepEqual(parseCounterDoc({ project: "godlock", total: 40 }), { downloads: 40, views: null, uses: null });
    assert.deepEqual(parseCounterDoc({ uses: 42, downloads: 9 }), { downloads: 9, views: null, uses: 42 });
    assert.deepEqual(parseCounterDoc({ project: "azbrowser", views: 7, downloads: 2, total: 2 }), { downloads: 2, views: 7, uses: null });
    const counted = await attachCatalogCounters([
      { slug: "godlock", name: "GodLock", download: "https://godlock-download-tracker.vibelock.workers.dev/download" },
      { slug: "aziel-runtime", name: "Aziel Runtime" },
    ], {}, {
      runtimeUses: 12,
      counterFetch: async (url) => {
        if (String(url).includes("/count")) {
          return new Response(JSON.stringify({ project: "godlock", total: 40 }), { headers: { "Content-Type": "application/json" } });
        }
        throw new Error("unexpected " + url);
      },
    });
    assert.equal(counted.products.find((p) => p.slug === "godlock").downloads, 40);
    assert.equal(counted.runtimeUses, 12);
    assert.ok(counted.countersFetched >= 1);
  });

  it("lists AZBrowser, AZNet, and FragGate as separate cards with Worker /count pills", async () => {
    assert.deepEqual(OMIT_UNTIL_WORKER_SLUGS, []);
    assert.equal(omitUntilWorker("aznet"), false);
    assert.equal(omitUntilWorker("azbrowser"), false);
    assert.equal(omitUntilWorker("azhub"), false);
    assert.equal(omitUntilWorker("azinterface"), false);
    assert.equal(AZNET_CARD.download, AZNET_DOWNLOAD);
    assert.equal(AZNET_CARD.worker, AZNET_WORKER);
    assert.equal(AZHUB_CARD.download, AZHUB_DOWNLOAD);
    assert.equal(AZHUB_CARD.worker, AZHUB_WORKER);
    assert.equal(AZINTERFACE_CARD.download, AZINTERFACE_DOWNLOAD);
    assert.equal(AZINTERFACE_CARD.worker, AZINTERFACE_WORKER);
    const counted = await attachCatalogCounters([
      {
        slug: "azbrowser",
        name: "AZBrowser / AZNet",
        one_line: "AZBrowser / AZNet Phase 1: secure research browser + Lamb Lens ethical search.",
        download: AZBROWSER_DOWNLOAD,
        count: "https://azbrowser-download-tracker.vibelock.workers.dev/count",
      },
      { slug: "aznet", name: "AZNet", download: AZNET_DOWNLOAD, count: "https://aznet-download-tracker.vibelock.workers.dev/count" },
    ], {}, {
      counterFetch: async (url) => {
        const u = String(url);
        if (u.includes("fraggate-download-tracker") && u.endsWith("/count")) {
          return new Response(JSON.stringify({ project: "fraggate", views: 8, downloads: 1, total: 1 }), { headers: { "Content-Type": "application/json" } });
        }
        if (u.includes("azbrowser-download-tracker") && u.endsWith("/count")) {
          return new Response(JSON.stringify({ project: "azbrowser", views: 7, downloads: 2, total: 2 }), { headers: { "Content-Type": "application/json" } });
        }
        if (u.includes("aznet-download-tracker") && u.endsWith("/count")) {
          return new Response(JSON.stringify({ project: "aznet", views: 3, downloads: 1, total: 1 }), { headers: { "Content-Type": "application/json" } });
        }
        if (u.includes("azhub-download-tracker") && u.endsWith("/count")) {
          return new Response(JSON.stringify({ project: "azhub", views: 4, downloads: 1, total: 1 }), { headers: { "Content-Type": "application/json" } });
        }
        if (u.includes("azinterface-download-tracker") && u.endsWith("/count")) {
          return new Response(JSON.stringify({ project: "azinterface", views: 5, downloads: 1, total: 1 }), { headers: { "Content-Type": "application/json" } });
        }
        throw new Error("unexpected " + url);
      },
    });
    const fg = counted.products.find((p) => p.slug === "fraggate");
    const azb = counted.products.find((p) => p.slug === "azbrowser");
    const azn = counted.products.find((p) => p.slug === "aznet");
    assert.ok(fg);
    assert.equal(fg.download, FRAGGATE_DOWNLOAD);
    assert.equal(fg.downloads, 1);
    assert.equal(fg.views, 8);
    assert.ok(azb);
    assert.equal(azb.downloads, 2);
    assert.equal(azb.views, 7);
    assert.ok(azn);
    assert.equal(azn.download, AZNET_DOWNLOAD);
    assert.equal(azn.downloads, 1);
    assert.equal(azn.views, 3);
    const html = softwareBody({ products: counted.products });
    assert.match(html, /id="fraggate"[^>]*data-family="gate"/);
    assert.match(html, /<h3>FragGate<\/h3>/);
    assert.match(html, /href="https:\/\/fraggate-download-tracker\.vibelock\.workers\.dev\/download">Download<\/a>/);
    assert.match(html, /href="https:\/\/fraggate-download-tracker\.vibelock\.workers\.dev\/">Worker<\/a>/);
    assert.match(html, /id="azbrowser"[^>]*data-family="plain"/);
    assert.match(html, /<h3>AZBrowser<\/h3>/);
    assert.match(html, /href="https:\/\/azbrowser-download-tracker\.vibelock\.workers\.dev\/download">Download<\/a>/);
    assert.match(html, /id="aznet"[^>]*data-family="plain"/);
    assert.match(html, /<h3>AZNet<\/h3>/);
    assert.match(html, /href="https:\/\/aznet-download-tracker\.vibelock\.workers\.dev\/download">Download<\/a>/);
    assert.match(html, /href="https:\/\/aznet-download-tracker\.vibelock\.workers\.dev\/">Worker<\/a>/);
    assert.doesNotMatch(html, /AZBrowser \/ AZNet/);
    assert.doesNotMatch(html, /AZBrowser\s+Phase[-\s]?1/i);
    const copy = hubProductCopy({ slug: "azbrowser", name: "AZBrowser / AZNet", one_line: "AZBrowser / AZNet Phase 1: cite." });
    assert.equal(copy.name, "AZBrowser");
    assert.equal(copy.one_line, "AZBrowser: cite.");
    assert.doesNotMatch(copy.one_line, /AZBrowser\s*\/\s*AZNet/);
    assert.doesNotMatch(copy.one_line, /Phase[-\s]?1/i);
    const slashPhase = hubProductCopy({
      slug: "azbrowser",
      name: "AZBrowser / Phase 1",
      one_line: "AZBrowser / Phase 1: leftover after AZNet strip.",
    });
    assert.equal(slashPhase.name, "AZBrowser");
    assert.equal(slashPhase.one_line, "AZBrowser: leftover after AZNet strip.");
    assert.equal(hubProductCopy({ slug: "aznet", name: "AZNet / AZBrowser", one_line: "AZNet SIDE-NET." }).name, "AZNet");
    const pub = publicProduct(fg);
    assert.equal(pub.worker, FRAGGATE_WORKER);
    assert.equal(pub.downloads, 1);
    assert.equal(pub.views, 8);
    const pubNet = publicProduct(azn);
    assert.equal(pubNet.worker, AZNET_WORKER);
    assert.equal(pubNet.downloads, 1);
    assert.equal(pubNet.views, 3);
  });

  it("keeps grammar on the live AZBrowser catalog banner (no orphaned AZNet subject)", () => {
    const LIVE_AZBROWSER_ONE_LINE = "AZBrowser (AZB-1.0): Lamb Lens ethical research browser. Cite; refuse harvest; no invented visits. FragGate only. AZNet is a separate software (order/token pairing only).";
    const LIVE_AZBROWSER_BANNER = "AZBrowser (AZB-1.0): Lamb Lens ethical research browser. Reached only via FragGate (POST /v1/fraggate/call { slug: \"azbrowser\", op }). Cite; refuse harmful harvest; never invent visit results. Not Chromium. tor_exit / phoenix_wipe / unrestricted proxy stay stub. AZNet is a separate product/engine — pairing is order/token only, not a shared Phase-1 UI. Author Aziel Eliab.";
    const fromOneLine = hubProductCopy({
      slug: "azbrowser",
      name: "AZBrowser",
      one_line: LIVE_AZBROWSER_ONE_LINE,
    });
    assert.equal(fromOneLine.name, "AZBrowser");
    assert.equal(fromOneLine.one_line, LIVE_AZBROWSER_ONE_LINE);
    assert.doesNotMatch(fromOneLine.one_line, /^\s*is a separate/);
    assert.doesNotMatch(fromOneLine.one_line, /\.\s+is a separate/);
    assert.doesNotMatch(fromOneLine.one_line, /FragGate only\.\s+is a separate/);
    assert.match(fromOneLine.one_line, /AZNet is a separate software \(order\/token pairing only\)\./);
    assert.doesNotMatch(fromOneLine.one_line, / {2}/);
    assert.doesNotMatch(fromOneLine.one_line, /AZBrowser\s*\/\s*AZNet/);

    const fromBanner = hubProductCopy({
      slug: "azbrowser",
      name: "AZBrowser / AZNet",
      banner: LIVE_AZBROWSER_BANNER,
    });
    assert.equal(fromBanner.name, "AZBrowser");
    assert.doesNotMatch(fromBanner.one_line, /^\s*is a separate/);
    assert.doesNotMatch(fromBanner.one_line, /\.\s+is a separate/);
    assert.match(fromBanner.one_line, /AZNet is a separate software/);
    assert.doesNotMatch(fromBanner.one_line, / {2}/);
    assert.doesNotMatch(fromBanner.one_line, /AZBrowser\s*\/\s*AZNet/);
    assert.doesNotMatch(fromBanner.one_line, /AZBrowser\s+Phase[-\s]?1/i);
    assert.match(fromBanner.one_line, /not a shared Phase-1 UI/);
    assert.match(fromBanner.one_line, /[A-Za-z0-9)]\.$/);

    const healed = hubProductCopy({
      slug: "azbrowser",
      one_line: "FragGate only. is a separate engine (order/token pairing only).",
    });
    assert.equal(healed.one_line, "FragGate only. AZNet is a separate software (order/token pairing only).");
    const staleBrowser = hubProductCopy({
      slug: "azbrowser",
      one_line: "AZBrowser (AZB-1.0): Lamb Lens ethical research browser. Cite; refuse harvest; no invented visits. FragGate only. AZNet is a separate engine (order/token pairing only).",
    });
    assert.equal(staleBrowser.one_line, LIVE_AZBROWSER_ONE_LINE);

    const liveOrphan = hubProductCopy({
      slug: "azbrowser",
      name: "AZBrowser",
      one_line: "AZBrowser (AZB-1.0): Lamb Lens ethical research browser. Cite; refuse harvest; no invented visits. FragGate only. is a separate engine (order/token pairing only).",
    });
    assert.equal(liveOrphan.one_line, LIVE_AZBROWSER_ONE_LINE);

    const card = compactProduct({
      slug: "azbrowser",
      name: "AZBrowser / AZNet",
      one_line: LIVE_AZBROWSER_ONE_LINE,
    });
    assert.equal(card.one_line, LIVE_AZBROWSER_ONE_LINE);
    const html = softwareBody({ products: [card] });
    assert.doesNotMatch(html, /FragGate only\.\s+is a separate/);
    assert.match(html, /AZNet is a separate software \(order\/token pairing only\)\./);
  });

  it("lists AZHub and AZInterface as separate Plain cards and never nests them", async () => {
    const LIVE_AZHUB_ONE_LINE = "AZHub (AIH-WP-1.0): Blank Key / neutral spatial container. Does not interpret. FragGate only. AZInterface is a separate software.";
    const LIVE_AZINTERFACE_ONE_LINE = "AZInterface (AIH-WP-1.0): custodial operating environment. Pre-locked page cycles OFF/integrity/ON/FULL SHUTDOWN/MEMORIAL. FragGate only. AZHub is a separate software.";
    const counted = await attachCatalogCounters([
      {
        slug: "azhub",
        name: "AZHub / AZInterface",
        one_line: "AZHub / AZInterface: Blank Key + custodial page cycles.",
        download: AZHUB_DOWNLOAD,
        count: "https://azhub-download-tracker.vibelock.workers.dev/count",
      },
      {
        slug: "azinterface",
        name: "AZInterface / AZHub",
        one_line: LIVE_AZINTERFACE_ONE_LINE,
        download: AZINTERFACE_DOWNLOAD,
        count: "https://azinterface-download-tracker.vibelock.workers.dev/count",
      },
    ], {}, {
      counterFetch: async (url) => {
        const u = String(url);
        if (u.includes("azhub-download-tracker") && u.endsWith("/count")) {
          return new Response(JSON.stringify({ project: "azhub", views: 4, downloads: 2, total: 2 }), { headers: { "Content-Type": "application/json" } });
        }
        if (u.includes("azinterface-download-tracker") && u.endsWith("/count")) {
          return new Response(JSON.stringify({ project: "azinterface", views: 5, downloads: 3, total: 3 }), { headers: { "Content-Type": "application/json" } });
        }
        if (u.includes("fraggate-download-tracker") && u.endsWith("/count")) {
          return new Response(JSON.stringify({ project: "fraggate", views: 1, downloads: 1, total: 1 }), { headers: { "Content-Type": "application/json" } });
        }
        if (u.includes("aznet-download-tracker") && u.endsWith("/count")) {
          return new Response(JSON.stringify({ project: "aznet", views: 1, downloads: 1, total: 1 }), { headers: { "Content-Type": "application/json" } });
        }
        throw new Error("unexpected " + url);
      },
    });
    const hub = counted.products.find((p) => p.slug === "azhub");
    const iface = counted.products.find((p) => p.slug === "azinterface");
    assert.ok(hub);
    assert.equal(hub.download, AZHUB_DOWNLOAD);
    assert.equal(hub.downloads, 2);
    assert.equal(hub.views, 4);
    assert.ok(iface);
    assert.equal(iface.download, AZINTERFACE_DOWNLOAD);
    assert.equal(iface.downloads, 3);
    assert.equal(iface.views, 5);
    const html = softwareBody({ products: counted.products });
    assert.match(html, /id="azhub"[^>]*data-family="plain"/);
    assert.match(html, /<h3>AZHub<\/h3>/);
    assert.match(html, /href="https:\/\/azhub-download-tracker\.vibelock\.workers\.dev\/download">Download<\/a>/);
    assert.match(html, /href="https:\/\/azhub-download-tracker\.vibelock\.workers\.dev\/">Worker<\/a>/);
    assert.match(html, /href="https:\/\/github\.com\/AzielEliab\/azhub">GitHub<\/a>/);
    assert.match(html, /id="azinterface"[^>]*data-family="plain"/);
    assert.match(html, /<h3>AZInterface<\/h3>/);
    assert.match(html, /href="https:\/\/azinterface-download-tracker\.vibelock\.workers\.dev\/download">Download<\/a>/);
    assert.match(html, /href="https:\/\/azinterface-download-tracker\.vibelock\.workers\.dev\/">Worker<\/a>/);
    assert.match(html, /href="https:\/\/github\.com\/AzielEliab\/azinterface">GitHub<\/a>/);
    assert.doesNotMatch(html, /AZHub \/ AZInterface/);
    assert.doesNotMatch(html, /AZInterface \/ AZHub/);
    assert.doesNotMatch(html, /<h3>AZHub \/ AZInterface<\/h3>/);
    const nested = hubProductCopy({ slug: "azhub", name: "AZHub / AZInterface", one_line: "AZHub / AZInterface: Blank Key." });
    assert.equal(nested.name, "AZHub");
    assert.equal(nested.one_line, "AZHub: Blank Key.");
    const ifaceCopy = hubProductCopy({ slug: "azinterface", name: "AZInterface / AZHub", one_line: LIVE_AZINTERFACE_ONE_LINE });
    assert.equal(ifaceCopy.name, "AZInterface");
    assert.equal(ifaceCopy.one_line, LIVE_AZINTERFACE_ONE_LINE);
    assert.match(ifaceCopy.one_line, /AZHub is a separate software\./);
    const hubLive = hubProductCopy({ slug: "azhub", name: "AZHub", one_line: LIVE_AZHUB_ONE_LINE });
    assert.equal(hubLive.name, "AZHub");
    assert.equal(hubLive.one_line, LIVE_AZHUB_ONE_LINE);
    assert.match(hubLive.one_line, /AZInterface is a separate software\./);
    const healedHub = hubProductCopy({
      slug: "azhub",
      one_line: "FragGate only. is a separate engine.",
    });
    assert.equal(healedHub.one_line, "FragGate only. AZInterface is a separate software.");
    const healedIface = hubProductCopy({
      slug: "azinterface",
      one_line: "FragGate only. is a separate engine.",
    });
    assert.equal(healedIface.one_line, "FragGate only. AZHub is a separate software.");
    const staleHub = hubProductCopy({
      slug: "azhub",
      one_line: "AZHub (AIH-WP-1.0): Blank Key / neutral spatial container. Does not interpret. FragGate only. AZInterface is a separate engine.",
    });
    assert.equal(staleHub.one_line, LIVE_AZHUB_ONE_LINE);
    const staleIface = hubProductCopy({
      slug: "azinterface",
      one_line: "AZInterface (AIH-WP-1.0): custodial operating environment. Pre-locked page cycles OFF/integrity/ON/FULL SHUTDOWN/MEMORIAL. FragGate only. AZHub is a separate engine.",
    });
    assert.equal(staleIface.one_line, LIVE_AZINTERFACE_ONE_LINE);
    const pubHub = publicProduct(hub);
    assert.equal(pubHub.worker, AZHUB_WORKER);
    assert.equal(pubHub.family, "plain");
    assert.equal(pubHub.author, "Aziel Eliab");
    const pubIface = publicProduct(iface);
    assert.equal(pubIface.worker, AZINTERFACE_WORKER);
    assert.equal(pubIface.family, "plain");
    assert.equal(pubIface.author, "Aziel Eliab");
    assert.equal(suiteFamily({ slug: "azhub", name: "AZHub" }), "plain");
    assert.equal(suiteFamily({ slug: "azinterface", name: "AZInterface" }), "plain");
  });

  it("heals AZNet live catalog Separate engine to Separate software", () => {
    const LIVE_AZNET_ONE_LINE = "AZNet (AZN-WP-0.1): silent verification side-net. Hash continuity without hosting. Separate engine; functional-order pair with AZBrowser.";
    const HEALED_AZNET_ONE_LINE = "AZNet (AZN-WP-0.1): silent verification side-net. Hash continuity without hosting. Separate software; functional-order pair with AZBrowser.";
    const LIVE_AZNET_BANNER = "AZNet (AZN-WP-0.1): silent verification side-net. Hash continuity without hosting. Custodian garden of hash refs + memorial ledger. Integrity refuse/isolate. Separate engine from AZBrowser (functional-order pair: token AND flag required; own Worker / own UI). FragGate LIVE only. Never hosts payloads. Author Aziel Eliab.";
    const snap = CATALOG_FALLBACK_PRODUCTS.find((p) => p.slug === "aznet");
    assert.ok(snap);
    assert.equal(snap.one_line, HEALED_AZNET_ONE_LINE);
    assert.equal(AZNET_CARD.one_line, HEALED_AZNET_ONE_LINE);
    assert.doesNotMatch(AZNET_CARD.one_line, /Separate engine/);

    const healed = hubProductCopy({ slug: "aznet", name: "AZNet", one_line: LIVE_AZNET_ONE_LINE });
    assert.equal(healed.name, "AZNet");
    assert.equal(healed.one_line, HEALED_AZNET_ONE_LINE);
    assert.match(healed.one_line, /Separate software; functional-order pair with AZBrowser\./);
    assert.doesNotMatch(healed.one_line, /Separate engine/);

    const fromBanner = hubProductCopy({ slug: "aznet", name: "AZNet", banner: LIVE_AZNET_BANNER });
    assert.equal(fromBanner.name, "AZNet");
    assert.match(fromBanner.one_line, /Separate software from AZBrowser/);
    assert.doesNotMatch(fromBanner.one_line, /Separate engine/);

    const staleGodlock = hubProductCopy({
      slug: "godlock",
      name: "GodLock",
      one_line: "Offline ABAD / hardening score. Not a VPN and not an anonymity network.",
    });
    assert.equal(staleGodlock.one_line, "Specified Fit / GodLock score. Not a VPN and not an anonymity network.");
    assert.doesNotMatch(staleGodlock.one_line, /\bABAD\b/);
    const bound = hubProductCopy({ slug: "godlock", name: "GodLock", one_line: "bound godlock" });
    assert.equal(bound.one_line, "bound godlock");

    const card = compactProduct({ slug: "aznet", name: "AZNet", one_line: LIVE_AZNET_ONE_LINE });
    assert.equal(card.one_line, HEALED_AZNET_ONE_LINE);
    const html = softwareBody({ products: [card] });
    assert.match(html, /id="aznet"[^>]*data-family="plain"/);
    assert.match(html, /<h3>AZNet<\/h3>/);
    assert.match(html, /Separate software; functional-order pair with AZBrowser\./);
    assert.doesNotMatch(html, /Separate engine/);
  });

  it("names aziel-runtime Aziel Runtime and never mashes runtime version with FragGate", () => {
    assert.equal(stripRuntimeFragGateMash("Aziel Eliab Runtime 1.6.15 FragGate door"), "Aziel Runtime");
    assert.equal(stripRuntimeFragGateMash("runtime 1.6.15 FragGate"), "aziel-runtime");
    assert.equal(stripRuntimeFragGateMash("FragGate 1.6.15 door"), "aziel-runtime door");
    const mashed = hubProductCopy({
      slug: "aziel-runtime",
      name: "Aziel Eliab Runtime",
      one_line: "Aziel Eliab Runtime 1.6.15 FragGate door. One door — discover, route, refuse.",
    });
    assert.equal(mashed.name, "Aziel Runtime");
    assert.equal(mashed.one_line, "Aziel Runtime. One door — discover, route, refuse.");
    assert.doesNotMatch(mashed.one_line, /runtime\s+\d+\.\d+(?:\.\d+)?\s+FragGate/i);
    const html = softwareBody({
      products: [{ slug: "aziel-runtime", name: "Aziel Eliab Runtime", one_line: "runtime 1.6.15 FragGate mash" }],
    });
    assert.match(html, /<h2 class="soft-heading">Downloadable software<\/h2>\s*<div class="soft-grid">/);
    assert.match(html, /<h3>Aziel Runtime<\/h3>/);
    assert.match(html, /v2\.0\.0-rc1/);
    assert.match(html, /Official Runtime/);
    assert.doesNotMatch(html, /Aziel Eliab Runtime/);
    assert.doesNotMatch(html, /runtime 1\.6\.15 FragGate/i);
    const families = softwareSuite(CATALOG_FALLBACK_PRODUCTS).map((p) => p.family);
    const lastPlain = families.lastIndexOf("plain");
    const firstGate = families.indexOf("gate");
    const firstLock = families.indexOf("lock");
    assert.ok(lastPlain < firstGate);
    assert.ok(firstGate < firstLock);
  });
});

describe("Phase F Aziel Runtime 2.0.0-rc1 hub cite", () => {
  it("leads Softwares and runtime SEO with the crawler abstract and cites live 2.0.0-rc1", () => {
    assert.equal(RUNTIME_VERSION, "2.0.0-rc1");
    assert.match(RUNTIME_ABSTRACT, /not merely an API orchestrator or software aggregator/);
    const software = defaultDescription("software");
    const runtime = defaultDescription("runtime");
    assert.ok(software.startsWith(RUNTIME_ABSTRACT.slice(0, 80)));
    assert.ok(runtime.startsWith(RUNTIME_ABSTRACT.slice(0, 80)));
    assert.ok(software.indexOf(RUNTIME_ABSTRACT.slice(0, 40)) < software.indexOf("Aziel Eliab Softwares catalog"));
    assert.ok(runtime.indexOf(RUNTIME_ABSTRACT.slice(0, 40)) < runtime.indexOf("2.0.0-rc1"));
    assert.match(runtime, /GET \/v1\/mesh never enables/);
    assert.match(runtime, /Remain-OFF/);
    const html = softwareBody({ products: [] });
    assert.match(html, /<h2 class="soft-heading">Downloadable software<\/h2>\s*<div class="soft-grid">/);
    assert.doesNotMatch(html, /<h2>Runtime<\/h2>/);
    assert.doesNotMatch(html, /Full Aziel Eliab suite/);
    assert.match(html, />Official Runtime</);
    assert.match(html, />Source on GitHub</);
    assert.match(html, />Try on Glama</);
    assert.match(html, />Documentation\/Architecture</);
    assert.match(html, /class="button" href="https:\/\/glama\.ai\/mcp\/servers\/AzielEliab\/aziel-runtime">Try on Glama<\/a>/);
    assert.match(html, /class="button ghost" href="\/runtime">Official Runtime<\/a>/);
    assert.ok(html.indexOf("Try on Glama") < html.indexOf("Official Runtime"));
    assert.doesNotMatch(html, /glama\.ai\/mcp\/servers\/[0-9a-f]{8,}/i);
  });
});

function graphLd(html) {
  return JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
}

function isSharedPersonRef(value) {
  return !!value && value["@id"] === "https://www.azieleliab.com/#aziel" && Object.keys(value).length === 1;
}

describe("Aziel Public Entity Graph Phases B–D", () => {
  it("uses the shared hub Person @id and never a competing primary", () => {
    assert.equal(AZIEL_PERSON_ID, "https://www.azieleliab.com/#aziel");
    assert.deepEqual(personRef(), { "@id": "https://www.azieleliab.com/#aziel" });
    const person = personNode();
    assert.equal(person["@id"], "https://www.azieleliab.com/#aziel");
    assert.equal(person.url, "https://www.azieleliab.com/");
    assert.ok(person.sameAs.includes("https://godlock.uk/AzielEliab"));
    const stub = personLocalStub();
    assert.equal(stub["@id"], LOCAL_PERSON_STUB_ID);
    assert.equal(stub["@type"], undefined);
    assert.deepEqual(stub.sameAs, { "@id": "https://www.azieleliab.com/#aziel" });
  });

  it("keeps WebSite and GodLock SoftwareApplication project-specific with shared author/creator", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/"), mockEnv());
    const html = await res.text();
    const ld = graphLd(html);
    const site = ld["@graph"].find((n) => n["@type"] === "WebSite");
    const godlock = ld["@graph"].find((n) => n["@type"] === "SoftwareApplication" && n.name === "GodLock");
    const persons = ld["@graph"].filter((n) => n["@type"] === "Person");
    assert.equal(site["@id"], "https://godlock.uk/#website");
    assert.ok(isSharedPersonRef(site.author));
    assert.ok(isSharedPersonRef(site.publisher));
    assert.ok(isSharedPersonRef(site.creator));
    assert.equal(godlock["@id"], "https://godlock.uk/#godlock");
    assert.ok(isSharedPersonRef(godlock.author));
    const parts = [].concat(godlock.isPartOf || []);
    assert.ok(parts.some((p) => p && p["@id"] === "https://godlock.uk/#website"));
    assert.ok(parts.some((p) => p && p["@id"] === "https://www.azieleliab.com/runtime#godlock"));
    const runtime = ld["@graph"].find((n) => n["@type"] === "SoftwareApplication" && n.name === "Aziel Runtime");
    assert.equal(runtime["@id"], "https://www.azieleliab.com/runtime#runtime");
    assert.deepEqual(runtime.sameAs, [
      "https://github.com/AzielEliab/aziel-runtime",
      "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime",
    ]);
    assert.ok(isSharedPersonRef(runtime.author));
    assert.ok(!ld["@graph"].some((n) => n["@id"] === "https://godlock.uk/runtime#runtime"));
    const mcpOps = ld["@graph"].filter((n) => {
      const types = [].concat(n["@type"] || []);
      return types.includes("Action") || types.includes("EntryPoint") || types.includes("HowTo") || types.includes("ControlAction");
    });
    assert.equal(mcpOps.length, 0);
    assert.equal(persons.length, 1);
    assert.equal(persons[0]["@id"], "https://www.azieleliab.com/#aziel");
    assert.ok(ld["@graph"].some((n) => n["@id"] === LOCAL_PERSON_STUB_ID && n.sameAs && n.sameAs["@id"] === AZIEL_PERSON_ID && !n["@type"]));
    assert.ok(!ld["@graph"].some((n) => n["@type"] === "Person" && n["@id"] === LOCAL_PERSON_STUB_ID));
    for (const node of ld["@graph"]) {
      for (const key of ["author", "publisher", "creator", "provider", "copyrightHolder"]) {
        if (node[key]) assert.ok(isSharedPersonRef(node[key]), key + " on " + node["@type"]);
      }
    }
  });

  it("puts the ecosystem block in footer/nav, not between Softwares heading and list", async () => {
    const links = ecosystemLinks();
    assert.deepEqual(links.map((l) => [l.label, l.href, !!l.secondary]), [
      ["Official site", "https://www.azieleliab.com/", false],
      ["Aziel Corpus Library", "https://www.azielcorpuslibrary.net/", false],
      ["Aziel Runtime on GitHub", "https://github.com/AzielEliab/aziel-runtime", false],
      ["Aziel Runtime", "https://aziel-runtime.vibelock.workers.dev/", true],
      ["Try on Glama", "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime", false],
    ]);
    const eco = ecosystemNav();
    assert.match(eco, /Part of the Aziel Eliab ecosystem/);
    assert.match(eco, /href="https:\/\/www\.azieleliab\.com\/">Official site<\/a>/);
    assert.match(eco, /href="https:\/\/www\.azielcorpuslibrary\.net\/">Aziel Corpus Library<\/a>/);
    assert.match(eco, /href="https:\/\/github\.com\/AzielEliab\/aziel-runtime">Aziel Runtime on GitHub<\/a>/);
    assert.match(eco, /href="https:\/\/aziel-runtime\.vibelock\.workers\.dev\/" class="secondary">Aziel Runtime<\/a>/);
    assert.match(eco, /href="https:\/\/glama\.ai\/mcp\/servers\/AzielEliab\/aziel-runtime">Try on Glama<\/a>/);
    const software = softwareBody({ products: [] });
    assert.match(software, /<h2 class="soft-heading">Downloadable software<\/h2>\s*<div class="soft-grid">/);
    assert.doesNotMatch(software, /Part of the Aziel Eliab ecosystem/);
    const html = page("Software", software, { path: "/software", kind: "software" });
    assert.match(html, /<nav class="nav2">[\s\S]*?<nav class="ecosystem"/);
    assert.match(html, /<footer>[\s\S]*Part of the Aziel Eliab ecosystem/);
    const between = html.match(/<h2 class="soft-heading">Downloadable software<\/h2>([\s\S]*?)<div class="soft-grid">/);
    assert.ok(between);
    assert.doesNotMatch(between[1], /Part of the Aziel Eliab ecosystem/);
    const live = await worker.fetch(new Request("https://godlock.uk/software"), mockEnv());
    const liveHtml = await live.text();
    assert.match(liveHtml, /Part of the Aziel Eliab ecosystem/);
    assert.match(liveHtml, />Try on Glama</);
    assert.match(liveHtml, /<h2 class="soft-heading">Downloadable software<\/h2>\s*<div class="soft-grid">/);
    const liveLd = graphLd(liveHtml);
    const list = liveLd["@graph"].find((n) => n["@type"] === "ItemList");
    const godItem = (list.itemListElement || []).find((it) => it.item && it.item.identifier === "godlock");
    assert.ok(godItem);
    const toolParts = [].concat(godItem.item.isPartOf || []);
    assert.ok(toolParts.some((p) => p && p["@id"] === "https://www.azieleliab.com/runtime#godlock"));
    assert.ok(isSharedPersonRef(godItem.item.author));
  });

  it("self-canonicals godlock.uk pages to themselves and leaves Remain-OFF untouched", async () => {
    const paths = ["/", "/software", "/AzielEliab", "/reason", "/verify", "/donate"];
    for (const path of paths) {
      const res = await worker.fetch(new Request("https://godlock.uk" + path), mockEnv());
      assert.equal(res.status, 200, path);
      const html = await res.text();
      const expected = "https://godlock.uk" + path;
      assert.match(html, new RegExp('rel="canonical" href="' + expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"'), path);
      assert.doesNotMatch(html, /rel="canonical" href="https:\/\/www\.azieleliab\.com\//);
      assert.doesNotMatch(html, /rel="canonical" href="https:\/\/www\.azielcorpuslibrary\.net/);
      assert.doesNotMatch(html, /rel="canonical" href="https:\/\/aziel-runtime\.vibelock\.workers\.dev/);
    }
    const cite = citeDoc();
    assert.equal(cite.mesh_default_off, true);
    assert.equal(cite.mesh_get_never_enables, true);
    assert.equal(cite.mesh_auto_heal, false);
    assert.equal(cite.mesh_node_gate, false);
    assert.match(llmsDoc(), /Person @id: https:\/\/www\.azieleliab\.com\/#aziel/);
    assert.match(llmsDoc(), /Runtime @id: https:\/\/www\.azieleliab\.com\/runtime#runtime/);
    assert.match(llmsDoc(), /GodLock Runtime tool: https:\/\/www\.azieleliab\.com\/runtime#godlock/);
    assert.match(llmsDoc(), /Part of the Aziel Eliab ecosystem/);
  });
});

describe("receipts UI and public payload", () => {
  it("lists prior public receipts in caller order (newest-first from publicReceipts)", () => {
    const prior = [
      { id: "new", label: "Yes", summary: "Newer hold", created_utc: "2026-09-11T12:00:00.000Z", content_sha256: "aa" },
      { id: "old", label: "Interesting", summary: "Older row", created_utc: "2026-09-10T12:00:00.000Z", content_sha256: "bb" },
    ];
    const home = homeBody({ stats: { current_score: 49.5, residual: 50.5, uses: 3 }, latest: null, prior });
    assert.match(home, /<h2>Prior receipts<\/h2>/);
    const newerAt = home.indexOf("/receipt/new");
    const olderAt = home.indexOf("/receipt/old");
    assert.ok(newerAt > 0 && olderAt > newerAt);
    assert.match(home, /id="stat-current-score">49\.5%/);
    assert.match(home, /id="stat-residual">50\.5%/);
    assert.match(home, /id="stat-uses">3</);
  });

  it("refreshes scorebox from gatherStats fields in the homepage script", () => {
    const html = page("GodLock", homeBody({ stats: { current_score: 50, residual: 50, uses: 0 }, latest: null, prior: [] }), { path: "/", kind: "home" });
    assert.match(html, /id="stat-current-score"/);
    assert.match(html, /id="stat-residual"/);
    assert.match(html, /if\(j&&j\.stats\)\{applyStats\(j\.stats\);\}/);
    assert.match(html, /scoreEl&&j\.current_score!=null/);
    assert.match(html, /residualEl&&j\.residual!=null/);
    assert.match(html, /usesEl&&j\.uses!=null/);
  });

  it("exposes score_before, score_after, and delta on public JSON receipts", () => {
    const payload = publicPayload({
      id: "r1",
      created_utc: "2026-09-11T12:00:00.000Z",
      label: "Yes",
      summary: "The challenge holds.",
      explanation: "Score moved down.",
      score_before: 50.5,
      score_after: 49.5,
      residual: 50.5,
      text_sha256: "t",
      content_sha256: "c",
      isolated: 0,
    });
    assert.equal(payload.score_before, 50.5);
    assert.equal(payload.score_after, 49.5);
    assert.equal(payload.delta, -1);
    assert.equal(payload.isolated, 0);
    assert.equal("weighing" in payload, false);
  });
});
