from __future__ import annotations

import json
from pathlib import Path

from fastapi.testclient import TestClient

from godlock.app import create_app
from godlock.cli import main
from godlock.engine import GodLockEngine
from godlock.receipts import Receipt


def test_export_import_roundtrip_keeps_hashes(mem_engine: GodLockEngine) -> None:
    first = mem_engine.submit("ABAD Flower of Life phi")
    rid = first["receipt"]["id"]
    digest = first["receipt"]["hash"]
    bundle = mem_engine.export_json()
    assert bundle["author"] == "Aziel Eliab"
    assert "lumen" not in json.dumps(bundle).lower()
    assert bundle["receipts"][0]["hash"] == digest

    other = GodLockEngine(persist=False)
    loaded = other.import_json(bundle)
    assert loaded["mode"] == "receipts"
    assert loaded["loaded"] == 1
    assert loaded["failed"] == []
    stored = other.receipts.get(rid)
    assert stored.hash == digest
    assert stored.verify()
    assert stored.text == "ABAD Flower of Life phi"

    again = other.import_json(bundle)
    assert again["skipped"] == 1
    assert again["loaded"] == 0


def test_tampered_receipt_fails_and_is_not_stored(mem_engine: GodLockEngine) -> None:
    mem_engine.submit("ABAD phi")
    bundle = mem_engine.export_json()
    bundle["receipts"][0]["text"] = "tampered payload"
    other = GodLockEngine(persist=False)
    result = other.import_json(bundle)
    assert result["failed"]
    assert result["loaded"] == 0
    assert len(other.receipts) == 0


def test_import_text_json_submits(mem_engine: GodLockEngine) -> None:
    result = mem_engine.import_json({"text": "corkscrew ABAD"})
    assert result["mode"] == "texts"
    assert result["submitted"] == 1
    rec = Receipt(**result["results"][0]["receipt"])
    assert rec.verify()


def test_cli_export_import(tmp_path: Path, capsys, monkeypatch) -> None:
    monkeypatch.chdir(tmp_path)
    data = tmp_path / "data"
    assert main(["--data-dir", str(data), "submit", "--text", "ABAD phi"]) == 0
    capsys.readouterr()
    out = tmp_path / "godlock.json"
    assert main(["--data-dir", str(data), "export", "--out", str(out)]) == 0
    capsys.readouterr()
    payload = json.loads(out.read_text(encoding="utf-8"))
    assert payload["receipts"][0]["hash"]
    data2 = tmp_path / "data2"
    assert main(["--data-dir", str(data2), "import", "--file", str(out)]) == 0
    imported = json.loads(capsys.readouterr().out)
    assert imported["loaded"] == 1
    assert imported["failed"] == []


def test_http_import_export_and_simple_ui() -> None:
    app = create_app(engine=GodLockEngine(persist=False), persist=False)
    client = TestClient(app)
    home = client.get("/")
    assert home.status_code == 200
    html = home.text
    assert "Import JSON" in html
    assert "Export JSON" in html
    assert "Verify" in html
    assert "Record" in html
    assert "Aziel Eliab" in html
    assert "Not a VPN" in html
    assert "Collin Horton" not in html
    assert "Revealer" not in html
    assert "GodLock.AZ" not in html

    posted = client.post("/stress", json={"text": "ABAD phi corkscrew"})
    assert posted.status_code == 200
    digest = posted.json()["receipt"]["hash"]

    exported = client.get("/export")
    assert exported.status_code == 200
    assert "attachment" in exported.headers.get("content-disposition", "")
    bundle = exported.json()
    assert bundle["receipts"][0]["hash"] == digest

    doctor = client.get("/doctor")
    assert doctor.status_code == 200
    assert doctor.json()["verdict"] == "PASS"

    verify = client.get("/verify")
    assert verify.status_code == 200
    assert "PASS" in verify.text
    assert "All checks good" in verify.text

    other = create_app(engine=GodLockEngine(persist=False), persist=False)
    other_client = TestClient(other)
    loaded = other_client.post("/import", json=bundle)
    assert loaded.status_code == 200
    body = loaded.json()
    assert body["loaded"] == 1
    assert body["failed"] == []

    texts = other_client.post("/import", json={"text": "Flower of Life"})
    assert texts.status_code == 200
    assert texts.json()["submitted"] == 1
