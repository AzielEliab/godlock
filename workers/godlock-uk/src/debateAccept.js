/**
 * Debate acceptance for godlock.uk.
 * Fail closed: an argument is accepted only when it is relative to
 * intelligent design. Unrelated text is not queued, scored, or archived.
 * This is the Worker rule. It is not a public-site LIVE stamp.
 * Author: Aziel Eliab.
 */
import { visibleChallengeText, REFUSE } from "./challengeText.js";

export const DEBATE_NOT_RELATIVE_MESSAGE =
  "This argument is not relative to intelligent design. It was not accepted for debate. Nothing was queued, scored, or archived.";

/** Machine cite. No live flag — the code refuses; a deploy is a separate fact. */
export const DEBATE_ACCEPTANCE = Object.freeze({
  rule: "An argument that is not relative to intelligent design is not accepted for debate.",
  fail_closed: true,
  queued_when_unrelated: false,
  scored_when_unrelated: false,
  archived_when_unrelated: false,
  refuse_code: REFUSE.NOT_RELATIVE,
});

export const DEBATE_ACCEPT_PUBLIC =
  "An argument is accepted for debate only when it is relative to intelligent design. Anything else is not accepted and is not queued.";

/** Direct intelligent-design dispute language. */
const DESIGN_DISPUTE_RE =
  /\b(?:intelligent\s+design|irreducible\s+complexity|specified\s+(?:complexity|information|fit)|functionally\s+specified|watchmaker|design[-\s]?flaw|teleolog(?:y|ical)|intelligent\s+caus(?:e|ation)|argument\s+from\s+design|inference\s+from\s+design|god\s+of\s+the\s+gaps|creationis(?:t|m)|fine[-\s]?tun(?:e|ing|ed)|anthropic(?:\s+principle)?)\b/i;

/**
 * Steel biological object. Bare DNA, RNA, protein, heredity, or
 * "digital information" is not enough on its own.
 */
const STEEL_OBJECT_RE =
  /\b(?:code\s*\+\s*reader|code\s*\/\s*reader|code-plus-reader|code\s+and\s+(?:the\s+)?reader|codon(?:\s+table)?|genetic\s+code|mapping\s+table|translation\s+(?:system|reader)|translation\s*(?:\/|\+)\s*reader|semantic\s+mapping|functional\s+information|digital\s+sequence|flagell\w*|ribosom\w*)\b/i;

/** Origin alternatives this debate already weighs, as claims rather than passing nouns. */
const SIM_RE =
  /simulation\s+hypothesis|simulated\s+(?:universe|reality|world|cosmos)|multi[-\s]?simulation|ancestor\s+simulation|nested\s+simulation|\bin\s+a\s+simulation\b|simulation\s+argument|\bbostrom\b/i;

const NIHIL_RE =
  /creatio(?:\s+|-)ex(?:\s+|-)nihilo|\bex\s+nihilo\b|\b(?:came|come|comes|coming)\s+from\s+nothing\b|\b(?:created|creation)\s+(?:from|out\s+of)\s+nothing\b|\bsomething\s+from\s+nothing\b|\bout\s+of\s+nothing\b|\buniverse\s+from\s+nothing\b|\bfrom\s+nothingness\b/i;

/** Multiverse counts only beside a design, tuning, or cosmos word — not a franchise title alone. */
const MULTIVERSE_REPLY_RE = /\bmultiverse\b/i;
const MULTIVERSE_COMPANION_RE =
  /\b(?:design|tun(?:e|ing|ed)|anthropic|constant|cosmolog(?:y|ical)|universe|god|creat(?:or|ion|ed))\b/i;

/** Spiral-as-design counts only when the text also names design, God, or creation. */
const SPIRAL_RE =
  /golden\s+ratio|φ|\bphi\b|flower\s+of\s+life|corkscrew|vesica\s+piscis|pretty\s+spiral|fibonacci|\b1\.618\b/i;
const SPIRAL_DESIGN_RE =
  /\b(?:design(?:ed|er)?|god|creat(?:or|ion|ed)|intelligent)\b/i;

/** A Darwinian reply counts only beside a design object, a design word, or the origin of life or code. */
const ORIGIN_REPLY_RE =
  /\b(?:natural\s+selection|darwin(?:ian|ism)?|abiogenesis|origin\s+of\s+life|unguided|undirected)\b/i;
const ORIGIN_COMPANION_RE =
  /\b(?:design|intelligent|complexity|flagell\w*|genetic|code|information|replicat\w*|life|creat(?:or|ion|ed)|god)\b/i;

const DESIGNER_RE =
  /\b(?:who|what)\s+designed\s+the\s+designer\b|\b(?:the|an|a)\s+designer\b|\bdesigned\s+by\s+(?:god|intelligence|a\s+designer)\b/i;

/**
 * Fail closed. Empty text is not relative. A keyword class must hit.
 * No model call. No default-accept for long English.
 */
export function isRelativeToIntelligentDesign(text) {
  if (!visibleChallengeText(text)) return false;
  const t = String(text);
  if (DESIGN_DISPUTE_RE.test(t)) return true;
  if (STEEL_OBJECT_RE.test(t)) return true;
  if (DESIGNER_RE.test(t)) return true;
  if (SIM_RE.test(t)) return true;
  if (NIHIL_RE.test(t)) return true;
  if (MULTIVERSE_REPLY_RE.test(t) && MULTIVERSE_COMPANION_RE.test(t)) return true;
  if (SPIRAL_RE.test(t) && SPIRAL_DESIGN_RE.test(t)) return true;
  if (ORIGIN_REPLY_RE.test(t) && ORIGIN_COMPANION_RE.test(t)) return true;
  return false;
}

export function debateAcceptance(text) {
  if (isRelativeToIntelligentDesign(text)) {
    return {
      ok: true,
      accepted: true,
      relative_to_intelligent_design: true,
    };
  }
  return {
    ok: false,
    accepted: false,
    relative_to_intelligent_design: false,
    queued: false,
    scored: false,
    archived: false,
    code: REFUSE.NOT_RELATIVE,
    error: DEBATE_NOT_RELATIVE_MESSAGE,
    status: 400,
  };
}
