import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import { isMachinePresencePath, isSitePresencePath } from "./src/presence.js";
import {
  RSS_RECEIPT_LIMIT,
  RSS_SELF,
  publicRssRows,
  rssDate,
  rssXml,
  xmlEscape,
} from "./src/rss.js";
import {
  CANON_HOST,
  RSS_CANONICAL_URL,
  RSS_PATH,
  citeDoc,
  headMeta,
  llmsDoc,
  robotsTxt,
  siteOpenApi,
  sitemapXml,
} from "./src/seo.js";
import { page, siteFooter, whoPageHtml } from "./src/ui.js";

function visibleBody(html) {
  return String(html)
    .replace(/^[\s\S]*<body[^>]*>/i, "")
    .replace(/<\/body>[\s\S]*$/i, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "");
}

const QUESTION = "Specified Fit & the reader <phi> are not a \"spiral\" proof.";

function feedEnv(rows) {
  const sqls = [];
  return {
    sqls,
    env: {
      DB: {
        prepare(sql) {
          sqls.push(String(sql));
          const stmt = {
            bind() { return stmt; },
            async run() { return { success: true }; },
            async first() { return null; },
            async all() { return { results: rows }; },
          };
          return stmt;
        },
        async batch(list) {
          return Promise.all((list || []).map((stmt) => stmt.run()));
        },
      },
    },
  };
}

describe("RSS 2.0", () => {
  it("escapes markup and keeps a real receipt date", () => {
    assert.equal(xmlEscape("A & B <c>"), "A &amp; B &lt;c&gt;");
    assert.equal(rssDate("not-a-date"), "");
    assert.equal(rssDate("2026-11-01T12:00:00.000Z"), "Sun, 01 Nov 2026 12:00:00 GMT");
  });

  it("lists standing pages and public receipts, and omits isolated rows", () => {
    const xml = rssXml([
      {
        id: "old",
        created_utc: "2026-10-01T00:00:00.000Z",
        challenge_text: "Older public question",
        label: "Yes",
        summary: "kept",
        isolated: 0,
      },
      {
        id: "new",
        created_utc: "2026-11-01T12:00:00.000Z",
        challenge_text: QUESTION,
        label: "Let's review",
        summary: "public reading",
        isolated: 0,
      },
      {
        id: "hidden",
        created_utc: "2026-11-02T00:00:00.000Z",
        challenge_text: "isolated question",
        label: "No",
        summary: "secret",
        isolated: 1,
      },
      { id: "", challenge_text: "no id", isolated: 0 },
    ]);
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
    assert.match(xml, /<rss version="2.0"/);
    assert.ok(xml.includes("<atom:link href=\"" + RSS_SELF + "\" rel=\"self\" type=\"application/rss+xml\"/>"));
    assert.ok(xml.includes("<language>en-gb</language>"));
    assert.ok(xml.includes("<dc:creator>Aziel Eliab</dc:creator>"));
    assert.ok(xml.includes("<lastBuildDate>Sun, 01 Nov 2026 12:00:00 GMT</lastBuildDate>"));
    assert.ok(!xml.includes("isolated question"));
    assert.ok(!xml.includes(">secret<"));
    const newer = xml.indexOf("Specified Fit");
    const older = xml.indexOf("Older public question");
    assert.ok(newer > 0 && older > newer);
    assert.ok(xml.includes("<title>" + xmlEscape(QUESTION) + "</title>"));
    assert.ok(xml.includes("Specified Fit &amp; the reader &lt;phi&gt;"));
    assert.ok(xml.includes("<category>Let&apos;s review</category>"));
    assert.ok(xml.includes(CANON_HOST + "/receipt/new"));
    assert.ok(xml.includes("<link>" + CANON_HOST + "/</link>"));
    assert.ok(xml.includes(CANON_HOST + "/reason"));
    assert.ok(xml.includes(CANON_HOST + "/software"));
    assert.ok(xml.includes(CANON_HOST + "/doors"));
    assert.ok(xml.includes(CANON_HOST + "/runtime"));
    assert.ok(xml.includes(CANON_HOST + "/receipts"));
    assert.ok(xml.includes(CANON_HOST + "/verify"));
    assert.ok(xml.includes(CANON_HOST + "/donate"));
    assert.ok(xml.includes(CANON_HOST + "/AzielEliab"));
    assert.ok(xml.includes(CANON_HOST + "/aziel"));
    assert.ok(xml.includes(CANON_HOST + "/who"));
    assert.equal((xml.match(/<item>/g) || []).length, 2 + 11);
    assert.ok(!xml.includes("<pubDate></pubDate>"));
    const home = xml.slice(xml.indexOf(CANON_HOST + "/</link>\n      <guid"));
    assert.ok(!home.slice(0, 400).includes("<pubDate>"));
  });

  it("omits lastBuildDate when nothing has a timestamp", () => {
    const xml = rssXml([]);
    assert.ok(!xml.includes("<lastBuildDate>"));
    assert.ok(xml.includes(CANON_HOST + "/doors"));
  });

  it("keeps an in-memory receipt only when isolated is strictly false or 0", () => {
    const xml = rssXml([
      {
        id: "pub",
        created_utc: "2026-11-01T00:00:00.000Z",
        challenge_text: "public question kept",
        label: "Yes",
        summary: "",
        isolated: 0,
      },
      {
        id: "bool",
        created_utc: "2026-11-02T00:00:00.000Z",
        challenge_text: "false flag kept",
        label: "Yes",
        summary: "",
        isolated: false,
      },
      {
        id: "strue",
        created_utc: "2026-11-03T00:00:00.000Z",
        challenge_text: "string true hidden",
        label: "No",
        summary: "secret true",
        isolated: "true",
      },
      {
        id: "sfalse",
        created_utc: "2026-11-04T00:00:00.000Z",
        challenge_text: "string false hidden",
        label: "No",
        summary: "",
        isolated: "false",
      },
    ]);
    assert.ok(xml.includes("public question kept"));
    assert.ok(xml.includes("false flag kept"));
    assert.ok(!xml.includes("string true hidden"));
    assert.ok(!xml.includes("secret true"));
    assert.ok(!xml.includes("string false hidden"));
  });

  it("serves /rss.xml and redirects the aliases", async () => {
    const rec = feedEnv([
      {
        id: "r1",
        created_utc: "2026-11-03T08:00:00.000Z",
        challenge_text: QUESTION,
        label: "Interesting",
        summary: "reading",
        isolated: 0,
      },
    ]);
    const res = await worker.fetch(new Request("https://godlock.uk/rss.xml", {
      headers: { "User-Agent": "Mozilla/5.0" },
    }), rec.env);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("Content-Type") || "", /application\/rss\+xml/);
    assert.match(res.headers.get("Content-Signal") || "", /ai-train=yes/);
    const body = await res.text();
    assert.ok(body.includes(QUESTION.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace(/"/g, "&quot;")));
    assert.ok(rec.sqls.some((sql) => /isolated=0/.test(sql)));

    const head = await worker.fetch(new Request("https://godlock.uk/rss.xml", { method: "HEAD" }), rec.env);
    assert.equal(head.status, 200);
    assert.equal(await head.text(), "");
    assert.match(head.headers.get("Content-Type") || "", /application\/rss\+xml/);

    for (const alias of ["/rss", "/feed", "/feed.xml"]) {
      const redirected = await worker.fetch(new Request("https://godlock.uk" + alias), rec.env);
      assert.equal(redirected.status, 308, alias);
      assert.equal(redirected.headers.get("Location"), RSS_CANONICAL_URL);
    }
    const queried = await worker.fetch(new Request("https://godlock.uk/feed?x=1"), rec.env);
    assert.equal(queried.status, 308);
    assert.equal(queried.headers.get("Location"), RSS_CANONICAL_URL);
  });

  it("sends feed aliases to the canonical URL and nowhere else", async () => {
    const env = {
      DB: {
        prepare() {
          const stmt = {
            bind() { return stmt; },
            async run() { return { success: true }; },
            async first() { return null; },
            async all() { return { results: [] }; },
          };
          return stmt;
        },
        async batch() { return []; },
      },
    };
    const cases = [
      ["https://evil.example/rss", { Host: "evil.example" }],
      ["https://godlock.uk/feed", { Host: "evil.example" }],
      ["https://godlock.uk./rss", {}],
      ["https://godlock.uk:8443/feed.xml", {}],
      ["https://godlock.uk//evil", {}],
      ["https://godlock.uk/\\evil", {}],
      ["https://godlock.uk/rss\\..\\evil", {}],
      ["https://godlock.uk/rss%5Cevil", {}],
    ];
    for (const [href, headers] of cases) {
      const res = await worker.fetch(new Request(href, { headers }), env);
      const location = res.headers.get("Location");
      if (res.status === 308) {
        assert.equal(location, RSS_CANONICAL_URL, href);
      } else {
        assert.equal(location, null, href);
      }
      if (location) assert.equal(location, "https://godlock.uk/rss.xml");
    }
  });

  it("keeps a missing database an empty receipt list", async () => {
    assert.deepEqual(await publicRssRows({}), []);
    const res = await worker.fetch(new Request("https://godlock.uk/rss.xml"), {});
    assert.equal(res.status, 200);
    const body = await res.text();
    assert.ok(body.includes(CANON_HOST + "/"));
    assert.ok(!body.includes("<lastBuildDate>"));
  });

  it("is advertised from HTML, robots, sitemap, cite, llms, and OpenAPI", async () => {
    const home = headMeta({ title: "GodLock", path: "/", kind: "home" });
    assert.match(home, /rel="alternate" href="\/rss\.xml" type="application\/rss\+xml" title="GodLock RSS"/);
    assert.match(whoPageHtml(), /<head>[\s\S]*rel="alternate" type="application\/rss\+xml"[\s\S]*<\/head>/);
    const homePage = page("GodLock", "<p>Engine</p>", { path: "/", kind: "home" });
    assert.match(homePage, /<head>[\s\S]*rel="alternate" href="\/rss\.xml" type="application\/rss\+xml"[\s\S]*<\/head>/);
    const robots = robotsTxt();
    assert.match(robots, /Allow: \/rss\.xml/);
    assert.match(robots, /RSS 2\.0: \/rss\.xml/);
    const xml = await sitemapXml({});
    assert.ok(xml.includes("<loc>" + CANON_HOST + RSS_PATH + "</loc>"));
    assert.equal(citeDoc().priority_pages.rss, CANON_HOST + RSS_PATH);
    assert.match(llmsDoc(), new RegExp("RSS: " + CANON_HOST.replace(/[.]/g, "\\.") + "\\/rss\\.xml"));
    assert.ok(siteOpenApi().paths[RSS_PATH]);
    assert.equal(siteOpenApi().paths["/feed"].get.responses["308"].description, "Permanent redirect");
    assert.equal(isMachinePresencePath("/rss.xml"), true);
    assert.equal(isMachinePresencePath("/feed"), true);
    assert.equal(isSitePresencePath("/rss.xml", "GET"), false);
    assert.equal(RSS_RECEIPT_LIMIT, 50);
  });

  it("puts no feed link in the footer or any visible HTML body", async () => {
    const stmt = {
      bind() { return stmt; },
      async first() { return null; },
      async all() { return { results: [] }; },
      async run() { return { success: true }; },
    };
    const env = {
      DB: { prepare() { return stmt; }, async batch() { return []; } },
      MESH_PROBE_ORIGIN: false,
    };
    const paths = ["/", "/reason", "/software", "/doors", "/receipts", "/verify", "/donate", "/AzielEliab", "/aziel", "/who", "/no-such"];
    assert.doesNotMatch(siteFooter(), /rss|\/feed/i);
    for (const path of paths) {
      const res = await worker.fetch(new Request("https://godlock.uk" + path, {
        headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
      }), env);
      const html = await res.text();
      assert.match(html, /<html/i, path);
      const body = visibleBody(html);
      assert.doesNotMatch(body, /rss\.xml/i, path);
      assert.doesNotMatch(body, /application\/rss\+xml/i, path);
      assert.doesNotMatch(body, /href="\/rss"/i, path);
      assert.doesNotMatch(body, /href="\/feed/i, path);
      assert.doesNotMatch(body, />\s*rss\s*</i, path);
      assert.doesNotMatch(body, /GodLock RSS/i, path);
      if (path === "/" || path === "/who") {
        assert.match(html, /<head[\s\S]*rel="alternate"[^>]*application\/rss\+xml[\s\S]*<\/head>/i, path);
      }
    }
  });
});
