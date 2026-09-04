/**
 * GodLock.uk locked protocol: isolate, score, answer.
 * ABAD / φ / √2 / Flower of Life / corkscrew are an engagement heuristic,
 * not a proof of physics. Author: Aziel Eliab.
 */
import { sha256hex, canonicalJson } from "./ledger.js";

export const FLOOR = 33.3;
export const CEILING = 99.7;
export const START = 50;
export const LABELS = ["Yes", "No", "Let's review", "Interesting"];

const AI_MODELS = [
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "@cf/meta/llama-3.2-11b-instruct",
  "@cf/meta/llama-3.1-8b-instruct",
  "@cf/meta/llama-3.2-3b-instruct",
];

const FAMILY_WEIGHTS = {
  aziel_sequence: 3.0,
  phi: 2.0,
  sqrt2: 2.0,
  flower_of_life: 2.5,
  corkscrew: 2.0,
  abad: 3.0,
};

const FAMILY_PATTERNS = {
  aziel_sequence: [/aziel\s+sequence/i, /aziel[-_]?seq(?:uence)?/i],
  phi: [/\bphi\b/i, /golden\s+ratio/i, /φ/, /\b1\.618\d*\b/],
  sqrt2: [/sqrt\s*\(?\s*2/i, /√\s*2/, /square\s+root\s+of\s+2/i, /\b1\.414\d*\b/],
  flower_of_life: [/flower\s+of\s+life/i, /vesica\s+piscis/i],
  corkscrew: [/corkscrew/i],
  abad: [/\babad\b/i, /a\s*[-–—]\s*b\s*[-–—]\s*a\s*[-–—]\s*d/i],
};

const ID_RE = /intelligent\s*design|design[- ]flaw|irreducible\s+complexity|specified\s+complexity|watchmaker|fine[- ]tun(?:e|ing)|anthropic\s+principle|creation(?:ist|ism)?|counter[- ]argument|stress[- ]test|falsif|empirical|framework|heuristic/i;

export function clampScore(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return START;
  return Math.min(CEILING, Math.max(FLOOR, Math.round(x * 10) / 10));
}

export function residualOf(score) {
  return Math.round((100 - clampScore(score)) * 10) / 10;
}

export function scoreEngagement(text) {
  const hits = [];
  let score = 0;
  for (const [family, patterns] of Object.entries(FAMILY_PATTERNS)) {
    if (patterns.some((p) => p.test(text))) {
      hits.push(family);
      score += FAMILY_WEIGHTS[family];
    }
  }
  return { score: Math.round(score * 10) / 10, hits };
}

export function isHighEffortChallenge(text) {
  const t = String(text || "");
  if (ID_RE.test(t)) return true;
  const eng = scoreEngagement(t);
  if (eng.hits.length) return true;
  const words = t.trim().split(/\s+/).filter((w) => w.length > 2);
  if (words.length >= 12 && /[aeiou]/i.test(t) && t.trim().length >= 80) return true;
  return false;
}

export function isGibberish(text) {
  const t = String(text || "").trim();
  if (!t) return true;
  const letters = t.replace(/[^A-Za-z]/g, "");
  const vowels = (letters.match(/[aeiouAEIOU]/g) || []).length;
  if (letters.length < 8 && vowels === 0) return true;
  if (letters.length >= 8) {
    const counts = {};
    for (const c of letters.toLowerCase()) counts[c] = (counts[c] || 0) + 1;
    const max = Math.max(0, ...Object.values(counts));
    if (max / letters.length > 0.7) return true;
    const uniq = new Set(letters.toLowerCase());
    if (uniq.size <= 2) return true;
  }
  if (vowels === 0 && letters.length < 24) return true;
  const mash = /^(?:[asdfghjkl;']{8,}|[qwertyuiop]{8,}|[zxcvbnm]{8,}|[a-z]{1,2}\1{6,})$/i;
  if (mash.test(t.replace(/\s+/g, ""))) return true;
  return false;
}

export function shouldIsolate(text) {
  if (isHighEffortChallenge(text)) return false;
  return isGibberish(text);
}

export function isAmbiguous(text) {
  const t = String(text || "").trim();
  if (!t) return true;
  if (isHighEffortChallenge(t)) return false;
  const words = t.split(/\s+/).filter(Boolean);
  if (t.length < 24 || words.length < 4) return true;
  if (!/[aeiou]/i.test(t)) return true;
  return false;
}

function looksEnglish(text) {
  const t = String(text || "");
  const letters = t.replace(/[^A-Za-z\u00C0-\u024F]/g, "");
  if (!letters) return false;
  const latin = (t.match(/[A-Za-z]/g) || []).length;
  return latin / Math.max(letters.length, 1) > 0.6;
}

function normalizeLabel(raw) {
  const s = String(raw || "").trim();
  const low = s.toLowerCase().replace(/['’]/g, "'");
  if (low === "yes") return "Yes";
  if (low === "no") return "No";
  if (low === "interesting") return "Interesting";
  if (low.includes("review") || low === "lets review" || low === "let's review") return "Let's review";
  return "";
}

function clampDelta(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(-3, Math.min(3, Math.round(x * 10) / 10));
}

function extractJson(raw) {
  const s = String(raw || "").trim();
  if (!s) return null;
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1].trim() : s;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}


function asText(v, max) {
  const cap = max || 8000;
  if (v == null) return "";
  if (typeof v === "string") return v.trim().slice(0, cap);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map((x) => asText(x, cap)).filter(Boolean).join("\n").slice(0, cap);
  if (typeof v === "object") {
    for (const k of ["text", "summary", "explanation", "content", "value"]) {
      if (typeof v[k] === "string" && v[k].trim()) return v[k].trim().slice(0, cap);
    }
    const parts = [];
    for (const k of Object.keys(v)) {
      const s = asText(v[k], cap);
      if (s && s !== "[object Object]") parts.push(s);
    }
    return parts.join("\n").slice(0, cap);
  }
  const s = String(v);
  return s === "[object Object]" ? "" : s.slice(0, cap);
}

function coerceModelObject(raw) {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    if (raw.label || raw.summary || raw.explanation) return raw;
    if (raw.response && typeof raw.response === "object") return coerceModelObject(raw.response);
    if (raw.response && typeof raw.response === "string") return extractJson(raw.response);
    return raw;
  }
  return extractJson(raw);
}

export function parseModelOutput(raw, currentScore) {
  const obj = coerceModelObject(raw);
  let label = "";
  let summary = "";
  let explanation = "";
  let score_delta = 0;
  let weighing = "";
  if (obj && typeof obj === "object") {
    label = normalizeLabel(asText(obj.label, 40));
    summary = asText(obj.summary, 600);
    explanation = asText(obj.explanation, 8000);
    score_delta = clampDelta(obj.score_delta);
    weighing = asText(obj.weighing, 800);
    const blob = (JSON.stringify(obj) + " " + explanation).toUpperCase();
    if (blob.includes("SUPERSEDED")) score_delta = 0;
  } else {
    const lines = String(raw || "").split(/\n+/).map((l) => l.trim()).filter(Boolean);
    if (lines.length) {
      label = normalizeLabel(lines[0].replace(/^[#>*\-\s]+/, "").split(/[.:-]/)[0]);
      summary = lines[1] || lines[0];
      explanation = lines.slice(2).join("\n");
    }
  }
  if (!label) label = "Let's review";
  if (!summary) summary = "The engine recorded the challenge under the locked protocol.";
  if (!explanation) explanation = summary;
  const next = clampScore(currentScore + score_delta);
  const actualDelta = Math.round((next - currentScore) * 10) / 10;
  return {
    label,
    summary: summary.slice(0, 600),
    explanation: explanation.slice(0, 8000),
    score_delta: actualDelta,
    weighing: (weighing || ("delta " + actualDelta)).slice(0, 800),
    residual: residualOf(next),
  };
}

function systemPrompt(currentScore, priorNodes) {
  const nodes = (priorNodes || []).map((n, i) => {
    return (i + 1) + ". id=" + n.id + " label=" + n.label + " score " + n.score_before + "→" + n.score_after
      + " hash=" + String(n.content_sha256 || "").slice(0, 16)
      + " summary=" + String(n.summary || "").slice(0, 180);
  }).join("\n") || "(none yet)";
  return [
    "You are the GodLock public HTTPS engine. Author: Aziel Eliab only.",
    "GodLock is a product name, not an identity. Never credit Horton, OpenAI, or GodLock.AZ.",
    "This surface stress-tests the ABAD framework: A-B-A-D layering, Aziel Sequence, phi / golden ratio / φ, √2, Flower of Life / vesica piscis, corkscrew growth.",
    "Those tokens are an engagement heuristic, not a proof of physics, not a laboratory rate, and not a claim that a ratio appears in nature at a published frequency.",
    "Intelligent-design and design-flaw challenges are welcome and processed under the same locked protocol. Never isolate a high-effort challenge.",
    "This is a public HTTPS bootstrap engine. Mesh, gossip, Tor, tunnels, and IP-to-IP networking are NOT running here. Never claim they are.",
    "English only.",
    "Current confidence score: " + currentScore + ". Floor " + FLOOR + ". Ceiling " + CEILING + ". Residual uncertainty = 100 − new score.",
    "Score may go down when a challenge holds. SUPERSEDED does not affect scoring (force score_delta 0).",
    "Let's review is ONLY for ambiguous, non-English, or too-short input (score_delta 0). A complete intelligent-design or design-flaw challenge MUST be Interesting, Yes, or No — never Let's review — and MUST include score_delta (negative when the challenge holds).",
    "Prior public receipt nodes (cite them by id when relevant):",
    nodes,
    "Reply with JSON only, no markdown:",
    '{"label":"Yes|No|Let\'s review|Interesting","summary":"...","explanation":"...","score_delta":0.0,"weighing":"..."}',
    "label must be exactly one of those four. score_delta is typically in [-3, 3].",
    "explanation must be long and empirically honest. If the challenge lands, say so and lower the score.",
    "Public summary and explanation: locked protocol only (Yes, No, Let's review, Interesting, score, residual). Do not name internal determination methods or unpublished frameworks.",
  ].join("\n");
}

async function runAi(env, text, currentScore, priorNodes) {
  if (!env || !env.AI || typeof env.AI.run !== "function") return null;
  const user = "Challenge text:\n" + String(text || "").slice(0, 6000);
  const messages = [
    { role: "system", content: systemPrompt(currentScore, priorNodes) },
    { role: "user", content: user },
  ];
  let lastErr = "";
  for (const model of AI_MODELS) {
    try {
      const res = await env.AI.run(model, { messages, max_tokens: 1400, temperature: 0.3 });
      let raw = "";
      if (typeof res === "string") raw = res;
      else if (res && typeof res.response === "string") raw = res.response;
      else if (res && res.response && typeof res.response === "object") raw = res.response;
      else if (res && typeof res === "object") raw = res;
      const parsed = parseModelOutput(raw, currentScore);
      if (parsed && parsed.summary && parsed.summary !== "[object Object]") {
        parsed.model = model;
        return parsed;
      }
      lastErr = "empty from " + model;
    } catch (err) {
      lastErr = (err && err.message) ? err.message : String(err);
    }
  }
  return lastErr ? { error: lastErr } : null;
}

export function fallbackAnswer(text, currentScore, priorNodes) {
  const t = String(text || "").trim();
  const prior = (priorNodes || []).slice(0, 8);
  const cite = prior.length
    ? " Prior receipt nodes: " + prior.map((n) => n.id + " (" + n.label + ")").join(", ") + "."
    : " No prior public receipt nodes exist yet.";
  const eng = scoreEngagement(t);
  const idHit = ID_RE.test(t);
  const empirical = /empirical|experiment|measur|dataset|observ|replicat|peer[- ]review|p-value|laboratory|falsif/i.test(t);
  const meshClaim = /\b(vpn|tor|mesh|gossip|cloudflared|tunnel|anonymity network)\b/i.test(t)
    && /(is|running|live|hidden|masked|peer)/i.test(t)
    && !/(not|no|isn't|is not|never)/i.test(t);
  const designGap = /not a proof|not physics|engineering default|keyword|circular|heuristic only|no laboratory/i.test(t);

  let label = "Let's review";
  let delta = 0;
  let summary = "";
  let explanation = "";
  let weighing = "";

  if (!t) {
    label = "No";
    summary = "Empty input. Nothing was scored.";
    explanation = "The locked protocol requires a challenge in English. No text was present, so the engine answers No and does not move the confidence score." + cite;
    weighing = "Empty input: score_delta 0.";
  } else if (!looksEnglish(t)) {
    label = "Let's review";
    summary = "Please resubmit the challenge in English.";
    explanation = "This public surface is English only. The engine did not score the input." + cite;
    weighing = "Language gate: score_delta 0.";
  } else if (isAmbiguous(t) && !idHit && !eng.hits.length) {
    label = "Let's review";
    summary = "The input is too thin to weigh. Please state the design-flaw or intelligent-design challenge in a full sentence.";
    explanation = "Ambiguous or very short input is not scored. Intelligent-design and design-flaw attacks are processed when they carry a claim the engine can weigh against the ABAD heuristic (φ, √2, Flower of Life, corkscrew, A-B-A-D). Restate the objection." + cite;
    weighing = "Ambiguous: score_delta 0.";
  } else if (meshClaim) {
    label = "No";
    delta = -0.2;
    summary = "This HTTPS surface is not a mesh, VPN, Tor hop, or tunnel.";
    explanation = "GodLock.uk is a public HTTPS bootstrap engine. Mesh, gossip, cloudflared tunnels, masked IPs, and EigenTrust networking are not running here. Treating them as live on this surface is a category error. The engine records the claim and lowers confidence slightly because the public copy must stay honest." + cite;
    weighing = "False mesh/VPN claim on this surface: -0.2.";
  } else if (empirical && eng.hits.length && !designGap) {
    label = "Yes";
    delta = Math.min(1.5, 0.4 + eng.hits.length * 0.2);
    summary = "The challenge cites an empirical check and engages the ABAD token families.";
    explanation = "Families hit: " + eng.hits.join(", ") + ". The engine treats that as engagement with the framework being stress-tested, not as laboratory proof that φ or √2 appear in nature at a published rate. Weights in the local scorer are engineering defaults. A passing empirical citation raises confidence only as a recorded engagement, with residual uncertainty kept explicit." + cite;
    weighing = "Empirical citation + family hits " + eng.hits.join(",") + ": +" + delta + ".";
  } else if (idHit || designGap) {
    label = "Interesting";
    delta = designGap ? -0.6 : -0.3;
    summary = "Intelligent-design / design-flaw challenge accepted. The framework is a heuristic, not a physics proof.";
    explanation = "GodLock exists to be attacked. ABAD, φ, √2, Flower of Life, and corkscrew are the named surface. Engagement scoring is a keyword/family heuristic (see abad.py weights), not a ROC study and not a claim about nature. If the challenge is that intelligent design (or a design flaw) is being smuggled in as physics, that objection holds as a category correction: this engine already states the weights are defaults. Confidence moves down because the public score must not pretend a proof was added." + (eng.hits.length ? " Families also present: " + eng.hits.join(", ") + "." : "") + cite;
    weighing = "Valid design-flaw / ID stress: " + delta + " after explicit weighing.";
  } else if (eng.hits.length) {
    label = "Interesting";
    delta = Math.min(1.2, 0.2 + eng.hits.length * 0.15);
    summary = "The text engages ABAD/φ/√2/Flower of Life/corkscrew without a closed empirical proof.";
    explanation = "Hits: " + eng.hits.join(", ") + ". Engagement raises the local heuristic. It does not convert the framework into physics. Residual uncertainty stays " + residualOf(currentScore + delta) + " after clamp." + cite;
    weighing = "Engagement families " + eng.hits.join(",") + ": +" + delta + ".";
  } else {
    label = "Let's review";
    summary = "Need a clearer claim against the ABAD surface.";
    explanation = "The engine can weigh intelligent-design disputes, design flaws, and empirical checks aimed at ABAD / φ / √2 / Flower of Life / corkscrew. Restate the challenge as a sentence the protocol can score." + cite;
    weighing = "Unscoped: score_delta 0.";
  }

  if (label === "Let's review") delta = 0;
  const next = clampScore(currentScore + delta);
  const actual = Math.round((next - currentScore) * 10) / 10;
  return {
    label,
    summary,
    explanation,
    score_delta: actual,
    weighing,
    residual: residualOf(next),
    model: "godlock-local-scorer-0.1",
  };
}

export async function answerChallenge(env, text, currentScore, priorNodes) {
  const t = String(text || "");
  const ai = await runAi(env, t, currentScore, priorNodes);
  let out = (ai && ai.label && ai.summary && ai.summary !== "[object Object]") ? ai : null;
  if (!out) {
    out = fallbackAnswer(t, currentScore, priorNodes);
    if (ai && ai.error) {
      out.explanation = out.explanation + " (Workers AI unavailable; local scorer used.)";
    }
  }
  if (out.label === "Let's review" && !isAmbiguous(t) && isHighEffortChallenge(t)) {
    out.label = "Interesting";
    if (!out.score_delta) {
      const blob = String(out.explanation || "") + " " + String(out.summary || "");
      const holds = /holds|valid|correct|gap|not a proof|heuristic|design flaw|category/i.test(blob);
      out.score_delta = holds ? -0.5 : 0.3;
      out.weighing = (out.weighing ? out.weighing + " " : "") + "Protocol: high-effort challenge remapped from Let's review to Interesting.";
    }
  }
  if (out.label === "Let's review") out.score_delta = 0;
  const next = clampScore(currentScore + Number(out.score_delta || 0));
  out.score_delta = Math.round((next - currentScore) * 10) / 10;
  out.residual = residualOf(next);
  return out;
}

export function receiptContent(row) {
  return {
    id: row.id,
    created_utc: row.created_utc,
    text_sha256: row.text_sha256,
    label: row.label,
    summary: row.summary,
    explanation: row.explanation,
    score_before: row.score_before,
    score_after: row.score_after,
    residual: row.residual,
    isolated: row.isolated,
  };
}

export function hashReceipt(row) {
  return sha256hex(canonicalJson(receiptContent(row)));
}
