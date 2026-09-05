import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AZIEL_ELIAB_PATH,
  AZIEL_CORPUS_PATH,
  SOFTWARE_PATH,
  RUNTIME_PATH,
  AZIEL_MANIFESTO,
  AZIEL_SIGNATURE,
  azielEliabBody,
  azielEliabText,
  page,
  topNav,
  CSS,
  softwareBody,
  homeBody,
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
  permanentIdentityRedirect,
  CANON_HOST,
  LIBRARY_AZIEL,
  AUTHOR_GITHUB,
  GITHUB,
  AI_CRAWLER_AGENTS,
  AI_CLIENTS,
  AI_CLIENTS_SENTENCE,
} from "./src/seo.js";
import worker from "./src/index.js";

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
  };
}

describe("Aziel Eliab page chrome", () => {
  it("uses the corpus identity path /AzielEliab", () => {
    assert.equal(AZIEL_ELIAB_PATH, "/AzielEliab");
    assert.equal(AZIEL_CORPUS_PATH, "/AzielCorpusLibrary");
    assert.equal(SOFTWARE_PATH, "/software");
    assert.equal(RUNTIME_PATH, "/runtime");
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

  it("orders nav Engine | Software | Runtime | Verify | Aziel Eliab | Aziel Corpus Library", () => {
    const nav = topNav("/verify");
    assert.match(
      nav,
      /href="\/">Engine<\/a><span class="sep">\|<\/span><a href="\/software">Software<\/a><span class="sep">\|<\/span><a href="\/runtime">Runtime<\/a><span class="sep">\|<\/span><a href="\/verify"/,
    );
    assert.match(
      nav,
      /href="\/verify"[^>]*>Verify<\/a><span class="sep">\|<\/span><a href="\/AzielEliab" class="aziel">Aziel Eliab<\/a><span class="sep">\|<\/span><a href="https:\/\/www\.azielcorpuslibrary\.net\/AzielEliab" class="aziel">Aziel Corpus Library<\/a>/,
    );
    assert.match(CSS, /--royal:#6b3fa0/);
    assert.match(CSS, /--royal-deep:#4a2870/);
  });

  it("renders crawlable manifesto HTML with a Digital Library cross-link", () => {
    const html = page("Aziel Eliab", azielEliabBody(), { path: AZIEL_ELIAB_PATH, kind: "aziel" });
    assert.match(html, /<title>Aziel Eliab — GodLock<\/title>/);
    assert.match(html, /name="robots" content="index,follow"/);
    assert.match(html, /rel="canonical" href="https:\/\/godlock\.uk\/AzielEliab"/);
    assert.match(html, /name="keywords" content="Aziel Eliab, GodLock, receipt, intelligent design stress-test"/);
    assert.ok(html.includes(AZIEL_MANIFESTO[0]));
    assert.ok(html.includes("— Aziel Eliab"));
    assert.match(html, /href="https:\/\/www\.azielcorpuslibrary\.net\/AzielEliab">Aziel Eliab — Digital Library<\/a>/);
    assert.doesNotMatch(html, /MCP|OpenAPI|runtime_session|Workers AI/i);
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const person = ld["@graph"].find((n) => n["@type"] === "Person");
    assert.equal(person.name, "Aziel Eliab");
    assert.deepEqual(person.alternateName, ["Aziel Elroi Eliab"]);
    assert.equal(person.url, "https://godlock.uk/AzielEliab");
    assert.ok(person.sameAs.includes(LIBRARY_AZIEL));
    assert.ok(person.sameAs.includes(AUTHOR_GITHUB));
    assert.ok(person.sameAs.includes(GITHUB));
    assert.ok(ld["@graph"].some((n) => n["@type"] === "ProfilePage"));
  });
});

describe("Aziel Eliab SEO surfaces", () => {
  it("describes the identity page", () => {
    assert.match(defaultDescription("aziel"), /Aziel Eliab/);
    const meta = headMeta({ title: "Aziel Eliab", path: "/AzielEliab", kind: "aziel" });
    assert.match(meta, /name="robots" content="index,follow"/);
    assert.match(meta, /og:title" content="Aziel Eliab — GodLock"/);
    const person = personNode();
    assert.deepEqual(person.sameAs, [LIBRARY_AZIEL, AUTHOR_GITHUB, GITHUB]);
  });

  it("lists identity and library pages in robots, sitemap, cite, llms, and ai", async () => {
    const robots = robotsTxt();
    assert.match(robots, /Allow: \/AzielEliab/);
    assert.doesNotMatch(robots, /Allow: \/AzielCorpusLibrary/);
    assert.match(robots, /Allow: \/software/);
    assert.match(robots, /Allow: \/runtime\nAllow: \/runtime\//);
    assert.match(robots, /Allow: \/ai\.txt/);
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
    assert.ok(xml.includes(CANON_HOST + "/AzielEliab"));
    assert.ok(xml.includes(CANON_HOST + "/runtime"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/v1/runtime.json"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/openapi.json"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/llms.txt"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/cite.json"));
    assert.ok(xml.includes(CANON_HOST + "/runtime/mcp"));
    assert.ok(xml.includes("https://www.azielcorpuslibrary.net/runtime"));
    assert.ok(!xml.includes(CANON_HOST + "/AzielCorpusLibrary"));
    assert.ok(xml.includes(LIBRARY_AZIEL));
    const cite = citeDoc();
    assert.equal(cite.aziel_eliab, CANON_HOST + "/AzielEliab");
    assert.equal(cite.aziel_corpus_library, LIBRARY_AZIEL);
    assert.equal(cite.library_aziel_eliab, LIBRARY_AZIEL);
    assert.equal(cite.author, "Aziel Eliab");
    assert.ok(cite.ai_clients.includes("ChatGPT (GPT Actions / OpenAI)"));
    assert.ok(cite.ai_clients.includes("Grok (xAI)"));
    assert.ok(cite.ai_clients.includes("Venice"));
    assert.ok(cite.ai_clients.includes("Claude (Anthropic)"));
    assert.ok(cite.ai_clients.includes("Cursor (MCP)"));
    assert.ok(cite.ai_clients.includes("other MCP/OpenAPI-capable assistants"));
    assert.ok(cite.ai_clients.length >= 16);
    assert.equal(cite.runtime, CANON_HOST + "/runtime");
    assert.equal(cite.runtime_openapi, CANON_HOST + "/runtime/openapi.json");
    assert.equal(cite.runtime_mcp, CANON_HOST + "/runtime/mcp");
    assert.equal(cite.runtime_library, "https://www.azielcorpuslibrary.net/runtime");
    assert.ok(cite.sameAs.includes(CANON_HOST + "/runtime"));
    assert.equal(cite.door, "fraggate");
    const llms = llmsDoc();
    assert.match(llms, /Aziel Eliab: https:\/\/godlock\.uk\/AzielEliab/);
    assert.match(llms, /Aziel Corpus Library: https:\/\/www\.azielcorpuslibrary\.net\/AzielEliab/);
    assert.doesNotMatch(llms, /Aziel Corpus Library: https:\/\/godlock\.uk\/AzielCorpusLibrary/);
    assert.match(llms, /## Runtime \(FragGate door\)/);
    assert.match(llms, /Door: https:\/\/godlock\.uk\/runtime/);
    assert.match(llms, /OpenAPI: https:\/\/godlock\.uk\/runtime\/openapi\.json/);
    assert.match(llms, /MCP: POST https:\/\/godlock\.uk\/runtime\/mcp/);
    assert.match(llms, /Library door: https:\/\/www\.azielcorpuslibrary\.net\/runtime/);
    assert.match(llms, /Works with ChatGPT \(GPT Actions \/ OpenAI\), Grok \(xAI\), Venice, Claude \(Anthropic\)/);
    assert.match(llms, /Cursor \(MCP\), Glama \(MCP\), Perplexity, Microsoft Copilot \/ Bing, Google Gemini \/ Vertex/);
    assert.match(llms, /GPTBot, ChatGPT-User, OAI-SearchBot, Venice, Grok, Google-Extended/);
    assert.doesNotMatch(llms, /Use with Grok, ChatGPT, Venice/);
    assert.equal(aiDoc(), llmsDoc());
  });

  it("308s about/kebab/case variants to the canonical identity paths", () => {
    assert.equal(permanentIdentityRedirect("/aziel-eliab"), "/AzielEliab");
    assert.equal(permanentIdentityRedirect("/azieleliab"), "/AzielEliab");
    assert.equal(permanentIdentityRedirect("/about"), "/AzielEliab");
    assert.equal(permanentIdentityRedirect("/aboutme"), "/AzielEliab");
    assert.equal(permanentIdentityRedirect("/AzielEliab"), "");
    assert.equal(permanentIdentityRedirect("/aziel-corpus-library"), LIBRARY_AZIEL);
    assert.equal(permanentIdentityRedirect("/AzielCorpusLibrary"), LIBRARY_AZIEL);
    assert.equal(permanentIdentityRedirect("/AzielCorpusLibrary/"), LIBRARY_AZIEL);
  });
});

describe("homepage stays a natural argument surface", () => {
  it("does not publish specified-fit machinery or a paste-block", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/"), mockEnv());
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /Answers open with Yes, No, Let's review, or Interesting/);
    assert.match(html, /GodLock records a receipt\. It does not sermonize/);
    assert.match(html, /Works with ChatGPT \(GPT Actions \/ OpenAI\), Grok \(xAI\), Venice, Claude \(Anthropic\)/);
    assert.match(html, /Cursor \(MCP\), Glama \(MCP\), Perplexity/);
    assert.match(html, /other MCP\/OpenAPI-capable assistants/);
    assert.match(html, /href="\/runtime">Runtime<\/a>/);
    const homeLd = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.ok(homeLd["@graph"].some((n) => n["@type"] === "WebAPI" && n.documentation === "https://godlock.uk/runtime/openapi.json"));
    assert.ok(homeLd["@graph"].some((n) => n["@type"] === "SoftwareApplication" && n.name === "Aziel Eliab Runtime" && (n.sameAs || []).includes("https://www.azielcorpuslibrary.net/runtime")));
    assert.doesNotMatch(html, /Use with Grok, ChatGPT, Venice/);
    assert.doesNotMatch(html, /INTERNAL_CRITERIA|Specified Fit|bootstrap lock|paste-block|how the argument works/i);
    assert.doesNotMatch(html, /Functionally specified digital information joined to a translation system/);
  });

  it("does not serve the internal operator brief", async () => {
    for (const path of ["/internal", "/internal/", "/internal/SPECIFIED_FIT.md"]) {
      const res = await worker.fetch(new Request("https://godlock.uk" + path), mockEnv());
      assert.equal(res.status, 404, path);
      const html = await res.text();
      assert.doesNotMatch(html, /Steel claim|INTERNAL_CRITERIA|Specified Fit, Not Pretty Spirals/);
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
    assert.match(software, /Works with ChatGPT \(GPT Actions \/ OpenAI\), Grok \(xAI\), Venice, Claude \(Anthropic\)/);
    assert.match(software, /Amazon Q tooling, DuckAssist, You\.com, Cohere/);
    assert.doesNotMatch(software, /Use with Grok, ChatGPT, Venice/);
    const home = homeBody({ stats: {}, latest: null, prior: [] });
    assert.match(home, /Works with ChatGPT \(GPT Actions \/ OpenAI\)/);
    const softwareMeta = defaultDescription("software");
    assert.match(softwareMeta, /Claude \(Anthropic\)/);
    assert.match(headMeta({ title: "Software", path: "/software", kind: "software" }), /Claude, Cursor, Glama, Perplexity/);
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
    assert.match(html, /<title>Aziel Eliab — GodLock<\/title>/);
    assert.match(html, /index,follow/);
    assert.ok(html.includes(AZIEL_MANIFESTO[3]));
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
