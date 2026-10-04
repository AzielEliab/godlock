import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  scoreDebateText, triadSnapshot, debateSummary, describeRescore, meterRemainder, DEBATE_HEADLINE,
  publishedReading, newestPublishedMeter, visitorReceiptLine,
} from "./src/debateScore.js";
import { affectReason, affectedPriors, lineageCore } from "./src/rescore.js";
import { sha256hex } from "./src/ledger.js";
import { hashReceipt } from "./src/engine.js";
import { homeBody, receiptsBody } from "./src/ui.js";
import worker from "./src/index.js";

const TEXT = "Functionally specified digital information joined to a translation reader is a claim about origin. The mapping is stated as a sentence with a hash recorded in the receipt.";

describe("TRIAD_V3 debate score", () => {
  it("uses the published cycle mean and does not write display back into combined", () => {
    const sha = sha256hex(TEXT);
    const review = scoreDebateText(TEXT, sha);
    const snap = triadSnapshot(review);
    assert.equal(snap.schema, "aziel.triad.v3");
    assert.equal(snap.ready, true);
    assert.equal(snap.public_score, "triad_cycle_mean");
    assert.equal(snap.combined, review.triad.triad_cycle_mean);
    assert.equal(snap.display, Math.round(snap.combined * 100));
    assert.notEqual(snap.combined, snap.display);
    assert.equal(meterRemainder(snap.display), 100 - snap.display);
    assert.equal(snap.pairing_count, snap.cycle_factors.length * snap.cycle_factors.length);
    assert.ok(snap.cycle_factors.includes("spre"));
    assert.ok(snap.cycle_factors.includes("clce"));
    assert.ok(snap.cycle_factors.includes("bayesian"));
    assert.ok(snap.omitted.includes("physics"));
    assert.equal(snap.factors.physics, null);
    assert.match(debateSummary(review), /TRIAD_V3 display/);
  });
});

describe("flawless rescore match", () => {
  const prior = {
    id: "abc123",
    challenge_text: "The mapping table is a claim about origin v1",
    text_sha256: "aa",
    isolated: 0,
    score_after: 50.5,
  };

  it("does not rescore a loosely related question", () => {
    const loose = "A different question about shells and pretty ratios in galaxies.";
    assert.equal(affectReason(loose, prior, "bb"), "");
  });

  it("rescores when the new text names the receipt id", () => {
    assert.equal(affectReason("Please look again at receipt abc123.", prior, "bb"), "explicit_id");
  });

  it("rescores an explicit supersedes link", () => {
    assert.equal(affectReason("supersedes abc123", prior, "bb"), "explicit");
  });

  it("rescores the same succession after a version tail", () => {
    assert.equal(lineageCore(prior.challenge_text), lineageCore("The mapping table is a claim about origin v2"));
    assert.equal(affectReason("The mapping table is a claim about origin v2", prior, "bb"), "subject_title_lineage");
  });

  it("does not rescore identical bytes", () => {
    assert.equal(affectReason(prior.challenge_text, prior, prior.text_sha256), "");
  });

  it("labels a legacy rescore without erasing the old number", () => {
    const after = triadSnapshot(scoreDebateText(prior.challenge_text, sha256hex(prior.challenge_text)));
    const note = describeRescore({
      affectReason: "explicit_id",
      previousDisplay: prior.score_after,
      previousSource: "stored_score_after",
      beforeSnap: null,
      afterSnap: after,
    });
    assert.match(note, /Earlier receipt was rescored/);
    assert.match(note, /50\.5/);
    assert.match(note, /was not rewritten|is kept/);
    assert.match(note, new RegExp(String(after.display)));
  });

  it("returns only the priors the new question affects", () => {
    const hits = affectedPriors("supersedes abc123", [prior, { ...prior, id: "other", challenge_text: "unrelated words here please" }], "cc");
    assert.deepEqual(hits.map((h) => h.prior.id), ["abc123"]);
  });
});

describe("debate page", () => {
  it("states the headline and keeps the meters", () => {
    const html = homeBody({
      stats: { triad_display: 42, meter_remainder: 58, current_score: 42, residual: 58 },
      latest: null,
      prior: [],
    });
    assert.match(html, new RegExp(DEBATE_HEADLINE.replace(".", "\\.")));
    assert.match(html, /id="stat-current-score">42%/);
    assert.match(html, /id="stat-residual">58%/);
    assert.match(html, /id="steer"/);
    assert.match(html, /Triad display/);
    assert.doesNotMatch(html, /floor 33\.3/);
    assert.doesNotMatch(html, /Specified Fit, Not Pretty Spirals/);
    assert.match(html, /not a claim that bias is impossible/);
  });
});

describe("published reading of stored challenge text", () => {
  const TEXT = "Functionally specified digital information joined to a translation reader is a claim about origin. The mapping is stated as a sentence with a hash recorded in the receipt.";
  const row = {
    id: "legacy1",
    created_utc: "2026-09-21T17:28:54.169Z",
    label: "No",
    challenge_text: TEXT,
    text_sha256: sha256hex(TEXT),
    score_before: 50.2,
    score_after: 50.5,
    residual: 49.5,
    isolated: 0,
    summary: "kept",
    explanation: "kept",
    content_sha256: "abc",
  };

  it("reads TRIAD_V3 from the stored text and leaves the old score on the row", () => {
    const before = JSON.stringify(row);
    const reading = publishedReading(row);
    const snap = triadSnapshot(scoreDebateText(TEXT, row.text_sha256));
    assert.equal(reading.ready, true);
    assert.equal(reading.schema, "aziel.triad.v3");
    assert.equal(reading.display, snap.display);
    assert.equal(reading.combined, snap.combined);
    assert.equal(reading.display, Math.round(reading.combined * 100));
    assert.notEqual(reading.combined, reading.display);
    assert.equal(meterRemainder(reading.display), 100 - reading.display);
    assert.equal(JSON.stringify(row), before);
    const moved = publishedReading({ ...row, score_before: 1, score_after: 99, label: "Yes" });
    assert.equal(moved.display, reading.display);
    assert.equal(moved.combined, reading.combined);
    const line = visitorReceiptLine(row);
    assert.match(line, new RegExp("TRIAD_V3 display " + reading.display));
    assert.match(line, /Old stored label No/);
    assert.match(line, /Old stored score 50\.2% → 50\.5%/);
    assert.match(line, /Original receipt kept/);
    assert.match(line, /was not rewritten/);
    assert.doesNotMatch(line, /Not yet rescored/);
    assert.doesNotMatch(line, /cannot be biased|unbiased/i);
    const html = receiptsBody({
      rows: [row],
      total: 1,
      page: 1,
      pageSize: 50,
      stats: {
        triad_display: reading.display,
        meter_remainder: 100 - reading.display,
        current_score: 50.5,
        residual: 49.5,
        receipts: 1,
      },
    });
    assert.match(html, new RegExp("TRIAD_V3 display " + reading.display));
    assert.match(html, /Old stored score 50\.2%/);
    assert.match(html, /triad reading/);
    assert.match(html, /stored challenge text is missing, that row is not scored/i);
    assert.doesNotMatch(html, /Not yet rescored/);
    assert.match(html, new RegExp('id="steer-current-score">' + reading.display + "%"));
    assert.match(html, new RegExp('id="steer-residual">' + (100 - reading.display) + "%"));
    assert.equal(reading.display + (100 - reading.display), 100);
  });

  it("leaves missing or empty stored text unscored", () => {
    const missing = { ...row, challenge_text: null };
    const reading = publishedReading(missing);
    assert.equal(reading.ready, false);
    assert.equal(reading.status, "missing");
    assert.equal(reading.display, null);
    const line = visitorReceiptLine(missing);
    assert.match(line, /Stored challenge text is missing/);
    assert.match(line, /not scored with TRIAD_V3/);
    assert.match(line, /Old stored score 50\.2% → 50\.5%/);
    assert.doesNotMatch(line, /TRIAD_V3 display \d/);
    const empty = publishedReading({ ...row, challenge_text: " \n\t" });
    assert.equal(empty.status, "empty");
    assert.equal(empty.display, null);
    assert.match(visitorReceiptLine({ ...row, challenge_text: " \n\t" }), /Stored challenge text is empty/);
  });

  it("still says what a flawless rescore changed and keeps the old number", () => {
    const after = triadSnapshot(scoreDebateText(row.challenge_text, row.text_sha256));
    const note = describeRescore({
      affectReason: "explicit_id",
      previousDisplay: row.score_after,
      previousSource: "stored_score_after",
      beforeSnap: null,
      afterSnap: after,
    });
    const rescored = {
      ...row,
      rescores: [{
        reason: "explicit_id",
        display: after.display,
        changed_note: note,
        created_utc: "2026-10-03T00:00:00.000Z",
      }],
      latest_rescore: {
        reason: "explicit_id",
        display: after.display,
        changed_note: note,
        created_utc: "2026-10-03T00:00:00.000Z",
      },
    };
    const line = visitorReceiptLine(rescored);
    assert.match(line, /Earlier receipt was rescored/);
    assert.match(line, /50\.5/);
    assert.match(line, /is kept|was not rewritten/);
    assert.match(line, /Old stored score 50\.2% → 50\.5%/);
    assert.match(line, new RegExp("TRIAD_V3 display " + after.display));
    assert.equal(rescored.score_after, 50.5);
    assert.equal(rescored.label, "No");
  });

  it("uses the newest scoreable stored text for the meter and does not write receipts", async () => {
    const writes = [];
    const newerMissing = {
      id: "new-missing",
      created_utc: "2026-10-01T00:00:00.000Z",
      challenge_text: null,
      text_sha256: "aa",
      label: "Interesting",
      score_before: 50,
      score_after: 50.5,
      residual: 49.5,
      isolated: 0,
      summary: "s",
      explanation: "e",
      content_sha256: hashReceipt({
        id: "new-missing",
        created_utc: "2026-10-01T00:00:00.000Z",
        text_sha256: "aa",
        label: "Interesting",
        summary: "s",
        explanation: "e",
        score_before: 50,
        score_after: 50.5,
        residual: 49.5,
        isolated: 0,
      }),
    };
    const older = {
      ...row,
      id: "older",
      created_utc: "2026-09-01T00:00:00.000Z",
      content_sha256: "stored-hash",
    };
    const metadata = new Map([["current_score", "49.5"]]);
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
          if (/COUNT\(\*\) AS n FROM receipts WHERE isolated=0/.test(q)) return { n: 2 };
          if (/COUNT\(\*\) AS n FROM receipts/.test(q)) return { n: 2 };
          if (/COUNT\(\*\) AS n FROM ledger/.test(q)) return { n: 0 };
          if (/FROM heartbeats/.test(q)) return { n: 0 };
          if (/SELECT \* FROM receipts WHERE id=/.test(q)) {
            return [newerMissing, older].find((r) => r.id === bound[0]) || null;
          }
          return null;
        },
        async all() {
          if (/steer-aggregate/.test(q)) {
            return { results: [newerMissing, older].map((r) => ({ label: r.label, challenge_text: r.challenge_text, isolated: r.isolated })) };
          }
          if (/FROM receipts WHERE isolated=0/.test(q)) {
            return { results: [newerMissing, older] };
          }
          if (/receipt_rescores/.test(q)) return { results: [] };
          return { results: [] };
        },
        async run() {
          writes.push(q);
          return { success: true };
        },
      };
      return stmt;
    }
    const env = {
      DB: { prepare, async batch() { return []; } },
      MESH_PROBE_ORIGIN: false,
    };
    const reading = publishedReading(older);
    const meter = newestPublishedMeter([newerMissing, older]);
    assert.equal(meter.receipt_id, "older");
    assert.equal(meter.display, reading.display);
    assert.equal(meter.remainder, 100 - reading.display);
    const count = await (await worker.fetch(new Request("https://godlock.uk/count"), env)).json();
    assert.equal(count.triad_display, reading.display);
    assert.equal(count.meter_remainder, 100 - reading.display);
    assert.equal(count.triad_display + count.meter_remainder, 100);
    assert.equal(count.triad_display_source, "stored_challenge_text");
    assert.equal(count.current_score, 49.5);
    const home = await (await worker.fetch(new Request("https://godlock.uk/"), env)).text();
    assert.match(home, new RegExp('id="stat-current-score">' + reading.display + "%"));
    assert.match(home, new RegExp('id="stat-residual">' + (100 - reading.display) + "%"));
    assert.match(home, /TRIAD_V3 display /);
    assert.match(home, /Old stored score/);
    assert.match(home, /Stored challenge text is missing/);
    assert.doesNotMatch(home, /Not yet rescored/);
    const list = await (await worker.fetch(new Request("https://godlock.uk/receipts"), env)).text();
    assert.match(list, /TRIAD_V3 display /);
    assert.match(list, /Old stored label No/);
    assert.match(list, /Stored challenge text is missing\. This receipt is not scored with TRIAD_V3/);
    assert.equal(newerMissing.score_before, 50);
    assert.equal(newerMissing.score_after, 50.5);
    assert.equal(newerMissing.challenge_text, null);
    assert.equal(older.score_before, 50.2);
    assert.equal(older.score_after, 50.5);
    assert.equal(older.challenge_text, TEXT);
    assert.equal(older.content_sha256, "stored-hash");
    assert.equal(older.label, "No");
    assert.equal(writes.some((q) => /INSERT INTO receipts|UPDATE receipts|DELETE FROM receipts/i.test(q)), false);
  });
});
