# GodLock.uk public HTTPS engine

Worker `godlock-uk`. Live at https://godlock.uk (fallback `godlock-uk.vibelock.workers.dev`).

One input. Submit a challenge (including intelligent-design / design-flaw attacks). The engine answers with the locked protocol: **Yes**, **No**, **Let's review**, or **Interesting**, then summary, long explanation, score change, residual uncertainty.

Every submission is hash-chained into an append-only ledger. Isolated gibberish is stored but not scored and not shown on the public feed. High-effort intelligent-design challenges are never isolated.

**This is a public HTTPS bootstrap surface. Mesh is not on this surface.** No Cloudflare Tunnel. No node mesh. Author: **Aziel Eliab**.

GodLock is a product name, not an identity.

Counted download: https://godlock-download-tracker.vibelock.workers.dev/download

## Scoring

Start 50%. Floor 33.3%. Ceiling 99.7%. Residual = 100 − current. Score may go down after explicit weighing.

## Routes

- `/` engine (one screen)
- `POST /submit` challenge (`text`); JSON unless `Accept: text/html` (then 303)
- `POST /heartbeat` live-node ping; JSON includes `live_nodes` and `submissions` so the homepage can update
- `GET /stats` JSON: `live_nodes`, `submissions`, views, downloads, score (site counters; not the download-tracker)
- `GET /count` JSON: `{ live_nodes, submissions }` (site presence + receipt tally; not downloads)
- `/verify` walk the ledger
- `/receipt/{id}` public if not isolated
- `/health` JSON
- `/robots.txt` `/sitemap.xml` `/cite.json` `/llms.txt`

## Counters

**Live Nodes** = distinct `godlock_node` sessions with a heartbeat in the last **5 minutes**. Every request (including the homepage GET) upserts `heartbeats(session_id, last_ms)`. The page POSTs `/heartbeat` on load, every 25s, and when the tab becomes visible, then writes the returned `live_nodes` into the stat. Presence rows older than 15 minutes are deleted. If D1 read-after-write is empty, the current visitor still counts as 1.

**Submissions** = `COUNT(*)` from `receipts` (isolated included). If receipts are empty after a ledger rebuild, falls back to ledger rows with action `SUBMIT` or `ISOLATE`, then to metadata `uses`.

HTML/JSON for these routes is `Cache-Control: no-store` so a proxy cannot freeze the numbers at 0.

## Deploy

```bash
cd workers/godlock-uk
npx wrangler d1 execute godlock-uk --remote --file schema.sql
npx wrangler deploy --keep-vars
```

`ensureSchema` also `ALTER TABLE heartbeats ADD COLUMN last_ms` on first request, so deploy alone is enough for an existing D1. Apex `https://godlock.uk` is proxied to `godlock-uk.vibelock.workers.dev`; deploy the **engine** Worker (`name = "godlock-uk"` in this folder) on the account that owns that workers.dev hostname and the `godlock-uk` D1 binding. Download-tracker `/stats` stays on `godlock-download-tracker.vibelock.workers.dev` and is a separate download tally.
