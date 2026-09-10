# GodLock.uk public HTTPS engine

Worker `godlock-uk`. Live at https://godlock.uk (fallback `godlock-uk.vibelock.workers.dev`).

Public reasoning is **Specified Fit, Not Pretty Spirals** (Aziel Eliab): functionally specified digital information plus a translation / reader system. Pretty spirals and φ are not a proof. Darwinian selection is conceded after a replicator. Residual uncertainty stays (ceiling 99.7 · floor 33.3).

One input. Submit a challenge (including intelligent-design / design-flaw attacks). The engine answers with the locked protocol: **Yes**, **No**, **Let's review**, or **Interesting**, then summary, long explanation, score change, residual uncertainty.

Every submission is hash-chained into an append-only ledger. Isolated gibberish is stored but not scored and not shown on the public feed. High-effort intelligent-design challenges are never isolated.

**This is a public HTTPS bootstrap surface.** Suite mesh is **QNM-BUILD-1.0**: opt-in on the runtime door (`/runtime/v1/mesh/*`) and **default off** until operator/runtime enable. Public rollup is **live|locked|isolated counts only**. No Node Gate. No auto-heal. Not an anonymity network. **QNS-CD-1.0** (photon QNS1 packet transfer) is a hub cite / Worker mesh cross-map only — local qnsd in [qnm-node](https://github.com/AzielEliab/qnm-node), runtime cites in [aziel-runtime](https://github.com/AzielEliab/aziel-runtime), pair custody on [AZInterface](https://github.com/AzielEliab/azinterface). Not a Softwares-tab product. No public qnsd proxy. No Cloudflare Tunnel. Author: **Aziel Eliab**.

GodLock is a product name, not an identity.

Counted download: https://godlock-download-tracker.vibelock.workers.dev/download

## Scoring

Start 50%. Floor 33.3%. Ceiling 99.7%. Residual = 100 − current. Score may go down after explicit weighing.

## Routes

- `/` engine (one screen; Specified Fit steel claim on the spine)
- `/reason` Specified Fit, Not Pretty Spirals (public brief); `/specified-fit` 308 here
- `POST /submit` challenge (`text`); JSON unless `Accept: text/html` (then 303)
- `POST /heartbeat` live-node ping; JSON includes `live_nodes`, `mesh`, and `uses` so the homepage can update
- `GET /stats` JSON: `live_nodes`, `site_live_nodes`, `mesh`, `uses`, views, downloads, score (site counters; not the download-tracker)
- `GET /count` JSON: `{ live_nodes, site_live_nodes, mesh_enabled, mesh_live_nodes, mesh_locked, mesh_isolated, uses }` (site presence + optional QNM rollup + ledger-backed Uses; not downloads)
- `GET /mesh` JSON snapshot of QNM-BUILD-1.0 suite mesh (`rollup.live|locked|isolated` counts only; default off; empty/disabled when runtime `/v1/mesh/*` is missing). Payload includes the **QNS-CD-1.0** hub cite / Worker mesh cross-map (`qns_cd`; photon QNS1 packet transfer; no public qnsd proxy)
- `/verify` walk the ledger
- `/donate` AZL-DONATE-1.0 door (static copy + rails; no KV; payment is not a key). Each rail is a solid black-on-white PNG `<img>` at `/donate/qr/{btc,eth,ltc,xrp,doge,sol,trx}.png`. Same door: https://www.azieleliab.com/donate
- `/software` Downloadable software heading, then the listed cards only (no Runtime CTA or suite-blurb filler). Full live aziel-runtime catalog from `GET /v1/software` (fallback `GET /v1/fraggate/list`, then catalog.json / snapshot) plus Aziel Runtime (`aziel-runtime`), AZBrowser (Plain), AZNet (Plain, `aznet-download-tracker`), AZHub (Plain, `azhub-download-tracker`, Blank Key / AIH-WP-1.0), AZInterface (Plain, `azinterface-download-tracker`, custodial page cycles / AIH-WP-1.0), and a dedicated FragGate Gate card (`fraggate-download-tracker` Download/Worker, not GitHub-only), A–Z with DecisionGATE. Never mash “runtime 1.6.x FragGate” in Software blurbs or meta. Service-bind `AZIEL_RUNTIME` first, then HTTPS origin / library, then a snapshot fallback so the page never goes empty. New catalog slugs are included automatically. Each card tethers Worker, GitHub, and `/runtime`. AZBrowser, AZNet, AZHub, and AZInterface stay separate cards. Never nest Hub with Interface. Sorted Plain A–Z → Gate A–Z → Lock A–Z (Clock is not Lock).
- `/runtime` and `/runtime/*` same-origin Aziel Runtime door (service-bind or HTTPS proxy to aziel-runtime)
- `/AzielEliab` public identity page (Aziel Eliab only); `/aziel-eliab`, `/about`, `/aboutme` 308 here
- Nav **Aziel Corpus Library** is an off-site link to `https://www.azielcorpuslibrary.net/AzielEliab`. `/AzielCorpusLibrary` (and kebab/case aliases) 308 there; godlock.uk does not host a library About mirror
- `/receipt/{id}` public if not isolated
- `/health` JSON
- `/robots.txt` `/sitemap.xml` `/cite.json` `/llms.txt` `/ai.txt` `/openapi.json` (each lists the `/runtime` door)
- Same-origin runtime also serves `/runtime/v1/health`, `/runtime/v1/runtime.json`, `/runtime/v1/software`, `/runtime/v1/fraggate/list`, `/runtime/v1/mesh`, `/runtime/v1/mesh/list`, `POST /runtime/v1/mesh/{join|heartbeat|enable|disable}`, `/runtime/v1/update/check`, `/runtime/v1/uses`, `/runtime/openapi.json`, `POST /runtime/mcp`

## Counters

**Live Nodes** = distinct `godlock_node` sessions with a heartbeat in the last **5 minutes**, **unless suite mesh is enabled**. When aziel-runtime `/v1/mesh` reports `enabled: true`, the public Live Nodes figure is QNM `rollup.live` (no visiting floor / no auto-heal). The muted caption under the stat grid shows **live · locked · isolated** counts only — not a peer list and not a Node Gate. When mesh is off, missing, or 404 (routes not merged yet), Live Nodes stay on site heartbeats and `mesh.status` is `off` or `unavailable`. Every request (including the homepage GET) upserts `heartbeats(session_id, last_ms)`. Homepage GET counts the current visitor on first paint (`visiting`) for **site** heartbeats only. The page POSTs `/heartbeat` on load, every 25s, and when the tab becomes visible, then writes the returned `live_nodes` into `#stat-live-nodes` and the mesh caption into `#mesh-status`. Presence rows older than 15 minutes are deleted.

MCP / FragGate call mesh ops through the same-origin runtime proxy: `GET/POST https://godlock.uk/runtime/v1/mesh/*` or `POST https://godlock.uk/runtime/mcp`. Enable/disable stay on that door (default off until operator/runtime enable). The public engine does not auto-join, auto-enable, or auto-heal visitors into the mesh. There is no Node Gate on godlock.uk.

anon-broadcast is a local communique style tool (text → TTS / desk reel / metadata-culled MP4 + SHA-256 receipt). **Not a publish path on godlock.uk.** Not hosted on this Worker. No ffmpeg farm. Identity Aziel Eliab only. Mesh is not an anonymity network.

**Uses** = `COUNT(*)` of receipt-ledger rows with action `SUBMIT` or `ISOLATE`, floored by durable `metadata.uses` so a parent ledger wipe does not drop the counter. That is a real submission that went through `POST /submit` and was hash-chained. Heartbeats, page views, downloads, and `/runtime` API traffic do not increment Uses. Isolated submissions count because they are ledgered (`ISOLATE`). `SCORE` rows do not count. Application code never resets Views, Uses, downloads, or Live Nodes.

Parent-only history wipe (D1 `receipts` + `ledger` only — never counter KV): see `docs/d1-receipt-wipe.md`.

**Runtime API uses** (`GET /runtime/v1/uses`) is a separate KV-backed host log for proxied FragGate / MCP / session / pull / v1 traffic on this door. SEO static, `GET /runtime/v1/uses`, and GET health/ready do not increment it. It is not the GodLock product Uses ledger. Proxy requests are stamped `X-Aziel-Runtime-Via: godlock.uk`.

INTERNAL_CRITERIA / bootstrap-lock jargon stays off public receipts. Specified Fit is the public brief (`/reason`). Operator notes under `internal/` are not a public route.

HTML/JSON for these routes is `Cache-Control: no-store` so a proxy cannot freeze the numbers at 0.

## Deploy

Push to `main` deploys this Worker via `.github/workflows/deploy-workers.yml` (`CLOUDFLARE_API_TOKEN` GitHub secret; account `ac575a9b822bea2bed97d0ab73aed238`). No tokens in the repo.

```bash
cd workers/godlock-uk
npx wrangler d1 execute godlock-uk --remote --file schema.sql
npx wrangler deploy --keep-vars
```

`ensureSchema` also `ALTER TABLE heartbeats ADD COLUMN last_ms` on first request, so deploy alone is enough for an existing D1. Apex `https://godlock.uk` is proxied to `godlock-uk.vibelock.workers.dev`; deploy the **engine** Worker (`name = "godlock-uk"` in this folder) on the account that owns that workers.dev hostname and the `godlock-uk` D1 binding. Download-tracker `/stats` stays on `godlock-download-tracker.vibelock.workers.dev` and is a separate download tally.
