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
- `POST /heartbeat` live-node ping; JSON includes `live_nodes` and `uses` so the homepage can update
- `GET /stats` JSON: `live_nodes`, `uses`, views, downloads, score (site counters; not the download-tracker)
- `GET /count` JSON: `{ live_nodes, uses }` (site presence + ledger-backed Uses; not downloads)
- `/verify` walk the ledger
- `/software` live aziel-runtime catalog listing
- `/AzielEliab` public identity page (Aziel Eliab only); `/aziel-eliab`, `/about`, `/aboutme` 308 here
- `/AzielCorpusLibrary` About Aziel / library correspondence page
- `/receipt/{id}` public if not isolated
- `/health` JSON
- `/robots.txt` `/sitemap.xml` `/cite.json` `/llms.txt` `/ai.txt`

## Counters

**Live Nodes** = distinct `godlock_node` sessions with a heartbeat in the last **5 minutes**. Every request (including the homepage GET) upserts `heartbeats(session_id, last_ms)`. Homepage GET counts the current visitor on first paint (`visiting`), even if D1 COUNT lags. The page POSTs `/heartbeat` on load, every 25s, and when the tab becomes visible, then writes the returned `live_nodes` into `#stat-live-nodes`. Presence rows older than 15 minutes are deleted.

**Uses** = `COUNT(*)` of receipt-ledger rows with action `SUBMIT` or `ISOLATE` only. That is a real submission that went through `POST /submit` and was hash-chained. Heartbeats, page views, and downloads do not increment Uses. A receipt with no ledger row does not count. Isolated submissions count because they are ledgered (`ISOLATE`). `SCORE` rows do not count.

Foundational / empirical-limit determination stays internal. It is stripped from public HTML, receipt copy, and scrapeable metadata.

HTML/JSON for these routes is `Cache-Control: no-store` so a proxy cannot freeze the numbers at 0.

## Deploy

```bash
cd workers/godlock-uk
npx wrangler d1 execute godlock-uk --remote --file schema.sql
npx wrangler deploy --keep-vars
```

`ensureSchema` also `ALTER TABLE heartbeats ADD COLUMN last_ms` on first request, so deploy alone is enough for an existing D1. Apex `https://godlock.uk` is proxied to `godlock-uk.vibelock.workers.dev`; deploy the **engine** Worker (`name = "godlock-uk"` in this folder) on the account that owns that workers.dev hostname and the `godlock-uk` D1 binding. Download-tracker `/stats` stays on `godlock-download-tracker.vibelock.workers.dev` and is a separate download tally.
