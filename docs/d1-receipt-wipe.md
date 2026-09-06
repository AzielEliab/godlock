# Parent-only D1 receipt / ledger wipe

Operator note. **Parent** may clear the public argument history on GodLock.uk. Application code must never wipe or reset counters.

GodLock.uk D1 binding: `DB`  
Database name: `godlock-uk`  
Database id: `a499ef56-ad02-4431-a3e4-e23f96f500f0`  
(see `workers/godlock-uk/wrangler.toml`)

## What you may wipe

Receipt rows and ledger rows only. That is the public challenge history and the hash chain that cites it.

```sql
-- Snapshot Uses into metadata FIRST. Uses is normally COUNT of
-- ledger SUBMIT/ISOLATE. After DELETE FROM ledger that count would
-- be 0 unless metadata.uses already holds the floor.
UPDATE metadata
SET value = (
  SELECT CAST(MAX(
    COALESCE((SELECT COUNT(*) FROM ledger WHERE action IN ('SUBMIT', 'ISOLATE')), 0),
    COALESCE((SELECT CAST(value AS INTEGER) FROM metadata WHERE key = 'uses'), 0)
  ) AS TEXT)
)
WHERE key = 'uses';

DELETE FROM receipts;
DELETE FROM ledger;
```

Wrangler (remote production D1):

```bash
cd workers/godlock-uk
npx wrangler d1 execute godlock-uk --remote --command "UPDATE metadata SET value = (SELECT CAST(MAX(COALESCE((SELECT COUNT(*) FROM ledger WHERE action IN ('SUBMIT', 'ISOLATE')), 0), COALESCE((SELECT CAST(value AS INTEGER) FROM metadata WHERE key = 'uses'), 0)) AS TEXT)) WHERE key = 'uses'"
npx wrangler d1 execute godlock-uk --remote --command "DELETE FROM receipts"
npx wrangler d1 execute godlock-uk --remote --command "DELETE FROM ledger"
```

Local / preview D1: drop `--remote` or point at the preview database. Confirm the database name before execute.

After wipe, `/verify` walks an empty ledger (valid empty chain). Home prior-receipts is empty. **Views, Uses floor, current_score, downloads cache, Live Nodes, and download KV are unchanged** if you followed the “do not touch” list below.

## What you must not wipe

Do **not** run DELETE/UPDATE that resets these. Do **not** put such SQL in application code.

| Surface | Store | Keys / tables | Why |
| --- | --- | --- | --- |
| Views | D1 `metadata` | `key = 'views'` | Homepage view counter |
| Uses floor | D1 `metadata` | `key = 'uses'` | Durable Uses after a ledger wipe |
| Current confidence | D1 `metadata` | `key = 'current_score'` | Running score (floor 33.3 · ceiling 99.7) |
| Downloads cache | D1 `metadata` | `key = 'downloads_cache'` | Last good download-tracker read |
| Live Nodes | D1 `heartbeats` | all rows | 5-minute presence; expires on its own |
| Downloads | KV `DOWNLOADS` on `godlock-download-tracker` | `project\|owner\|repo\|branch\|fork` | Counted gzip downloads |
| Runtime API uses | KV `RUNTIME_USES` on `godlock-uk` | `runtime_uses\|…` | FragGate / MCP / session log — not product Uses |

Never:

```sql
-- FORBIDDEN
DELETE FROM metadata;
DELETE FROM metadata WHERE key IN ('views', 'uses', 'current_score', 'downloads_cache');
UPDATE metadata SET value = '0' WHERE key IN ('views', 'uses');
DELETE FROM heartbeats;
```

Never against download-tracker KV:

```bash
# FORBIDDEN — this is the download counter, not the receipt ledger
npx wrangler kv key delete --binding DOWNLOADS --remote 'godlock|AzielEliab|godlock|main|0'
npx wrangler kv bulk delete …
```

Never against godlock-uk `RUNTIME_USES` KV. That log is not the receipt ledger.

## Application law

`workers/godlock-uk/src/index.js` creates tables with `CREATE TABLE IF NOT EXISTS` and `INSERT OR IGNORE` for metadata defaults. It increments `views` on homepage GET. It snapshots Uses into `metadata.uses` when the ledger count is higher. It does **not** DELETE receipts, DELETE ledger, or set counters to zero.

`schema.sql` says never UPDATE or DELETE receipt/ledger rows from the app. This parent wipe is an operator exception for history only.

`--no-persist` on the local Python package is in-memory, not a wipe.
