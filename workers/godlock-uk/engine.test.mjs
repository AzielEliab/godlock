import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FLOOR,
  CEILING,
  START,
  LABELS,
  clampScore,
  residualOf,
  INTERNAL_CRITERIA,
  systemPrompt,
  fallbackAnswer,
  isHighEffortChallenge,
  isAmbiguous,
  isSpiralOnlyChallenge,
  hasSpecifiedFitClaim,
  specifiedFitHolds,
  parseModelOutput,
  answerChallenge,
  enforceProtocolScore,
  challengeHolds,
  receiptScoreDelta,
} from "./src/engine.js";
import { hideInternalDetermination as hideCopy, publicSafeFields } from "./src/publicCopy.js";

const SPIRAL_ONLY = "The golden ratio and the flower of life corkscrew in shells is measured proof of intelligent design. Phi equals 1.618 so God designed physics.";

const SPECIFIED_FIT = [
  "Functionally specified digital information joined to a translation system that reads it is a code-plus-reader object:",
  "a mapping table, machines that implement the mapping, and error repair, with the machines encoded in the sequences.",
  "Law yields regularity, not semantic mappings. Chance yields unspecified complexity.",
  "Selection amplifies after a heredity system exists; it does not originate the joint code and reader.",
  "Pretty spirals and the golden ratio are not a specification and are not a design proof.",
  "RNA-world stories are research hopes, not a demonstrated unguided route to coded translation.",
  "Intelligent causation is the best current explanation of that origin, without 100 percent certainty.",
].join(" ");

describe("score bounds and labels", () => {
  it("keeps floor 33.3 and ceiling 99.7", () => {
    assert.equal(FLOOR, 33.3);
    assert.equal(CEILING, 99.7);
    assert.equal(START, 50);
    assert.equal(clampScore(10), 33.3);
    assert.equal(clampScore(100), 99.7);
    assert.equal(clampScore(50), 50);
    assert.equal(residualOf(60), 40);
  });

  it("keeps the four public labels", () => {
    assert.deepEqual(LABELS, ["Yes", "No", "Let's review", "Interesting"]);
  });
});

describe("systemPrompt specified-fit grounding", () => {
  it("injects INTERNAL_CRITERIA and refuses spiral-as-proof", () => {
    const prompt = systemPrompt(50, []);
    assert.match(prompt, /INTERNAL_CRITERIA/);
    assert.match(prompt, /Functionally specified digital information/);
    assert.match(prompt, /Pretty ratios \/ spirals are NOT a design proof/);
    assert.match(prompt, /code\+reader/);
    assert.match(prompt, /Never name INTERNAL_CRITERIA/);
    assert.match(prompt, /Specified Fit/);
    assert.match(prompt, /bootstrap lock/);
    assert.match(prompt, /Do not coach the next paste/);
    assert.doesNotMatch(prompt, /This surface stress-tests the ABAD framework/);
    assert.match(INTERNAL_CRITERIA, /Layer A Detection/);
    assert.match(INTERNAL_CRITERIA, /ceiling 99\.7/);
  });
});

describe("challenge class: spiral vs code+reader", () => {
  it("treats a spiral-only ID claim as heuristic, not steel class", () => {
    assert.equal(isSpiralOnlyChallenge(SPIRAL_ONLY), true);
    assert.equal(hasSpecifiedFitClaim(SPIRAL_ONLY), false);
    assert.equal(specifiedFitHolds(SPIRAL_ONLY), false);
    assert.equal(isHighEffortChallenge(SPIRAL_ONLY), true);
    const out = fallbackAnswer(SPIRAL_ONLY, 50, []);
    assert.notEqual(out.label, "Let's review");
    assert.ok(out.label === "No" || out.label === "Interesting");
    assert.ok(Math.abs(out.score_delta) <= 0.2, "spiral-only must not be a steel ID win");
    assert.doesNotMatch(out.summary, /INTERNAL_CRITERIA|Specified Fit|bootstrap lock/i);
    assert.doesNotMatch(out.explanation, /INTERNAL_CRITERIA|Specified Fit|bootstrap lock|ABAD framework/i);
  });

  it("does not Let's-review a short code+reader claim for length alone", () => {
    const short = "The genetic code plus its translation reader is specified information; chance and law have not originated that joint system.";
    assert.equal(hasSpecifiedFitClaim(short), true);
    assert.equal(isHighEffortChallenge(short), true);
    assert.equal(isAmbiguous(short), false);
    const out = fallbackAnswer(short, 50, []);
    assert.notEqual(out.label, "Let's review");
    assert.ok(["Yes", "No", "Interesting"].includes(out.label));
  });

  it("treats a stated code+reader claim as high-effort, not Let's review for length", () => {
    assert.equal(hasSpecifiedFitClaim(SPECIFIED_FIT), true);
    assert.equal(isSpiralOnlyChallenge(SPECIFIED_FIT), false);
    assert.equal(specifiedFitHolds(SPECIFIED_FIT), true);
    assert.equal(isHighEffortChallenge(SPECIFIED_FIT), true);
    assert.equal(isAmbiguous(SPECIFIED_FIT), false);
    const out = fallbackAnswer(SPECIFIED_FIT, 50, []);
    assert.notEqual(out.label, "Let's review");
    assert.ok(["Yes", "No", "Interesting"].includes(out.label));
    assert.ok(out.score_delta < 0, "honest scoring when the steel challenge holds");
    assert.doesNotMatch(out.summary + " " + out.explanation, /INTERNAL_CRITERIA|Specified Fit|bootstrap lock/i);
  });
});

describe("publicSafeFields", () => {
  it("drops weighing and strips method labels", () => {
    const safe = publicSafeFields({
      summary: "INTERNAL_CRITERIA Specified Fit, Not Pretty Spirals recorded.",
      explanation: "bootstrap lock and ABAD framework stay hidden.",
      weighing: "private note",
      label: "Interesting",
    });
    assert.equal("weighing" in safe, false);
    assert.doesNotMatch(safe.summary, /INTERNAL_CRITERIA/i);
    assert.match(safe.summary, /Specified Fit, Not Pretty Spirals/);
    assert.doesNotMatch(safe.explanation, /bootstrap lock|ABAD framework/i);
    assert.equal(hideCopy("weighing internals: x"), "x");
  });

  it("does not mangle ordinary observation sentences", () => {
    assert.equal(
      hideCopy("The relationship between observation and the data remains open."),
      "The relationship between observation and the data remains open.",
    );
    assert.equal(
      hideCopy("the relationship between the limits of observation and the measured result"),
      "the relationship between observational limits and the measured result",
    );
    assert.equal(
      hideCopy("There are limits of observation in any empirical study."),
      "There are observational limits in any empirical study.",
    );
    assert.match(hideCopy("Submit a challenge about specified complexity."), /specified complexity/);
  });
});

function aiEnv(payload) {
  return {
    AI: {
      async run() {
        return { response: typeof payload === "string" ? payload : JSON.stringify(payload) };
      },
    },
  };
}

describe("answerChallenge score enforcement", () => {
  it("moves a holding Specified Fit Yes off a stuck equal before/after score", async () => {
    const parsed = parseModelOutput({
      label: "Yes",
      summary: "The challenge holds.",
      explanation: "The specified-fit objection holds and is valid. Residual stays explicit.",
      score_delta: 0,
    }, 50.5);
    assert.equal(parsed.label, "Yes");
    assert.equal(parsed.score_delta, 0, "parser still reports the model delta");

    const before = 50.5;
    const out = await answerChallenge(aiEnv({
      label: "Yes",
      summary: "The challenge holds.",
      explanation: "The specified-fit objection holds and is valid. Residual stays explicit.",
      score_delta: 0,
    }), SPECIFIED_FIT, before, []);
    assert.equal(out.label, "Yes");
    assert.ok(out.score_delta < 0, "holding challenge must lower confidence");
    assert.ok(out.score_delta >= -3 && out.score_delta <= -0.5);
    const after = clampScore(before + out.score_delta);
    assert.notEqual(after, before);
    assert.equal(receiptScoreDelta(before, after), out.score_delta);
    assert.equal(after, 49.5);
    assert.equal(out.score_delta, -1);
  });

  it("does not rely only on the Let's-review remap branch", async () => {
    const out = enforceProtocolScore(SPECIFIED_FIT, {
      label: "Interesting",
      summary: "Recorded. The objection holds.",
      explanation: "The challenge holds under the locked protocol.",
      score_delta: 0,
    }, 50);
    assert.equal(out.label, "Interesting");
    assert.ok(out.score_delta < 0);
    assert.equal(challengeHolds(SPECIFIED_FIT, out), true);
  });

  it("remaps Let's review on a complete high-effort challenge and still moves the score", async () => {
    const out = await answerChallenge(aiEnv({
      label: "Let's review",
      summary: "Need more.",
      explanation: "The engine parked a complete specified-fit challenge.",
      score_delta: 0,
    }), SPECIFIED_FIT, 50, []);
    assert.notEqual(out.label, "Let's review");
    assert.ok(["Yes", "No", "Interesting"].includes(out.label));
    assert.ok(out.score_delta < 0);
  });

  it("keeps Let's review at delta 0 for short ambiguous English", async () => {
    const short = "ok";
    const out = await answerChallenge({}, short, 50, []);
    assert.equal(out.label, "Let's review");
    assert.equal(out.score_delta, 0);
  });

  it("does not lower spiral-only / phi-as-physics much", async () => {
    const out = await answerChallenge(aiEnv({
      label: "Yes",
      summary: "Pretty spirals prove design.",
      explanation: "Phi as physics.",
      score_delta: 0,
    }), SPIRAL_ONLY, 50, []);
    assert.ok(out.label === "Yes" || out.label === "No" || out.label === "Interesting");
    assert.ok(out.score_delta >= 0, "spiral-only must not be treated as a steel hold");
    assert.ok(Math.abs(out.score_delta) <= 0.3);
  });

  it("fallback Specified Fit still reports a real negative delta", () => {
    const before = 50.5;
    const out = fallbackAnswer(SPECIFIED_FIT, before, []);
    assert.notEqual(out.label, "Let's review");
    assert.ok(out.score_delta < 0, "honest scoring when the steel challenge holds");
    assert.notEqual(clampScore(before + out.score_delta), before);
  });
});
