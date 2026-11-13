/**
 * Debate acceptance for godlock.uk.
 * Fail closed: an argument is accepted only when it is relative to
 * intelligent design. Unrelated text is not queued, scored, or archived.
 * This is the Worker rule. It is not a public-site LIVE stamp.
 * No model call. A long paragraph does not default to accept.
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

/**
 * Phrases that name the debate by themselves.
 * Fine-tuning, watchmaker, creationism, anthropic, and "the designer"
 * are not in this list — those words also name other subjects.
 */
const STRONG_DESIGN_RE =
  /\b(?:intelligent\s+design|irreducible\s+complexity|specified\s+(?:complexity|information|fit)|functionally\s+specified|design[-\s]?flaw|teleolog(?:y|ical)|intelligent\s+caus(?:e|ation)|argument\s+from\s+design|inference\s+from\s+design|god\s+of\s+the\s+gaps)\b/i;

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

/** The regress question, and a mind named as God or intelligence. */
const DESIGNER_QUESTION_RE =
  /\b(?:who|what)\s+designed\s+the\s+designer\b/i;
const DESIGNED_BY_MIND_RE =
  /\bdesigned\s+by\s+(?:god|an?\s+intelligence|intelligence)\b/i;

/**
 * "The designer" and "designed by a designer" also name product designers.
 * They count only beside the debate (life, universe, code, God, and the same).
 */
const BARE_DESIGNER_RE =
  /\b(?:the|an|a)\s+designer\b|\bdesigned\s+by\s+a\s+designer\b/i;
const DESIGNER_COMPANION_RE =
  /\b(?:god|intelligence|intelligent|life|universes?|cosmos|creation|codes?|biology|species|organisms?|complexity|information|dna|rna|origins?|genetic|flagell\w*|physics|laws?)\b/i;

/** Fine-tuning a guitar is not the fine-tuning argument. */
const FINE_TUNE_RE = /\bfine[-\s]?tun(?:e|ing|ed)\b/i;
const FINE_TUNE_COMPANION_RE =
  /\b(?:constants?|universes?|cosmos|cosmolog(?:y|ical)|anthropic|design|god|physics|parameters?|life|creators?|creation|multiverse|probabilit(?:y|ies)|physical|laws?)\b/i;

/** A shop watchmaker is not Paley's watchmaker. Blind Watchmaker stays in. */
const WATCHMAKER_RE = /\bwatchmakers?\b/i;
const WATCHMAKER_COMPANION_RE =
  /\b(?:design(?:ed|er)?|god|paley|arguments?|analog(?:y|ies)|universes?|life|creation|teleolog(?:y|ical)|intelligent|complexity|creators?|blind)\b/i;

/** "Creationist" as a shop name is not the creationism dispute. */
const CREATIONISM_RE = /\bcreationis(?:t|m)s?\b/i;
const CREATIONISM_COMPANION_RE =
  /\b(?:design|god|evolution|darwin(?:ian|ism)?|science|biology|life|bible|genesis|labels?|codons?|faith|religion|origins?|intelligent|creation|species|scripture|flood)\b/i;

/** "Anthropic principle" is the debate. Bare "anthropic" needs a companion. */
const ANTHROPIC_PRINCIPLE_RE = /\banthropic\s+principle\b/i;
const ANTHROPIC_BARE_RE = /\banthropic\b/i;
const ANTHROPIC_COMPANION_RE =
  /\b(?:principle|design|constants?|universes?|fine[-\s]?tun|god|life|cosmos|cosmolog(?:y|ical)|parameters?)\b/i;

const STRIP_RES = [
  STRONG_DESIGN_RE,
  STEEL_OBJECT_RE,
  SIM_RE,
  NIHIL_RE,
  MULTIVERSE_REPLY_RE,
  SPIRAL_RE,
  ORIGIN_REPLY_RE,
  DESIGNER_QUESTION_RE,
  DESIGNED_BY_MIND_RE,
  BARE_DESIGNER_RE,
  FINE_TUNE_RE,
  WATCHMAKER_RE,
  CREATIONISM_RE,
  ANTHROPIC_PRINCIPLE_RE,
  ANTHROPIC_BARE_RE,
];

function classHit(text) {
  const t = String(text);
  if (STRONG_DESIGN_RE.test(t)) return true;
  if (STEEL_OBJECT_RE.test(t)) return true;
  if (DESIGNER_QUESTION_RE.test(t)) return true;
  if (DESIGNED_BY_MIND_RE.test(t)) return true;
  if (BARE_DESIGNER_RE.test(t) && DESIGNER_COMPANION_RE.test(t)) return true;
  if (FINE_TUNE_RE.test(t) && FINE_TUNE_COMPANION_RE.test(t)) return true;
  if (WATCHMAKER_RE.test(t) && WATCHMAKER_COMPANION_RE.test(t)) return true;
  if (CREATIONISM_RE.test(t) && CREATIONISM_COMPANION_RE.test(t)) return true;
  if (ANTHROPIC_PRINCIPLE_RE.test(t)) return true;
  if (ANTHROPIC_BARE_RE.test(t) && ANTHROPIC_COMPANION_RE.test(t)) return true;
  if (SIM_RE.test(t)) return true;
  if (NIHIL_RE.test(t)) return true;
  if (MULTIVERSE_REPLY_RE.test(t) && MULTIVERSE_COMPANION_RE.test(t)) return true;
  if (SPIRAL_RE.test(t) && SPIRAL_DESIGN_RE.test(t)) return true;
  if (ORIGIN_REPLY_RE.test(t) && ORIGIN_COMPANION_RE.test(t)) return true;
  return false;
}

/** Letters left after debate phrases are removed. A mash there is not an argument. */
function remainderIsMash(text) {
  let rest = String(text);
  for (const re of STRIP_RES) {
    rest = rest.replace(new RegExp(re.source, "gi"), " ");
  }
  const letters = rest.replace(/[^A-Za-z]/g, "");
  if (letters.length < 6) return false;
  const vowels = (letters.match(/[aeiou]/gi) || []).length;
  if (vowels === 0) return true;
  const counts = {};
  for (const c of letters.toLowerCase()) counts[c] = (counts[c] || 0) + 1;
  const max = Math.max(...Object.values(counts));
  if (max / letters.length > 0.7) return true;
  if (new Set(letters.toLowerCase()).size <= 2) return true;
  return false;
}

/** Split on sentence punctuation followed by whitespace. Decimals such as 1.618 stay intact. */
function sentencesOf(text) {
  return String(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function wordCount(text) {
  return String(text).split(/\s+/).filter(Boolean).length;
}

/**
 * A one-sentence claim can be short. A topic word in its own sentence
 * does not carry the surrounding unrelated sentences.
 */
function hasSubstantiveDesignSentence(text) {
  const parts = sentencesOf(text);
  if (parts.length <= 1) return classHit(text);
  return parts.some((part) => classHit(part) && wordCount(part) >= 6);
}

/**
 * Fail closed. Empty text is not relative. A keyword class must hit,
 * and the hit has to be the argument rather than a passing word or a mash.
 */
export function isRelativeToIntelligentDesign(text) {
  if (!visibleChallengeText(text)) return false;
  const t = String(text);
  if (remainderIsMash(t)) return false;
  if (!classHit(t)) return false;
  if (!hasSubstantiveDesignSentence(t)) return false;
  return true;
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
