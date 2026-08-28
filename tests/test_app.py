from __future__ import annotations

from fastapi.testclient import TestClient

from godlock.app import create_app
from godlock.config import DEFAULT_BIND_HOST
from godlock.engine import GodLockEngine


def test_bind_default_is_loopback() -> None:
    app = create_app(engine=GodLockEngine(persist=False), persist=False)
    assert app.state.bind_host == "127.0.0.1"
    assert app.state.bind_host == DEFAULT_BIND_HOST


def test_fastapi_submit_stats_health() -> None:
    app = create_app(engine=GodLockEngine(persist=False), persist=False)
    client = TestClient(app)
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["ok"] is True
    assert health.json()["bind_host"] == "127.0.0.1"

    posted = client.post("/stress", json={"text": "ABAD and phi corkscrew"})
    assert posted.status_code == 200
    body = posted.json()
    assert body["receipt"]["id"]
    assert body["counter"] == 1
    assert body["receipt"]["ingress_node"] != body["receipt"]["egress_node"]

    stats = client.get("/stats")
    assert stats.status_code == 200
    assert stats.json()["counter"] == 1
    assert stats.json()["resilience_score"] >= 0

    merged = client.post(
        "/merge",
        json={"receipt_id": body["receipt"]["id"], "hardening": "Require vesica keyword."},
    )
    assert merged.status_code == 200
    assert merged.json()["rules"] == 1

    home = client.get("/")
    assert home.status_code == 200
    assert b"GodLock" in home.content
