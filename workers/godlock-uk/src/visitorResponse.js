/**
 * Read-time response for a stored receipt.
 * Uses the existing local scorer (fallbackAnswer) when the stored
 * summary/explanation is the TRIAD_V3 method essay. Does not call a model.
 * Does not write or rewrite the receipt row.
 * Author: Aziel Eliab.
 */
import { fallbackAnswer } from "./engine.js";
import { hideInternalDetermination } from "./publicCopy.js";
import { visibleChallengeText } from "./challengeText.js";

const PROTOCOL = new Set(["Yes", "No", "Let's review", "Interesting"]);

const METHOD_RE = /TRIAD_V3 display|The score is the published corpus triad|not written back into combined|Factors that do not apply are omitted|Applicable factors in this cycle|Omitted, not scored as 0|No listed factor was omitted|That number is those published checkers|A later question rescores an earlier receipt|Display is round\(combined/;

const ASIDE_RE = /Rescored earlier receipts|No earlier receipt was in a flawless succession|Earlier receipt was rescored/;

const BOILER = [
  /\s*No prior public receipt nodes exist yet\./g,
  /\s*Prior receipt nodes:[^.]*\./g,
  /\s*Residual uncertainty stays explicit\. Floor 33\.3\. Ceiling 99\.7\./g,
  /\s*Residual uncertainty stays [\d.]+ after clamp\. Floor 33\.3\. Ceiling 99\.7\./g,
  /\s*\(Workers AI unavailable; local scorer used\.\)/g,
];

/** Phrases the home page must not grow. Receipt pages still show the full local answer. */
export const HOME_RESPONSE_BAN = /SPLIT THE WIRES|COLD-COPY SURVIVAL|REHEAL|die-with-pull|QNM-BUILD-1\.0|anonymity network|Public HTTPS engine|Residual uncertainty|Current confidence|Specified Fit, Not Pretty Spirals|Score floor 33\.3|INTERNAL_CRITERIA|bootstrap lock|floor 33\.3/;

export function isScoringMethodCopy(text) {
  return METHOD_RE.test(String(text || ""));
}

function splitSentences(text) {
  return String(text || "").split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

function stripBoiler(text) {
  let s = String(text || "");
  for (const re of BOILER) {
    re.lastIndex = 0;
    s = s.replace(re, "");
  }
  return s.replace(/[ \t]{2,}/g, " ").trim();
}

function clean(text) {
  return hideInternalDetermination(stripBoiler(text));
}

function successionAside(explanation) {
  return splitSentences(explanation).filter((s) => ASIDE_RE.test(s)).join(" ");
}

function protocolLabel(label) {
  const s = String(label || "");
  return PROTOCOL.has(s) ? s : "";
}

function numeric(n, fallback) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

function joinUnique(a, b) {
  const left = String(a || "").trim();
  const right = String(b || "").trim();
  if (!right || left.includes(right)) return left;
  return (left + " " + right).trim();
}

/**
 * Visitor-facing answer for one stored row.
 * Stored summary/explanation are left untouched on the row.
 */
export function visitorResponse(row) {
  const storedSummary = clean(row && row.summary != null ? String(row.summary) : "");
  const storedExplanation = clean(row && row.explanation != null ? String(row.explanation) : "");
  const aside = successionAside(storedExplanation);
  const summaryIsMethod = isScoringMethodCopy(storedSummary);
  const explanationIsMethod = isScoringMethodCopy(storedExplanation);
  const challenge = row && row.challenge_text != null ? String(row.challenge_text) : null;
  const canAnswer = challenge != null && visibleChallengeText(challenge);

  if (!summaryIsMethod && !explanationIsMethod) {
    const summary = storedSummary || "Receipt recorded under the locked protocol.";
    const explanation = storedExplanation || summary;
    return {
      label: protocolLabel(row && row.label),
      summary,
      explanation: joinUnique(explanation, aside),
      derived: false,
    };
  }

  if (!canAnswer) {
    const summary = "Challenge text was not retained, so no response is invented for this receipt.";
    return { label: "", summary, explanation: joinUnique(summary, aside), derived: false };
  }

  const local = fallbackAnswer(challenge, numeric(row && row.score_before, 50), []);
  const summary = summaryIsMethod ? clean(local.summary) : (storedSummary || clean(local.summary));
  const explanationBody = explanationIsMethod ? clean(local.explanation) : (storedExplanation || clean(local.explanation));
  return {
    label: protocolLabel(local.label) || protocolLabel(row && row.label),
    summary,
    explanation: joinUnique(explanationBody, aside),
    derived: true,
  };
}

export function paragraphFrom(spoken, { full = true } = {}) {
  const lead = spoken && spoken.label ? spoken.label + "." : "";
  let text = [lead, spoken && spoken.summary, spoken && spoken.explanation]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (!full) {
    text = splitSentences(text).filter((s) => !HOME_RESPONSE_BAN.test(s)).join(" ").replace(/\s+/g, " ").trim();
  }
  return text || "Receipt recorded under the locked protocol.";
}

export function responseParagraph(row, opts) {
  return paragraphFrom(visitorResponse(row), opts);
}
