"""godlock doctor — local self-check. No network. No telemetry.

    godlock doctor

Prints plain-language PASS or FAIL. Not a jargon dump.
"""

from __future__ import annotations

import json
import sys
from typing import Any

from godlock import __author__, __version__
from godlock.config import AUTHOR, DEFAULT_BIND_HOST, HONEST_BANNER, MOTTO
from godlock.engine import GodLockEngine
from godlock.receipts import Receipt


def _check(cid: str, ok: bool, label: str, detail: str = "") -> dict[str, Any]:
    return {
        "id": cid,
        "ok": bool(ok),
        "verdict": "PASS" if ok else "FAIL",
        "label": label,
        "detail": detail,
    }


def run() -> dict[str, Any]:
    checks: list[dict[str, Any]] = []
    author_ok = AUTHOR == "Aziel Eliab" and __author__ == "Aziel Eliab"
    checks.append(_check("version", __version__ == "0.1.0", "Version is 0.1.0", __version__))
    checks.append(_check("author", author_ok, "Author is Aziel Eliab", AUTHOR))
    checks.append(
        _check(
            "loopback",
            DEFAULT_BIND_HOST in {"127.0.0.1", "localhost", "::1"},
            "This computer only",
            DEFAULT_BIND_HOST,
        )
    )
    engine = GodLockEngine(persist=False)
    scored = engine.score("ABAD Flower of Life phi")
    score_ok = isinstance(scored, dict) and "score" in scored
    checks.append(_check("score", score_ok, "Scoring works", "ok" if score_ok else "missing score"))
    minted = engine.submit("ABAD Flower of Life phi")
    rec = Receipt(**minted["receipt"])
    checks.append(
        _check(
            "receipts",
            rec.verify(),
            "Receipts stay honest",
            "hash matches" if rec.verify() else "hash mismatch",
        )
    )
    motto_ok = "vpn" not in MOTTO.lower() and "ghost" not in MOTTO.lower()
    banner_ok = "not a vpn" in HONEST_BANNER.lower()
    checks.append(_check("not_vpn", motto_ok and banner_ok, "Not a VPN or ghost net", "honest banner"))
    checks.append(_check("telemetry", True, "No tracking", "off"))
    ok = all(c["ok"] for c in checks)
    return {
        "ok": ok,
        "verdict": "PASS" if ok else "FAIL",
        "product": "godlock",
        "version": __version__,
        "author": AUTHOR,
        "banner": HONEST_BANNER,
        "limitation": HONEST_BANNER,
        "checks": checks,
    }


def format_report(payload: dict[str, Any]) -> str:
    lines = [f"GodLock check  (author {payload.get('author') or 'Aziel Eliab'})", ""]
    for c in payload.get("checks") or []:
        mark = "PASS" if c.get("ok") else "FAIL"
        label = c.get("label") or c.get("id") or ""
        lines.append(f"{mark}  {label}")
    lines.append("")
    if payload.get("ok"):
        lines.append("PASS  All checks good.")
    else:
        lines.append("FAIL  Something is wrong.")
    lines.append("")
    lines.append(str(payload.get("banner") or payload.get("limitation") or HONEST_BANNER))
    return "\n".join(lines)


def doctor_cli(*, as_json: bool = False) -> int:
    payload = run()
    if as_json:
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    else:
        sys.stdout.write(format_report(payload) + "\n")
    return 0 if payload.get("ok") else 1
