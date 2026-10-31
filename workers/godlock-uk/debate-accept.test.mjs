import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REFUSE } from "./src/challengeText.js";
import {
  DEBATE_ACCEPTANCE,
  DEBATE_ACCEPT_PUBLIC,
  debateAcceptance,
  isRelativeToIntelligentDesign,
} from "./src/debateAccept.js";
import { homeBody } from "./src/ui.js";
import { helpDoc } from "./src/help.js";

const RELATIVE = [
  "Functionally specified digital information joined to a translation reader is the steel class. Pretty spirals are not a proof.",
  "The genetic code plus its translation reader is specified information; chance and law have not originated that joint system.",
  "The golden ratio and the flower of life corkscrew in shells is measured proof of intelligent design. Phi equals 1.618 so God designed physics.",
  "Fine-tuning of the constants is a design argument, and the multiverse is the usual reply.",
  "Something from nothing does not explain a code and a reader.",
  "The simulation hypothesis says a designer outside the universe is running us.",
  "Irreducible complexity of the bacterial flagellum is a design claim.",
  "Natural selection after a replicator exists does not write the genetic code.",
  "Who designed the designer of the genetic code?",
  "Creationism is a label, not a codon table.",
  "Phi equals 1.618 so God designed physics.",
];

const UNRELATED = [
  "aaaaaaaaaa",
  "The quarterly earnings of the retail sector beat estimates after the holiday season in London.",
  "The big bang produced the cosmic microwave background and the standard cosmology fits the data.",
  "What is DNA?",
  "Aziel Eliab is a software designer who ships local tools.",
  "Phi equals 1.618 and the golden ratio appears in shells.",
  "The simulation of galaxy formation uses a numerical grid.",
  "The Marvel multiverse movie opens on Friday.",
  "Charles Darwin wrote a book about earthworms in his garden and nothing else.",
  "The evolution of the smartphone market continued through the holiday quarter.",
];

describe("debate acceptance fails closed", () => {
  it("accepts arguments relative to intelligent design", () => {
    for (const text of RELATIVE) {
      assert.equal(isRelativeToIntelligentDesign(text), true, text);
      const gate = debateAcceptance(text);
      assert.equal(gate.ok, true, text);
      assert.equal(gate.relative_to_intelligent_design, true);
    }
  });

  it("refuses arguments that are not relative, including gibberish and bare cosmology", () => {
    for (const text of UNRELATED) {
      assert.equal(isRelativeToIntelligentDesign(text), false, text);
      const gate = debateAcceptance(text);
      assert.equal(gate.ok, false, text);
      assert.equal(gate.code, REFUSE.NOT_RELATIVE);
      assert.equal(gate.queued, false);
      assert.equal(gate.scored, false);
      assert.equal(gate.archived, false);
      assert.equal(gate.accepted, false);
      assert.equal(gate.status, 400);
      assert.match(gate.error, /not relative to intelligent design/);
      assert.match(gate.error, /Nothing was queued, scored, or archived/);
    }
  });

  it("refuses empty text as not relative before the empty-text code is chosen", () => {
    assert.equal(isRelativeToIntelligentDesign(""), false);
    assert.equal(isRelativeToIntelligentDesign("   "), false);
    assert.equal(isRelativeToIntelligentDesign(null), false);
  });

  it("keeps the machine cite free of a live stamp", () => {
    assert.equal(DEBATE_ACCEPTANCE.fail_closed, true);
    assert.equal(DEBATE_ACCEPTANCE.queued_when_unrelated, false);
    assert.equal(DEBATE_ACCEPTANCE.refuse_code, "GODLOCK-NOT-RELATIVE");
    assert.equal("live" in DEBATE_ACCEPTANCE, false);
    assert.match(DEBATE_ACCEPT_PUBLIC, /relative to intelligent design/);
    assert.match(DEBATE_ACCEPT_PUBLIC, /not queued/);
  });

  it("shows the rule on the homepage form and in human help", () => {
    const html = homeBody({ stats: {}, latest: null, prior: [] });
    assert.match(html, /id="debate-acceptance"/);
    assert.match(html, /relative to intelligent design/);
    assert.match(html, /not queued/);
    const help = helpDoc();
    assert.match(help, /## Debate acceptance/);
    assert.match(help, /GODLOCK-NOT-RELATIVE/);
    assert.match(help, /fails closed/);
  });
});
