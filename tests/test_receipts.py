from __future__ import annotations

import pytest

from godlock.engine import GodLockEngine
from godlock.receipts import ImmutableReceiptError, Receipt, ReceiptStore


def test_receipt_immutability(mem_engine: GodLockEngine) -> None:
    result = mem_engine.submit("the Aziel Sequence is not optional")
    rec = Receipt(**result["receipt"])
    with pytest.raises(Exception):
        rec.text = "mutated"  # type: ignore[misc]
    store: ReceiptStore = mem_engine.receipts
    stored = store.get(rec.id)
    assert stored.hash == rec.hash
    assert stored.verify()
    twin = Receipt(
        id=rec.id,
        timestamp=rec.timestamp,
        ingress_node=rec.ingress_node,
        egress_node=rec.egress_node,
        text="different payload",
        hash=rec.hash,
    )
    with pytest.raises(ImmutableReceiptError):
        store.append(twin)


def test_counter_increments(mem_engine: GodLockEngine) -> None:
    assert mem_engine.counter == 0
    mem_engine.submit("first")
    mem_engine.submit("second")
    assert mem_engine.counter == 2
    stats = mem_engine.stats()
    assert stats["counter"] == 2


def test_persist_roundtrip(data_dir, engine: GodLockEngine) -> None:
    r = engine.submit("persist me")
    rid = r["receipt"]["id"]
    again = GodLockEngine(data_dir=data_dir, persist=True)
    assert again.counter == 1
    assert again.receipts.get(rid).text == "persist me"
