# Contributing to GodLock

**Forks are first-class.** This project is Apache-2.0; you do not need
permission to fork, patch, or redistribute. Pull requests are welcome
if you want a change upstream. Keep a fork forever if you do not.

**Forks are welcome and always allowed.**

## How to run tests

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
python -m pytest -q
```

Python 3.10+, fastapi, uvicorn, cryptography, jinja2, pytest, httpx.
No Docker required for tests. No Ollama required for tests. The
heuristic Jeeves model (`godlock-jeeves-heuristic-0.1`) is offline.

## Ground rules

1. Treat `origin` as one peer among many. Downstream forks are part of
   the download-tracking model (see `workers/download-tracker`): they
   report as `{owner}/{repo}`, not as anonymous noise.
2. **Do not invent evaluation numbers or fake "proof" scores.** ABAD
   weights in `godlock/abad.py` are engineering defaults. If you measure
   something, publish the method in the same breath as the number.
3. **No real ghosting / opsec-evasion PRs.** GodLock's MirageGrid and
   Airlock are *logical identities* (strings like `grid-07`). Pull
   requests that add Tor, proxy chains, IP hopping, traffic-analysis
   breaking, connection-drop anonymity, origin-IP hiding, scorched-earth
   log wiping, or anti-forensics will be refused. The core listens on
   localhost. Public traffic, if any, sits behind an ops layer you
   already run — this repo does not pretend to be that layer.
4. **Do not implement malware, exploits, or concealment of a server
   from its operators.**
5. **Keep the dependency list small.** fastapi, uvicorn, cryptography,
   jinja2 in the core. Dev extra is pytest + httpx. Ollama is optional
   and unused unless `OLLAMA_HOST` is set.
6. **Receipts are immutable.** No wipe API. `--no-persist` means
   in-memory, not "erase the evidence."
7. **Lumen capsules are one-way from the API's point of view.** Do not
   add an endpoint that serves capsule plaintext back from disk.

## Where to change things

- ABAD tokens / weights: `godlock/abad.py`
- Logical grid / airlock: `godlock/grid.py`
- Receipts / counter: `godlock/receipts.py`
- Jeeves heuristic: `godlock/jeeves.py`
- Active rules / merge: `godlock/rules.py`
- Capsule crypto: `godlock/lumen.py`
- HTTP: `godlock/app.py`
- CLI: `godlock/cli.py`
- New behavior needs an offline test that fails without the change.

## Reporting downloads from a fork

Point users at GitHub Releases. If you cut your own releases, POST
`/event` on the download-tracker worker so counts stay attributed to
your `owner/repo` (see `workers/download-tracker/README.md`).

## License of contributions

By submitting a change you agree it is licensed under Apache-2.0, the
same license as the rest of the tree. Keep the copyright lines honest.
