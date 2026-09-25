import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker, { publicPayload } from "./src/index.js";
import { hashReceipt } from "./src/engine.js";
import { homeBody, reasonBody, steerPanel, page } from "./src/ui.js";
import {
  STEER_BALANCE_NOTE,
  STEER_FRAME_IDS,
  STEER_METHOD,
  aggregateSteer,
  classifyChallenge,
  formatSteerPercent,
  hitsBiologicalDesign,
  hitsCameFromNothing,
  scalesFromUnits,
  unavailableSteer,
} from "./src/steer.js";
import { residualOf } from "./src/engine.js";

const BIO = "The genetic code plus its translation reader is specified information; chance and law have not originated that joint system.";
const SIM = "Bostrom's simulation hypothesis says we are in a simulation.";
const COSMO = "Fine-tuning of the cosmic constants in the big bang is a physics-ledger question.";
const SPIRAL = "The golden ratio and the flower of life corkscrew in shells is measured proof of intelligent design. Phi equals 1.618 so God designed physics.";
const COSMO_ID_WORDS = "Fine-tuning shows intelligent design of the constants.";
const BOTH = "The genetic code's reader and the big bang are different questions.";
const GALAXY_SIM = "A computer simulation of galaxy formation under the standard cosmology.";
const NIHIL = "The claim is that the universe came from nothing.";
const EX_NIHILO = "Creatio ex nihilo is the something-from-nothing claim, also called ex nihilo.";
const BANG_AND_NIHIL = "The big bang is when the universe came from nothing.";
const BIO_AND_NIHIL = "The genetic code's reader came from nothing.";
const CREATIONISM = "Young-earth creationism is a sociology label.";

function sumScales(scales) {
  const n = STEER_FRAME_IDS.reduce((s, id) => s + Number(scales[id]), 0);
  return Math.round(n * 10) / 10;
}

function row(text, extra) {
  return { challenge_text: text, isolated: 0, label: "Interesting", ...(extra || {}) };
}

describe("steer classification", () => {
  it("keeps biology, simulation, and cosmology on separate frames", () => {
    assert.equal(classifyChallenge(BIO).primary, "intelligent_design");
    assert.equal(classifyChallenge(SIM).primary, "multi_simulation");
    assert.equal(classifyChallenge(COSMO).primary, "standard_cosmology");
    assert.equal(hitsBiologicalDesign(COSMO), false);
    assert.equal(hitsBiologicalDesign(COSMO_ID_WORDS), false);
    assert.equal(classifyChallenge(COSMO_ID_WORDS).primary, "standard_cosmology");
  });

  it("does not treat pretty spirals or a galaxy simulation as design or multi-simulation", () => {
    assert.equal(classifyChallenge(SPIRAL).primary, "undecided");
    assert.equal(classifyChallenge(SPIRAL).weights.intelligent_design, 0);
    assert.equal(classifyChallenge(GALAXY_SIM).primary, "standard_cosmology");
    assert.equal(classifyChallenge(GALAXY_SIM).weights.multi_simulation, 0);
    assert.equal(classifyChallenge("phi 1.618").primary, "undecided");
    const named = classifyChallenge("The big bang does not write a codon table.");
    assert.equal(named.primary, "split");
    assert.equal(named.weights.intelligent_design, 0.5);
    assert.equal(named.weights.standard_cosmology, 0.5);
  });

  it("splits a receipt that names two ledgers instead of spending one on the other", () => {
    const c = classifyChallenge(BOTH);
    assert.equal(c.primary, "split");
    assert.equal(c.weights.intelligent_design, 0.5);
    assert.equal(c.weights.standard_cosmology, 0.5);
    assert.equal(c.weights.multi_simulation, 0);
    assert.equal(c.weights.came_from_nothing, 0);
    assert.equal(c.weights.undecided, 0);
    const sum = STEER_FRAME_IDS.reduce((s, id) => s + c.weights[id], 0);
    assert.equal(Math.round(sum * 10000) / 10000, 1);
  });

  it("counts a missing challenge as undecided and skips isolated rows", () => {
    assert.equal(classifyChallenge("").primary, "undecided");
    assert.equal(classifyChallenge(null).primary, "undecided");
    const steer = aggregateSteer([
      { challenge_text: null, isolated: 0 },
      { challenge_text: BIO, isolated: 1 },
      row(SIM),
    ]);
    assert.equal(steer.inputs, 2);
    assert.equal(steer.scales.multi_simulation, 50);
    assert.equal(steer.scales.undecided, 50);
    assert.equal(steer.scales.intelligent_design, 0);
    assert.equal(steer.leader, "tie");
  });
});

describe("steer aggregate", () => {
  it("is 100% undecided when the archive is empty", () => {
    const steer = aggregateSteer([]);
    assert.equal(steer.available, true);
    assert.equal(steer.empty, true);
    assert.equal(steer.inputs, 0);
    assert.equal(steer.leader, "undecided");
    assert.equal(steer.steer_leader, undefined);
    assert.equal(steer.scales.undecided, 100);
    assert.equal(steer.scales.intelligent_design, 0);
    assert.equal(sumScales(steer.scales), 100);
    assert.match(steer.note, /separate ledgers/);
    assert.match(steer.note, /does not sermonize/);
    assert.doesNotMatch(steer.method, /INTERNAL_CRITERIA|weighing|bootstrap lock|salt/i);
    assert.match(STEER_METHOD, /largest-remainder/);
  });

  it("sums one-decimal shares to 100 across mixed inputs", () => {
    const steer = aggregateSteer([row(BIO), row(BIO), row(SIM)]);
    assert.equal(steer.inputs, 3);
    assert.equal(steer.leader, "intelligent_design");
    assert.equal(steer.scales.intelligent_design, 66.7);
    assert.equal(steer.scales.multi_simulation, 33.3);
    assert.equal(steer.scales.standard_cosmology, 0);
    assert.equal(steer.scales.came_from_nothing, 0);
    assert.equal(steer.scales.undecided, 0);
    assert.equal(sumScales(steer.scales), 100);
    assert.equal(formatSteerPercent(66.7), "66.7");
    assert.equal(formatSteerPercent(50), "50");
  });

  it("gives the leftover tenth by published order when remainders match", () => {
    const steer = aggregateSteer([row(BIO), row(SIM), row(COSMO)]);
    assert.equal(steer.scales.intelligent_design, 33.4);
    assert.equal(steer.scales.multi_simulation, 33.3);
    assert.equal(steer.scales.standard_cosmology, 33.3);
    assert.equal(steer.scales.came_from_nothing, 0);
    assert.equal(sumScales(steer.scales), 100);
    assert.equal(steer.leader, "tie");
    assert.deepEqual(steer.leaders, ["intelligent_design", "multi_simulation", "standard_cosmology"]);
    assert.match(steer.steering_toward, /^Tied:/);
  });

  it("does not invent shares when the archive cannot be read", () => {
    const steer = unavailableSteer();
    assert.equal(steer.available, false);
    assert.equal(steer.scales, null);
    assert.equal(steer.leader, null);
    assert.equal(steer.inputs, null);
    assert.match(steer.note, /No share is shown/);
    const html = steerPanel(steer, { current_score: 50, residual: 50 });
    assert.match(html, /No share is shown/);
    assert.doesNotMatch(html, /id="steer-pct-undecided"/);
    assert.match(html, /id="steer-current-score">50%/);
    assert.match(html, /id="steer-residual">50%/);
    assert.match(html, /id="steer-balance"/);
    assert.match(html, /one vote plane and sum to 100/);
    assert.doesNotMatch(html, /id="steer-pct-came_from_nothing"/);
  });

  it("rounds with integer units", () => {
    const scales = scalesFromUnits({
      intelligent_design: 10000,
      multi_simulation: 0,
      standard_cosmology: 0,
      came_from_nothing: 0,
      undecided: 0,
    }, 1);
    assert.deepEqual(scales, {
      intelligent_design: 100,
      multi_simulation: 0,
      standard_cosmology: 0,
      came_from_nothing: 0,
      undecided: 0,
    });
  });
});

describe("came from nothing", () => {
  it("classifies the ex-nihilo claim without spending Layer B or Layer C", () => {
    assert.equal(hitsCameFromNothing(NIHIL), true);
    assert.equal(hitsCameFromNothing(EX_NIHILO), true);
    assert.equal(hitsCameFromNothing("A Universe from Nothing"), true);
    assert.equal(hitsCameFromNothing("nothing comes from nothing"), true);
    assert.equal(hitsCameFromNothing("creation from nothing"), true);
    assert.equal(classifyChallenge(NIHIL).primary, "came_from_nothing");
    assert.equal(classifyChallenge(NIHIL).weights.came_from_nothing, 1);
    assert.equal(classifyChallenge(NIHIL).weights.standard_cosmology, 0);
    assert.equal(classifyChallenge(NIHIL).weights.intelligent_design, 0);
    assert.equal(classifyChallenge(EX_NIHILO).primary, "came_from_nothing");
    assert.equal(hitsCameFromNothing(COSMO), false);
    assert.equal(hitsCameFromNothing(CREATIONISM), false);
    assert.equal(hitsCameFromNothing("nothingness"), false);
    assert.equal(hitsBiologicalDesign(NIHIL), false);
    assert.equal(classifyChallenge(CREATIONISM).primary, "undecided");
    assert.equal(classifyChallenge(CREATIONISM).weights.came_from_nothing, 0);
    assert.equal(classifyChallenge(CREATIONISM).weights.intelligent_design, 0);
  });

  it("splits a big-bang-plus-ex-nihilo receipt and leaves biology at zero", () => {
    const c = classifyChallenge(BANG_AND_NIHIL);
    assert.equal(c.primary, "split");
    assert.deepEqual(c.hits, ["standard_cosmology", "came_from_nothing"]);
    assert.equal(c.weights.standard_cosmology, 0.5);
    assert.equal(c.weights.came_from_nothing, 0.5);
    assert.equal(c.weights.intelligent_design, 0);
    const sum = STEER_FRAME_IDS.reduce((s, id) => s + c.weights[id], 0);
    assert.equal(Math.round(sum * 10000) / 10000, 1);
  });

  it("splits biology plus the ex-nihilo phrase instead of rewriting Layer B", () => {
    const c = classifyChallenge(BIO_AND_NIHIL);
    assert.equal(c.primary, "split");
    assert.equal(c.weights.intelligent_design, 0.5);
    assert.equal(c.weights.came_from_nothing, 0.5);
    assert.equal(c.weights.standard_cosmology, 0);
  });

  it("keeps a spiral-only design slogan off Layer B when it also names the claim", () => {
    const c = classifyChallenge("The golden ratio came from nothing. Phi equals 1.618.");
    assert.equal(c.primary, "came_from_nothing");
    assert.equal(c.weights.intelligent_design, 0);
    assert.equal(c.weights.came_from_nothing, 1);
  });

  it("folds the share into the vote plane so printed percents still sum to 100", () => {
    const steer = aggregateSteer([row(BIO), row(COSMO), row(NIHIL)]);
    assert.equal(steer.inputs, 3);
    assert.equal(steer.leader, "tie");
    assert.deepEqual(steer.leaders, ["intelligent_design", "standard_cosmology", "came_from_nothing"]);
    assert.equal(steer.scales.intelligent_design, 33.4);
    assert.equal(steer.scales.standard_cosmology, 33.3);
    assert.equal(steer.scales.came_from_nothing, 33.3);
    assert.equal(steer.scales.multi_simulation, 0);
    assert.equal(steer.scales.undecided, 0);
    assert.equal(sumScales(steer.scales), 100);
    assert.equal(steer.sums_to, 100);
    assert.equal(steer.balance, STEER_BALANCE_NOTE);
    assert.match(steer.method, /not a free-floating second score/);
    assert.match(steer.method, /not derived by relabeling Layer C/);
    const empty = aggregateSteer([]);
    assert.equal(empty.scales.came_from_nothing, 0);
    assert.equal(empty.scales.undecided, 100);
  });

  it("renders the Came from nothing meter beside the other Steer bars", () => {
    const steer = aggregateSteer([row(NIHIL), row(COSMO)]);
    const residual = residualOf(40);
    const html = page("GodLock", homeBody({
      stats: { current_score: 40, residual, steer, scales: steer.scales },
      latest: null,
      prior: [],
    }), { path: "/", kind: "home" });
    assert.equal(sumScales(steer.scales), 100);
    assert.equal(Math.round((40 + residual) * 10) / 10, 100);
    assert.match(html, /id="stat-current-score">40%/);
    assert.match(html, /id="stat-residual">60%/);
    assert.match(html, /id="steer-pct-came_from_nothing">50%/);
    assert.match(html, /id="steer-bar-came_from_nothing" style="width:50%"/);
    assert.match(html, /id="steer-pct-standard_cosmology">50%/);
    assert.match(html, /var ids=\["intelligent_design","multi_simulation","standard_cosmology","came_from_nothing","undecided"\]/);
    assert.match(html, /Came from nothing does not spend either ledger/);
  });

  it("keeps confidence and residual a separate pair that sums to 100", () => {
    for (const score of [33.3, 50, 49.5, 99.7]) {
      const residual = residualOf(score);
      assert.equal(Math.round((score + residual) * 10) / 10, 100);
    }
  });
});

describe("steer public surfaces", () => {
  const rows = [
    {
      id: "bio1",
      label: "Interesting",
      challenge_text: BIO,
      isolated: 0,
      summary: "Recorded.",
      explanation: "Recorded.",
      created_utc: "2026-09-01T00:00:00.000Z",
      score_before: 50,
      score_after: 49.5,
      residual: 50.5,
      content_sha256: "abc",
      text_sha256: "def",
    },
    {
      id: "sim1",
      label: "Interesting",
      challenge_text: SIM,
      isolated: 0,
      summary: "Recorded.",
      explanation: "Recorded.",
      created_utc: "2026-09-02T00:00:00.000Z",
      score_before: 49.5,
      score_after: 49.5,
      residual: 50.5,
      content_sha256: "ghi",
      text_sha256: "jkl",
    },
  ];

  function archiveEnv() {
    const metadata = new Map([
      ["current_score", "49.5"],
      ["views", "3"],
      ["uses", "2"],
    ]);
    function prepare(sql) {
      const q = String(sql);
      let bound = [];
      const stmt = {
        bind(...args) {
          bound = args;
          return stmt;
        },
        async first() {
          if (/SELECT value FROM metadata/.test(q)) {
            const v = metadata.get(bound[0]);
            return v != null ? { value: v } : null;
          }
          if (/COUNT\(\*\) AS n FROM receipts WHERE isolated=0/.test(q)) {
            return { n: rows.filter((r) => !Number(r.isolated)).length };
          }
          if (/COUNT\(\*\) AS n FROM receipts/.test(q)) return { n: rows.length };
          if (/COUNT\(\*\) AS n FROM ledger/.test(q)) return { n: 0 };
          if (/FROM heartbeats/.test(q)) return { n: 0 };
          if (/SELECT \* FROM receipts WHERE id=/.test(q)) {
            return rows.find((r) => r.id === bound[0]) || null;
          }
          return null;
        },
        async all() {
          if (/steer-aggregate/.test(q)) {
            return {
              results: rows.filter((r) => !Number(r.isolated)).map((r) => ({
                label: r.label,
                challenge_text: r.challenge_text,
                isolated: r.isolated,
              })),
            };
          }
          if (/FROM receipts WHERE isolated=0/.test(q)) {
            return { results: rows.filter((r) => !Number(r.isolated)) };
          }
          if (/FROM ledger/.test(q)) return { results: [] };
          return { results: [] };
        },
        async run() {
          return { success: true };
        },
      };
      return stmt;
    }
    return {
      DB: {
        prepare,
        async batch() {
          return [];
        },
      },
      MESH_PROBE_ORIGIN: false,
    };
  }

  it("renders a ranked Steer panel plus the existing confidence scales", () => {
    const steer = aggregateSteer(rows);
    const html = homeBody({
      stats: { current_score: 49.5, residual: 50.5, steer, steer_leader: steer.leader, scales: steer.scales, receipts: 2 },
      latest: rows[0],
      prior: [],
    });
    assert.match(html, /id="stat-current-score">49\.5%/);
    assert.match(html, /id="stat-residual">50\.5%/);
    assert.match(html, /id="steer"/);
    assert.match(html, /Steering toward: Tied:/);
    assert.match(html, /Intelligent design \(Specified Fit \/ bio code\+reader\)/);
    assert.match(html, /Multi-simulation/);
    assert.match(html, /Big Bang \/ standard cosmology \(physics ledger\)/);
    assert.match(html, /Came from nothing/);
    assert.match(html, /id="steer-pct-came_from_nothing">0%/);
    assert.match(html, /id="steer-bar-came_from_nothing" style="width:0%"/);
    assert.match(html, /id="steer-balance"/);
    assert.match(html, /one vote plane and sum to 100/);
    assert.match(html, /separate pair and sum to 100/);
    assert.match(html, /these two sum to 100/);
    assert.match(html, /Undecided \/ Let's review \/ other/);
    assert.match(html, /id="steer-pct-intelligent_design">50%/);
    assert.match(html, /id="steer-pct-multi_simulation">50%/);
    assert.match(html, /id="steer-bar-intelligent_design" style="width:50%"/);
    assert.match(html, /separate ledgers/);
    assert.match(html, /does not sermonize/);
    assert.match(html, /Frame/);
    assert.match(html, /100% of this receipt/);
    assert.doesNotMatch(html, /INTERNAL_CRITERIA|weighing|bootstrap lock/);
    const reason = reasonBody({ stats: { current_score: 49.5, residual: 50.5, steer } });
    assert.match(reason, /id="steer-leader"/);
    assert.match(reason, /A\. Detection/);
  });

  it("publishes steer on /count, /reason, and the receipt", async () => {
    const env = archiveEnv();
    const count = await (await worker.fetch(new Request("https://godlock.uk/count"), env)).json();
    assert.equal(count.current_score, 49.5);
    assert.equal(count.residual, 50.5);
    assert.equal(count.steer_leader, "tie");
    assert.equal(count.scales.intelligent_design, 50);
    assert.equal(count.scales.multi_simulation, 50);
    assert.equal(count.scales.standard_cosmology, 0);
    assert.equal(count.scales.came_from_nothing, 0);
    assert.equal(count.scales.undecided, 0);
    assert.equal(count.steer.balance, STEER_BALANCE_NOTE);
    assert.equal(Math.round((count.current_score + count.residual) * 10) / 10, 100);
    assert.equal(count.steer.inputs, 2);
    assert.equal(count.steer.sums_to, 100);
    assert.equal(sumScales(count.scales), 100);

    const home = await (await worker.fetch(new Request("https://godlock.uk/"), env)).text();
    assert.match(home, /id="steer-leader">Steering toward: Tied:/);
    assert.match(home, /class="scorebox"/);
    assert.match(home, /Current confidence/);
    assert.match(home, /Residual uncertainty/);

    const reason = await (await worker.fetch(new Request("https://godlock.uk/reason?format=json"), env)).json();
    assert.equal(reason.steer_leader, "tie");
    assert.equal(reason.current_score, 49.5);
    assert.equal(reason.scales.intelligent_design, 50);
    assert.match(reason.text, /Functionally specified digital information/);

    const receipt = await (await worker.fetch(new Request("https://godlock.uk/receipt/bio1", {
      headers: { Accept: "application/json" },
    }), env)).json();
    assert.equal(receipt.ok, true);
    assert.equal(receipt.receipt.classification.primary, "intelligent_design");
    assert.equal(receipt.receipt.classification.text_retained, true);
    assert.equal(receipt.steer_leader, "tie");
    assert.equal(receipt.current_score, 49.5);
    assert.equal(receipt.residual, 50.5);
    assert.equal(receipt.receipt.weighing, undefined);
    const stored = rows[0];
    assert.equal(hashReceipt(stored), hashReceipt(stored));
    const payload = publicPayload(stored);
    assert.equal("units" in payload.classification, false);
    assert.equal(payload.classification.hits[0], "intelligent_design");
  });

  it("shows undecided, not a slogan, when nothing has been scored", async () => {
    const env = {
      DB: {
        prepare() {
          const stmt = {
            bind() { return stmt; },
            async first() { return null; },
            async all() { return { results: [] }; },
            async run() { return { success: true }; },
          };
          return stmt;
        },
        async batch() { return []; },
      },
      MESH_PROBE_ORIGIN: false,
    };
    const count = await (await worker.fetch(new Request("https://godlock.uk/count"), env)).json();
    assert.equal(count.steer_leader, "undecided");
    assert.equal(count.scales.undecided, 100);
    assert.equal(count.scales.came_from_nothing, 0);
    assert.equal(count.steer.inputs, 0);
    assert.equal(sumScales(count.scales), 100);
    assert.equal(Math.round((count.current_score + count.residual) * 10) / 10, 100);
    assert.equal(count.current_score, 50);
    assert.equal(count.residual, 50);
    const home = await (await worker.fetch(new Request("https://godlock.uk/"), env)).text();
    assert.match(home, /Steering toward: Undecided \/ Let's review \/ other/);
    assert.match(home, /Came from nothing/);
    assert.match(home, /id="steer-pct-came_from_nothing">0%/);
    assert.match(home, /No scored public challenges yet/);
    assert.match(home, /id="stat-current-score">50%/);
  });
});
