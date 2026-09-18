import { describe, it } from "node:test";
import assert from "node:assert/strict";
import worker, { publicPayload, processSubmit, parseDownloadTotal } from "./src/index.js";
import { sha256hex } from "./src/ledger.js";
import { CHALLENGE_NOT_RETAINED, receiptsBody, homeBody, navItems, topNav } from "./src/ui.js";
import {
  ACT_RECEIPT_HEADING,
  ACT_RECEIPT_ORIGIN,
  ACT_RECEIPT_SISTERS,
  ACT_RECEIPT_SPEC,
  ACT_RECEIPT_ZERO,
  actRowsFromChallenges,
  oneSentence,
  sanitizeMeta,
  verifyActChain,
} from "./src/actReceipts.js";

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
          const limit = Number(bound[0]) || 5;
          const offset = Number(bound[1]) || 0;
          const rows = receipts
            .filter((r) => !Number(r.isolated))
            .slice()
            .sort((a, b) => String(b.created_utc || "").localeCompare(String(a.created_utc || "")));
          return {
            results: rows.slice(offset, offset + limit),
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
    assert.match(html, /href="\/receipts">Full receipts chain</);
    assert.match(html, /id="stat-receipts">/);
    assert.match(html, /Functionally specified digital information/);
    assert.match(html, new RegExp("href=\"/receipt/" + row.id + "\">Full receipt<"));
    assert.doesNotMatch(html, /class="donate-home"/);
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

describe("Receipts tab and homepage last five", () => {
  it("serves /receipts with the full public chain and stored challenge text", async () => {
    const rec = recordingEnv();
    const row = await processSubmit(rec.env, PUBLIC_CHALLENGE);
    const htmlRes = await worker.fetch(
      new Request("https://godlock.uk/receipts", {
        headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    );
    assert.equal(htmlRes.status, 200);
    const html = await htmlRes.text();
    assert.match(html, /<title>Receipts — GodLock<\/title>/);
    assert.match(html, /href="\/receipts"[^>]*aria-current="page"/);
    assert.match(html, /Functionally specified digital information/);
    assert.match(html, new RegExp("/receipt/" + row.id));
    assert.match(html, /id="stat-receipts">1</);
    assert.match(html, /stress-test engine/);
    const jsonRes = await worker.fetch(
      new Request("https://godlock.uk/receipts?format=json", {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    );
    const body = await jsonRes.json();
    assert.equal(body.ok, true);
    assert.equal(body.path, "/receipts");
    assert.equal(body.total, 1);
    assert.equal(body.receipts.length, 1);
    assert.equal(body.receipts[0].challenge_text, PUBLIC_CHALLENGE);
    assert.equal(body.stats.receipts, 1);
  });

  it("308s /prior to /receipts", async () => {
    const rec = recordingEnv();
    const res = await worker.fetch(
      new Request("https://godlock.uk/prior", { headers: { "User-Agent": "Mozilla/5.0" } }),
      rec.env,
    );
    assert.equal(res.status, 308);
    assert.equal(res.headers.get("Location"), "/receipts");
  });

  it("lists at most five receipts on the homepage when more exist", async () => {
    const rec = recordingEnv();
    for (let i = 0; i < 7; i++) {
      rec.receipts.push({
        id: "id" + i,
        created_utc: "2026-09-0" + (i + 1) + "T00:00:00.000Z",
        challenge_text: "challenge body " + i,
        label: "Yes",
        summary: "s" + i,
        explanation: "e",
        isolated: 0,
        content_sha256: "c" + i,
      });
    }
    const htmlRes = await worker.fetch(
      new Request("https://godlock.uk/", {
        headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    );
    const html = await htmlRes.text();
    assert.match(html, /id="stat-receipts">7</);
    assert.match(html, /challenge body 6/);
    assert.doesNotMatch(html, /challenge body 0/);
    assert.doesNotMatch(html, /challenge body 1/);
    const jsonRes = await worker.fetch(
      new Request("https://godlock.uk/?format=json", {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    );
    const body = await jsonRes.json();
    assert.equal(body.receipts.length, 5);
    assert.equal(body.stats.receipts, 7);
    const tab = await (await worker.fetch(
      new Request("https://godlock.uk/receipts?format=json", {
        headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    )).json();
    assert.equal(tab.total, 7);
    assert.equal(tab.receipts.length, 7);
  });
});

describe("download tally is never views plus uses", () => {
  it("reads tracker total/downloads and rejects invented sums", () => {
    assert.equal(parseDownloadTotal({ total: 81, downloads: 81, views: 143 }), 81);
    assert.equal(parseDownloadTotal({ downloads: 26 }), 26);
    assert.equal(parseDownloadTotal({ count: 9 }), 9);
    assert.equal(parseDownloadTotal(null), null);
    assert.equal(parseDownloadTotal({ views: 1213, uses: 35 }), null);
  });
});

describe("ACT-RECEIPT-1.0 section on /receipts only", () => {
  it("keeps a single Receipts tab pointed at /receipts", () => {
    const tabs = navItems().filter((it) => it.label === "Receipts");
    assert.equal(tabs.length, 1);
    assert.equal(tabs[0].href, "/receipts");
    const nav = topNav("/receipts");
    assert.match(nav, /href="\/receipts"[^>]*aria-current="page"/);
    assert.equal((nav.match(/href="\/receipts"/g) || []).length, 1);
    assert.doesNotMatch(nav, /act-receipts/);
  });

  it("keeps the challenge ledger first and adds the ACT lattice below", async () => {
    const rec = recordingEnv();
    const row = await processSubmit(rec.env, PUBLIC_CHALLENGE);
    const htmlRes = await worker.fetch(
      new Request("https://godlock.uk/receipts", {
        headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    );
    const html = await htmlRes.text();
    assert.match(html, /<h1 class="soft-heading">Receipts<\/h1>/);
    assert.match(html, /Public questions and the hash-chained receipt list/);
    assert.match(html, /Functionally specified digital information/);
    assert.match(html, new RegExp("/receipt/" + row.id));
    assert.match(html, /<h2>Public action receipts \(ACT-RECEIPT-1\.0\)<\/h2>/);
    assert.match(html, /id="ingest-tip"/);
    assert.match(html, /cite, don't merge/);
    const challengeAt = html.indexOf("Public questions and the hash-chained receipt list");
    const ingestAt = html.indexOf('id="ingest-tip"');
    const actAt = html.indexOf(ACT_RECEIPT_HEADING);
    assert.ok(challengeAt > 0 && ingestAt > challengeAt && actAt > ingestAt);
    assert.match(html, /href="https:\/\/www\.azielcorpuslibrary\.net\/receipts"/);
    assert.equal(ACT_RECEIPT_ORIGIN, "https://www.azielcorpuslibrary.net/receipts");
    assert.match(html, /href="https:\/\/www\.azieleliab\.com\/receipts">ae</);
    assert.match(html, /href="https:\/\/www\.hedidntjump\.com\/receipts">HDJ</);
    assert.equal(ACT_RECEIPT_SISTERS[0].id, "ae");
    assert.equal(ACT_RECEIPT_SISTERS[1].id, "HDJ");
    assert.match(html, /href="https:\/\/www\.azieleliab\.com\/#aziel"/);
    const actStart = html.indexOf('id="act-receipts"');
    assert.ok(actStart > 0);
    assert.doesNotMatch(html.slice(actStart), /1 Chronicles 15:20/);
    assert.match(html, /<div class="k">Hash<\/div>/);
    assert.match(html, /<div class="k">Action<\/div>/);
    assert.match(html, /<div class="k">Output<\/div>/);
    assert.match(html, /<div class="k">Event<\/div>/);
    assert.match(html, /<div class="k">previous_hash<\/div>/);
    assert.match(html, /chain verified/);
    const home = await (await worker.fetch(
      new Request("https://godlock.uk/", {
        headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
      }),
      rec.env,
    )).text();
    assert.match(home, /<h2>Prior receipts<\/h2>/);
    assert.doesNotMatch(home, /Public action receipts \(ACT-RECEIPT-1\.0\)/);
  });

  it("does not change homepage Prior chrome and leaves empty ACT list honest", () => {
    const home = homeBody({ stats: { receipts: 0 }, latest: null, prior: [] });
    assert.match(home, /<h2>Prior receipts<\/h2>/);
    assert.doesNotMatch(home, /ACT-RECEIPT-1\.0/);
    const empty = receiptsBody({ rows: [], total: 0, page: 1, pageSize: 50, stats: { receipts: 0 } });
    assert.match(empty, /No public receipts yet/);
    assert.match(empty, /Public action receipts \(ACT-RECEIPT-1\.0\)/);
    assert.match(empty, /No public action receipts on this host yet/);
    assert.doesNotMatch(empty, /1 Chronicles 15:20/);
  });

  it("verifies the four-field previous_hash chain from public challenge rows", () => {
    assert.equal(oneSentence("Mint a receipt. Then publish."), "Mint a receipt.");
    const clean = sanitizeMeta({
      user: "nope",
      email: "a@b.c",
      ip: "1.2.3.4",
      location: "home",
      surface: "godlock.uk",
      path: "/submit",
    });
    assert.equal(clean.user, undefined);
    assert.equal(clean.email, undefined);
    assert.equal(clean.ip, undefined);
    assert.equal(clean.location, undefined);
    assert.equal(clean.surface, "godlock.uk");
    const rows = [
      {
        id: "old",
        created_utc: "2026-09-10T12:00:00.000Z",
        challenge_text: "First challenge asks whether specified fit holds.",
        label: "Yes",
        summary: "Specified fit holds on the steel class.",
      },
      {
        id: "new",
        created_utc: "2026-09-11T12:00:00.000Z",
        challenge_text: "Second challenge asks about pretty spirals.",
        label: "No",
        summary: "Pretty spirals are not a proof.",
      },
    ];
    const chained = actRowsFromChallenges(rows);
    assert.equal(chained.length, 2);
    assert.equal(chained[0].previous_hash, ACT_RECEIPT_ZERO);
    assert.equal(chained[1].previous_hash, chained[0].hash);
    assert.equal(chained[0].action, "First challenge asks whether specified fit holds.");
    assert.equal(chained[1].output, "Pretty spirals are not a proof.");
    assert.equal(chained[0].metadata.user, undefined);
    assert.equal(chained[0].metadata.surface, "godlock.uk");
    assert.equal(chained[0].spec, ACT_RECEIPT_SPEC);
    const report = verifyActChain(chained);
    assert.equal(report.ok, true);
    assert.equal(report.entries, 2);
    assert.equal(report.errors.length, 0);
    const broken = chained.map((r, i) => i === 1 ? { ...r, previous_hash: ACT_RECEIPT_ZERO } : r);
    assert.equal(verifyActChain(broken).ok, false);
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
    assert.ok(rec.sqls.some((s) => /CREATE TABLE IF NOT EXISTS submit_guard/i.test(s)));
  });
});
