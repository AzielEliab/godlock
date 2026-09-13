/**
 * ACT-RECEIPT-1.0 page lattice for /receipts only.
 * Four-field public action receipts + previous_hash chain.
 * Does not replace the GodLock challenge ledger.
 * Author: Aziel Eliab.
 */
import { canonicalJson, sha256hex, ZERO } from "./ledger.js";
import {
  AZIEL_OFFICIAL,
  AZIEL_PERSON_ID,
  CANON_HOST,
  HEDIDNTJUMP,
  HEDIDNTJUMP_LABEL,
  LIBRARY,
  RUNTIME_VERSION,
} from "./seo.js";

export const ACT_RECEIPT_SPEC = "ACT-RECEIPT-1.0";
export const ACT_RECEIPT_HEADING = "Public action receipts (ACT-RECEIPT-1.0)";
export const ACT_RECEIPT_ORIGIN = LIBRARY.replace(/\/$/, "") + "/receipts";
export const ACT_RECEIPT_ZERO = ZERO;
export const ACT_RECEIPT_SURFACE = "godlock.uk";

export const ACT_RECEIPT_SISTERS = [
  { id: "ae", label: "ae", href: AZIEL_OFFICIAL.replace(/\/$/, "") + "/receipts" },
  { id: "HDJ", label: "HDJ", href: HEDIDNTJUMP.replace(/\/$/, "") + "/receipts" },
];

const DROP_META = /^(user|email|ip|geo|location|lat|lon|longitude|latitude|cookie|cookies|token|tokens|authorization)$/i;

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

export function oneSentence(text) {
  const raw = String(text == null ? "" : text).replace(/\s+/g, " ").trim();
  if (!raw) return "";
  const m = raw.match(/^(.+?[.!?])(?:\s|$)/);
  return m ? m[1] : raw;
}

export function sanitizeMeta(meta) {
  const src = meta && typeof meta === "object" && !Array.isArray(meta) ? meta : {};
  const out = {};
  for (const [key, value] of Object.entries(src)) {
    if (DROP_META.test(key)) continue;
    if (value == null) continue;
    const t = typeof value;
    out[key] = t === "string" || t === "number" || t === "boolean" ? value : String(value);
  }
  return out;
}

export function actCanonicalPayload({ action, output, metadata, previous_hash }) {
  return {
    action: oneSentence(action),
    metadata: sanitizeMeta(metadata),
    output: oneSentence(output),
    previous_hash: previous_hash || ACT_RECEIPT_ZERO,
    spec: ACT_RECEIPT_SPEC,
  };
}

export function hashActReceipt(payload) {
  return sha256hex(canonicalJson(payload));
}

export function chainActReceipts(events) {
  let previous_hash = ACT_RECEIPT_ZERO;
  return (events || []).map((ev) => {
    const payload = actCanonicalPayload({
      action: ev.action,
      output: ev.output,
      metadata: ev.metadata,
      previous_hash,
    });
    const hash = hashActReceipt(payload);
    const row = {
      id: ev.id || ("AZACT-" + hash.slice(0, 12)),
      hash,
      entry_hash: hash,
      previous_hash: payload.previous_hash,
      action: payload.action,
      output: payload.output,
      metadata: payload.metadata,
      created_utc: ev.created_utc || "",
      spec: ACT_RECEIPT_SPEC,
    };
    previous_hash = hash;
    return row;
  });
}

export function verifyActChain(receipts) {
  const rows = Array.isArray(receipts) ? receipts : [];
  const errors = [];
  let expectedPrev = ACT_RECEIPT_ZERO;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const prev = String(r.previous_hash || "");
    if (prev !== expectedPrev) errors.push("chain break at " + i);
    const payload = actCanonicalPayload({
      action: r.action,
      output: r.output,
      metadata: r.metadata,
      previous_hash: r.previous_hash,
    });
    const hash = hashActReceipt(payload);
    if (hash !== String(r.hash || r.entry_hash || "")) errors.push("hash mismatch at " + i);
    expectedPrev = String(r.hash || r.entry_hash || "");
  }
  return {
    ok: errors.length === 0,
    entries: rows.length,
    errors,
    spec: ACT_RECEIPT_SPEC,
    ledger_head: expectedPrev,
  };
}

export function challengeToActEvent(row) {
  const challenge = row && row.challenge_text != null ? String(row.challenge_text) : "";
  return {
    id: row && row.id ? "AZACT-" + String(row.id).replace(/[^A-Za-z0-9]/g, "").slice(0, 12) : undefined,
    action: challenge || "Submit a Specified Fit challenge.",
    output: (row && (row.summary || row.label)) || "Challenge recorded on GodLock.",
    created_utc: row && row.created_utc ? row.created_utc : "",
    metadata: {
      surface: ACT_RECEIPT_SURFACE,
      path: "/submit",
      method: "POST",
      status: 200,
      tool: "godlock_challenge",
      spec: ACT_RECEIPT_SPEC,
      runtime: RUNTIME_VERSION,
      challenge_id: row && row.id ? String(row.id) : "",
    },
  };
}

/** Oldest-first hash chain from public GodLock challenge rows. Isolated rows must not be passed in. */
export function actRowsFromChallenges(rows) {
  const oldest = (rows || []).slice().sort((a, b) =>
    String(a && a.created_utc || "").localeCompare(String(b && b.created_utc || "")),
  );
  return chainActReceipts(oldest.map(challengeToActEvent));
}

export function actReceiptItems(receipts) {
  const newestFirst = (receipts || []).slice().reverse();
  return newestFirst.map((r) => {
    const meta = r.metadata || {};
    const bits = [meta.surface, meta.method, meta.path, meta.tool, meta.spec].filter(Boolean).join(" · ");
    return `<li>
      <div class="k">Hash</div>
      <div class="hash">${esc(r.hash || r.entry_hash || "")}</div>
      <div class="k">Action</div>
      <p class="act-field">${esc(r.action)}</p>
      <div class="k">Output</div>
      <p class="act-field">${esc(r.output)}</p>
      <div class="k">Event</div>
      <p class="act-meta muted">${esc(bits)}</p>
      <div class="k">previous_hash</div>
      <div class="hash">${esc(r.previous_hash || ACT_RECEIPT_ZERO)}</div>
    </li>`;
  }).join("");
}

export function actReceiptsSection(challengeRows) {
  const chained = actRowsFromChallenges(challengeRows);
  const verified = verifyActChain(chained);
  const items = actReceiptItems(chained);
  const list = items
    ? `<ul class="prior act-list">${items}</ul>`
    : `<p class="muted">No public action receipts on this host yet. Significant actions only — not page views.</p>`;
  const sisters = ACT_RECEIPT_SISTERS.map((s) =>
    `<a href="${esc(s.href)}">${esc(s.label)}</a> tip`,
  ).join(" · ");
  const count = chained.length;
  const chainNote = verified.ok
    ? `${count} four-field row${count === 1 ? "" : "s"} · chain verified`
    : "chain verification failed";
  return `
<section class="act-receipts" id="act-receipts">
  <h2>${esc(ACT_RECEIPT_HEADING)}</h2>
  <p>Cross-lattice public action receipts for this host. Four fields only: hash, one-sentence action, one-sentence output, event metadata. Hash-chained with <code>previous_hash</code>. Not the GodLock Yes / No / Let's review challenge ledger above. Not every page view.</p>
  <p class="muted">Origin: <a href="${esc(ACT_RECEIPT_ORIGIN)}">${esc(ACT_RECEIPT_ORIGIN)}</a>. Sister tips: ${sisters} (${esc(HEDIDNTJUMP_LABEL)}). Person @id <a href="${esc(AZIEL_PERSON_ID)}">${esc(AZIEL_PERSON_ID)}</a>.</p>
  <p class="muted">${esc(chainNote)} · host ${esc(CANON_HOST)}/receipts</p>
  ${list}
</section>`;
}
