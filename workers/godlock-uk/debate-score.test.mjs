import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  scoreDebateText, triadSnapshot, debateSummary, describeRescore, meterRemainder, DEBATE_HEADLINE,
} from "./src/debateScore.js";
import { affectReason, affectedPriors, lineageCore } from "./src/rescore.js";
import { sha256hex } from "./src/ledger.js";
import { homeBody } from "./src/ui.js";

const TEXT = "Functionally specified digital information joined to a translation reader is a claim about origin. The mapping is stated as a sentence with a hash recorded in the receipt.";

describe("TRIAD_V3 debate score", () => {
  it("uses the published cycle mean and does not write display back into combined", () => {
    const sha = sha256hex(TEXT);
    const review = scoreDebateText(TEXT, sha);
    const snap = triadSnapshot(review);
    assert.equal(snap.schema, "aziel.triad.v3");
    assert.equal(snap.ready, true);
    assert.equal(snap.public_score, "triad_cycle_mean");
    assert.equal(snap.combined, review.triad.triad_cycle_mean);
    assert.equal(snap.display, Math.round(snap.combined * 100));
    assert.notEqual(snap.combined, snap.display);
    assert.equal(meterRemainder(snap.display), 100 - snap.display);
    assert.equal(snap.pairing_count, snap.cycle_factors.length * snap.cycle_factors.length);
    assert.ok(snap.cycle_factors.includes("spre"));
    assert.ok(snap.cycle_factors.includes("clce"));
    assert.ok(snap.cycle_factors.includes("bayesian"));
    assert.ok(snap.omitted.includes("physics"));
    assert.equal(snap.factors.physics, null);
    assert.match(debateSummary(review), /TRIAD_V3 display/);
  });
});

describe("flawless rescore match", () => {
  const prior = {
    id: "abc123",
    challenge_text: "The mapping table is a claim about origin v1",
    text_sha256: "aa",
    isolated: 0,
    score_after: 50.5,
  };

  it("does not rescore a loosely related question", () => {
    const loose = "A different question about shells and pretty ratios in galaxies.";
    assert.equal(affectReason(loose, prior, "bb"), "");
  });

  it("rescores when the new text names the receipt id", () => {
    assert.equal(affectReason("Please look again at receipt abc123.", prior, "bb"), "explicit_id");
  });

  it("rescores an explicit supersedes link", () => {
    assert.equal(affectReason("supersedes abc123", prior, "bb"), "explicit");
  });

  it("rescores the same succession after a version tail", () => {
    assert.equal(lineageCore(prior.challenge_text), lineageCore("The mapping table is a claim about origin v2"));
    assert.equal(affectReason("The mapping table is a claim about origin v2", prior, "bb"), "subject_title_lineage");
  });

  it("does not rescore identical bytes", () => {
    assert.equal(affectReason(prior.challenge_text, prior, prior.text_sha256), "");
  });

  it("labels a legacy rescore without erasing the old number", () => {
    const after = triadSnapshot(scoreDebateText(prior.challenge_text, sha256hex(prior.challenge_text)));
    const note = describeRescore({
      affectReason: "explicit_id",
      previousDisplay: prior.score_after,
      previousSource: "stored_score_after",
      beforeSnap: null,
      afterSnap: after,
    });
    assert.match(note, /Earlier receipt was rescored/);
    assert.match(note, /50\.5/);
    assert.match(note, /was not rewritten|is kept/);
    assert.match(note, new RegExp(String(after.display)));
  });

  it("returns only the priors the new question affects", () => {
    const hits = affectedPriors("supersedes abc123", [prior, { ...prior, id: "other", challenge_text: "unrelated words here please" }], "cc");
    assert.deepEqual(hits.map((h) => h.prior.id), ["abc123"]);
  });
});

describe("debate page", () => {
  it("states the headline and keeps the meters", () => {
    const html = homeBody({
      stats: { triad_display: 42, meter_remainder: 58, current_score: 42, residual: 58 },
      latest: null,
      prior: [],
    });
    assert.match(html, new RegExp(DEBATE_HEADLINE.replace(".", "\\.")));
    assert.match(html, /id="stat-current-score">42%/);
    assert.match(html, /id="stat-residual">58%/);
    assert.match(html, /id="steer"/);
    assert.match(html, /Triad display/);
    assert.doesNotMatch(html, /floor 33\.3/);
    assert.doesNotMatch(html, /Specified Fit, Not Pretty Spirals/);
    assert.match(html, /not a claim that bias is impossible/);
  });
});
