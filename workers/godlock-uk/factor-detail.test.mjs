import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scoreDebateText } from "./src/debateScore.js";
import { factorDetail, storedFactorView, factorDetailSealed, ledgerRescoreLines, reasoningSealed, challengeSealed, NOT_STORED, NOT_SEALED_LABEL, FACTOR_KEYS } from "./src/factorDetail.js";
import { hashPayload, canonicalJson, ZERO } from "./src/ledger.js";
import { receiptLedgerAndProof, _resetProofCache, HEAD_SQL, TAIL_SQL, BY_RECEIPT_SQL } from "./src/receiptProof.js";
import { threadView, threadExpandScript } from "./src/ui.js";

const TEXT = "Functionally specified digital information joined to a translation reader is the steel class. Pretty spirals are not a proof. Probability given evidence suggests design.";

describe("factor detail at write time", () => {
  const review = scoreDebateText(TEXT, "");
  const fd = factorDetail(review);
  it("values are exactly the checker's factors", () => {
    for (const k of fd.cycle_factors) assert.equal(fd.factors[k].value, review.triad.factors[k]);
    assert.equal(fd.combined, review.triad.combined);
  });
  it("pairing products reproduce combined as the mean", () => {
    const n = fd.cycle_factors.length;
    assert.equal(fd.pairings.length, n * n);
    assert.equal(fd.pairings.length, review.triad.pairing_count);
    const mean = fd.pairings.reduce((a, p) => a + p.product, 0) / fd.pairings.length;
    assert.ok(Math.abs(mean - fd.combined) < 0.00005, mean + " vs " + fd.combined);
  });
  it("checker reasons are copied verbatim, not invented", () => {
    assert.deepEqual(fd.factors.spre.checker.factors, review.spre.factors);
    assert.equal(fd.factors.spre.checker.band, review.spre.band);
    assert.deepEqual(fd.factors.truth_formula.checker.factors, review.truth_formula.factors);
    assert.equal(fd.factors.spre.applicability_reason, review.applicability.spre.reason);
  });
  it("every omitted factor carries the checker's reason and is not scored as 0", () => {
    const omittedKeys = fd.omitted.map((o) => o.factor);
    for (const k of FACTOR_KEYS) assert.ok(fd.cycle_factors.includes(k) !== omittedKeys.includes(k));
    const clce = fd.omitted.find((o) => o.factor === "clce");
    assert.equal(clce.reason, review.applicability.clce.reason);
    assert.match(fd.omitted_note, /not scored as 0/);
  });
  it("no triad means no detail", () => assert.equal(factorDetail({}), null));
});

function mkDetail(vals) {
  const factors = {};
  for (const k of Object.keys(vals)) factors[k] = { value: vals[k] };
  return { schema: "godlock.factor_detail.v1", cycle_factors: Object.keys(vals), factors, pairings: [], omitted: [] };
}

describe("stored factor view (read time, no recompute)", () => {
  it("old receipt without stored detail says so", () => {
    const v = storedFactorView([{ reason: "initial", triad_json: JSON.stringify({ factors: { spre: 0.1 } }) }]);
    assert.equal(v.factor_detail, null); assert.equal(v.factor_detail_note, NOT_STORED);
  });
});

describe("drop-down view", () => {
  const fd = factorDetail(scoreDebateText(TEXT, ""));
  const base = { ok: true, proof: { status: "missing" } };
  it("renders values, pairings, combined and omitted reasons", () => {
    const v = threadView({ ...base, receipt: { summary: "S", factor_detail: fd, rescore_factor_changes: [] } });
    const m = new Map(v.factors);
    assert.equal(m.get("Factor spre"), String(fd.factors.spre.value));
    assert.ok([...m.keys()].some((k) => k.startsWith("Pairing bayesian × spre")));
    assert.match(m.get("Omitted clce"), /Not scored as 0/);
    assert.equal(v.note, "Hash-linked and sealed. Not signed.");
  });
  it("old receipts show the not-stored line", () => {
    const v = threadView({ ...base, receipt: { summary: "S" } });
    assert.deepEqual(v.factors, [["Seal coverage", NOT_SEALED_LABEL], ["Per-factor", "per-factor detail not stored for this receipt"]]);
  });
  it("rescore changes render with signed deltas", () => {
    const v = threadView({ ...base, receipt: { factor_detail: null, rescore_factor_changes: [{ ledger_seq: 7, ledger_timestamp_utc: "T7", created_utc: "IGNORED", changes: [{ factor: "spre", before: 0.15, after: 0.3, delta: 0.15 }] }] } });
    assert.deepEqual(v.factors.find((x) => x[0].startsWith("Rescore")), ["Rescore T7 (ledger #7)", "spre 0.15 → 0.3 (+0.15) (stored data, not covered)"]);
  });
  it("script uses textContent only and still parses", () => {
    const js = threadExpandScript();
    assert.doesNotMatch(js, /innerHTML|insertAdjacentHTML|document\.write/);
    assert.doesNotThrow(() => new Function(js.replace(/^<script>|<\/script>$/g, "")));
  });
});

function fakeDb(rows) {
  return { prepare(sql) {
    let args = [];
    const run = () => {
      if (sql === HEAD_SQL) return rows[rows.length - 1];
      if (sql === TAIL_SQL) return rows.filter((r) => r.sequence > args[0]);
      if (sql === BY_RECEIPT_SQL) return rows.filter((r) => JSON.parse(r.payload_json).receipt_id === args[0]);
      return null;
    };
    const st = { bind(...a) { args = a; return st; }, async first() { return run(); }, async all() { return { results: run() }; }, async run() { return {}; } };
    return st;
  } };
}
function ledgerWith(payloads) {
  const rows = []; let prev = ZERO;
  payloads.forEach(([action, payload], i) => {
    const e = { sequence: i + 1, timestamp_utc: "t" + i, action, payload, previous_hash: prev };
    const entry_hash = hashPayload(e);
    rows.push({ ...e, payload_json: canonicalJson(payload), entry_hash }); prev = entry_hash;
  });
  return rows;
}

describe("factor detail seal coverage", () => {
  const fd = factorDetail(scoreDebateText(TEXT, ""));
  const stored = () => [{ reason: "initial", triad_json: JSON.stringify({ factors: {}, factor_detail: fd }) }];
  const rows = () => ledgerWith([["SUBMIT", { receipt_id: "r1", factor_detail_sha256: hashPayload(fd) }], ["SCORE", { receipt_id: "r1" }]]);
  it("covered when the row matches the checkpoint and the sha matches", async () => {
    _resetProofCache();
    const { rows: lr, proof } = await receiptLedgerAndProof({ DB: fakeDb(rows()) }, "r1");
    assert.equal(proof.status, "verified");
    assert.equal(factorDetailSealed(storedFactorView(stored()).factor_detail, lr, proof), true);
    const v = threadView({ ok: true, proof, receipt: { factor_detail: fd, factor_detail_sealed: true } });
    assert.match(v.factors[0][1], /covered by the seal/); assert.doesNotMatch(v.factors[0][1], /not covered/);
  });
  it("triad_json edited after the write: not covered, sealed false", async () => {
    _resetProofCache();
    const { rows: lr, proof } = await receiptLedgerAndProof({ DB: fakeDb(rows()) }, "r1");
    const s = stored(); const snap = JSON.parse(s[0].triad_json);
    snap.factor_detail.factors.spre.value = 0.99; s[0].triad_json = JSON.stringify(snap);
    const sealed = factorDetailSealed(storedFactorView(s).factor_detail, lr, proof);
    assert.equal(sealed, false);
    const v = threadView({ ok: true, proof, receipt: { factor_detail: snap.factor_detail, factor_detail_sealed: sealed } });
    assert.equal(v.factors[0][1], NOT_SEALED_LABEL);
  });
  it("old SUBMIT without factor_detail_sha256 is not covered", async () => {
    _resetProofCache();
    const old = ledgerWith([["SUBMIT", { receipt_id: "r1" }]]);
    const { rows: lr, proof } = await receiptLedgerAndProof({ DB: fakeDb(old) }, "r1");
    assert.equal(factorDetailSealed(fd, lr, proof), false);
  });
  it("unverified proof is never covered", () => {
    assert.equal(factorDetailSealed(fd, rows(), { status: "unverified", entries: [] }), false);
  });
  it("pairing products display rounded to 4 places", () => {
    const v = threadView({ ok: true, proof: {}, receipt: { factor_detail: { cycle_factors: [], factors: {}, pairings: [{ i: "a", j: "b", product: 0.123456789 }], omitted: [] } } });
    assert.deepEqual(v.factors.find((x) => x[0] === "Pairing a × b"), ["Pairing a × b", "0.1235"]);
  });
});

describe("normalized detail and rescore sealing", () => {
  it("factorDetail is JSON-normalized: no undefined fields, hash survives a store round trip", () => {
    const review = scoreDebateText(TEXT, "");
    review.spre.band = undefined; // checker leaves a nested field undefined
    const fd = factorDetail(review);
    const roundTrip = JSON.parse(JSON.stringify({ factor_detail: fd })).factor_detail;
    assert.deepEqual(roundTrip, fd);
    assert.equal(hashPayload(roundTrip), hashPayload(fd));
    assert.ok(!("band" in fd.factors.spre.checker));
  });
});

describe("rescore lines are ordered and paired by the hashed ledger", () => {
  const d0 = mkDetail({ spre: 0.1 });
  const d1 = mkDetail({ spre: 0.2 });
  const d2 = mkDetail({ spre: 0.5 });
  const L = (extra = []) => ledgerWith([
    ["SUBMIT", { receipt_id: "r1", factor_detail_sha256: hashPayload(d0) }],
    ["RESCORE", { receipt_id: "r1", rescore_id: "a", reason: "supersedes", factor_detail_sha256: hashPayload(d1) }],
    ...extra,
    ["RESCORE", { receipt_id: "r1", rescore_id: "b", reason: "same-succession", factor_detail_sha256: hashPayload(d2) }],
  ]);
  const H = (tA = "t1", tB = "t2", omit) => [
    { id: "i", reason: "initial", created_utc: "t0", triad_json: JSON.stringify({ factor_detail: d0 }) },
    { id: "a", reason: "x", created_utc: tA, triad_json: JSON.stringify({ factor_detail: d1 }) },
    { id: "b", reason: "x", created_utc: tB, triad_json: JSON.stringify({ factor_detail: d2 }) },
  ].filter((h) => h.id !== omit);
  async function run(ledger, hist) {
    _resetProofCache();
    const { rows, proof } = await receiptLedgerAndProof({ DB: fakeDb(ledger) }, "r1");
    return ledgerRescoreLines(hist, rows, proof, "r1");
  }
  it("baseline: both covered, ledger order, ledger timestamps and reasons", async () => {
    const lines = await run(L(), H());
    assert.deepEqual(lines.map((l) => [l.id, l.ledger_seq, l.sealed, l.reason]), [["a", 2, true, "supersedes"], ["b", 3, true, "same-succession"]]);
    assert.equal(lines[0].ledger_timestamp_utc, "t1");
    assert.deepEqual(lines[1].changes, [{ factor: "spre", before: 0.2, after: 0.5, delta: 0.3 }]);
  });
  it("swapped created_utc: original ledger order and correct deltas", async () => {
    const lines = await run(L(), H("t9", "t0"));
    assert.deepEqual(lines.map((l) => l.id), ["a", "b"]);
    assert.deepEqual(lines[0].changes, [{ factor: "spre", before: 0.1, after: 0.2, delta: 0.1 }]);
    assert.deepEqual(lines[1].changes, [{ factor: "spre", before: 0.2, after: 0.5, delta: 0.3 }]);
    assert.ok(lines.every((l) => l.sealed));
  });
  it("history order is irrelevant", async () => {
    const lines = await run(L(), H().reverse());
    assert.deepEqual(lines.map((l) => l.id), ["a", "b"]);
  });
  it("missing stored row for the middle rescore: it and the next line are not covered", async () => {
    const lines = await run(L(), H("t1", "t2", "a"));
    assert.equal(lines.find((l) => l.id === "a").sealed, false);
    assert.equal(lines.find((l) => l.id === "b").sealed, false);
    assert.equal(lines.find((l) => l.id === "b").changes, null);
  });
  it("stored rescore with no ledger row: listed, not covered", async () => {
    const hist = H().concat([{ id: "ghost", reason: "x", created_utc: "t5", triad_json: JSON.stringify({ factor_detail: d2 }) }]);
    const g = (await run(L(), hist)).find((l) => l.id === "ghost");
    assert.equal(g.sealed, false); assert.equal(g.ledger_seq, null);
  });
  it("intervening RESCORE for this receipt: b pairs with the intervening row, not with a", async () => {
    const dx = mkDetail({ spre: 0.9 });
    const lines = await run(L([["RESCORE", { receipt_id: "r1", rescore_id: "x", factor_detail_sha256: hashPayload(dx) }]]), H());
    const b = lines.find((l) => l.id === "b");
    assert.equal(b.sealed, false, "x has no stored detail, so the link into b is not covered");
    assert.equal(b.changes, null);
  });
  it("label uses the ledger timestamp, never created_utc", async () => {
    _resetProofCache();
    const { rows, proof } = await receiptLedgerAndProof({ DB: fakeDb(L()) }, "r1");
    const lines = ledgerRescoreLines(H("FAKE1", "FAKE2"), rows, proof, "r1");
    const v = threadView({ ok: true, proof, receipt: { rescore_factor_changes: lines } });
    const labels = v.factors.filter((x) => x[0].startsWith("Rescore")).map((x) => x[0]);
    assert.deepEqual(labels, ["Rescore t1 (ledger #2)", "Rescore t2 (ledger #3)"]);
    assert.ok(!labels.join().includes("FAKE"));
  });
});

describe("reasoning seal", () => {
  const row = { id: "r1", created_utc: "c", text_sha256: "x", label: "Triad", summary: "S", explanation: "E", score_before: 50, score_after: 31, residual: 69, isolated: 0 };
  const hash = (r) => hashPayload({ id: r.id, created_utc: r.created_utc, text_sha256: r.text_sha256, label: r.label, summary: r.summary, explanation: r.explanation, score_before: r.score_before, score_after: r.score_after, residual: r.residual, isolated: r.isolated });
  it("covered when receipt row hashes to sealed SUBMIT content_sha256", async () => {
    _resetProofCache();
    const { rows, proof } = await receiptLedgerAndProof({ DB: fakeDb(ledgerWith([["SUBMIT", { receipt_id: "r1", content_sha256: hash(row) }]])) }, "r1");
    assert.equal(reasoningSealed(row, rows, proof, hash), true);
    assert.equal(reasoningSealed({ ...row, explanation: "edited" }, rows, proof, hash), false);
    const v = threadView({ ok: true, proof, receipt: { summary: "S", reasoning_sealed: false } });
    assert.match(v.reasoning.find((x) => x[0] === "Reasoning seal")[1], /not covered/);
  });
});

describe("ledger-form tamper tests", () => {
  const d0 = mkDetail({ spre: 0.1 });
  const d1 = mkDetail({ spre: 0.2 });
  const H = (d1stored) => [
    { id: "i", reason: "initial", triad_json: JSON.stringify({ factor_detail: d0 }) },
    { id: "a", reason: "x", triad_json: JSON.stringify({ factor_detail: d1stored }) },
  ];
  async function run(submitSha, hist) {
    _resetProofCache();
    const ledger = ledgerWith([
      ["SUBMIT", { receipt_id: "r1", factor_detail_sha256: submitSha }],
      ["RESCORE", { receipt_id: "r1", rescore_id: "a", factor_detail_sha256: hashPayload(d1) }],
    ]);
    const { rows, proof } = await receiptLedgerAndProof({ DB: fakeDb(ledger) }, "r1");
    assert.equal(proof.status, "verified");
    return { lines: ledgerRescoreLines(hist, rows, proof, "r1"), proof };
  }
  it("edited rescore factor_detail, ledger row kept: not covered", async () => {
    const { lines, proof } = await run(hashPayload(d0), H(mkDetail({ spre: 0.99 })));
    assert.equal(lines[0].sealed, false);
    const v = threadView({ ok: true, proof, receipt: { rescore_factor_changes: lines } });
    assert.match(v.factors.find((x) => x[0].startsWith("Rescore"))[1], /\(stored data, not covered\)$/);
  });
  it("previous (SUBMIT) detail unsealed, own detail sealed: not covered", async () => {
    const { lines } = await run("0".repeat(64), H(d1));
    assert.equal(lines[0].sealed, false);
  });
  it("control: both sealed is covered", async () => {
    const { lines } = await run(hashPayload(d0), H(d1));
    assert.equal(lines[0].sealed, true);
  });
});

describe("question seal", () => {
  const q = "Is the steel class a proof?";
  async function proofFor(textSha) {
    _resetProofCache();
    return receiptLedgerAndProof({ DB: fakeDb(ledgerWith([["SUBMIT", { receipt_id: "r1", text_sha256: textSha }]])) }, "r1");
  }
  it("covered when sha256(challenge_text) matches the sealed text_sha256", async () => {
    const { sha256hex } = await import("./src/ledger.js");
    const { rows, proof } = await proofFor(sha256hex(q));
    assert.equal(challengeSealed(q, rows, proof), true);
    const v = threadView({ ok: true, proof, receipt: { summary: "S", challenge_text: q, challenge_sealed: true } });
    assert.match(v.reasoning.find((x) => x[0] === "Question seal")[1], /covered by the seal/);
  });
  it("edited challenge_text: stored data, not covered", async () => {
    const { sha256hex } = await import("./src/ledger.js");
    const { rows, proof } = await proofFor(sha256hex(q));
    assert.equal(challengeSealed(q + " edited", rows, proof), false);
    assert.equal(challengeSealed(null, rows, proof), false);
    const v = threadView({ ok: true, proof, receipt: { summary: "S", challenge_text: q + " edited", challenge_sealed: false } });
    assert.equal(v.reasoning.find((x) => x[0] === "Question seal")[1], "Question text is stored data, not covered by the seal.");
  });
  it("unverified proof: not covered", () => {
    assert.equal(challengeSealed(q, [], { status: "unverified", entries: [] }), false);
  });
});

describe("question seal when text is not shown", () => {
  for (const ct of [null, undefined]) {
    it("challenge_text " + ct + ": says question text not shown, even if sealed flag is true", () => {
      const r = { summary: "S", challenge_sealed: true };
      if (ct === null) r.challenge_text = null;
      const v = threadView({ ok: true, proof: {}, receipt: r });
      assert.equal(v.reasoning.find((x) => x[0] === "Question seal")[1], "question text not shown");
    });
  }
  it("text shown and sealed still reads covered", () => {
    const v = threadView({ ok: true, proof: {}, receipt: { summary: "S", challenge_text: "q", challenge_sealed: true } });
    assert.match(v.reasoning.find((x) => x[0] === "Question seal")[1], /covered by the seal/);
  });
});
