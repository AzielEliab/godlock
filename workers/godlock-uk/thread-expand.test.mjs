import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hashPayload, canonicalJson, ZERO } from "./src/ledger.js";
import { buildReceiptProof } from "./src/receiptProof.js";
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

describe("receipt proof", () => {
  const rows = chain([{ id: "aaa" }, { id: "bbb111" }, { id: "ccc" }]);
  it("verifies and seals at the ledger head", () => {
    const p = buildReceiptProof(rows, "bbb111");
    assert.equal(p.status, "verified");
    assert.equal(p.receipt_hash, rows[1].entry_hash);
    assert.equal(p.prev_hash, rows[0].entry_hash);
    assert.equal(p.seal, rows[2].entry_hash);
    assert.match(p.not_signed, /Not signed/);
  });
  it("missing receipt fails closed", () => {
    const p = buildReceiptProof(rows, "zzz999");
    assert.equal(p.status, "missing"); assert.equal(p.seal, null);
  });
  it("tampered payload is unverified with no seal", () => {
    const bad = rows.map((r) => ({ ...r }));
    bad[1].payload_json = canonicalJson({ id: "bbb111", x: 1 });
    const p = buildReceiptProof(bad, "bbb111");
    assert.equal(p.status, "unverified"); assert.equal(p.seal, null);
  });
  it("tamper elsewhere in the chain also blocks the seal", () => {
    const bad = rows.map((r) => ({ ...r })); bad[2].previous_hash = ZERO;
    assert.equal(buildReceiptProof(bad, "bbb111").status, "unverified");
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
});
