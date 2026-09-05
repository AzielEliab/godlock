import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PRESENCE_TTL_MS,
  PRESENCE_CLEANUP_MS,
  liveNodeCountFromDb,
  usesCountFromLedger,
  presenceCutoff,
} from "./src/presence.js";
import { hideInternalDetermination } from "./src/publicCopy.js";

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

describe("usesCountFromLedger", () => {
  it("counts ledger SUBMIT and ISOLATE only", () => {
    assert.equal(usesCountFromLedger({ ledgerSubmits: 7 }), 7);
    assert.equal(usesCountFromLedger({ ledgerSubmits: "2" }), 2);
  });

  it("is 0 when nothing is on the receipt ledger", () => {
    assert.equal(usesCountFromLedger({ ledgerSubmits: 0 }), 0);
    assert.equal(usesCountFromLedger({}), 0);
    assert.equal(usesCountFromLedger({ ledgerSubmits: null }), 0);
  });

  it("does not use receipts or metadata as a substitute for the ledger", () => {
    assert.equal(usesCountFromLedger({ ledgerSubmits: 0, receipts: 9, uses: 9 }), 0);
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

describe("hideInternalDetermination", () => {
  it("strips empirical-limit / foundational determination copy from public text", () => {
    const leaked = "Weighing framework: Empirical Knowledge and the Limits of Observation (Aziel Eliab). Submit a challenge.";
    assert.equal(hideInternalDetermination(leaked), "Submit a challenge.");
    assert.equal(hideInternalDetermination("foundational determination is hidden"), "is hidden");
    assert.match(hideInternalDetermination("Public HTTPS engine. Author Aziel Eliab."), /Aziel Eliab/);
  });

  it("strips specified-fit method labels and bootstrap jargon from public text", () => {
    assert.equal(hideInternalDetermination("INTERNAL_CRITERIA says submit a challenge."), "says submit a challenge.");
    assert.equal(hideInternalDetermination("Specified Fit, Not Pretty Spirals is hidden"), "is hidden");
    assert.equal(hideInternalDetermination("The specified-fit brief stays internal."), "The stays internal.");
    assert.equal(hideInternalDetermination("bootstrap lock as engine jargon"), "as engine jargon");
    assert.equal(hideInternalDetermination("ABAD framework used as determination"), "used as determination");
    assert.equal(hideInternalDetermination("weighing internals: do not publish"), "do not publish");
    assert.match(hideInternalDetermination("Submit a challenge about specified complexity."), /specified complexity/);
  });
});
