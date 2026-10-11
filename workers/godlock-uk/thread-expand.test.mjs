import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hashPayload, canonicalJson, ZERO } from "./src/ledger.js";
import { receiptLedgerAndProof, verifyForward, _resetProofCache, HEAD_SQL, TAIL_SQL, BY_RECEIPT_SQL } from "./src/receiptProof.js";
import { threadView, threadExpandScript, priorReceiptItems } from "./src/ui.js";

function chain(payloads) {
  const rows = []; let prev = ZERO;
  payloads.forEach((payload, i) => {
    const e = { sequence: i + 1, timestamp_utc: "2026-10-0" + (i + 1) + "T00:00:00.000Z", action: "submit", payload, previous_hash: prev };
    const entry_hash = hashPayload(e);
    rows.push({ ...e, payload_json: canonicalJson(payload), entry_hash });
    prev = entry_hash;
  });
  return rows;
}

function fakeDb(rows, log) {
  return { prepare(sql) {
    let args = [];
    const run = () => {
      log.push(sql);
      if (sql === HEAD_SQL) return rows.length ? rows[rows.length - 1] : null;
      if (sql === TAIL_SQL) return rows.filter((r) => r.sequence > args[0]);
      if (sql === BY_RECEIPT_SQL) return rows.filter((r) => JSON.parse(r.payload_json).receipt_id === args[0]);
      if (sql.startsWith("CREATE INDEX")) return null;
      throw new Error("unexpected sql " + sql);
    };
    const st = { bind(...a) { args = a; return st; }, async first() { return run(); }, async all() { return { results: run() }; }, async run() { run(); return {}; } };
    return st;
  } };
}

describe("receipt proof", () => {
  const payloads = () => [{ receipt_id: "aaa" }, { receipt_id: "bbb111", note: "mentions aaa" }, { receipt_id: "bbb111" }, { receipt_id: "ccc" }];
  it("verifies, seals at the head, exact receipt_id match only", async () => {
    _resetProofCache();
    const rows = chain(payloads()); const log = [];
    const { rows: mine, proof } = await receiptLedgerAndProof({ DB: fakeDb(rows, log) }, "aaa");
    assert.equal(mine.length, 1, "substring mention in bbb111 must not match");
    assert.equal(proof.status, "verified");
    assert.equal(proof.receipt_hash, rows[0].entry_hash);
    assert.equal(proof.prev_hash, ZERO);
    assert.equal(proof.seal, rows[3].entry_hash);
    assert.match(proof.not_signed, /Not signed/);
    assert.ok(!log.some((q) => /LIKE|instr\(/i.test(q)));
  });
  it("second request uses the cached checkpoint: probe only, no tail scan", async () => {
    _resetProofCache();
    const rows = chain(payloads()); const log = [];
    const env = { DB: fakeDb(rows, log) };
    await receiptLedgerAndProof(env, "bbb111");
    log.length = 0;
    const { proof } = await receiptLedgerAndProof(env, "bbb111");
    assert.equal(proof.status, "verified");
    assert.equal(log.filter((q) => q === TAIL_SQL).length, 0);
    assert.equal(log.filter((q) => q === HEAD_SQL).length, 1);
  });
  it("new rows: verifies only from the checkpoint forward", async () => {
    _resetProofCache();
    const p = payloads(); const rows = chain(p); const env = { DB: fakeDb(rows, []) };
    await receiptLedgerAndProof(env, "aaa");
    const more = chain(p.concat([{ receipt_id: "ddd" }]));
    rows.push(more[4]);
    const r = verifyForward({ seq: 4, hash: rows[3].entry_hash, count: 4, at: null }, [rows[4]], rows[4]);
    assert.equal(r.ok, true);
    const { proof } = await receiptLedgerAndProof(env, "ddd");
    assert.equal(proof.status, "verified"); assert.equal(proof.sealed_seq, 5);
  });
  it("missing receipt fails closed", async () => {
    _resetProofCache();
    const { proof } = await receiptLedgerAndProof({ DB: fakeDb(chain(payloads()), []) }, "zzz999");
    assert.equal(proof.status, "missing"); assert.equal(proof.seal, null);
  });
  it("tampered receipt row is unverified with no seal", async () => {
    _resetProofCache();
    const rows = chain(payloads());
    rows[1] = { ...rows[1], payload_json: canonicalJson({ receipt_id: "bbb111", x: 1 }) };
    const { proof } = await receiptLedgerAndProof({ DB: fakeDb(rows, []) }, "bbb111");
    assert.equal(proof.status, "unverified"); assert.equal(proof.seal, null);
  });
  it("partial read (fewer rows than head expects) fails closed", () => {
    const rows = chain(payloads());
    const r = verifyForward({ seq: 0, hash: ZERO, count: 0, at: null }, rows.slice(0, 2), rows[3]);
    assert.equal(r.ok, false); assert.ok(r.errors.some((e) => /partial read/.test(e)));
  });
  it("head rewritten under a cached checkpoint forces full re-verify and fails", async () => {
    _resetProofCache();
    const rows = chain(payloads()); const env = { DB: fakeDb(rows, []) };
    await receiptLedgerAndProof(env, "aaa");
    rows[3] = { ...rows[3], entry_hash: "f".repeat(64) };
    const { proof } = await receiptLedgerAndProof(env, "aaa");
    assert.equal(proof.status, "unverified"); assert.equal(proof.seal, null);
  });
  it("row below the checkpoint rewritten with recomputed hash, head and count unchanged: unverified", async () => {
    _resetProofCache();
    const rows = chain(payloads()); const env = { DB: fakeDb(rows, []) };
    const first = await receiptLedgerAndProof(env, "aaa");
    assert.equal(first.proof.status, "verified");
    const forged = { sequence: 1, timestamp_utc: rows[0].timestamp_utc, action: "submit", payload: { receipt_id: "aaa", forged: true }, previous_hash: ZERO };
    rows[0] = { ...forged, payload_json: canonicalJson(forged.payload), entry_hash: hashPayload(forged) };
    const { proof } = await receiptLedgerAndProof(env, "aaa");
    assert.equal(proof.status, "unverified"); assert.equal(proof.seal, null);
  });
  it("checkpoint stores a verified hash for every seq", () => {
    const rows = chain(payloads());
    const r = verifyForward({ seq: 0, hash: ZERO, count: 0, at: null, hashes: [] }, rows, rows[3]);
    assert.deepEqual(r.checkpoint.hashes, rows.map((x) => x.entry_hash));
  });
  it("migration file holds the receipt_id index and wrangler points at it", async () => {
    const fs = await import("node:fs");
    assert.match(fs.readFileSync(new URL("./migrations/0001_ledger_receipt_id_index.sql", import.meta.url), "utf8"), /idx_ledger_receipt_id/);
    assert.match(fs.readFileSync(new URL("./wrangler.toml", import.meta.url), "utf8"), /migrations_dir = "migrations"/);
  });
  it("ledger read failure is missing", async () => {
    _resetProofCache();
    const { proof } = await receiptLedgerAndProof({ DB: { prepare() { throw new Error("D1 down"); } } }, "aaa");
    assert.equal(proof.status, "missing");
  });
});

describe("thread expand view", () => {
  it("fetch failure shows receipt missing, no reasoning invented", () => {
    const v = threadView(null);
    assert.equal(v.status, "missing"); assert.equal(v.reasoning.length, 0);
  });
  it("verified proof renders hashes, seal and verify link", () => {
    const v = threadView({ ok: true, receipt: { summary: "S", explanation: "E" }, proof: { status: "verified", receipt_hash: "h1", prev_hash: "h0", seal: "h9", timestamp_utc: "t", verify_url: "/verify" } });
    assert.equal(v.status, "verified");
    assert.deepEqual(v.reasoning, [["Summary", "S"], ["Reasoning", "E"]]);
    const m = Object.fromEntries(v.receipt);
    assert.equal(m["Seal (verified ledger head)"], "h9"); assert.equal(m.Verify, "/verify");
  });
  it("verified without a seal is downgraded", () => {
    const v = threadView({ ok: true, receipt: { summary: "S" }, proof: { status: "verified", receipt_hash: "h1", prev_hash: "h0", seal: null } });
    assert.equal(v.status, "unverified");
  });
  it("unverified proof never shows a seal", () => {
    const v = threadView({ ok: true, receipt: {}, proof: { status: "unverified", receipt_hash: "h1", prev_hash: "h0", seal: "h9" } });
    assert.equal(Object.fromEntries(v.receipt)["Seal (verified ledger head)"], "missing");
  });
  it("prior rows render a drop-down and the page script parses", () => {
    const html = priorReceiptItems([{ id: "abc", created_utc: "2026-10-01T00:00:00Z", challenge_text: "q" }]);
    assert.match(html, /<details class="thread" data-receipt-id="abc">/);
    const js = threadExpandScript().replace(/^<script>|<\/script>$/g, "");
    assert.doesNotThrow(() => new Function(js));
    assert.doesNotMatch(threadExpandScript(), /signed by|signature/i);
  });
  it("verify link is hardcoded, never taken from the server", () => {
    const v = threadView({ ok: true, receipt: { summary: "S" }, proof: { status: "verified", receipt_hash: "h1", prev_hash: "h0", seal: "h9", verify_url: "javascript:alert(1)" } });
    assert.equal(Object.fromEntries(v.receipt).Verify, "/verify");
    assert.match(threadExpandScript(), /a\.href="\/verify"/);
  });
});
