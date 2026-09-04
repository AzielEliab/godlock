import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PRESENCE_TTL_MS,
  PRESENCE_CLEANUP_MS,
  liveNodeCountFromDb,
  submissionCountFromRows,
  presenceCutoff,
} from "./src/presence.js";

describe("liveNodeCountFromDb", () => {
  it("returns the D1 count when heartbeats are visible", () => {
    assert.equal(liveNodeCountFromDb(3, true), 3);
    assert.equal(liveNodeCountFromDb("2", false), 2);
  });

  it("counts the current visitor when D1 read is empty after a write", () => {
    assert.equal(liveNodeCountFromDb(0, true), 1);
    assert.equal(liveNodeCountFromDb(null, true), 1);
  });

  it("stays 0 when nobody heartbeated", () => {
    assert.equal(liveNodeCountFromDb(0, false), 0);
    assert.equal(liveNodeCountFromDb(undefined, false), 0);
  });
});

describe("submissionCountFromRows", () => {
  it("prefers receipts over wiped metadata uses", () => {
    assert.equal(submissionCountFromRows({ receipts: 7, ledgerSubmits: 0, uses: 0 }), 7);
  });

  it("falls back to ledger SUBMIT/ISOLATE when receipts were wiped", () => {
    assert.equal(submissionCountFromRows({ receipts: 0, ledgerSubmits: 4, uses: 0 }), 4);
  });

  it("falls back to uses only when receipts and ledger are empty", () => {
    assert.equal(submissionCountFromRows({ receipts: 0, ledgerSubmits: 0, uses: 2 }), 2);
    assert.equal(submissionCountFromRows({ receipts: 0, ledgerSubmits: 0, uses: 0 }), 0);
  });

  it("counts isolated receipts (receipts includes isolated rows)", () => {
    assert.equal(submissionCountFromRows({ receipts: 2, ledgerSubmits: 2, uses: 1 }), 2);
  });
});

describe("presenceCutoff", () => {
  it("uses a 5-minute live window and a longer cleanup window", () => {
    assert.equal(PRESENCE_TTL_MS, 5 * 60 * 1000);
    assert.equal(PRESENCE_CLEANUP_MS, 15 * 60 * 1000);
    const now = Date.parse("2026-09-04T13:00:00.000Z");
    const c = presenceCutoff(now);
    assert.equal(c.sinceMs, now - PRESENCE_TTL_MS);
    assert.equal(c.cleanupMs, now - PRESENCE_CLEANUP_MS);
    assert.equal(c.sinceIso, "2026-09-04T12:55:00.000Z");
  });
});
