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
    assert.doesNotMatch(safe.summary, /INTERNAL_CRITERIA|Specified Fit/i);
    assert.doesNotMatch(safe.explanation, /bootstrap lock|ABAD framework/i);
    assert.equal(hideCopy("weighing internals: x"), "x");
  });
});
