import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker from "./src/index.js";
import { hashPayload } from "./src/ledger.js";
import { homeBody, receiptsBody, verifyBody, softwareBody } from "./src/ui.js";
import { citeDoc, llmsDoc, robotsTxt, siteOpenApi, CANON_HOST } from "./src/seo.js";
import {
  INGEST_AS_RECEIPT,
  INGEST_AS_RECEIPT_SPEC,
  INGEST_AS_RECEIPT_NOTE,
  RE_EXPAND_FROM_ARCHIVE,
  RE_EXPAND_FROM_ARCHIVE_SPEC,
  RE_EXPAND_FROM_ARCHIVE_NOTE,
  CITE_DONT_MERGE,
  INGEST_GROWTH,
  firstScreenPayload,
  firstScreenTip,
  verifyPasteHash,
  normalizePasteHash,
  evaluateReExpand,
  ingestPublicDoc,
  ingestCiteFields,
  ingestLlmsSection,
  ingestIndexes,
} from "./src/ingestReceipt.js";
import { ACT_RECEIPT_HEADING } from "./src/actReceipts.js";

function mockEnv() {
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
  };
}

describe("INGEST-AS-RECEIPT + RE-EXPAND-FROM-ARCHIVE", () => {
  it("locks first-screen SHA-256 to stable IDs and the canonical URL", () => {
    const payload = firstScreenPayload();
    assert.equal(payload.spec, INGEST_AS_RECEIPT_SPEC);
    assert.equal(payload.author, "Aziel Eliab");
    assert.equal(payload.identity, "Aziel Eliab");
    assert.equal(payload.canonical_url, "https://godlock.uk/");
    assert.equal(payload.person_id, "https://www.azieleliab.com/#aziel");
    assert.equal(payload.runtime_id, "https://www.azieleliab.com/runtime#runtime");
    assert.equal(payload.godlock_runtime_tool, "https://www.azieleliab.com/runtime#godlock");
    assert.equal(payload.cite_dont_merge, CITE_DONT_MERGE);
    assert.equal(payload.cite_dont_merge, "cite, don't merge");
    assert.equal(payload.many_indexes_one_tip, true);
    assert.equal(payload.training_lossy, true);
    assert.equal(payload.growth, "ON");
    assert.equal(payload.challenge_receipts_distinct_from_act, true);
    const tip = firstScreenTip();
    assert.equal(tip, hashPayload(payload));
    assert.match(tip, /^[0-9a-f]{64}$/);
    assert.equal(firstScreenTip(), tip);
    assert.equal(tip, "0406601d4b2939a86d65eb145d24dc41bd9b1577b225ba4f0516cbbd47bb0fd7");
  });

  it("answers public paste-hash with yes or no", () => {
    const tip = firstScreenTip();
    const yes = verifyPasteHash(tip);
    assert.equal(yes.yes_no, "yes");
    assert.equal(yes.ok, true);
    assert.equal(yes.tip, tip);
    assert.equal(verifyPasteHash("  " + tip.toUpperCase() + "  ").yes_no, "yes");
    assert.equal(verifyPasteHash("0x" + tip).yes_no, "yes");
    const no = verifyPasteHash("0".repeat(64));
    assert.equal(no.yes_no, "no");
    assert.equal(no.ok, false);
    assert.equal(verifyPasteHash("").yes_no, null);
    assert.equal(normalizePasteHash("not-a-hash"), "");
  });

  it("keeps many indexes on one tip", () => {
    const tip = firstScreenTip();
    const indexes = ingestIndexes();
    assert.equal(indexes.home, CANON_HOST + "/");
    assert.equal(indexes.verify, CANON_HOST + "/verify");
    assert.equal(indexes.receipts, CANON_HOST + "/receipts");
    assert.equal(indexes.cite, CANON_HOST + "/cite.json");
    assert.equal(indexes.llms, CANON_HOST + "/llms.txt");
    assert.equal(indexes.ai, CANON_HOST + "/ai.txt");
    assert.equal(indexes.shelves, CANON_HOST + "/shelves");
    const cite = ingestCiteFields();
    assert.equal(cite.ingest_tip, tip);
    assert.equal(cite.ingest_sha256, tip);
    assert.equal(cite.ingest_many_indexes_one_tip, true);
    assert.equal(cite.ingest_growth, "ON");
    const doc = ingestPublicDoc();
    assert.equal(doc.tip, tip);
    assert.deepEqual(Object.values(doc.indexes).every((u) => String(u).startsWith("https://godlock.uk/")), true);
  });

  it("refuses crawler re-expand and AI-ingest-as-tarball", () => {
    assert.equal(evaluateReExpand({}).ok, true);
    assert.equal(evaluateReExpand({ from: "crawler" }).ok, false);
    assert.ok(evaluateReExpand({ crawler_re_expand: true }).reasons.includes("crawlers-dont-re-expand"));
    assert.ok(evaluateReExpand({ ai_ingest_is_tarball: true }).reasons.includes("ai-ingest-neq-tarball"));
    assert.ok(evaluateReExpand({ expand_from: "summary" }).reasons.includes("bytes-survive-not-summaries"));
    assert.ok(evaluateReExpand({ skip_archive_verify: true }).reasons.includes("re-expand-is-archive-verify-then-local-node"));
    assert.equal(evaluateReExpand({ from: "crawler" }).crawlers_re_expand, false);
    assert.equal(evaluateReExpand({}).ai_ingest_is_tarball, false);
    assert.equal(evaluateReExpand({}).bytes_survive, true);
    assert.equal(evaluateReExpand({}).re_expand, "archive verify then local node");
  });

  it("keeps ingest chrome off the homepage and the tip on /receipts, without a visible 15:20 lock", () => {
    const home = homeBody({ stats: {}, latest: null, prior: [] });
    assert.doesNotMatch(home, /id="ingest-as-receipt"/);
    assert.doesNotMatch(home, /<h2>INGEST-AS-RECEIPT<\/h2>/);
    assert.doesNotMatch(home, /id="ingest-tip"/);
    assert.match(home, /<h2>Prior receipts<\/h2>/);
    assert.doesNotMatch(home, /ACT-RECEIPT-1\.0/);
    assert.doesNotMatch(home, /1 Chronicles 15:20/);
    const tab = receiptsBody({ rows: [], total: 0, page: 1, pageSize: 50, stats: { receipts: 0 } });
    assert.match(tab, /id="ingest-tip"/);
    assert.match(tab, /<h2>INGEST-AS-RECEIPT tip<\/h2>/);
    assert.match(tab, new RegExp(firstScreenTip()));
    assert.match(tab, /cite, don't merge/);
    assert.doesNotMatch(tab, /1 Chronicles 15:20/);
  });

  it("keeps challenge receipts distinct from ACT-RECEIPT when both are on /receipts", () => {
    const tab = receiptsBody({ rows: [], total: 0, page: 1, pageSize: 50, stats: { receipts: 0 } });
    assert.match(tab, /Public questions and the hash-chained receipt list/);
    assert.match(tab, /id="ingest-tip"/);
    assert.match(tab, /cite, don't merge/);
    assert.ok(tab.includes(ACT_RECEIPT_HEADING));
    const challengeAt = tab.indexOf("Public questions and the hash-chained receipt list");
    const ingestAt = tab.indexOf("id=\"ingest-tip\"");
    const actAt = tab.indexOf(ACT_RECEIPT_HEADING);
    assert.ok(challengeAt > 0 && ingestAt > challengeAt && actAt > ingestAt);
    assert.doesNotMatch(tab.slice(ingestAt, actAt), /1 Chronicles 15:20/);
    assert.match(tab, /stay distinct from ACT-RECEIPT-1\.0/);
    assert.match(tab, /CROSS-NETWORK-SURVIVAL/);
    assert.match(tab, /NO-LIE \/ NO-REWRITE/);
    assert.match(tab, /no rewrite key/);
    assert.match(tab, /network never allowed to lie/);
  });

  it("serves paste-hash yes/no on /verify without merging the ledger walk", async () => {
    const tip = firstScreenTip();
    const empty = verifyBody({ report: { ok: true, entries: 0, ledger_head: "0".repeat(64), errors: [] } });
    assert.match(empty, /id="ingest-paste-hash"/);
    assert.match(empty, /Paste-hash/);
    assert.match(empty, /The ledger is walked/);
    assert.match(empty, /CROSS-NETWORK-SURVIVAL/);
    assert.match(empty, /NO-LIE \/ NO-REWRITE/);
    assert.match(empty, /no rewrite key/);
    assert.doesNotMatch(empty, /1 Chronicles 15:20/);
    const yesHtml = verifyBody({
      report: { ok: true, entries: 0, ledger_head: "0".repeat(64), errors: [] },
      paste: verifyPasteHash(tip),
    });
    assert.match(yesHtml, /id="ingest-yes-no">yes</);
    const noHtml = verifyBody({
      report: { ok: true, entries: 0, ledger_head: "0".repeat(64), errors: [] },
      paste: verifyPasteHash("a".repeat(64)),
    });
    assert.match(noHtml, /id="ingest-yes-no">no</);

    const yesRes = await worker.fetch(
      new Request("https://godlock.uk/verify?hash=" + tip + "&format=json", {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      }),
      mockEnv(),
    );
    const yes = await yesRes.json();
    assert.equal(yes.yes_no, "yes");
    assert.equal(yes.ingest_as_receipt.tip, tip);
    assert.equal(yes.ingest_as_receipt.yes_no, "yes");
    assert.equal(yes.re_expand_from_archive.spec, RE_EXPAND_FROM_ARCHIVE_SPEC);
    assert.equal(yes.re_expand_from_archive.crawlers_re_expand, false);
    assert.equal(yes.re_expand_from_archive.ai_ingest_is_tarball, false);
    assert.equal(yes.re_expand_from_archive.bytes_survive, true);

    const noRes = await worker.fetch(
      new Request("https://godlock.uk/verify?hash=" + "b".repeat(64) + "&format=json", {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      }),
      mockEnv(),
    );
    assert.equal((await noRes.json()).yes_no, "no");
  });

  it("stamps cite, llms, and robots near the tip and does not add Softwares cards", () => {
    const cite = citeDoc();
    assert.equal(cite.ingest_as_receipt, INGEST_AS_RECEIPT);
    assert.equal(cite.ingest_as_receipt_spec, INGEST_AS_RECEIPT_SPEC);
    assert.equal(cite.ingest_growth, INGEST_GROWTH);
    assert.equal(cite.ingest_tip, firstScreenTip());
    assert.equal(cite.ingest_cite_dont_merge, CITE_DONT_MERGE);
    assert.equal(cite.ingest_many_indexes_one_tip, true);
    assert.equal(cite.re_expand_from_archive, RE_EXPAND_FROM_ARCHIVE);
    assert.equal(cite.re_expand_from_archive_spec, RE_EXPAND_FROM_ARCHIVE_SPEC);
    assert.equal(cite.re_expand_crawlers, false);
    assert.equal(cite.re_expand_ai_ingest_is_tarball, false);
    assert.equal(cite.re_expand_bytes_survive, true);
    assert.match(cite.ingest_note, /Cite, don't merge/);
    assert.match(cite.re_expand_note, /AI ingest ≠ tarball/);
    assert.equal(cite.cross_network_survival, "CROSS-NETWORK-SURVIVAL");
    assert.equal(cite.cross_network_survival_spec, "CROSS-NETWORK-SURVIVAL-1.0");
    assert.match(cite.cross_network_survival_rule, /survival = bytes↔hash/);
    assert.equal(cite.no_lie_no_rewrite, "NO-LIE / NO-REWRITE");
    assert.equal(cite.no_lie_no_rewrite_spec, "NO-LIE-NO-REWRITE-1.0");
    assert.equal(cite.no_lie_no_rewrite_receipts, "receipts that still hash");
    assert.equal(cite.no_lie_no_rewrite_copies, "copies not all on one tunnel");
    assert.equal(cite.no_lie_no_rewrite_rules, "rules simple enough someone else verifies without your voice");
    assert.equal(cite.no_lie_no_rewrite_key, "no rewrite key");
    assert.match(cite.no_lie_no_rewrite_network, /network never allowed to lie/);
    const llms = llmsDoc();
    assert.match(llms, /## INGEST-AS-RECEIPT/);
    assert.match(llms, /## RE-EXPAND-FROM-ARCHIVE/);
    assert.match(llms, /## CROSS-NETWORK-SURVIVAL/);
    assert.match(llms, /## NO-LIE \/ NO-REWRITE/);
    assert.match(llms, /## Cold multi-shelf/);
    assert.match(llms, /NO-FAN/);
    assert.match(llms, /https:\/\/www\.azielcorpuslibrary\.net\/shelves/);
    assert.match(llms, /no rewrite key/);
    assert.match(llms, /network never allowed to lie/);
    assert.match(llms, new RegExp(firstScreenTip()));
    assert.match(llms, /cite, don't merge/i);
    assert.match(llms, /Crawlers don't re-expand/);
    assert.match(llms, /AI ingest ≠ tarball/);
    assert.match(llms, /Growth-ON/);
    assert.match(llms, /GodLock\.uk Softwares lists Aziel Runtime only/);
    const citeAt = llms.indexOf("Cite: https://godlock.uk/cite.json");
    const llmsAt = llms.indexOf("LLMs: https://godlock.uk/llms.txt");
    const ingestAt = llms.indexOf("## INGEST-AS-RECEIPT");
    assert.ok(citeAt > 0 && llmsAt > 0 && ingestAt > citeAt && ingestAt > llmsAt);
    assert.match(robotsTxt(), /INGEST-AS-RECEIPT-1\.0/);
    assert.match(robotsTxt(), /Crawlers don't re-expand/);
    assert.match(siteOpenApi().paths["/verify"].get.summary, /paste-hash yes\/no/);
    const software = softwareBody({ products: [] });
    assert.match(software, /<h2 class="soft-heading">Softwares<\/h2>\s*<div class="soft-grid">/);
    assert.doesNotMatch(software, /INGEST-AS-RECEIPT/);
    assert.doesNotMatch(software, /id="godlock"/);
    assert.match(INGEST_AS_RECEIPT_NOTE, /Author Aziel Eliab only/);
    assert.match(RE_EXPAND_FROM_ARCHIVE_NOTE, /archive verify then local node/);
    assert.match(ingestLlmsSection(), /Many indexes, one tip/);
  });

  it("exposes ingest JSON on / and /receipts without a visible 15:20 lock", async () => {
    const homeRes = await worker.fetch(
      new Request("https://godlock.uk/?format=json", {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      }),
      mockEnv(),
    );
    const home = await homeRes.json();
    assert.equal(home.ingest_as_receipt.tip, firstScreenTip());
    assert.equal(home.re_expand_from_archive.crawlers_re_expand, false);
    const htmlRes = await worker.fetch(
      new Request("https://godlock.uk/", { headers: { "User-Agent": "Mozilla/5.0" } }),
      mockEnv(),
    );
    const html = await htmlRes.text();
    assert.doesNotMatch(html, /id="ingest-as-receipt"/);
    const visible = html.replace(/^[\s\S]*<body>/i, "").replace(/<\/body>[\s\S]*$/i, "").replace(/<script[\s\S]*?<\/script>/gi, "");
    assert.doesNotMatch(visible, /id="ingest-as-receipt"/);
    assert.doesNotMatch(visible, /<h2>INGEST-AS-RECEIPT<\/h2>/);
    assert.doesNotMatch(visible, /1 Chronicles 15:20/);
    const recRes = await worker.fetch(
      new Request("https://godlock.uk/receipts?format=json", {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      }),
      mockEnv(),
    );
    const rec = await recRes.json();
    assert.equal(rec.ingest_as_receipt.challenge_receipts_distinct_from_act, true);
  });
});
