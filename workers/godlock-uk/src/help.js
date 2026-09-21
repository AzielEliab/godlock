/**
 * Additive human help / addendum text. Author: Aziel Eliab.
 * Plain-language discoverability. Positive definitions only.
 * Does not replace /llms.txt, /ai.txt, or /cite.json.
 */
import {
  AUTHOR,
  AZIEL_OFFICIAL,
  AZIEL_PERSON_ID,
  CANON_HOST,
  GODLOCK_SITE_BLURB,
  OFFICIAL_SOFTWARES,
  SOFTWARE_HTML_SUITE_NOTE,
  SOFTWARE_HUB_LOCAL_NOTE,
  SOFTWARE_SSOT,
  SOFTWARE_SSOT_FALLBACK,
  SOFTWARE_PATH,
  VERIFY_PATH,
  RECEIPTS_PATH,
  WHO_PATH,
  WHO_IS_PATH,
  WHY_IS_PATH,
  WHY_OFFICIAL,
  X_URL,
  X_HANDLE,
  GLAMA_RUNTIME,
  AUTHOR_GITHUB,
  AZIEL_ELIAB_PATH,
  REASON_PATH,
  RUNTIME_PATH,
} from "./seo.js";

export const HELP_PATH = "/help.txt";
export const HELP_PATH_UPPER = "/HELP.txt";
export const ADDENDUM_PATH = "/addendum.txt";
export const HELP_README_PATH = "/help/README.txt";
export const HELP_SHORT_PATH = "/help";

export const HELP_PATHS = Object.freeze([
  HELP_PATH,
  HELP_PATH_UPPER,
  ADDENDUM_PATH,
  HELP_README_PATH,
  HELP_SHORT_PATH,
]);

export function isHelpPath(path) {
  return HELP_PATHS.includes(path);
}

/** Plain-language human help. Positive product + verify + Softwares + Person + machine links. */
export function helpDoc() {
  return [
    "GodLock.uk — human help",
    "",
    "Author: " + AUTHOR,
    "Person @id: " + AZIEL_PERSON_ID,
    "Official site: " + AZIEL_OFFICIAL,
    "",
    "## What GodLock is",
    "",
    GODLOCK_SITE_BLURB,
    "Growth-ON. Never invent. NO-LIE.",
    "",
    "## How to verify",
    "",
    "Walk the public hash-chained ledger: " + CANON_HOST + VERIFY_PATH,
    "Public receipts: " + CANON_HOST + RECEIPTS_PATH,
    "Paste a first-screen SHA-256 on /verify (?hash=) to check the tip.",
    "Every scored challenge is hash-chained into an append-only ledger.",
    "",
    "## Steer",
    "",
    "Steer is the share of scored public challenges: intelligent design (Specified Fit / bio code+reader), multi-simulation, Big Bang / standard cosmology (physics ledger), and undecided.",
    "Shares sum to 100. Current confidence and residual uncertainty stay a separate score (floor 33.3 · ceiling 99.7).",
    "Layer B (biology) and Layer C (cosmology) stay separate ledgers. GodLock records, analyzes, hardens, and grows.",
    "Machine fields live on " + CANON_HOST + "/count : current_score, residual, steer, steer_leader, scales.",
    "",
    "## Softwares",
    "",
    SOFTWARE_HTML_SUITE_NOTE,
    SOFTWARE_HUB_LOCAL_NOTE.trim(),
    "GodLock Softwares page: " + CANON_HOST + SOFTWARE_PATH,
    "Official Softwares listing: " + OFFICIAL_SOFTWARES,
    "Suite Softwares catalog (Worker SSoT): " + SOFTWARE_SSOT,
    "Same-origin suite catalog: " + CANON_HOST + RUNTIME_PATH + "/v1/software",
    "FragGate list fallback only: " + SOFTWARE_SSOT_FALLBACK,
    "",
    "## Person",
    "",
    "Public identity is Aziel Eliab only. Person @id is always " + AZIEL_PERSON_ID + ".",
    "Who page: " + CANON_HOST + WHO_PATH,
    "Why (machine): " + CANON_HOST + WHY_IS_PATH,
    "Official why: " + WHY_OFFICIAL,
    "X " + X_HANDLE + ": " + X_URL,
    "GitHub: " + AUTHOR_GITHUB,
    "Try on Glama: " + GLAMA_RUNTIME,
    "About: " + CANON_HOST + AZIEL_ELIAB_PATH,
    "Specified Fit, Not Pretty Spirals: " + CANON_HOST + REASON_PATH,
    "",
    "## Machine surfaces (existing)",
    "",
    "llms.txt: " + CANON_HOST + "/llms.txt",
    "ai.txt: " + CANON_HOST + "/ai.txt",
    "cite.json: " + CANON_HOST + "/cite.json",
    "robots.txt: " + CANON_HOST + "/robots.txt",
    "who-is: " + CANON_HOST + WHO_IS_PATH,
    "why-is: " + CANON_HOST + WHY_IS_PATH,
    "Runtime door: " + CANON_HOST + RUNTIME_PATH,
    "OpenAPI: " + CANON_HOST + "/openapi.json",
    "MCP discovery: " + CANON_HOST + "/.well-known/mcp.json",
    "",
    "## This addendum",
    "",
    "Same body on /help.txt, /HELP.txt, /addendum.txt, /help/README.txt, and /help.",
    "These files explain GodLock in plain language. They sit beside the machine crawl aids; they do not replace them.",
    "",
  ].join("\n");
}
