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
- `POST /heartbeat` live-node ping
- `/verify` walk the ledger
- `/receipt/{id}` public if not isolated
- `/health` JSON
- `/robots.txt` `/sitemap.xml` `/cite.json` `/llms.txt`

## Deploy

```bash
wrangler d1 execute godlock-uk --remote --file schema.sql
wrangler deploy --keep-vars
```
