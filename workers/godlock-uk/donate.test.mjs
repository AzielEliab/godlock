import { describe, it } from "node:test";
import assert from "node:assert/strict";
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
  publicRails,
} from "./src/donate.js";
import { homeBody, page, topNav } from "./src/ui.js";
import { defaultDescription, citeDoc } from "./src/seo.js";

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
  });

  it("renders Copy, Open-in-wallet, QR, and network note on each rail", () => {
    const html = donateBody();
    for (const rail of DONATE_RAILS) {
      assert.ok(html.includes(rail.address), rail.id);
      assert.ok(html.includes('href="' + rail.uri + '"'), rail.id + " uri");
      assert.ok(html.includes('data-copy="' + rail.address + '"'), rail.id + " copy");
    }
    assert.equal(html.split(DONATE_NETWORK_NOTE).length - 1, DONATE_RAILS.length);
    assert.equal(html.split("<svg ").length - 1, DONATE_RAILS.length);
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
    }
    assert.match(home, /href="\/donate">Donate door</);
    assert.match(donateHomeBlock(), /id="donate"/);
    assert.match(topNav("/"), /href="\/donate">Donate<\/a>/);
    const wrapped = page("GodLock", home, { path: "/", kind: "home" });
    assert.match(wrapped, /href="\/donate">Donate<\/a>/);
    assert.match(defaultDescription("donate"), /Nothing is free/);
    assert.equal(citeDoc().donate, "https://godlock.uk/donate");
  });
});
