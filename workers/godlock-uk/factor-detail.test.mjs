import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scoreDebateText } from "./src/debateScore.js";
import { factorDetail, storedFactorView, factorDetailSealed, sealRescoreChanges, NOT_STORED, NOT_SEALED_LABEL, FACTOR_KEYS } from "./src/factorDetail.js";
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

describe("stored factor view (read time, no recompute)", () => {
  it("old receipt without stored detail says so", () => {
    const v = storedFactorView([{ reason: "initial", triad_json: JSON.stringify({ factors: { spre: 0.1 } }) }]);
    assert.equal(v.factor_detail, null); assert.equal(v.factor_detail_note, NOT_STORED);
  });
  it("rescore rows show which factors changed and by how much", () => {
    const v = storedFactorView([
      { reason: "initial", triad_json: JSON.stringify({ factors: { spre: 0.15, bayesian: 0.5, clce: null } }) },
      { reason: "supersedes", created_utc: "t2", triad_json: JSON.stringify({ factors: { spre: 0.3, bayesian: 0.5, clce: 0.2 } }) },
    ]);
    assert.deepEqual(v.rescore_factor_changes[0].changes, [
      { factor: "clce", before: null, after: 0.2, delta: null },
      { factor: "spre", before: 0.15, after: 0.3, delta: 0.15 },
    ]);
  });
  it("rescore without stored factors is not guessed", () => {
    const v = storedFactorView([{ reason: "initial", triad_json: null }, { reason: "x", triad_json: JSON.stringify({ factors: { spre: 1 } }) }]);
    assert.equal(v.rescore_factor_changes[0].changes, null);
    assert.equal(v.rescore_factor_changes[0].note, NOT_STORED);
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
    const v = threadView({ ...base, receipt: { factor_detail: null, rescore_factor_changes: [{ created_utc: "t2", changes: [{ factor: "spre", before: 0.15, after: 0.3, delta: 0.15 }] }] } });
    assert.deepEqual(v.factors[2], ["Rescore t2", "spre 0.15 → 0.3 (+0.15) (stored data, not covered)"]);
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
  const fd1 = factorDetail(scoreDebateText(TEXT, ""));
  const fd2 = factorDetail(scoreDebateText(TEXT + " Measured evidence from an archive.", ""));
  const history = (d2) => [
    { id: "i0", reason: "initial", triad_json: JSON.stringify({ factors: fd1.factors && { spre: 0.15 }, factor_detail: fd1 }) },
    { id: "rs1", reason: "supersedes", created_utc: "t2", triad_json: JSON.stringify({ factors: { spre: 0.3 }, factor_detail: d2 }) },
  ];
  const ledger = () => ledgerWith([
    ["SUBMIT", { receipt_id: "r1", factor_detail_sha256: hashPayload(fd1) }],
    ["RESCORE", { receipt_id: "r1", rescore_id: "rs1", factor_detail_sha256: hashPayload(fd2) }],
  ]);
  it("rescore line covered when its RESCORE entry sha matches", async () => {
    _resetProofCache();
    const { rows: lr, proof } = await receiptLedgerAndProof({ DB: fakeDb(ledger()) }, "r1");
    const fv = storedFactorView(history(fd2));
    sealRescoreChanges(fv.rescore_factor_changes, lr, proof);
    assert.equal(fv.rescore_factor_changes[0].sealed, true);
    const v = threadView({ ok: true, proof, receipt: { ...fv, factor_detail_sealed: true } });
    assert.match(v.factors.find((x) => x[0] === "Rescore t2")[1], /\(covered by seal\)$/);
  });
  it("rescore detail edited after write: stored data, not covered", async () => {
    _resetProofCache();
    const { rows: lr, proof } = await receiptLedgerAndProof({ DB: fakeDb(ledger()) }, "r1");
    const bad = JSON.parse(JSON.stringify(fd2)); bad.combined = 0.99;
    const fv = storedFactorView(history(bad));
    sealRescoreChanges(fv.rescore_factor_changes, lr, proof);
    assert.equal(fv.rescore_factor_changes[0].sealed, false);
    const v = threadView({ ok: true, proof, receipt: fv });
    assert.match(v.factors.find((x) => x[0] === "Rescore t2")[1], /\(stored data, not covered\)$/);
  });
  it("SUBMIT sha never seals a rescore line", async () => {
    _resetProofCache();
    const only = ledgerWith([["SUBMIT", { receipt_id: "r1", factor_detail_sha256: hashPayload(fd2) }]]);
    const { rows: lr, proof } = await receiptLedgerAndProof({ DB: fakeDb(only) }, "r1");
    const fv = storedFactorView(history(fd2));
    sealRescoreChanges(fv.rescore_factor_changes, lr, proof);
    assert.equal(fv.rescore_factor_changes[0].sealed, false);
  });
});
