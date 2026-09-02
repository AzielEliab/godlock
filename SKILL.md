---
name: GodLock
description: Use when calling GodLock hosted /v1 or installing the local package. Author Aziel Eliab.
---

# GodLock

GodLock is a product name (ABAD stress-test and resilience engine), not an identity label. Author: Aziel Eliab. Not a VPN. Not a ghost net. Not anonymity. Logical ABAD receipts only.

**Identity:** Aziel Eliab. GodLock is a **product name**, not an identity label.

**THIS IS:** a self-hosted stress-test and resilience engine for the ABAD framework (Aziel Sequence, φ/√2 convergences, Flower of Life geometry). Product name: GodLock.

**THIS IS NOT:** an identity label, a VPN, a ghost net, IP hiding, or anonymity. Author is Aziel Eliab. GodLock is the product name only.

Author: **Aziel Eliab**. Forks are welcome and always allowed. Apache-2.0.

Always send `User-Agent: Mozilla/5.0`. Cloudflare Workers may 403 an empty agent.

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
  -d '{"note":"advisory ABAD score; not a VPN"}'
```

## Local (after one-click install)

```bash
curl -fsSL https://godlock-download-tracker.vibelock.workers.dev/install.sh | bash
godlock ui
```

Then open http://127.0.0.1:8080 (loopback only).

Counted download (gzip HTTP 200, no 302): https://godlock-download-tracker.vibelock.workers.dev/download?asset=godlock-0.1.0.tar.gz
GitHub: https://github.com/AzielEliab/godlock
