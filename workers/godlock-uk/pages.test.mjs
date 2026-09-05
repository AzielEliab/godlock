import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AZIEL_ELIAB_PATH,
  AZIEL_MANIFESTO,
  AZIEL_SIGNATURE,
  azielEliabBody,
  azielEliabText,
  page,
  topNav,
  CSS,
} from "./src/ui.js";
import { robotsTxt, sitemapXml, citeDoc, llmsDoc, defaultDescription, headMeta, CANON_HOST } from "./src/seo.js";
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
  });

  it("keeps the manifesto paragraphs and signature exactly", () => {
    assert.equal(AZIEL_MANIFESTO.length, 4);
    assert.equal(
      AZIEL_MANIFESTO[0],
      "I made this because a debate with no record becomes a pulpit, and a pulpit with no score becomes a private religion. Intelligent design was never the point by itself. The point was whether a claim could stand in the open, be answered, and leave something behind that was not just my voice.",
    );
    assert.equal(
      AZIEL_MANIFESTO[1],
      "Questions over answers, or the mouth outruns the mind. Document over declare, or speech becomes a throne. Formality before familiarity, or warmth is mistaken for proof. Trust is an output. It is grown from a chain you can audit, not granted at the door. I am not always right. That is not a confession. It is the method.",
    );
    assert.equal(
      AZIEL_MANIFESTO[2],
      "A claim that cannot be scored is a sermon wearing work clothes. Intelligent design and design-flaw sit at the same table. No creed inherits a private lane. Later readings bury earlier ones as the evidence hardens. The receipt is the argument that survives the speaker.",
    );
    assert.equal(
      AZIEL_MANIFESTO[3],
      "All paths lead home. Morality over legality: a statute can bless a harm and still be called law. Law keeps order. Morality keeps the soul from calling order holy. Let us pray there is a God. If there is, the record is how we stay correctable before Him. If there is not, the record is how we stay correctable before each other.",
    );
    assert.equal(AZIEL_SIGNATURE, "— Aziel Eliab");
    const text = azielEliabText();
    assert.ok(text.includes("\n\n"));
    assert.ok(text.endsWith("— Aziel Eliab\n"));
  });

  it("places Aziel Eliab next to Verify in the top nav, in royal purple", () => {
    const nav = topNav("/verify");
    assert.match(nav, /<nav class="nav2">/);
    assert.match(nav, /href="\/">Engine<\/a><span class="sep">\|<\/span><a href="\/verify"/);
    assert.match(nav, /href="\/verify"[^>]*>Verify<\/a><span class="sep">\|<\/span><a href="\/AzielEliab" class="aziel">Aziel Eliab<\/a>/);
    assert.doesNotMatch(nav, /MCP|openapi|runtime_session/i);
    assert.match(CSS, /--royal:#6b3fa0/);
    assert.match(CSS, /--royal-deep:#4a2870/);
    assert.match(CSS, /\.nav2 a\.aziel/);
    assert.match(CSS, /\.about-aziel/);
  });

  it("renders crawlable manifesto HTML without MCP chrome", () => {
    const html = page("Aziel Eliab", azielEliabBody(), { path: AZIEL_ELIAB_PATH, kind: "aziel" });
    assert.match(html, /<title>Aziel Eliab — GodLock<\/title>/);
    assert.match(html, /name="robots" content="index,follow"/);
    assert.match(html, /rel="canonical" href="https:\/\/godlock\.uk\/AzielEliab"/);
    assert.match(html, /class="about-aziel"/);
    assert.match(html, /class="about-sign"/);
    assert.ok(html.includes(AZIEL_MANIFESTO[0]));
    assert.ok(html.includes("— Aziel Eliab"));
    assert.doesNotMatch(html, /MCP|OpenAPI|runtime_session|Workers AI/i);
    assert.match(html, /aria-current="page">Aziel Eliab<\/a>/);
  });
});

describe("Aziel Eliab SEO surfaces", () => {
  it("describes the identity page", () => {
    assert.match(defaultDescription("aziel"), /Aziel Eliab/);
    const meta = headMeta({ title: "Aziel Eliab", path: "/AzielEliab", kind: "aziel" });
    assert.match(meta, /name="robots" content="index,follow"/);
    assert.match(meta, /og:title" content="Aziel Eliab — GodLock"/);
  });

  it("lists /AzielEliab in robots, sitemap, cite, and llms", async () => {
    const robots = robotsTxt();
    assert.match(robots, /Allow: \/AzielEliab/);
    const xml = await sitemapXml({});
    assert.ok(xml.includes(CANON_HOST + "/AzielEliab"));
    const cite = citeDoc();
    assert.equal(cite.aziel_eliab, CANON_HOST + "/AzielEliab");
    assert.equal(cite.author, "Aziel Eliab");
    const llms = llmsDoc();
    assert.match(llms, /Aziel Eliab: https:\/\/godlock\.uk\/AzielEliab/);
    assert.match(llms, /Identity is Aziel Eliab only/);
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

  it("redirects the kebab path to /AzielEliab", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/aziel-eliab"), mockEnv());
    assert.equal(res.status, 303);
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
});
