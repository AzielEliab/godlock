"""Grep-level guard: this core must not grow a real ghost network."""

from __future__ import annotations

import ast
from pathlib import Path

import godlock

ROOT = Path(godlock.__file__).resolve().parent

FORBIDDEN_MODULES = {
    "socks",
    "sockshandler",
    "stem",
    "torpy",
    "IPy",
    "scapy",
    "proxybroker",
    "aiohttp_socks",
    "python_socks",
    "requests",  # no outbound proxy client in the core
}

FORBIDDEN_SUBSTRINGS = (
    "torrc",
    "socks5://",
    "proxy_chain",
    "iptables",
    "scorched",
    "wipe_logs",
    "shred(",
)


def _python_files() -> list[Path]:
    return [p for p in ROOT.rglob("*.py") if p.is_file()]


def test_no_real_proxy_or_ip_rotation() -> None:
    for path in _python_files():
        source = path.read_text(encoding="utf-8")
        tree = ast.parse(source, filename=str(path))
        for node in ast.walk(tree):
            names: list[str] = []
            if isinstance(node, ast.Import):
                names = [n.name.split(".")[0] for n in node.names]
            elif isinstance(node, ast.ImportFrom) and node.module:
                names = [node.module.split(".")[0]]
            for name in names:
                assert name not in FORBIDDEN_MODULES, f"{path.name} imports {name}"
                assert name != "socket", f"{path.name} must not import socket; uvicorn binds"
        lower = source.lower()
        for needle in FORBIDDEN_SUBSTRINGS:
            assert needle not in lower, f"{path} contains {needle!r}"


def test_no_wipe_api() -> None:
    from godlock.receipts import ReceiptStore

    assert not hasattr(ReceiptStore, "wipe")
    assert not hasattr(ReceiptStore, "shred")
    assert not hasattr(ReceiptStore, "scorch")
