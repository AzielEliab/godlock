import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker, { processSubmit, publicPayload, REFUSE } from "./src/index.js";
import {
  inspectChallengeBody,
  inspectChallengeForm,
  validateChallengeText,
  visibleChallengeText,
} from "./src/challengeText.js";
import { checkSubmitGuard, SUBMIT_RATE_MAX, submitFingerprint } from "./src/submitGuard.js";
import { sha256hex } from "./src/ledger.js";
import { FLOOR, CEILING, LABELS } from "./src/engine.js";
import { homeBody } from "./src/ui.js";
import { siteOpenApi } from "./src/seo.js";

const VALID =
  "Functionally specified digital information joined to a translation reader is the steel class. Pretty spirals are not a proof.";
const EMPTY_SHA256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

function submitEnv() {
  const receipts = [];
  const ledger = [];
  const heartbeats = new Map();
  const guard = new Map();
  const metadata = new Map([
    ["current_score", "50"],
    ["views", "0"],
    ["uses", "0"],
  ]);

  function gkey(kind, key) {
    return String(kind) + "\0" + String(key);
  }

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
        if (/SELECT COUNT\(\*\) AS n FROM ledger WHERE action IN/.test(q)) {
          return { n: ledger.filter((e) => e.action === "SUBMIT" || e.action === "ISOLATE").length };
        }
        if (/SELECT COUNT\(\*\) AS n FROM ledger/.test(q)) {
          return { n: ledger.length };
        }
        if (/SELECT COUNT\(\*\) AS n FROM receipts WHERE isolated=0/.test(q)) {
          return { n: receipts.filter((r) => !Number(r.isolated)).length };
        }
        if (/SELECT COUNT\(\*\) AS n FROM receipts/.test(q)) {
          return { n: receipts.length };
        }
        if (/SELECT \* FROM receipts WHERE id=/.test(q)) {
          return receipts.find((r) => r.id === bound[0]) || null;
        }
        if (/FROM ledger ORDER BY sequence DESC/.test(q)) {
          const last = ledger[ledger.length - 1];
          return last ? { sequence: last.sequence, entry_hash: last.entry_hash } : null;
        }
        if (/FROM heartbeats/.test(q)) {
          return { n: heartbeats.size };
        }
        if (/SELECT last_ms, count FROM submit_guard/.test(q)) {
          const row = guard.get(gkey(bound[0], bound[1]));
          return row ? { last_ms: row.last_ms, count: row.count } : null;
        }
        return null;
      },
      async all() {
        if (/FROM receipts WHERE isolated=0/.test(q)) {
          const limit = Number(bound[0]) || 5;
          const offset = Number(bound[1]) || 0;
          const rows = receipts
            .filter((r) => !Number(r.isolated))
            .slice()
            .sort((a, b) => String(b.created_utc || "").localeCompare(String(a.created_utc || "")));
          return { results: rows.slice(offset, offset + limit) };
        }
        if (/FROM ledger/.test(q)) {
          return { results: ledger };
        }
        return { results: [] };
      },
      async run() {
        if (/INSERT INTO receipts/.test(q)) {
          const cols = (q.match(/INSERT INTO receipts\(([^)]+)\)/i) || ["", ""])[1]
            .split(",")
            .map((c) => c.trim());
          const row = {};
          cols.forEach((c, i) => {
            row[c] = bound[i];
          });
          receipts.push(row);
        }
        if (/INSERT INTO ledger/.test(q)) {
          ledger.push({
            sequence: bound[0],
            timestamp_utc: bound[1],
            action: bound[2],
            payload_json: bound[3],
            previous_hash: bound[4],
            entry_hash: bound[5],
          });
        }
        if (/INSERT INTO metadata/.test(q) || /ON CONFLICT\(key\)/.test(q)) {
          metadata.set(String(bound[0]), String(bound[1]));
        }
        if (/INSERT INTO heartbeats/.test(q)) {
          heartbeats.set(String(bound[0]), { last_utc: bound[1], last_ms: bound[2] });
        }
        if (/DELETE FROM heartbeats/.test(q)) {
          /* keep test rows */
        }
        if (/INSERT INTO submit_guard/.test(q)) {
          guard.set(gkey(bound[0], bound[1]), { last_ms: bound[2], count: bound[3] });
        }
        if (/DELETE FROM submit_guard/.test(q)) {
          const cut = Number(bound[0]) || 0;
          for (const [k, v] of guard) {
            if (v.last_ms < cut) guard.delete(k);
          }
        }
        return { success: true };
      },
    };
    return stmt;
  }

  return {
    env: {
      DB: {
        prepare,
        async batch(list) {
          return Promise.all((list || []).map(() => ({})));
        },
      },
      MESH_PROBE_ORIGIN: false,
    },
    receipts,
    ledger,
    heartbeats,
    guard,
    metadata,
  };
}

function jsonSubmit(body, extraHeaders) {
  const init = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0",
      ...(extraHeaders || {}),
    },
  };
  if (body !== undefined) init.body = body === null ? "null" : JSON.stringify(body);
  return new Request("https://godlock.uk/submit", init);
}

async function postSubmit(env, body, extraHeaders) {
  return worker.fetch(jsonSubmit(body, extraHeaders), env);
}

describe("challenge text validation", () => {
  it("refuses null, missing, empty, and whitespace-ish text before any score", () => {
    assert.equal(validateChallengeText(null).code, REFUSE.NULL_ARG);
    assert.equal(validateChallengeText(undefined).code, REFUSE.NULL_ARG);
    assert.equal(validateChallengeText("").code, REFUSE.EMPTY_TEXT);
    assert.equal(validateChallengeText("   ").code, REFUSE.EMPTY_TEXT);
    assert.equal(validateChallengeText("\n\t").code, REFUSE.EMPTY_TEXT);
    assert.equal(validateChallengeText("\u200b").code, REFUSE.EMPTY_TEXT);
    assert.equal(inspectChallengeBody({}).code, REFUSE.NULL_ARG);
    assert.equal(inspectChallengeBody({ text: null }).code, REFUSE.NULL_ARG);
    assert.equal(inspectChallengeBody(null).code, REFUSE.NULL_ARG);
    assert.equal(inspectChallengeBody({ text: "" }).code, REFUSE.EMPTY_TEXT);
    assert.equal(visibleChallengeText("  hi  "), "hi");
    const ok = validateChallengeText(VALID);
    assert.equal(ok.ok, true);
    assert.equal(ok.text, VALID);
  });

  it("reads a form field the same way as JSON text", () => {
    const form = {
      has(k) {
        return k === "text";
      },
      get() {
        return "   ";
      },
    };
    assert.equal(inspectChallengeForm(form).code, REFUSE.EMPTY_TEXT);
    const missing = { has() { return false; }, get() { return null; } };
    assert.equal(inspectChallengeForm(missing).code, REFUSE.NULL_ARG);
  });
});

describe("POST /submit refuses empty/null and does not archive", () => {
  const cases = [
    { name: "empty object", body: {}, code: REFUSE.NULL_ARG },
    { name: "text null", body: { text: null }, code: REFUSE.NULL_ARG },
    { name: "body null", body: null, code: REFUSE.NULL_ARG },
    { name: "empty string", body: { text: "" }, code: REFUSE.EMPTY_TEXT },
    { name: "whitespace", body: { text: "  \n\t  " }, code: REFUSE.EMPTY_TEXT },
  ];

  for (const c of cases) {
    it("refuses " + c.name + " with " + c.code, async () => {
      const rec = submitEnv();
      const res = await postSubmit(rec.env, c.body);
      assert.equal(res.status, 400);
      const j = await res.json();
      assert.equal(j.ok, false);
      assert.equal(j.code, c.code);
      assert.equal(j.scored, false);
      assert.equal(j.archived, false);
      assert.equal(j.author, "Aziel Eliab");
      assert.equal(j.product, "GodLock");
      assert.equal(j.id, undefined);
      assert.doesNotMatch(JSON.stringify(j), /uploads/i);
      assert.doesNotMatch(JSON.stringify(j), /1 Chronicles 15:20/);
      assert.equal(rec.receipts.length, 0);
      assert.equal(rec.ledger.length, 0);
      assert.equal(rec.heartbeats.size, 0);
      assert.equal(rec.metadata.get("uses"), "0");
      assert.ok(!rec.receipts.some((r) => r.text_sha256 === EMPTY_SHA256));
    });
  }

  it("refuses a form with empty text", async () => {
    const rec = submitEnv();
    const res = await worker.fetch(new Request("https://godlock.uk/submit", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",
      },
      body: "text=",
    }), rec.env);
    assert.equal(res.status, 400);
    const j = await res.json();
    assert.equal(j.code, REFUSE.EMPTY_TEXT);
    assert.equal(rec.receipts.length, 0);
  });

  it("processSubmit throws and does not insert for empty/null", async () => {
    const rec = submitEnv();
    await assert.rejects(() => processSubmit(rec.env, ""), (err) => {
      assert.equal(err.refused, true);
      assert.equal(err.code, REFUSE.EMPTY_TEXT);
      return true;
    });
    await assert.rejects(() => processSubmit(rec.env, null), (err) => {
      assert.equal(err.code, REFUSE.NULL_ARG);
      return true;
    });
    assert.equal(rec.receipts.length, 0);
    assert.equal(rec.ledger.length, 0);
  });
});

describe("POST /submit still scores one valid challenge", () => {
  it("archives a real challenge and keeps floor 33.3 / ceiling 99.7 labels", async () => {
    const rec = submitEnv();
    const res = await postSubmit(rec.env, { text: VALID });
    assert.equal(res.status, 200);
    const j = await res.json();
    assert.equal(j.ok, true);
    assert.equal(!!j.isolated, false);
    assert.ok(j.id);
    assert.equal(j.challenge_text, VALID);
    assert.equal(j.text_sha256, sha256hex(VALID));
    assert.notEqual(j.text_sha256, EMPTY_SHA256);
    assert.ok(LABELS.includes(j.label));
    assert.ok(j.score_after >= FLOOR && j.score_after <= CEILING);
    assert.ok(j.score_before >= FLOOR && j.score_before <= CEILING);
    assert.equal(j.author, undefined);
    assert.equal(rec.receipts.length, 1);
    assert.ok(rec.ledger.some((e) => e.action === "SUBMIT"));
    assert.equal(publicPayload(rec.receipts[0]).challenge_text, VALID);
    const visible = homeBody({ stats: { current_score: j.score_after, residual: j.residual }, latest: rec.receipts[0], prior: [] });
    assert.match(visible, /Score floor 33\.3 · ceiling 99\.7/);
    assert.match(visible, /Yes, No, Let's review, or Interesting/);
    assert.doesNotMatch(visible, /1 Chronicles 15:20/);
    assert.doesNotMatch(visible, /uploads/i);
  });
});

describe("submit anti-spam", () => {
  it("rejects the same sha256 inside the short window", async () => {
    const rec = submitEnv();
    const first = await postSubmit(rec.env, { text: VALID }, { "CF-Connecting-IP": "203.0.113.9" });
    assert.equal(first.status, 200);
    const second = await postSubmit(rec.env, { text: VALID }, { "CF-Connecting-IP": "203.0.113.9" });
    assert.equal(second.status, 429);
    assert.ok(second.headers.get("Retry-After"));
    const j = await second.json();
    assert.equal(j.ok, false);
    assert.equal(j.code, REFUSE.DUP_TEXT);
    assert.equal(j.archived, false);
    assert.equal(rec.receipts.length, 1);
  });

  it("rate-limits a fingerprint after the window max", async () => {
    const rec = submitEnv();
    const req = new Request("https://godlock.uk/submit", {
      method: "POST",
      headers: { "User-Agent": "Mozilla/5.0", "CF-Connecting-IP": "198.51.100.7" },
    });
    const fp = submitFingerprint(req);
    assert.equal(fp.length, 32);
    const now = Date.now();
    for (let i = 0; i < SUBMIT_RATE_MAX; i++) {
      const g = await checkSubmitGuard(rec.env, req, "challenge body " + i, now);
      assert.equal(g.ok, true);
    }
    const blocked = await checkSubmitGuard(rec.env, req, "challenge body overflow", now);
    assert.equal(blocked.ok, false);
    assert.equal(blocked.code, REFUSE.RATE_LIMIT);
    assert.equal(blocked.status, 429);
    assert.ok(blocked.retryAfter >= 1);
  });
});

describe("submit docs stay honest", () => {
  it("lists refuse codes on OpenAPI /submit", () => {
    const spec = siteOpenApi();
    const post = spec.paths["/submit"].post;
    assert.ok(post.responses["400"]);
    assert.match(post.responses["400"].description, /GODLOCK-NULL-ARG/);
    assert.match(post.responses["400"].description, /GODLOCK-EMPTY-TEXT/);
    assert.match(post.responses["429"].description, /GODLOCK-RATE-LIMIT/);
    assert.match(post.responses["429"].description, /GODLOCK-DUP-TEXT/);
  });
});
