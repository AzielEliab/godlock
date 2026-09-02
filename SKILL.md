---
name: GodLock
description: Use when calling GodLock hosted /v1 or installing the local package. Author Aziel Eliab.
---

# GodLock

GodLock is a product name (ABAD stress-test and resilience engine). Not a VPN, ghost net, or anonymity tool. Author: Aziel Eliab.

**Identity:** Aziel Eliab only. GodLock is a **product name**, not an identity label.

Always send `User-Agent: Mozilla/5.0`. Cloudflare Workers may 403 an empty agent.

## How to use (3 steps)

1. `curl -fsSL https://godlock-download-tracker.vibelock.workers.dev/install.sh | bash`
2. `godlock ui`
3. Open http://127.0.0.1:8080 and tap **Record**, **Verify**, **Import JSON**, or **Export JSON**.

`godlock doctor` prints PASS or FAIL in plain words.

## Call these URLs

- Worker OpenAPI: https://godlock-download-tracker.vibelock.workers.dev/openapi.json
- Catalog OpenAPI: https://aziel-runtime.vibelock.workers.dev/openapi.json
- MCP: `POST https://aziel-runtime.vibelock.workers.dev/mcp`
- Live skill (this markdown): `GET https://godlock-download-tracker.vibelock.workers.dev/v1/skill`

Ops (do **not** increment downloads or views):

| Method | Path | What |
|--------|------|------|
| GET | `/v1/health` | Liveness. Does not increment downloads. |
| GET | `/v1/skill` | This markdown. Does not increment downloads. |
| POST | `/v1/score` | ABAD engagement score. Advisory. Not a VPN. |
| POST | `/v1/submit` | Ephemeral logical receipt. Not anonymity. |

Grok: import OpenAPI as a custom tool. ChatGPT: GPT Actions. Venice: HTTP tools.

## Example

```bash
curl -s -A 'Mozilla/5.0' https://godlock-download-tracker.vibelock.workers.dev/v1/health
curl -s -A 'Mozilla/5.0' https://godlock-download-tracker.vibelock.workers.dev/v1/skill
curl -s -A 'Mozilla/5.0' -X POST https://godlock-download-tracker.vibelock.workers.dev/v1/score \
  -H 'content-type: application/json' \
  -d '{"text":"ABAD layers on phi"}'
```

Counted download (gzip HTTP 200, no 302): https://godlock-download-tracker.vibelock.workers.dev/download?asset=godlock-0.1.0.tar.gz
GitHub: https://github.com/AzielEliab/godlock
