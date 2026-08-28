# GodLock

Self-hosted, browser-served **stress-test and resilience engine** for the
ABAD framework (Aziel Sequence, φ/√2 convergences, Flower of Life
geometry, corkscrew growth, A-B-A-D layering).

**Authors:** Collin Horton / Aziel the Revealer of the Sealed
**Date:** 12 July 2026
**License:** [Apache-2.0](LICENSE)
**GitHub:** [AzielEliab/godlock](https://github.com/AzielEliab/godlock)

> GodLock does not argue. It records, analyzes, hardens, and grows.

See the spec: [docs/whitepaper.md](docs/whitepaper.md).
How to contribute: [CONTRIBUTING.md](CONTRIBUTING.md).

**Forks are welcome and always allowed.**

---

## This repo is not an anonymity network

This tree is the **core + receipts engine**. It binds to `127.0.0.1` by
default. **MirageGrid** (25 named logical nodes) and **Airlock**
(ingress node ≠ egress node) are *in-process identity strings* such as
`grid-07`. They do not hop IPs, do not speak Tor, do not build proxy
chains, and do not hide origin addresses.

The 12 July 2026 paper places any public traffic *behind* an existing
ops layer you already run. That layer is out of scope here. Forks that
add real ghosting, log wiping, or anti-forensics will be refused (see
CONTRIBUTING).

`--no-persist` keeps receipts in memory. It is not a wipe.

POST `/merge` has **no authentication** because the process is a
localhost research tool. Do not publish it without your own auth in
front.

---

## Download

**Hosted (Cloudflare Worker, counted across branches and forks):**

# → [https://godlock-download-tracker.vibelock.workers.dev/download?asset=godlock-0.1.0.tar.gz](https://godlock-download-tracker.vibelock.workers.dev/download?asset=godlock-0.1.0.tar.gz) ←

Direct file: [godlock-0.1.0.tar.gz](https://godlock-download-tracker.vibelock.workers.dev/godlock-0.1.0.tar.gz)

- Tracker home: [https://godlock-download-tracker.vibelock.workers.dev/](https://godlock-download-tracker.vibelock.workers.dev/)
- Stats: [https://godlock-download-tracker.vibelock.workers.dev/stats](https://godlock-download-tracker.vibelock.workers.dev/stats)
- GitHub releases: [https://github.com/AzielEliab/godlock/releases](https://github.com/AzielEliab/godlock/releases)

Query params: `owner`, `repo` (`owner/repo` is accepted), `branch`,
`fork` (`1` or `owner/repo`), `tag`, `asset`. Forks can POST `/event`
so their downloads are counted separately. See the worker README.

---

## What it does

1. You submit a **counter-argument** (text) via CLI or HTTP.
2. GodLock mints an immutable **receipt** (uuid, UTC timestamp, logical
   ingress node, logical egress node, text, SHA-256).
3. The public **resilience counter** increments.
4. **Jeeves** returns `{receipt_id, suggested_hardening, model, notes}`.
   Default model: `godlock-jeeves-heuristic-0.1` (stdlib, offline).
   If `OLLAMA_HOST` is set, a thin adapter may try it and fall back.
5. Admin **merge** writes the hardening into the active rules table.
   Later scoring can pick up merged keywords (simple keyword add).
6. Scoring is ABAD-aware. Weights live in `godlock/abad.py` as
   engineering defaults — this README does not invent proof numbers.
7. **Lumen export** writes an AES-GCM capsule of receipt+analysis JSON.
   The API does not serve that plaintext back from disk; it keeps
   capsule ids and hashes only.

---

## Install

Python 3.10+. fastapi, uvicorn, cryptography, jinja2.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

From a release artifact:

```bash
python -m pip install godlock-0.1.0.tar.gz
```

Offline data dir: `./.godlock` (gitignored).

---

## CLI

```bash
godlock serve --host 127.0.0.1 --port 8080
godlock submit --text "..." [--out receipt.json]
godlock score --text "..."
godlock merge --receipt ID --hardening "..."
godlock rules
godlock stats
godlock export-lumen --receipt ID --out FILE.capsule
godlock version
```

`submit`, `stats`, and `score` work fully offline with `./.godlock`.

`--persist` (default) writes jsonl/json. `--no-persist` is in-memory
only — not a log wipe.

Library entry:

```python
from godlock import GodLockEngine

engine = GodLockEngine(data_dir="./.godlock", persist=True)
result = engine.submit("ABAD does not layer on phi.")
print(result["receipt"]["id"], result["counter"])
print(result["jeeves_analysis"]["suggested_hardening"])
engine.merge(result["receipt"]["id"], result["jeeves_analysis"]["suggested_hardening"])
engine.export_lumen(result["receipt"]["id"], "out.capsule")
```

---

## Web (localhost)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/` | Dashboard: counter, resilience score, recent receipt ids |
| POST | `/stress` | Submit text (JSON or form) |
| GET | `/stats` | JSON |
| POST | `/merge` | Admin, **no auth** on localhost |
| GET | `/health` | `bind_host` + ok |
| GET | `/capsules` | Capsule ids + hashes only |

Self-contained HTML. No CDN.

---

## Tests

```bash
pip install -e ".[dev]"
python -m pytest -q
```

Offline. No Docker. No Ollama.

---

## Docker (optional)

```bash
docker compose up --build
```

Publishes **127.0.0.1:8080** on the host only. A minimal ClusterIP
manifest lives in `k8s/deployment.yaml`. No privileged containers, no
`hostNetwork`.

---

## Layout

```
godlock/            library (abad, grid, receipts, jeeves, rules, lumen, app, cli)
tests/              pytest, offline
docs/whitepaper.md  12 July 2026 spec
examples/           submit a synthetic stress test
docker/             Dockerfile
k8s/                ClusterIP deployment
workers/download-tracker/   Cloudflare Worker + wrangler.toml (undeployed)
CONTRIBUTING.md     forks first-class; no real ghosting PRs
```

---

## License

Apache-2.0. See [LICENSE](LICENSE).

Forks are welcome and always allowed.
