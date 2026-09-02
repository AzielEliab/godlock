-- GodLock.uk public board. Append-only. Author: Aziel Eliab.
-- NEVER UPDATE or DELETE posts or ledger rows.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL COLLATE NOCASE,
  salt_b64 TEXT NOT NULL,
  hash_b64 TEXT NOT NULL,
  n INTEGER NOT NULL,
  r INTEGER NOT NULL,
  p INTEGER NOT NULL,
  dklen INTEGER NOT NULL,
  created_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  expires_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('question','post','reply')),
  parent_id TEXT,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_utc TEXT NOT NULL,
  content_sha256 TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_kind_created ON posts(kind, created_utc);
CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_utc);

CREATE TABLE IF NOT EXISTS interactions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_by TEXT,
  created_utc TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  content_sha256 TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_interactions_target ON interactions(target_id, kind);

CREATE TABLE IF NOT EXISTS ledger (
  sequence INTEGER PRIMARY KEY,
  timestamp_utc TEXT NOT NULL,
  action TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  entry_hash TEXT NOT NULL
);
