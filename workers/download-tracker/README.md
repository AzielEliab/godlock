# GodLock download tracker (Cloudflare Worker)

Counts GitHub-release downloads for GodLock across the canonical
repository, other branches, and forks. Forks are identified by GitHub
`owner/repo`.

**This worker must be deployed** before
`https://godlock-download-tracker.vibelock.workers.dev` resolves.
Until then, send people to
[GitHub Releases](https://github.com/AzielEliab/godlock/releases).

No secrets belong in this directory. The KV namespace id in
`wrangler.toml` is the placeholder `REPLACE_ME` until you create a
namespace.

This tree is shipped **undeployed**. Do not treat the workers.dev URL
as live until someone with the Cloudflare account runs the steps below.

## Bindings

| Binding     | Type | Purpose |
|-------------|------|---------|
| `DOWNLOADS` | KV   | Counters keyed `project|owner|repo|branch|fork` |

## Deploy

Push to `main` deploys this Worker via `.github/workflows/deploy-workers.yml` (`CLOUDFLARE_API_TOKEN` GitHub secret; account `ac575a9b822bea2bed97d0ab73aed238`). No tokens in the repo.

```bash
cd workers/download-tracker

# 1. Log in once (opens a browser; token stays in wrangler, not in git)
npx wrangler login

# 2. Create the KV namespace. Paste the id into wrangler.toml
#    replacing REPLACE_ME. Binding name MUST stay DOWNLOADS.
npx wrangler kv namespace create DOWNLOADS

# 3. Deploy
npx wrangler deploy
```

The `workers.dev` subdomain wrangler prints
(`godlock-download-tracker.<account>.workers.dev`) is enough until
custom DNS is ready. This tree documents the intended public URL
`https://godlock-download-tracker.vibelock.workers.dev`.

## Routes

| Method | Path | Behavior |
|--------|------|----------|
| GET | `/` | Index page with the GitHub Releases link |
| GET | `/download?repo=&tag=&asset=` | Increment KV, 302 to the hosted asset (default: `godlock-0.1.0.tar.gz`) |
| GET | `/count` | `{ project, views, downloads, total }` — `total` is the download tally (same as `downloads`), matching sibling product Workers |
| GET | `/stats` | JSON totals plus per-repo and per-branch breakdown |
| POST | `/event` | A fork reports a download |

Query params on `/download`: `owner`, `repo` (`AzielEliab/godlock` is
accepted), `branch`, `fork` (`1` or `owner/repo`), `tag`, `asset`.

Default redirect with no asset:

```
https://github.com/AzielEliab/godlock/releases
```

Tracked asset URL (after deploy):

```
https://godlock-download-tracker.vibelock.workers.dev/download?repo=AzielEliab/godlock&tag=latest&asset=godlock-0.1.0.tar.gz
```

A fork reports its own download:

```bash
curl -X POST https://godlock-download-tracker.vibelock.workers.dev/event \
  -H "content-type: application/json" \
  -d '{
    "owner": "YourFork",
    "repo": "godlock",
    "branch": "main",
    "fork": "1",
    "asset": "godlock-0.1.0.tar.gz"
  }'
```

`fork=1` or `fork=YourFork/godlock`. If `owner/repo` is not
`AzielEliab/godlock`, the worker records `fork=1` automatically.

## Count and stats

`GET /count` matches sibling product Workers (`azbrowser`, `fraggate`,
`aznet`, `azhub`, `azinterface`):

```json
{ "project": "godlock", "views": 12, "downloads": 40, "total": 40 }
```

- `views` — homepage view counter (`godlock|__views__`).
- `downloads` — counted Download / `/event` increments (`project|owner|repo|branch|fork`).
- `total` — download tally (same as `downloads`). This is the documented
  sum, not `views + downloads`. Existing KV keys are read as-is; `/count`
  does not increment or reset counters.

`GET /stats` returns `views`, `downloads`, `total` (download tally),
`by_repo`, `by_branch`, `by_fork`, and a `breakdown` array so forks can
read aggregates.

## CORS

All responses include `Access-Control-Allow-Origin: *`.

## Use with major AI clients

This Worker also hosts the product runtime API (CORS `*`). `/v1` routes do **not** increment `DOWNLOADS`.

Works with ChatGPT (GPT Actions / OpenAI), Grok (xAI), Venice, Claude (Anthropic), Cursor (MCP), Glama (MCP), Perplexity, Microsoft Copilot / Bing, Google Gemini / Vertex, Mistral, Meta AI, Apple Intelligence surfaces, Amazon Q tooling, DuckAssist, You.com, Cohere, and other MCP/OpenAPI-capable assistants.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/v1/health` | Liveness |
| GET | `/v1/update` | Runtime update check. Prompt + counted `/download` when `update_available`. Never silent overwrite. |
| GET | `/openapi.json` | OpenAPI 3.1 |
| GET | `/llms.txt` `/ai.txt` `/cite.json` `/robots.txt` `/sitemap.xml` | SEO / MCP discoverability |
| GET | `/ai` | OpenAPI/MCP how-to for ChatGPT, Grok, Venice, Claude, Cursor, Glama, Perplexity, Copilot/Bing, Gemini/Vertex, Mistral, Meta AI, Apple Intelligence, Amazon Q, DuckAssist, You.com, Cohere, and other assistants |

See the product README section **Use with major AI clients**.
OpenAPI: https://godlock-download-tracker.vibelock.workers.dev/openapi.json
