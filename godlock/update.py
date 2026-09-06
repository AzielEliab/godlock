"""Optional online update prompt for GodLock.

Calls aziel-runtime ``GET /v1/update/check?slug=godlock&version=…`` when a
network is available. Falls back to ``GET /v1/pull/godlock``. Surfaces a
counted ``/download`` link when ``update_available``. Never overwrites the
local install. Author: Aziel Eliab.
"""

from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Callable

from godlock import __version__

RUNTIME_HOST = "https://aziel-runtime.vibelock.workers.dev"
UPDATE_CHECK_PATH = "/v1/update/check"
PULL_PATH = "/v1/pull/godlock"
DOWNLOAD = "https://godlock-download-tracker.vibelock.workers.dev/download"
SLUG = "godlock"
USER_AGENT = "Mozilla/5.0"
DEFAULT_TIMEOUT_S = 2.5

Fetcher = Callable[[str], dict[str, Any] | None]


def compare_versions(left: str, right: str) -> int:
    """Return 1 if left > right, -1 if left < right, 0 if equal / unparsable."""
    def parts(raw: str) -> list[int]:
        out: list[int] = []
        for chunk in str(raw or "").strip().lstrip("vV").split("."):
            digits = ""
            for ch in chunk:
                if ch.isdigit():
                    digits += ch
                else:
                    break
            if digits == "":
                break
            out.append(int(digits))
        return out

    a, b = parts(left), parts(right)
    if not a or not b:
        return 0
    n = max(len(a), len(b))
    a.extend([0] * (n - len(a)))
    b.extend([0] * (n - len(b)))
    if a > b:
        return 1
    if a < b:
        return -1
    return 0


def _truthy(value: Any) -> bool:
    if value is True:
        return True
    if isinstance(value, str) and value.strip().lower() in {"1", "true", "yes"}:
        return True
    return False


def parse_update_doc(body: Any, current: str) -> dict[str, Any] | None:
    if not isinstance(body, dict):
        return None
    latest = str(body.get("latest") or body.get("latest_version") or body.get("version") or "").strip()
    installed = str(body.get("current") or body.get("installed") or current or "").strip()
    download = str(body.get("download") or body.get("download_url") or DOWNLOAD).strip() or DOWNLOAD
    flagged = _truthy(body.get("update_available"))
    if not flagged and latest and installed and compare_versions(latest, installed) > 0:
        flagged = True
    if body.get("error") and not latest:
        return None
    if not latest and not flagged:
        return None
    return {
        "ok": True,
        "slug": SLUG,
        "version": installed or current,
        "latest": latest or installed or current,
        "update_available": bool(flagged),
        "download": download,
        "forced": False,
        "author": "Aziel Eliab",
    }


def _default_fetch(url: str, timeout: float = DEFAULT_TIMEOUT_S) -> dict[str, Any] | None:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if getattr(resp, "status", 200) >= 400:
                return None
            raw = resp.read().decode("utf-8")
    except (urllib.error.URLError, TimeoutError, OSError, ValueError):
        return None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, dict) else None


def check_update(
    version: str | None = None,
    *,
    fetch: Fetcher | None = None,
    timeout: float = DEFAULT_TIMEOUT_S,
) -> dict[str, Any] | None:
    """Return an update record or None when offline / unchanged / unreadable.

    Never raises. Never downloads a package. ``forced`` is always False.
    """
    current = str(version or __version__)
    getter = fetch or (lambda url: _default_fetch(url, timeout=timeout))
    check_url = (
        f"{RUNTIME_HOST}{UPDATE_CHECK_PATH}"
        f"?slug={SLUG}&version={urllib.parse.quote(current, safe='')}"
    )
    parsed = parse_update_doc(getter(check_url), current)
    if parsed is None:
        parsed = parse_update_doc(getter(f"{RUNTIME_HOST}{PULL_PATH}"), current)
    if parsed is None:
        return None
    parsed["forced"] = False
    return parsed


def format_prompt(doc: dict[str, Any] | None) -> str:
    if not doc or not doc.get("update_available"):
        return ""
    latest = doc.get("latest") or ""
    current = doc.get("version") or __version__
    download = doc.get("download") or DOWNLOAD
    return (
        f"Update available: GodLock {latest} (you have {current}). "
        f"Counted download (no silent overwrite): {download}"
    )
