import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scoreDebateText } from "./src/debateScore.js";
import { factorDetail, storedFactorView, NOT_STORED, FACTOR_KEYS } from "./src/factorDetail.js";
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
    assert.deepEqual(v.factors, [["Per-factor", "per-factor detail not stored for this receipt"]]);
  });
  it("rescore changes render with signed deltas", () => {
    const v = threadView({ ...base, receipt: { factor_detail: null, rescore_factor_changes: [{ created_utc: "t2", changes: [{ factor: "spre", before: 0.15, after: 0.3, delta: 0.15 }] }] } });
    assert.deepEqual(v.factors[1], ["Rescore t2", "spre 0.15 → 0.3 (+0.15)"]);
  });
  it("script uses textContent only and still parses", () => {
    const js = threadExpandScript();
    assert.doesNotMatch(js, /innerHTML|insertAdjacentHTML|document\.write/);
    assert.doesNotThrow(() => new Function(js.replace(/^<script>|<\/script>$/g, "")));
  });
});
