---
name: GodLock
description: Use when calling GodLock hosted /v1 or installing the local package. Author Aziel Eliab.
---

# GodLock

GodLock is a product name (Specified Fit stress-test and resilience engine). Not a VPN, ghost net, or anonymity tool. Author: Aziel Eliab.

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
| GET | `/v1/update` | Online update check. Prompt + counted /download if update_available. Never silent overwrite. |
| POST | `/v1/score` | Specified Fit / GodLock engagement score. Advisory. Not a VPN. |
| POST | `/v1/submit` | Ephemeral logical receipt. Not anonymity. |

Works with ChatGPT (GPT Actions / OpenAI), Grok (xAI), Venice, Claude (Anthropic), Cursor (MCP), Glama (MCP), Perplexity, Microsoft Copilot / Bing, Google Gemini / Vertex, Mistral, Meta AI, Apple Intelligence surfaces, Amazon Q tooling, DuckAssist, You.com, Cohere, and other MCP/OpenAPI-capable assistants. ChatGPT: GPT Actions. Grok: import OpenAPI as a custom tool. Venice: HTTP tools. Claude: OpenAPI / custom connector. Cursor and Glama: MCP. Others: the same OpenAPI or MCP catalog.

## Example

```bash
curl -s -A 'Mozilla/5.0' https://godlock-download-tracker.vibelock.workers.dev/v1/health
curl -s -A 'Mozilla/5.0' https://godlock-download-tracker.vibelock.workers.dev/v1/skill
curl -s -A 'Mozilla/5.0' -X POST https://godlock-download-tracker.vibelock.workers.dev/v1/score \
  -H 'content-type: application/json' \
  -d '{"text":"Specified Fit is not a spiral proof"}'
```

Counted download (gzip HTTP 200, no 302): https://godlock-download-tracker.vibelock.workers.dev/download?asset=godlock-0.1.0.tar.gz
GitHub: https://github.com/AzielEliab/godlock

## Catalog + local UI

Author: **Aziel Eliab**. Honest scope: Offline Specified Fit / GodLock score. Not a VPN and not an anonymity network. GodLock is a product name. Public reasoning: Specified Fit, Not Pretty Spirals.

- Catalog product: https://aziel-runtime.vibelock.workers.dev/p/godlock/
- Catalog OpenAPI: https://aziel-runtime.vibelock.workers.dev/openapi.json
- Catalog MCP: `POST https://aziel-runtime.vibelock.workers.dev/mcp`
- This Worker skill: `GET https://godlock-download-tracker.vibelock.workers.dev/v1/skill`
- This Worker OpenAPI: https://godlock-download-tracker.vibelock.workers.dev/openapi.json
- Sample payload: `GET https://godlock-download-tracker.vibelock.workers.dev/v1/example`
- Update check: `GET https://aziel-runtime.vibelock.workers.dev/v1/update/check?slug=godlock&version=0.1.0` (Worker: `GET https://godlock-download-tracker.vibelock.workers.dev/v1/update`). If `update_available`, prompt with counted `https://godlock-download-tracker.vibelock.workers.dev/download`. Do not silently overwrite.
- Live software catalog: `GET https://aziel-runtime.vibelock.workers.dev/v1/software` (fallback `GET /v1/fraggate/list`)

Local UI: **Import JSON file** (`type=file`) and **Export JSON**. Then `godlock doctor`.

Works with ChatGPT (GPT Actions / OpenAI), Grok (xAI), Venice, Claude (Anthropic), Cursor (MCP), Glama (MCP), Perplexity, Microsoft Copilot / Bing, Google Gemini / Vertex, Mistral, Meta AI, Apple Intelligence surfaces, Amazon Q tooling, DuckAssist, You.com, Cohere, and other MCP/OpenAPI-capable assistants. Import catalog or Worker OpenAPI as GPT Actions, a Grok custom tool, Claude/Gemini/Copilot/Mistral/Meta/Cohere/Amazon Q/Perplexity HTTP or OpenAPI tools, Venice HTTP tools, or Cursor/Glama MCP.
