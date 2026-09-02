# GodLock

**A self-hosted stress-test and resilience engine for the ABAD framework**

**Author:** Aziel Eliab
**Date:** 12 July 2026
**License:** Apache-2.0
**Implementation:** `godlock` 0.1.0 under GitHub user AzielEliab

> GodLock does not argue. It records, analyzes, hardens, and grows.

---

## Abstract

GodLock is a localhost research tool that treats opposition as fuel.
A counter-argument is not a debate to win. It is a **stress test**:
logged as an immutable receipt, scored for engagement with the ABAD
framework, analysed by Jeeves into a suggested hardening, optionally
merged into an active rules table, and optionally sealed into a
one-way Lumen capsule.

The public metric is a **resilience counter** plus a mean engagement
score. Both grow as tests are recorded and rules are merged
(corkscrew growth). GodLock does not claim that a number in this
document proves a physical constant. Scoring weights are engineering
defaults documented in code.

This specification is implemented by the `godlock` Python package.
The package is the **core + receipts engine**. It is **not an
anonymity network**.

Forks are welcome and always allowed.

---

## 1. What GodLock is

GodLock is:

- self-hosted;
- browser-served on the loopback interface by default;
- a recorder of counter-arguments;
- an ABAD-aware scorer;
- a Jeeves proposer of hardenings;
- a merge table for active rules;
- a Lumen exporter of encrypted capsules.

GodLock is not:

- a chatbot that argues back;
- a proof that φ or √2 "appears in nature" at a published rate;
- Tor, a proxy chain, an IP hopper, or a traffic-analysis breaker;
- a scorched-earth log wiper or anti-forensics kit;
- malware, an exploit toolkit, or a way to hide a server from its
  operators.

---

## 2. The ABAD surface this engine hardens

GodLock exists to stress-test the ABAD framework as used by Aziel
Systems work: layered reading (A-B-A-D), the Aziel Sequence, φ and
√2 as named convergences, Flower of Life geometry, and corkscrew
growth. A submission *engages* the framework when its text hits one
or more of those families. Engagement is a heuristic, not a
decryption of a historical artifact and not a laboratory measurement.

The families and default weights (also in `godlock/abad.py`):

| Family | Tokens (examples) | Weight |
|--------|-------------------|--------|
| `aziel_sequence` | Aziel Sequence, aziel-seq | 3.0 |
| `phi` | phi, golden ratio, φ, 1.618 | 2.0 |
| `sqrt2` | sqrt(2), √2, square root of 2, 1.414 | 2.0 |
| `flower_of_life` | Flower of Life, vesica piscis | 2.5 |
| `corkscrew` | corkscrew | 2.0 |
| `abad` | ABAD, A-B-A-D | 3.0 |
| `merged_rule` | extra keywords from merged hardenings | 1.5 each |

Families stack. These numbers are **defaults for software**, not
empirical proof. A fork may change them; it must not pretend a study
was run unless it publishes the method next to the number.

A-B-A-D layering, in this engine, is operationalized as: **A**ccept
the counter-argument as a receipt, **B**ind it to logical ingress /
egress identity, **A**nalyse it (Jeeves), **D**eploy a merged rule
(corkscrew growth of the table). That is a software loop, not a
claim about a manuscript.

---

## 3. Core listens on localhost

The HTTP process binds to `127.0.0.1` by default (port 8080). CLI:

```
godlock serve --host 127.0.0.1 --port 8080
```

The application factory records that default so tests can assert it.
This is a research tool. POST `/merge` is unauthenticated **because
it is localhost**. An operator who publishes the port without an
auth proxy of their own is outside this spec.

Optional Docker Compose publishes `127.0.0.1:8080` on the host.
A minimal Kubernetes manifest uses **ClusterIP** only: no
`hostNetwork`, no privileged container.

---

## 4. Logical identities (MirageGrid, Airlock)

The 12 July 2026 design describes an ops story in which public
traffic would sit *behind* an existing MirageGrid / Airlock layer.
**This open core does not implement that network.** It models the
identities the receipts need:

### 4.1 MirageGrid

- 25 named logical nodes: `grid-01` … `grid-25`.
- Session identity rotates on a short interval.
- Rotation is entropy-driven (`secrets`) and **purely in-process**.
- `node_id` is a string. No sockets are opened for rotation.

### 4.2 Airlock

- A request is **accepted** on one logical **ingress** node.
- It is processed internally (same process, no connection drop).
- The response is **attributed** to a different logical **egress**
  node.
- Ingress is never equal to egress.
- No real IPs. No dropped sockets. No proxy chain.

Receipts store `ingress_node` and `egress_node` so a log can be read
as "entered at grid-04, left at grid-19" without implying a packet
took that path on the public internet.

If a deployment needs a real reverse proxy, use one. Do not file a
PR that adds Tor, SOCKS, IP hopping, or origin hiding to this repo.

---

## 5. Immutable receipts

A stress test produces a receipt:

| Field | Meaning |
|-------|---------|
| `id` | UUID |
| `timestamp` | UTC, `Z` suffix |
| `ingress_node` | logical Airlock ingress |
| `egress_node` | logical Airlock egress |
| `text` | the counter-argument |
| `hash` | SHA-256 of the canonical JSON of the other fields |

Receipts are frozen. The store is append-only (jsonl when persisting,
a dict when not). Overwrite of an existing id with a different
payload is an error. There is **no wipe API**, no shred, no
scorched-earth path. GodLock will not help an operator evade
inspection of their own logs.

The public **resilience counter** is the number of receipts. It only
increments.

---

## 6. Persistence

```
godlock submit --persist     # default: jsonl/json under ./.godlock
godlock submit --no-persist  # in-memory only
```

`--no-persist` skips disk. It does not delete a log that already
exists, and it is not advertised as anti-forensics. The data
directory `./.godlock` is gitignored. It may hold:

- `receipts.jsonl`
- `rules.json`
- `analyses.json`
- `capsule_index.json` (ids + hashes, not plaintext)
- `lumen.key`

---

## 7. Jeeves

Jeeves consumes a receipt and returns:

```
{
  "receipt_id": "...",
  "suggested_hardening": "...",
  "model": "godlock-jeeves-heuristic-0.1",
  "notes": "..."
}
```

The default model is a stdlib heuristic over ABAD families. It does
not require the network. If the environment variable `OLLAMA_HOST`
is set, a thin adapter may POST to that host's `/api/generate` with
a short timeout and must fall back to the heuristic on any failure.
Tests pass offline with the heuristic.

Jeeves **proposes**. It does not merge.

---

## 8. Merge and corkscrew growth

Admin `merge` applies a hardening (the Jeeves suggestion, or a
hand-written rule) to the **active rules** table. The table only
grows. Keywords extracted from the hardening are fed back into
scoring as `merged_rule` hits (simple keyword add). That is the
corkscrew: stress → receipt → hardening → rule → richer scoring of
the next stress.

HTTP `POST /merge` is the same operation. No auth on localhost.

---

## 9. Lumen capsules

`export-lumen` writes an AES-256-GCM file (`GLC1` magic, random
12-byte nonce) containing the JSON of receipt + Jeeves analysis +
engagement. Ciphertext is not plaintext. A wrong key fails.

Key source:

1. `GODLOCK_LUMEN_KEY` (64 hex chars, or any string SHA-256'd to 32 bytes);
2. otherwise a generated `lumen.key` in the data dir;
3. otherwise an ephemeral in-memory key when `--no-persist`.

**One-way from the API.** After write, GodLock does not serve the
capsule plaintext back from disk. It keeps an in-process (and
optional on-disk) index of `capsule_id` + SHA-256 only. Tests
decrypt with the same key to verify roundtrip. Operators who hold
the key may decrypt locally; the HTTP surface will not do it for
them.

---

## 10. HTTP surface

| Method | Path | Role |
|--------|------|------|
| GET | `/` | Dashboard: counter, resilience score, recent ids |
| POST | `/stress` | Submit text |
| GET | `/stats` | JSON stats |
| POST | `/merge` | Admin merge (no auth on localhost) |
| GET | `/health` | Liveness + `bind_host` |
| GET | `/capsules` | Ids + hashes only |

HTML is self-contained. No CDN.

---

## 11. CLI surface

```
godlock serve --host 127.0.0.1 --port 8080
godlock submit --text "..." [--out receipt.json]
godlock score --text "..."
godlock merge --receipt ID --hardening "..."
godlock rules
godlock stats
godlock export-lumen --receipt ID --out FILE.capsule
godlock version
```

`submit`, `stats`, and `score` work fully offline.

---

## 12. Security limits (normative)

This open, auditable, localhost research tool **must not** implement:

- real IP hopping, proxy chains, Tor, traffic-analysis breaking,
  connection-drop anonymity, or hiding of origin IPs;
- scorched-earth log wiping or anti-forensics;
- malware, exploits, or concealment of a server from operators.

MirageGrid and Airlock in this repository are logical. Ghosting is
logical-only.

---

## 13. What this document does not claim

It does not publish a measured ROC, a latency benchmark, or a
physical proof of φ or √2. Resilience score is the mean ABAD
engagement of logged receipts, an engineering convenience.

---

## 14. License and forks

Apache-2.0. Copyright 2026 Aziel Eliab.

Forks are welcome and always allowed. Download counts may be
reported per `owner/repo` through the optional Cloudflare worker
in `workers/download-tracker/` (shipped undeployed until an
operator with the account deploys it).
