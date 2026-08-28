from __future__ import annotations

from godlock.config import JEEVES_MODEL
from godlock.engine import GodLockEngine


def test_jeeves_hardening_tethered_to_receipt(mem_engine: GodLockEngine) -> None:
    result = mem_engine.submit("phi and ABAD without a corkscrew")
    analysis = result["jeeves_analysis"]
    assert analysis["receipt_id"] == result["receipt"]["id"]
    assert analysis["suggested_hardening"]
    assert analysis["model"] == JEEVES_MODEL
    assert "notes" in analysis
