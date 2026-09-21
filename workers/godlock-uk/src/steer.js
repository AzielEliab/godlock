/**
 * Public Steer: share of scored challenges across competing frames.
 * Derived at read time from archived public receipts. Not stored on the
 * hash chain. Not Current confidence. Not a proof.
 *
 * Ledgers stay separate (Specified Fit, Not Pretty Spirals):
 *   B  biological code+reader / Specified Fit  → intelligent_design
 *   —  simulation hypothesis                   → multi_simulation
 *   C  big bang, standard cosmology, fine-tuning,
 *      anthropic, multiverse replies           → standard_cosmology
 *   other / no retained frame                  → undecided
 *
 * Pretty spirals and φ are engagement heuristics. They do not cast a
 * design vote. A cosmology text that says "intelligent design" stays on
 * ledger C. A receipt that names more than one frame splits its one vote
 * equally so neither ledger spends the other's capital.
 *
 * Author: Aziel Eliab. GodLock is a product name.
 */
import { isSpiralOnlyChallenge } from "./engine.js";

export const STEER_FRAME_IDS = Object.freeze([
  "intelligent_design",
  "multi_simulation",
  "standard_cosmology",
  "undecided",
]);

export const STEER_LABELS = Object.freeze({
  intelligent_design: "Intelligent design (Specified Fit / bio code+reader)",
  multi_simulation: "Multi-simulation",
  standard_cosmology: "Big Bang / standard cosmology (physics ledger)",
  undecided: "Undecided / Let's review / other",
});

export const STEER_NOTE_PUBLIC =
  "Layer C (cosmology, including fine-tuning and multiverse replies) and Layer B (biology, code+reader) are separate ledgers. Cosmology does not spend biological capital. Biology does not settle the Big Bang. GodLock records, analyzes, hardens, and grows. It does not sermonize.";

export const STEER_METHOD =
  "Each non-isolated public receipt is one input. Frames are keyword classes the engine already uses: Layer B code+reader, Specified Fit, specified complexity, and other biological design objects; the simulation hypothesis (not a bare computer simulation); Layer C big bang, standard cosmology, cosmic microwave background, fine-tuning, anthropic reasoning, and multiverse replies. Pretty spirals and φ do not add a design share. Intelligent-design wording on a cosmology-only or spiral-only text does not spend the biology ledger. A receipt that hits more than one frame splits its one vote equally. Shares are those votes over the scored public receipts, in percent to one decimal, largest-remainder rounded so they sum to 100. Equal remainders break toward the earlier frame in the published order; that 0.1 is rounding, not a preference. The leader follows the exact vote, so an equal vote stays a tie even when the printed percents differ by 0.1. An empty archive is 100% undecided. Rows with no retained challenge text count as undecided. Isolated rows and refused empty submits are excluded. Steer is the mix of challenges. Current confidence is the separate running score (floor 33.3 · ceiling 99.7).";

/** Biological object / Specified Fit steel vocabulary. Not φ. Not cosmology. */
const BIO_OBJECT_RE = /code\s*\+\s*reader|code\s*\/\s*reader|code-plus-reader|code\s+and\s+(?:the\s+)?reader|codon|genetic\s+code|mapping\s+table|translation\s*(?:\/|\+)?\s*reader|translation\s+system|flagell\w*|ribosom\w*|\bDNA\b|\bRNA\b|\bprotein\b|nucleotide|amino\s+acid|specified\s+fit|specified\s+complexity|specified\s+information|functionally\s+specified|semantic\s+mapping|functional\s+information|irreducible\s+complexity|digital\s+sequence/i;

const ID_PHRASE_RE = /\bintelligent\s*design\b|\bwatchmaker\b/i;

/** Simulation hypothesis only. A numerical "simulation of" galaxies does not match. */
const SIM_RE = /simulation\s+hypothesis|simulated\s+(?:universe|reality|world|cosmos)|multi[-\s]?simulation|ancestor\s+simulation|nested\s+simulation|\bin\s+a\s+simulation\b|simulation\s+argument|\bbostrom\b/i;

/** Ledger C. Multiverse replies stay here. Bare "physics" does not match. */
const COSMO_RE = /big\s+bang|standard\s+cosmology|standard\s+model\s+of\s+cosmology|λ\s*cdm|lambda[-\s]?cdm|\blcdm\b|cosmic\s+microwave|\bcmb\b|fine[-\s]?tun(?:e|ing)|anthropic|multiverse|\bcosmolog/i;

export function hitsSimulationHypothesis(text) {
  return SIM_RE.test(String(text || ""));
}

export function hitsStandardCosmology(text) {
  return COSMO_RE.test(String(text || ""));
}

export function hitsBiologicalDesign(text) {
  const t = String(text || "");
  if (!t.trim()) return false;
  if (isSpiralOnlyChallenge(t)) return false;
  if (BIO_OBJECT_RE.test(t)) return true;
  if (ID_PHRASE_RE.test(t) && !hitsSimulationHypothesis(t) && !hitsStandardCosmology(t)) return true;
  return false;
}

function emptyWeights() {
  return {
    intelligent_design: 0,
    multi_simulation: 0,
    standard_cosmology: 0,
    undecided: 0,
  };
}

/** Integer vote units. One receipt = 10000 units, split equally across hits. */
function voteUnits(hits) {
  const units = emptyWeights();
  const list = hits.length ? hits : ["undecided"];
  const base = Math.floor(10000 / list.length);
  let rem = 10000 - base * list.length;
  for (const id of list) units[id] = base;
  for (const id of STEER_FRAME_IDS) {
    if (rem <= 0) break;
    if (list.includes(id)) {
      units[id] += 1;
      rem -= 1;
    }
  }
  return units;
}

export function classifyChallenge(text) {
  const hits = [];
  if (hitsBiologicalDesign(text)) hits.push("intelligent_design");
  if (hitsSimulationHypothesis(text)) hits.push("multi_simulation");
  if (hitsStandardCosmology(text)) hits.push("standard_cosmology");
  if (!hits.length) hits.push("undecided");
  const units = voteUnits(hits);
  const weights = emptyWeights();
  for (const id of STEER_FRAME_IDS) weights[id] = units[id] / 10000;
  return {
    hits,
    weights,
    units,
    primary: hits.length === 1 ? hits[0] : "split",
  };
}

function leadersFromUnits(units) {
  let max = -1;
  for (const id of STEER_FRAME_IDS) {
    const n = Number(units[id]) || 0;
    if (n > max) max = n;
  }
  return STEER_FRAME_IDS.filter((id) => (Number(units[id]) || 0) === max);
}

/**
 * Percent to 0.1, summing to 100. `units` are summed vote units; `n` is inputs.
 * Largest remainder. Equal remainders go to the earlier published frame.
 */
export function scalesFromUnits(units, n) {
  const scalesTenths = {};
  if (!n) {
    for (const id of STEER_FRAME_IDS) scalesTenths[id] = id === "undecided" ? 1000 : 0;
    return tenthsToScales(scalesTenths);
  }
  const den = n * 10;
  const fracs = [];
  let floorSum = 0;
  STEER_FRAME_IDS.forEach((id, i) => {
    const num = Number(units[id]) || 0;
    const floor = Math.floor(num / den);
    const rem = num % den;
    scalesTenths[id] = floor;
    floorSum += floor;
    fracs.push({ id, i, rem });
  });
  let leftover = 1000 - floorSum;
  fracs.sort((a, b) => b.rem - a.rem || a.i - b.i);
  for (let k = 0; leftover > 0; k += 1, leftover -= 1) {
    scalesTenths[fracs[k % fracs.length].id] += 1;
  }
  return tenthsToScales(scalesTenths);
}

function tenthsToScales(tenths) {
  const scales = {};
  for (const id of STEER_FRAME_IDS) scales[id] = tenths[id] / 10;
  return scales;
}

export function formatSteerPercent(n) {
  const x = Math.round(Number(n) * 10) / 10;
  if (!Number.isFinite(x)) return "0";
  return Number.isInteger(x) ? String(x) : x.toFixed(1);
}

function steerDocument(scales, inputs, units) {
  const leaders = inputs === 0 ? ["undecided"] : leadersFromUnits(units);
  const leader = leaders.length === 1 ? leaders[0] : "tie";
  const steering_toward = leaders.length === 1
    ? STEER_LABELS[leaders[0]]
    : "Tied: " + leaders.map((id) => STEER_LABELS[id]).join(" · ");
  return {
    available: true,
    leader,
    leaders,
    steering_toward,
    scales,
    labels: { ...STEER_LABELS },
    inputs,
    exclusive: false,
    sums_to: 100,
    split: "equal",
    empty: inputs === 0,
    method: STEER_METHOD,
    note: STEER_NOTE_PUBLIC,
    floor: 33.3,
    ceiling: 99.7,
  };
}

export function unavailableSteer() {
  return {
    available: false,
    leader: null,
    leaders: [],
    steering_toward: null,
    scales: null,
    labels: { ...STEER_LABELS },
    inputs: null,
    exclusive: false,
    sums_to: null,
    split: "equal",
    empty: null,
    method: STEER_METHOD,
    note: "Steer could not be read from the public receipt archive. No share is shown.",
    floor: 33.3,
    ceiling: 99.7,
  };
}

/** Aggregate scored public receipts. Isolated rows are skipped. */
export function aggregateSteer(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const units = emptyWeights();
  let n = 0;
  for (const row of list) {
    if (!row || Number(row.isolated)) continue;
    const text = row.challenge_text != null ? row.challenge_text : (row.text != null ? row.text : "");
    const classified = classifyChallenge(text);
    n += 1;
    for (const id of STEER_FRAME_IDS) units[id] += classified.units[id];
  }
  return steerDocument(scalesFromUnits(units, n), n, units);
}
