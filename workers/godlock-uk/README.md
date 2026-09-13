# GodLock.uk public HTTPS engine

Worker `godlock-uk`. Live at https://godlock.uk (fallback `godlock-uk.vibelock.workers.dev`).

Public reasoning is **Specified Fit, Not Pretty Spirals** (Aziel Eliab): functionally specified digital information plus a translation / reader system. Pretty spirals and φ are not a proof. Darwinian selection is conceded after a replicator. Residual uncertainty stays (ceiling 99.7 · floor 33.3).

One input. Submit a challenge (including intelligent-design / design-flaw attacks). The engine answers with the locked protocol: **Yes**, **No**, **Let's review**, or **Interesting**, then summary, long explanation, score change, residual uncertainty.

Every submission is hash-chained into an append-only ledger. Isolated gibberish is stored but not scored and not shown on the public feed. High-effort intelligent-design challenges are never isolated.

**This is a public HTTPS bootstrap surface.** Suite mesh is **QNM-BUILD-1.0**: read-only suite presence **on**. Public rollup is **live|locked|isolated counts only**. No Node Gate. No auto-heal. This Worker has **no mesh-off function**. Not an anonymity network. **QNS-CD-1.0** (photon QNS1 packet transfer) is a hub cite / Worker mesh cross-map only — local qnsd in [qnm-node](https://github.com/AzielEliab/qnm-node), runtime cites in [aziel-runtime](https://github.com/AzielEliab/aziel-runtime), pair custody on [AZInterface](https://github.com/AzielEliab/azinterface). Not a Softwares-tab product. No public qnsd proxy. No Cloudflare Tunnel. Author: **Aziel Eliab**.

GitHub-side crawl aids (this repo; not a live Worker deploy): [`docs/llms.txt`](../../docs/llms.txt), [`docs/ai.txt`](../../docs/ai.txt), [`docs/cite.json`](../../docs/cite.json), [`CITATION.cff`](../../CITATION.cff). Person `@id` https://www.azieleliab.com/#aziel. Runtime `@id` https://www.azieleliab.com/runtime#runtime. Softwares is GodLock-first (heading → list): Aziel Runtime only on this Worker, official listing https://www.azieleliab.com/software, not Digital Library completeness. Runtime **2.0.0-rc1**. Prefer [Try on Glama](https://glama.ai/mcp/servers/AzielEliab/aziel-runtime). Official Runtime Worker is secondary. FragGate kernel: https://github.com/AzielEliab/fraggate.

GodLock is a product name, not an identity.

Counted download: https://godlock-download-tracker.vibelock.workers.dev/download

## Scoring

Start 50%. Floor 33.3%. Ceiling 99.7%. Residual = 100 − current. Score may go down after explicit weighing.

## Routes

- `/` engine (one screen; Specified Fit steel claim on the spine). Rose-star brand mark top-left (same-origin `/sigil.png`). Not "everblooming sigil" wording. Homepage Prior receipts shows the last 5 only; Donate rails live on `/donate`, not as a homepage section.
- `/sigil.png` same-origin rose-star brand mark (Aziel Eliab). Worker UI chrome only — Softwares stays GodLock-first (Aziel Runtime + official listing), not a Digital Library clone.
- `/reason` Specified Fit, Not Pretty Spirals (public brief); `/specified-fit` 308 here
- `POST /submit` challenge (`text`); JSON unless `Accept: text/html` (then 303)
- `POST /heartbeat` live-node ping; JSON includes `live_nodes`, `mesh`, and `uses` so the homepage can update
- `GET /stats` JSON: `live_nodes`, `site_live_nodes`, `mesh`, `uses`, views, downloads, `receipts` (public isolated=0 count), score. Downloads come from the download-tracker `/count` (service bind, then HTTPS, then shared KV) and never from views+uses.
- `GET /count` JSON: `{ live_nodes, site_live_nodes, mesh_enabled, mesh_live_nodes, mesh_locked, mesh_isolated, uses, downloads, receipts, views }`
- `GET /mesh` JSON snapshot of QNM-BUILD-1.0 suite mesh (`rollup.live|locked|isolated` counts only; read-only, on; empty/unavailable when runtime `/v1/mesh/*` is missing). Payload includes the **QNS-CD-1.0** hub cite / Worker mesh cross-map (`qns_cd`; photon QNS1 packet transfer; no public qnsd proxy)
- `GET /v1/mesh` and `GET /v1/mesh/status` same-origin proxies (parity with azieleliab.com / corpus hubs) so Live Nodes clients that hit `/v1/mesh/status` work. GET never enables. Public surface stamps `mesh_default: "on"`. This Worker has no mesh-off / disable path.
- `/verify` walk the ledger
- `/donate` AZL-DONATE-1.0 door (static copy + rails; no KV; payment is not a key). Not embedded on the Engine homepage. Each rail is a solid black-on-white PNG `<img>` at `/donate/qr/{btc,eth,ltc,xrp,doge,sol,trx}.png`. Same door: https://www.azieleliab.com/donate
- `/receipts` public Receipts tab: full questions + hash-chained public receipt list (paginated). `/prior` 308 here. Isolated rows stay off the feed.
- `/` homepage Softwares one-liner lists Aziel Runtime and points at https://www.azieleliab.com/software. No GodLock or FragGate Softwares chips.
- `/software` Softwares heading → list only: Aziel Runtime (Try on Glama / Official Runtime / Source on GitHub / Documentation/Architecture) plus a pointer to the official Softwares listing at https://www.azieleliab.com/software. Not a cloned suite catalog and not a Digital Library Softwares page. FragGate stays the Runtime kernel, not a Softwares card here.
- `/v1/software` same-origin Softwares JSON (Aziel Runtime only; `official_softwares` pointer). Live catalog remains `/runtime/v1/software`
- `/runtime` and `/runtime/*` same-origin Aziel Runtime door (service-bind or HTTPS proxy to aziel-runtime)
- `/AzielEliab` public identity page (Aziel Eliab only); `/aziel-eliab`, `/about`, `/aboutme` 308 here
- Public Person `@id` is the shared hub id `https://www.azieleliab.com/#aziel`. Author / creator / publisher references use that object. The local fragment `https://godlock.uk/AzielEliab#aziel-eliab` is a stub pointing at the hub, not a competing primary. WebSite stays `https://godlock.uk/#website`. GodLock SoftwareApplication stays `https://godlock.uk/#godlock` (author → Person `@id`; `isPartOf` the hub Runtime tool `https://www.azieleliab.com/runtime#godlock`). Runtime references use the hub parent `https://www.azieleliab.com/runtime#runtime` (sameAs GitHub + Glama only). No MCP op entities.
- Footer/nav **Part of the Aziel Eliab ecosystem** (not between Softwares heading and list): Official site, Aziel Corpus Library, He Didn't Jump (`https://www.hedidntjump.com/`), Aziel Runtime on GitHub, Aziel Runtime (secondary workers.dev), Try on Glama. Self-canonicals only — godlock.uk pages point at themselves.
- Nav **Aziel Corpus Library** is an off-site link to `https://www.azielcorpuslibrary.net/AzielEliab`. `/AzielCorpusLibrary` (and kebab/case aliases) 308 there; godlock.uk does not host a library About mirror
- Nav **He Didn't Jump** is an off-site sister door to `https://www.hedidntjump.com/`. Not a Softwares card. Identity Aziel Eliab only.
- `/receipt/{id}` public if not isolated
- `/health` JSON
- `/robots.txt` `/sitemap.xml` `/cite.json` `/llms.txt` `/ai.txt` `/openapi.json` (each lists the `/runtime` door)
- AZindex identity machine (shared Person `@id` https://www.azieleliab.com/#aziel — GodLock is a product surface, not a second identity): `/person.jsonld` `/.well-known/person.jsonld` `/identity.jsonld` `/graph.jsonld` `/who-is-aziel-eliab.txt` `/who-is` `/.well-known/aziel.json`. Living public work identity of Aziel Eliab — not biblical Aziel or biblical Eliab; concordance hits do not merge. Latin aka includes The Revealer of The Sealed / Revealer of The Sealed (same Person). About public work on `/AzielEliab` (debate/record/pulpit; document over declare; Specified Fit) is factored into those FAQ/graph/llms/cite files — identity lock lines stay on machine surfaces, not About chrome. Homepage hashes (`#software` `#runtime` `#receipts` `#donate` `#reason` `#verify` `#AzielEliab`) map to real paths. AboutPage JSON-LD links the identity-machine URLs. Sister corpus stats: `https://www.azielcorpuslibrary.net/stats`.
- Same-origin runtime also serves `/runtime/v1/health`, `/runtime/v1/runtime.json`, `/runtime/v1/software`, `/runtime/v1/fraggate/list`, `/runtime/v1/mesh`, `/runtime/v1/mesh/status`, `/runtime/v1/mesh/nodes`, `POST /runtime/v1/mesh/{join|heartbeat|leave|enable}`, `/runtime/v1/update/check`, `/runtime/v1/uses`, `/runtime/openapi.json`, `POST /runtime/mcp`. `POST /runtime/v1/mesh/disable` is refused (no mesh-off function).

## Counters

**Live Nodes** = distinct `godlock_node` sessions with a heartbeat in the last **5 minutes**, **unless suite mesh reports enabled**. Homepage reads the LIVE aziel-runtime QNM rollup from `GET /v1/mesh/status` and `GET /v1/mesh/nodes` (service binding, then HTTPS origin). `GET /v1/mesh` never enables. When aziel-runtime reports `enabled: true`, the public Live Nodes figure is QNM `rollup.live` (no visiting floor / no auto-heal). The muted caption under the stat grid shows **live · locked · isolated** counts only — not a peer list and not a Node Gate. Public copy presents mesh as **on** (read-only suite presence). When the runtime rollup is missing or 404, Live Nodes stay on site heartbeats and `mesh.status` is `unavailable` — never an off toggle. Every request (including the homepage GET) upserts `heartbeats(session_id, last_ms)`. Homepage GET counts the current visitor on first paint (`visiting`) for **site** heartbeats only. The page POSTs `/heartbeat` on load, every 25s, and when the tab becomes visible, then writes the returned `live_nodes` into `#stat-live-nodes` and the mesh caption into `#mesh-status`. Presence rows older than 15 minutes are deleted.

MCP / FragGate read mesh through the same-origin runtime proxy: `GET https://godlock.uk/runtime/v1/mesh` or `GET https://godlock.uk/v1/mesh`. This Worker does not expose a disable path that turns suite presence off. The public engine does not auto-join, auto-enable, or auto-heal visitors into the mesh. There is no Node Gate on godlock.uk.

anon-broadcast is a local communique style tool (text → TTS / desk reel / metadata-culled MP4 + SHA-256 receipt). **Not a publish path on godlock.uk.** Not hosted on this Worker. No ffmpeg farm. Identity Aziel Eliab only. Mesh is not an anonymity network.

**Uses** = `COUNT(*)` of receipt-ledger rows with action `SUBMIT` or `ISOLATE`, floored by durable `metadata.uses` so a parent ledger wipe does not drop the counter. That is a real submission that went through `POST /submit` and was hash-chained. Heartbeats, page views, downloads, and `/runtime` API traffic do not increment Uses. Isolated submissions count because they are ledgered (`ISOLATE`). `SCORE` rows do not count. Application code never resets Views, Uses, downloads, or Live Nodes.

**Receipts** = `COUNT(*)` of `receipts` where `isolated=0` — the same public set as Prior receipts and `/receipts`. Isolated archive rows are not counted on the public counter. Heartbeat writes `#stat-receipts` the same way as Views / Uses / Downloads.

**Downloads** = download-tracker tally (`total` / `downloads` on `/count` or `/stats`). Read via `DOWNLOAD_TRACKER` service bind, then HTTPS, then the shared DOWNLOADS KV (`godlock|…` keys). Floored by `metadata.downloads_cache`. Never `views + uses`.

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

`ensureSchema` also `ALTER TABLE receipts ADD COLUMN challenge_text TEXT` and `ALTER TABLE heartbeats ADD COLUMN last_ms` on first request, so deploy alone is enough for an existing D1. New receipts keep the submitted challenge body for human review; `text_sha256` is sha256 of that exact stored text. Legacy rows with a null column show “challenge text not retained”. Apex `https://godlock.uk` is proxied to `godlock-uk.vibelock.workers.dev`; deploy the **engine** Worker (`name = "godlock-uk"` in this folder) on the account that owns that workers.dev hostname and the `godlock-uk` D1 binding. Download-tracker `/stats` stays on `godlock-download-tracker.vibelock.workers.dev` and is a separate download tally.
