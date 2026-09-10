import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import worker from "./src/index.js";
import {
  DONATE_COPY,
  DONATE_RAILS,
  DONATE_SIGNATURE,
  DONATE_SPEC,
  DONATE_PATH,
  DONATE_CANONICAL,
  DONATE_NETWORK_NOTE,
  donateBody,
  donateHomeBlock,
  donateDoc,
  donateText,
  donateTouchesStorage,
  donateQrSrc,
  publicRails,
} from "./src/donate.js";
import { homeBody, page, topNav } from "./src/ui.js";
import { defaultDescription, citeDoc } from "./src/seo.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const QR_DIR = join(HERE, "public", "donate", "qr");
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const THEATER = /tip.?jar|buy me a coffee|patron|unlocks? a feature|thank you for (your )?generosit|progress bar|name on a wall of fame/i;
const BANNED = /Collin Horton|GodLock\.AZ|\+25|10\.5281\/zenodo|support my custody/i;

function mockEnv() {
  const stmt = {
    bind() { return stmt; },
    async first() { return null; },
    async all() { return { results: [] }; },
    async run() { return { success: true }; },
  };
  const boom = async () => {
    throw new Error("donate must not touch KV");
  };
  return {
    DB: {
      prepare() { return stmt; },
      async batch() { return []; },
    },
    RUNTIME_USES: { get: boom, put: boom, list: boom },
    ASSETS: {
      async fetch(request) {
        const url = new URL(request.url);
        const name = url.pathname.split("/").pop() || "";
        const file = join(QR_DIR, name);
        if (!existsSync(file)) return new Response("missing", { status: 404 });
        const body = readFileSync(file);
        return new Response(body, { status: 200, headers: { "Content-Type": "image/png" } });
      },
    },
  };
}

describe("AZL-DONATE-1.0 copy and rails", () => {
  it("keeps the canonical copy and — Aziel signature exactly", () => {
    assert.equal(DONATE_SPEC, "AZL-DONATE-1.0");
    assert.equal(DONATE_PATH, "/donate");
    assert.equal(DONATE_CANONICAL, "https://www.azieleliab.com/donate");
    assert.equal(DONATE_SIGNATURE, "— Aziel");
    assert.deepEqual(DONATE_COPY, [
      "Nothing is free.",
      "This work has no corporate backer. No grant. No product that unlocks when you pay. Compute, hosting, and time have a cost. If a door stays open it is because the bill was paid.",
      "Donations keep the work in contact with what does not need a sponsor. They do not buy a vote, a feature, a name on a wall, or a quieter question.",
      "You do not owe this. If the work is useful, you already know what to do.",
      "Send only on the correct network. Double-check the address before you send. Wrong chain is a loss. There is no refund desk.",
      "The software remains free to run and fork. Payment is not a key.",
    ]);
    const text = donateText();
    assert.ok(text.startsWith("Nothing is free."));
    assert.ok(text.endsWith("— Aziel\n"));
    assert.doesNotMatch(text, /— Aziel Eliab/);
  });

  it("publishes the five lattice rails plus SOL and TRX extras", () => {
    const ids = DONATE_RAILS.map((r) => r.id);
    assert.deepEqual(ids, ["btc", "eth", "ltc", "xrp", "doge", "sol", "trx"]);
    const byId = Object.fromEntries(DONATE_RAILS.map((r) => [r.id, r]));
    assert.equal(byId.btc.address, "bc1q8cg7hmgmu7x9yaja8j249np0vt84d4y8duugr7");
    assert.equal(byId.btc.uri, "bitcoin:bc1q8cg7hmgmu7x9yaja8j249np0vt84d4y8duugr7");
    assert.equal(byId.eth.address, "0x29b386022e3968cf8dBFCE59569b49680184B23b");
    assert.equal(byId.eth.uri, "ethereum:0x29b386022e3968cf8dBFCE59569b49680184B23b");
    assert.equal(byId.ltc.address, "LWuqPjMCFtLHvoBaQL4m8QtnxbXSDftVNs");
    assert.equal(byId.ltc.uri, "litecoin:LWuqPjMCFtLHvoBaQL4m8QtnxbXSDftVNs");
    assert.equal(byId.xrp.address, "rLc3jZJbgEU1wBGwTFtgyq8bpayQE15K7b");
    assert.equal(byId.xrp.uri, "xrp:rLc3jZJbgEU1wBGwTFtgyq8bpayQE15K7b");
    assert.match(byId.xrp.note, /No destination tag required/);
    assert.equal(byId.doge.address, "DQ4go4iLPfNXDWim4KptTh3565sFCVrCyp");
    assert.equal(byId.doge.uri, "dogecoin:DQ4go4iLPfNXDWim4KptTh3565sFCVrCyp");
    assert.equal(byId.sol.address, "6BZNXxEvcZf1CgkWYojKoWUPCxCcNLbDKYRPfaN465gj");
    assert.equal(byId.sol.extra, true);
    assert.equal(byId.trx.address, "TJXb1YhZ9pAYsEW6UKUAzxFUzH6Tzcacyy");
    assert.equal(byId.trx.extra, true);
    assert.equal(publicRails().length, 7);
    for (const rail of publicRails()) {
      assert.equal(rail.qr, donateQrSrc(rail.id));
    }
  });

  it("ships a solid PNG payment-URI QR for every rail", () => {
    for (const rail of DONATE_RAILS) {
      const file = join(QR_DIR, rail.id + ".png");
      assert.equal(existsSync(file), true, file);
      const body = readFileSync(file);
      assert.ok(body.length > 32, rail.id + " bytes");
      assert.deepEqual(body.subarray(0, 8), PNG_MAGIC);
    }
  });

  it("renders Copy, Open-in-wallet, QR, and network note on each rail", () => {
    const html = donateBody();
    for (const rail of DONATE_RAILS) {
      assert.ok(html.includes(rail.address), rail.id);
      assert.ok(html.includes('href="' + rail.uri + '"'), rail.id + " uri");
      assert.ok(html.includes('data-copy="' + rail.address + '"'), rail.id + " copy");
    }
    assert.equal(html.split(DONATE_NETWORK_NOTE).length - 1, DONATE_RAILS.length);
    assert.doesNotMatch(html, /<svg[\s>]/);
    assert.doesNotMatch(html, /<rect[\s>]/);
    assert.equal(html.split("<img ").length - 1, DONATE_RAILS.length);
    for (const rail of DONATE_RAILS) {
      assert.ok(html.includes('src="/donate/qr/' + rail.id + '.png"'), rail.id + " png");
    }
    assert.match(html, /Open in wallet/);
    assert.match(html, />Copy</);
    assert.match(html, /No destination tag required/);
    assert.match(html, /https:\/\/www\.azieleliab\.com\/donate/);
    assert.match(html, /— Aziel/);
    assert.doesNotMatch(html, THEATER);
    assert.doesNotMatch(html, BANNED);
    assert.equal(donateTouchesStorage({ RUNTIME_USES: { get() { throw new Error("no"); } } }), false);
  });
});

describe("Donate door and homepage block", () => {
  it("serves /donate as HTML with identity chrome Aziel Eliab", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/donate"), mockEnv());
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /<title>Donate — GodLock<\/title>/);
    assert.match(html, /Author Aziel Eliab/);
    assert.match(html, /href="\/donate"[^>]*aria-current="page"/);
    assert.ok(html.includes("Nothing is free."));
    assert.ok(html.includes("Payment is not a key."));
    assert.ok(html.includes("— Aziel"));
    assert.match(html, /rel="canonical" href="https:\/\/godlock\.uk\/donate"/);
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.ok(ld["@graph"].some((n) => n["@type"] === "WebPage" && n.url === "https://godlock.uk/donate"));
    assert.ok(ld["@graph"].some((n) => n["@type"] === "Person" && n.name === "Aziel Eliab"));
    assert.doesNotMatch(html, THEATER);
    assert.doesNotMatch(html, /<svg[\s>]/);
    assert.doesNotMatch(html, /<rect[\s>]/);
    assert.equal(html.split("<img ").length - 1, DONATE_RAILS.length);
    assert.ok(html.includes('src="/donate/qr/btc.png"'));
    assert.ok(html.includes('src="/donate/qr/sol.png"'));
    assert.ok(html.includes('src="/donate/qr/trx.png"'));
  });

  it("returns JSON when asked without inventing unlock state", async () => {
    const res = await worker.fetch(new Request("https://godlock.uk/donate?format=json"), mockEnv());
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.spec, "AZL-DONATE-1.0");
    assert.equal(body.path, "/donate");
    assert.equal(body.author, "Aziel Eliab");
    assert.equal(body.identity, "Aziel Eliab");
    assert.equal(body.canonical, DONATE_CANONICAL);
    assert.equal(body.unlock, false);
    assert.equal(body.kv, false);
    assert.equal(body.tip_jar, false);
    assert.equal(body.rails.length, 7);
    assert.ok(body.text.includes("Nothing is free."));
    assert.deepEqual(body, { ...donateDoc(), author: "Aziel Eliab" });
  });

  it("keeps the homepage donate block on the same copy and rails", () => {
    const home = homeBody({ stats: {}, latest: null, prior: [] });
    const door = donateBody();
    for (const para of DONATE_COPY) {
      assert.ok(home.includes(para));
      assert.ok(door.includes(para));
    }
    for (const rail of DONATE_RAILS) {
      assert.ok(home.includes(rail.address));
      assert.ok(home.includes(rail.uri));
      assert.ok(home.includes('src="/donate/qr/' + rail.id + '.png"'));
      assert.ok(door.includes('src="/donate/qr/' + rail.id + '.png"'));
    }
    assert.doesNotMatch(home, /<svg[\s>]/);
    assert.doesNotMatch(door, /<svg[\s>]/);
    assert.match(home, /href="\/donate">Donate door</);
    assert.match(donateHomeBlock(), /id="donate"/);
    assert.match(topNav("/"), /href="\/donate">Donate<\/a>/);
    const wrapped = page("GodLock", home, { path: "/", kind: "home" });
    assert.match(wrapped, /href="\/donate">Donate<\/a>/);
    assert.match(defaultDescription("donate"), /Nothing is free/);
    assert.equal(citeDoc().donate, "https://godlock.uk/donate");
  });

  it("serves each donate QR PNG without touching KV", async () => {
    const env = mockEnv();
    for (const rail of DONATE_RAILS) {
      const res = await worker.fetch(new Request("https://godlock.uk" + donateQrSrc(rail.id)), env);
      assert.equal(res.status, 200, rail.id);
      assert.match(res.headers.get("Content-Type") || "", /image\/png/);
      const buf = Buffer.from(await res.arrayBuffer());
      assert.deepEqual(buf.subarray(0, 8), PNG_MAGIC);
    }
    const missing = await worker.fetch(new Request("https://godlock.uk/donate/qr/nope.png"), env);
    assert.equal(missing.status, 404);
  });
});
