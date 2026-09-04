-- GodLock.uk public HTTPS stress-test engine. Append-only.
-- Author: Aziel Eliab.
-- NEVER UPDATE or DELETE receipts or ledger rows (metadata + heartbeats excepted).

CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  created_utc TEXT NOT NULL,
  text_sha256 TEXT NOT NULL,
  label TEXT NOT NULL,
  summary TEXT NOT NULL,
  explanation TEXT NOT NULL,
  score_before REAL NOT NULL,
  score_after REAL NOT NULL,
  residual REAL NOT NULL,
  isolated INTEGER NOT NULL DEFAULT 0,
  content_sha256 TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_receipts_created ON receipts(created_utc);
CREATE INDEX IF NOT EXISTS idx_receipts_public ON receipts(isolated, created_utc);

CREATE TABLE IF NOT EXISTS ledger (
  sequence INTEGER PRIMARY KEY,
  timestamp_utc TEXT NOT NULL,
  action TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  entry_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Presence: Live Nodes = COUNT(heartbeats) with last_ms inside 5 minutes.
-- last_ms is the source of truth; last_utc is kept for humans / fallback.
CREATE TABLE IF NOT EXISTS heartbeats (
  session_id TEXT PRIMARY KEY,
  last_utc TEXT NOT NULL,
  last_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_heartbeats_last ON heartbeats(last_utc);
CREATE INDEX IF NOT EXISTS idx_heartbeats_last_ms ON heartbeats(last_ms);

INSERT OR IGNORE INTO metadata(key, value) VALUES ('current_score', '50');
INSERT OR IGNORE INTO metadata(key, value) VALUES ('views', '0');
INSERT OR IGNORE INTO metadata(key, value) VALUES ('uses', '0');
