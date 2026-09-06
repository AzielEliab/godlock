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
- `/software` full live aziel-runtime catalog plus aziel-runtime, AZBrowser (Plain), AZNet (Plain, `aznet-download-tracker`), AZHub (Plain, `azhub-download-tracker`, Blank Key / AIH-WP-1.0), AZInterface (Plain, `azinterface-download-tracker`, custodial page cycles / AIH-WP-1.0), and a dedicated FragGate Gate card (`fraggate-download-tracker` Download/Worker, not GitHub-only), A–Z with DecisionGATE. Service-bind `AZIEL_RUNTIME` first, then HTTPS origin / library, then a snapshot fallback so the page never goes empty. New catalog slugs are included automatically. Each card tethers Worker, GitHub, and `/runtime` FragGate/MCP, with download/view counters from Worker `/count` and uses when published. AZBrowser, AZNet, AZHub, and AZInterface stay separate cards. Never nest Hub with Interface. Sorted Plain A–Z → Gate A–Z → Lock A–Z (Clock is not Lock).
- `/runtime` and `/runtime/*` same-origin FragGate door (service-bind or HTTPS proxy to aziel-runtime 1.6.8)
- `/AzielEliab` public identity page (Aziel Eliab only); `/aziel-eliab`, `/about`, `/aboutme` 308 here
- Nav **Aziel Corpus Library** is an off-site link to `https://www.azielcorpuslibrary.net/AzielEliab`. `/AzielCorpusLibrary` (and kebab/case aliases) 308 there; godlock.uk does not host a library About mirror
- `/receipt/{id}` public if not isolated
- `/health` JSON
- `/robots.txt` `/sitemap.xml` `/cite.json` `/llms.txt` `/ai.txt` (each lists the `/runtime` door)
- Same-origin runtime also serves `/runtime/v1/health`, `/runtime/v1/runtime.json`, `/runtime/v1/fraggate/list`, `/runtime/v1/uses`, `/runtime/openapi.json`, `POST /runtime/mcp`

## Counters

**Live Nodes** = distinct `godlock_node` sessions with a heartbeat in the last **5 minutes**. Every request (including the homepage GET) upserts `heartbeats(session_id, last_ms)`. Homepage GET counts the current visitor on first paint (`visiting`), even if D1 COUNT lags. The page POSTs `/heartbeat` on load, every 25s, and when the tab becomes visible, then writes the returned `live_nodes` into `#stat-live-nodes`. Presence rows older than 15 minutes are deleted.

**Uses** = `COUNT(*)` of receipt-ledger rows with action `SUBMIT` or `ISOLATE` only. That is a real submission that went through `POST /submit` and was hash-chained. Heartbeats, page views, downloads, and `/runtime` API traffic do not increment Uses. A receipt with no ledger row does not count. Isolated submissions count because they are ledgered (`ISOLATE`). `SCORE` rows do not count.

**Runtime API uses** (`GET /runtime/v1/uses`) is a separate KV-backed host log for proxied FragGate / MCP / session / pull / v1 traffic on this door. SEO static, `GET /runtime/v1/uses`, and GET health/ready do not increment it. It is not the GodLock product Uses ledger. Proxy requests are stamped `X-Aziel-Runtime-Via: godlock.uk`.

Foundational / empirical-limit determination stays internal. It is stripped from public HTML, receipt copy, and scrapeable metadata. Operator notes under `internal/` are not a public route.

HTML/JSON for these routes is `Cache-Control: no-store` so a proxy cannot freeze the numbers at 0.

## Deploy

```bash
cd workers/godlock-uk
npx wrangler d1 execute godlock-uk --remote --file schema.sql
npx wrangler deploy --keep-vars
```

`ensureSchema` also `ALTER TABLE heartbeats ADD COLUMN last_ms` on first request, so deploy alone is enough for an existing D1. Apex `https://godlock.uk` is proxied to `godlock-uk.vibelock.workers.dev`; deploy the **engine** Worker (`name = "godlock-uk"` in this folder) on the account that owns that workers.dev hostname and the `godlock-uk` D1 binding. Download-tracker `/stats` stays on `godlock-download-tracker.vibelock.workers.dev` and is a separate download tally.
