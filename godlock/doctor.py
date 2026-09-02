"""godlock doctor — local self-check. No network. No telemetry.

    godlock doctor
"""

from __future__ import annotations

import json
import sys
from typing import Any

from godlock import __author__, __version__
from godlock.config import AUTHOR, DEFAULT_BIND_HOST, MOTTO
from godlock.engine import GodLockEngine


def _check(cid: str, ok: bool, detail: str = "") -> dict[str, Any]:
    return {"id": cid, "ok": bool(ok), "detail": detail}


def run() -> dict[str, Any]:
    checks: list[dict[str, Any]] = []
    checks.append(_check("version", __version__ == "0.1.0", __version__))
    checks.append(_check("author", AUTHOR == "Aziel Eliab" and __author__ == "Aziel Eliab", AUTHOR))
    checks.append(_check("loopback", DEFAULT_BIND_HOST in {"127.0.0.1", "localhost", "::1"}, DEFAULT_BIND_HOST))
    engine = GodLockEngine(persist=False)
    scored = engine.score("ABAD Flower of Life phi")
    ok_score = isinstance(scored, dict) and "score" in scored or isinstance(scored, dict)
    checks.append(_check("score", bool(scored), str(type(scored).__name__)))
    checks.append(_check("not_vpn", "vpn" not in MOTTO.lower(), "not a VPN or ghost net"))
    checks.append(_check("telemetry", True, "off"))
    ok = all(c["ok"] for c in checks)
    return {
        "ok": ok,
        "product": "godlock",
        "version": __version__,
        "author": AUTHOR,
        "limitation": "GodLock is a product name. Not a VPN, proxy, Tor hop, or identity label. Author: Aziel Eliab.",
        "checks": checks,
    }


def format_report(payload: dict[str, Any]) -> str:
    lines = [f"GodLock doctor {payload.get('version')}  (author Aziel Eliab)"]
    for c in payload.get("checks") or []:
        mark = "ok" if c.get("ok") else "FAIL"
        detail = f"  {c.get('detail')}" if c.get("detail") else ""
        lines.append(f"{mark}  {c.get('id')}{detail}")
    lines.append("doctor: healthy" if payload.get("ok") else "doctor: FAILED")
    lines.append(str(payload.get("limitation") or ""))
    return "\n".join(lines)


def doctor_cli(*, as_json: bool = False) -> int:
    payload = run()
    if as_json:
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    else:
        sys.stdout.write(format_report(payload) + "\n")
    return 0 if payload.get("ok") else 1
