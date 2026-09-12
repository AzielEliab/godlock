import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker, { publicPayload, processSubmit } from "./src/index.js";
import { sha256hex } from "./src/ledger.js";
import { CHALLENGE_NOT_RETAINED } from "./src/ui.js";

const PUBLIC_CHALLENGE =
  "Functionally specified digital information joined to a translation reader is the steel class. Pretty spirals are not a proof.";
const ISOLATE_CHALLENGE = "aaaaaaaaaa";

function recordingEnv() {
  const receipts = [];
  const ledger = [];
  const metadata = new Map([
    ["current_score", "50"],
    ["views", "0"],
    ["uses", "0"],
  ]);
  const inserts = [];
  const sqls = [];

  function prepare(sql) {
    const q = String(sql);
    sqls.push(q);
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
          return { n: 0 };
        }
        return null;
      },
      async all() {
        if (/FROM receipts WHERE isolated=0/.test(q)) {
          const limit = Number(bound[0]) || 24;
          return {
            results: receipts.filter((r) => !Number(r.isolated)).slice(0, limit),
          };
        }
        if (/FROM ledger/.test(q)) {
          return { results: ledger };
        }
        return { results: [] };
      },
      async run() {
        if (/INSERT INTO receipts/.test(q)) {
          inserts.push({ sql: q, args: bound.slice() });
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
          inserts.push({ sql: q, args: bound.slice() });
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
    metadata,
    inserts,
    sqls,
  };
}

describe("processSubmit stores challenge text", () => {
  it("persists the exact submitted text and hashes that same string", async () => {
    const rec = recordingEnv();
    const row = await processSubmit(rec.env, PUBLIC_CHALLENGE);
    assert.equal(row.challenge_text, PUBLIC_CHALLENGE);
    assert.equal(row.text_sha256, sha256hex(PUBLIC_CHALLENGE));
    assert.equal(Number(row.isolated), 0);
    const insert = rec.inserts.find((i) => /INSERT INTO receipts/.test(i.sql));
    assert.ok(insert);
    assert.match(insert.sql, /challenge_text/);
    assert.ok(insert.args.includes(PUBLIC_CHALLENGE));
    const submit = rec.ledger.find((e) => e.action === "SUBMIT");
    assert.ok(submit);
    const payload = JSON.parse(submit.payload_json);
    assert.equal(payload.text_sha256, row.text_sha256);
    assert.equal(payload.content_sha256, row.content_sha256);
    assert.equal(payload.challenge_preview, PUBLIC_CHALLENGE.slice(0, 160));
  });

  it("stores isolated challenge text off the public feed", async () => {
    const rec = recordingEnv();
    const row = await processSubmit(rec.env, ISOLATE_CHALLENGE);
    assert.equal(row.isolated, true);
    assert.equal(row.challenge_text, ISOLATE_CHALLENGE);
    assert.equal(row.text_sha256, sha256hex(ISOLATE_CHALLENGE));
    assert.equal(rec.receipts.length, 1);
    assert.equal(Number(rec.receipts[0].isolated), 1);
    const publicRows = rec.receipts.filter((r) => !Number(r.isolated));
    assert.equal(publicRows.length, 0);
    const isolate = rec.ledger.find((e) => e.action === "ISOLATE");
    assert.ok(isolate);
    const payload = JSON.parse(isolate.payload_json);
    assert.equal(payload.text_sha256, row.text_sha256);
    assert.equal(payload.content_sha256, row.content_sha256);
    const uses = rec.ledger.filter((e) => e.action === "SUBMIT" || e.action === "ISOLATE").length;
    assert.equal(uses, 1);
  });
});

describe("receipt HTML/JSON and prior list", () => {
  it("shows stored challenge text on /receipt JSON and HTML", async () => {
    const rec = recordingEnv();
    const row = await processSubmit(rec.env, PUBLIC_CHALLENGE);
    const htmlRes = await worker.fetch(
      new Request("https://godlock.uk/receipt/" + row.id, {
        headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    );
    assert.equal(htmlRes.status, 200);
    const html = await htmlRes.text();
    assert.match(html, /<div class="k">Challenge<\/div>/);
    assert.match(html, /Functionally specified digital information/);
    const jsonRes = await worker.fetch(
      new Request("https://godlock.uk/receipt/" + row.id + "?format=json", {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    );
    const body = await jsonRes.json();
    assert.equal(body.ok, true);
    assert.equal(body.receipt.challenge_text, PUBLIC_CHALLENGE);
    assert.equal(body.receipt.text_sha256, sha256hex(PUBLIC_CHALLENGE));
    assert.ok(body.receipt.summary);
    assert.ok(body.receipt.explanation);
  });

  it("includes a challenge preview on Prior receipts and homepage JSON", async () => {
    const rec = recordingEnv();
    const row = await processSubmit(rec.env, PUBLIC_CHALLENGE);
    const htmlRes = await worker.fetch(
      new Request("https://godlock.uk/", {
        headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    );
    const html = await htmlRes.text();
    assert.match(html, /<h2>Prior receipts<\/h2>/);
    assert.match(html, /Functionally specified digital information/);
    assert.match(html, new RegExp("href=\"/receipt/" + row.id + "\">Full receipt<"));
    const jsonRes = await worker.fetch(
      new Request("https://godlock.uk/?format=json", {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    );
    const body = await jsonRes.json();
    assert.equal(body.ok, true);
    const listed = (body.receipts || []).find((r) => r.id === row.id);
    assert.ok(listed);
    assert.equal(listed.challenge_text, PUBLIC_CHALLENGE);
  });

  it("keeps isolated receipts off the public receipt page and prior feed", async () => {
    const rec = recordingEnv();
    const row = await processSubmit(rec.env, ISOLATE_CHALLENGE);
    const htmlRes = await worker.fetch(
      new Request("https://godlock.uk/receipt/" + row.id, {
        headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    );
    assert.equal(htmlRes.status, 404);
    const html = await htmlRes.text();
    assert.doesNotMatch(html, /aaaaaaaaaa/);
    const jsonRes = await worker.fetch(
      new Request("https://godlock.uk/receipt/" + row.id + "?format=json", {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    );
    assert.equal(jsonRes.status, 404);
    const body = await jsonRes.json();
    assert.equal(body.ok, false);
    assert.equal("challenge_text" in body, false);
    const home = await worker.fetch(
      new Request("https://godlock.uk/?format=json", {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    );
    const listed = await home.json();
    assert.equal((listed.receipts || []).some((r) => r.id === row.id), false);
    assert.equal(publicPayload(row).isolated, 1);
    assert.equal("challenge_text" in publicPayload(row), false);
  });

  it("treats a missing challenge_text column as not retained", () => {
    const payload = publicPayload({
      id: "legacy",
      created_utc: "2026-01-01T00:00:00.000Z",
      label: "Yes",
      summary: "Older hold",
      explanation: "No body.",
      score_before: 50,
      score_after: 50,
      residual: 50,
      text_sha256: "t",
      content_sha256: "c",
      isolated: 0,
    });
    assert.equal(payload.challenge_text, null);
    assert.equal(CHALLENGE_NOT_RETAINED, "challenge text not retained");
  });
});

describe("schema migration", () => {
  it("adds challenge_text inside ensureSchema", async () => {
    const rec = recordingEnv();
    const res = await worker.fetch(
      new Request("https://godlock.uk/health", {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    );
    assert.equal(res.status, 200);
    assert.ok(rec.sqls.some((s) => /ALTER TABLE receipts ADD COLUMN challenge_text TEXT/i.test(s)));
    assert.ok(rec.sqls.some((s) => /CREATE TABLE IF NOT EXISTS receipts/i.test(s) && /challenge_text TEXT/i.test(s)));
  });
});
