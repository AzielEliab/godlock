import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AZIEL_ELIAB_PATH,
  AZIEL_CORPUS_PATH,
  SOFTWARE_PATH,
  AZIEL_MANIFESTO,
  AZIEL_SIGNATURE,
  CORPUS_ABOUT,
  CORPUS_OPENING,
  CORPUS_OPENING_SIGN,
  azielEliabBody,
  azielEliabText,
  azielCorpusLibraryBody,
  page,
  topNav,
  CSS,
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

  it("orders nav Engine | Software | Verify | Aziel Eliab | Aziel Corpus Library", () => {
    const nav = topNav("/verify");
    assert.match(
      nav,
      /href="\/">Engine<\/a><span class="sep">\|<\/span><a href="\/software">Software<\/a><span class="sep">\|<\/span><a href="\/verify"/,
    );
    assert.match(
      nav,
      /href="\/verify"[^>]*>Verify<\/a><span class="sep">\|<\/span><a href="\/AzielEliab" class="aziel">Aziel Eliab<\/a><span class="sep">\|<\/span><a href="\/AzielCorpusLibrary" class="aziel">Aziel Corpus Library<\/a>/,
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
    assert.match(robots, /Allow: \/AzielCorpusLibrary/);
    assert.match(robots, /Allow: \/software/);
    assert.match(robots, /Allow: \/ai\.txt/);
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
    assert.ok(xml.includes(CANON_HOST + "/AzielCorpusLibrary"));
    const cite = citeDoc();
    assert.equal(cite.aziel_eliab, CANON_HOST + "/AzielEliab");
    assert.equal(cite.aziel_corpus_library, CANON_HOST + "/AzielCorpusLibrary");
    assert.equal(cite.library_aziel_eliab, LIBRARY_AZIEL);
    assert.equal(cite.author, "Aziel Eliab");
    const llms = llmsDoc();
    assert.match(llms, /Aziel Eliab: https:\/\/godlock\.uk\/AzielEliab/);
    assert.match(llms, /Aziel Corpus Library: https:\/\/godlock\.uk\/AzielCorpusLibrary/);
    assert.equal(aiDoc(), llmsDoc());
  });

  it("308s about/kebab/case variants to the canonical identity paths", () => {
    assert.equal(permanentIdentityRedirect("/aziel-eliab"), "/AzielEliab");
    assert.equal(permanentIdentityRedirect("/azieleliab"), "/AzielEliab");
    assert.equal(permanentIdentityRedirect("/about"), "/AzielEliab");
    assert.equal(permanentIdentityRedirect("/aboutme"), "/AzielEliab");
    assert.equal(permanentIdentityRedirect("/AzielEliab"), "");
    assert.equal(permanentIdentityRedirect("/aziel-corpus-library"), "/AzielCorpusLibrary");
    assert.equal(permanentIdentityRedirect("/AzielCorpusLibrary"), "");
  });
});

describe("Aziel Corpus Library page", () => {
  it("mirrors the live About Aziel card and links the library home", () => {
    const html = page("Aziel Corpus Library", azielCorpusLibraryBody(), {
      path: AZIEL_CORPUS_PATH,
      kind: "corpus",
    });
    assert.match(html, /<h1>About Aziel<\/h1>/);
    assert.ok(html.includes("Who? Does not matter."));
    assert.doesNotMatch(html, /Who does not matter\./);
    assert.ok(html.includes(CORPUS_OPENING[0]));
    assert.ok(html.includes(CORPUS_OPENING[1]));
    assert.ok(html.includes(CORPUS_OPENING_SIGN));
    assert.ok(html.includes(CORPUS_ABOUT[0]));
    assert.ok(html.includes("Carry the torch"));
    assert.ok(html.includes("Aziel Library"));
    assert.ok(html.includes("I am temporary. The truth is not."));
    assert.match(html, /href="https:\/\/www\.azielcorpuslibrary\.net\/">Open the library<\/a>/);
    assert.match(html, /href="https:\/\/www\.azielcorpuslibrary\.net\/software"/);
    assert.match(html, /href="https:\/\/www\.azielcorpuslibrary\.net\/runtime"/);
    assert.match(html, /href="https:\/\/www\.azielcorpuslibrary\.net\/how-its-scored"/);
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.ok(ld["@graph"].some((n) => n["@type"] === "DigitalLibrary"));
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

  it("serves Aziel Corpus Library", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/AzielCorpusLibrary"), mockEnv());
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /<title>Aziel Corpus Library — GodLock<\/title>/);
    assert.match(html, /About Aziel/);
  });
});
