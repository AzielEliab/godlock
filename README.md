# GodLock

**GodLock is a product name** (ABAD stress-test and resilience engine).
It is **not** a VPN, ghost net, or anonymity tool.
**Author: Aziel Eliab only.**

> GodLock does not argue. It records, analyzes, hardens, and grows.

## Websites

**Primary public site:** [https://godlock.uk](https://godlock.uk)

- **GodLock.uk (public engine):** https://godlock.uk
- **Aziel Eliab on GodLock:** https://godlock.uk/AzielEliab
- **Verify:** https://godlock.uk/verify
- **Software catalog on GodLock:** https://godlock.uk/software
- **Aziel Corpus Library (sister site):** https://www.azielcorpuslibrary.net/ — Aziel Eliab https://www.azielcorpuslibrary.net/AzielEliab
- **aziel-runtime:** https://aziel-runtime.vibelock.workers.dev/ — repo https://github.com/AzielEliab/aziel-runtime

Counted download / install (gzip HTTP 200, no 302) — **not** the primary website:
https://godlock-download-tracker.vibelock.workers.dev/

**License:** [Apache-2.0](LICENSE)
**GitHub:** [AzielEliab/godlock](https://github.com/AzielEliab/godlock)
**Website:** [godlock.uk](https://godlock.uk)

Forks are welcome and always allowed.

## How to use (3 steps)

1. Install: `curl -fsSL https://godlock-download-tracker.vibelock.workers.dev/install.sh | bash`
2. Run: `godlock ui`
3. Open http://127.0.0.1:8080 and tap **Record**, **Verify**, **Import JSON**, or **Export JSON**.

That's it. This computer only.

`godlock doctor` prints PASS or FAIL in plain words. Same check as the Verify button.

## What this is

A localhost tool that records a test, saves an honest receipt (id, time, text, SHA-256), and can save or load a JSON file. Governments and kids can both read the file. Receipts are not rewritten. This process is **not** a VPN, proxy, Tor hop, or hiding net.

The public HTTPS stress-test engine is **https://godlock.uk** (fallback: https://godlock-uk.vibelock.workers.dev). Submit a challenge; Yes / No / Let's review / Interesting; hash-chained receipts; mesh is not on this surface.

Install and counted download stay on the download Worker (gzip HTTP 200, no 302). That URL is download/install only, not the project website:

- Install: https://godlock-download-tracker.vibelock.workers.dev/install.sh
- Tarball: [godlock-0.1.0.tar.gz](https://godlock-download-tracker.vibelock.workers.dev/download?asset=godlock-0.1.0.tar.gz)
- Stats: https://godlock-download-tracker.vibelock.workers.dev/stats
- Skill: https://godlock-download-tracker.vibelock.workers.dev/v1/skill
- OpenAPI: https://godlock-download-tracker.vibelock.workers.dev/openapi.json

Isolated counter: Worker `godlock-download-tracker`, KV `GODLOCK_DOWNLOADS`. `/v1` does not increment downloads.

## Check it

```bash
godlock doctor
```

PASS means version, author (Aziel Eliab), this-computer-only bind, scoring, honest receipts, and “not a VPN” all look right.

## For researchers

Spec: [docs/whitepaper.md](docs/whitepaper.md). Contribute: [CONTRIBUTING.md](CONTRIBUTING.md).

MirageGrid / Airlock are *names* such as `grid-07`. They do not hop IPs, speak Tor, or hide origin addresses. `--no-persist` keeps receipts in memory. It is not a wipe. POST `/merge` has no auth because this is a localhost research tool.

```bash
python -m venv .venv && source .venv/bin/activate && pip install -e ".[dev]"
godlock ui
godlock submit --text "ABAD phi" --out receipt.json
godlock export --out godlock.json
godlock import --file godlock.json
godlock doctor
python -m pytest -q
```

CLI also has `score`, `merge`, `rules`, `stats`, `export-lumen`, `version`. Bind is 127.0.0.1:8080. Self-contained HTML (no CDN, no telemetry).

HTTP: `GET /` (one screen), `POST /stress`, `GET /verify`, `GET /doctor`, `GET /export`, `POST /import`, `GET /stats`, `GET /health`, `POST /merge`, `GET /capsules` (ids + hashes only).

## iPhone & Android

Flutter sources: [`mobile/`](mobile/). Application id `com.azieeliab.godlock`. Offline. Banner: product name GodLock; author Aziel Eliab; not a VPN or hiding tool.

## Use with Grok, ChatGPT, Venice

Public engine and catalog live on godlock.uk and aziel-runtime — not on the download Worker.

- Public engine: https://godlock.uk
- Catalog OpenAPI: https://aziel-runtime.vibelock.workers.dev/openapi.json
- Catalog MCP: `POST https://aziel-runtime.vibelock.workers.dev/mcp`

Hosted `/v1` on the counted-download Worker is an install/runtime helper. It does **not** increment the download counter and is **not** the primary website. Always send `User-Agent: Mozilla/5.0`.

- OpenAPI: https://godlock-download-tracker.vibelock.workers.dev/openapi.json
- Health: https://godlock-download-tracker.vibelock.workers.dev/v1/health
- Skill: https://godlock-download-tracker.vibelock.workers.dev/v1/skill

POST `/v1/score` `{text}` and POST `/v1/submit` `{text}` (ephemeral, no durable anonymity). Every response banners: not a VPN, ghost net, or anonymity tool.

## Cite this

Aziel Eliab. GodLock. https://godlock.uk. https://github.com/AzielEliab/godlock.

No DOI is claimed. Do not invent one.

- Public engine: https://godlock.uk (fallback https://godlock-uk.vibelock.workers.dev)
- Aziel Eliab on GodLock: https://godlock.uk/AzielEliab
- Verify: https://godlock.uk/verify
- Software catalog on GodLock: https://godlock.uk/software
- Aziel Corpus Library: https://www.azielcorpuslibrary.net/ — Aziel Eliab https://www.azielcorpuslibrary.net/AzielEliab
- aziel-runtime: https://aziel-runtime.vibelock.workers.dev/ — https://github.com/AzielEliab/aziel-runtime
- Counted download / install: https://godlock-download-tracker.vibelock.workers.dev/
- GitHub: https://github.com/AzielEliab/godlock
- Citation JSON: https://godlock.uk/cite.json

## License

Apache-2.0. See [LICENSE](LICENSE).
