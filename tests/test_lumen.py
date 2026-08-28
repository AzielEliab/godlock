from __future__ import annotations

from pathlib import Path

import pytest

from godlock.engine import GodLockEngine
from godlock.lumen import LumenAuthError, decrypt_capsule


def test_lumen_encrypts_and_roundtrips(tmp_path: Path, mem_engine: GodLockEngine) -> None:
    result = mem_engine.submit("Flower of Life stress test")
    rid = result["receipt"]["id"]
    out = tmp_path / "one.capsule"
    info = mem_engine.export_lumen(rid, out)
    blob = out.read_bytes()
    plaintext_marker = b"suggested_hardening"
    assert plaintext_marker not in blob
    assert result["receipt"]["text"].encode() not in blob
    assert info["sha256"]
    assert info["capsule_id"]
    opened = decrypt_capsule(out, mem_engine.lumen_key)
    assert opened["receipt"]["id"] == rid
    assert opened["jeeves_analysis"]["receipt_id"] == rid
    with pytest.raises(LumenAuthError):
        decrypt_capsule(out, b"\x00" * 32)
    # API-style index has hashes, not plaintext.
    idx = mem_engine.capsule_index()
    assert idx[0]["sha256"] == info["sha256"]
    assert "receipt" not in idx[0]
