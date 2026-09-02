from __future__ import annotations

import json

from godlock.cli import main
from godlock.config import AUTHOR, HONEST_BANNER
from godlock.doctor import format_report, run


def test_doctor_pass_plain_language(capsys) -> None:
    assert main(["doctor"]) == 0
    out = capsys.readouterr().out
    assert "PASS" in out
    assert "All checks good" in out
    assert "Aziel Eliab" in out
    assert "Not a VPN" in out or "vpn" in out.lower()
    assert "FAIL" not in out
    assert "ok  version" not in out
    assert "Collin" not in out
    assert "Horton" not in out
    assert "Revealer" not in out
    assert "GodLock.AZ" not in out


def test_doctor_json_and_banner() -> None:
    payload = run()
    assert payload["ok"] is True
    assert payload["verdict"] == "PASS"
    assert payload["author"] == "Aziel Eliab" == AUTHOR
    assert "Not a VPN" in payload["banner"]
    assert payload["banner"] == HONEST_BANNER
    labels = [c["label"] for c in payload["checks"]]
    assert "Author is Aziel Eliab" in labels
    assert "Receipts stay honest" in labels
    assert all(c["verdict"] == "PASS" for c in payload["checks"])
    text = format_report(payload)
    assert text.startswith("GodLock check")
    assert "PASS  All checks good." in text


def test_doctor_json_cli(capsys) -> None:
    assert main(["doctor", "--json"]) == 0
    payload = json.loads(capsys.readouterr().out)
    assert payload["ok"] is True
    assert payload["verdict"] == "PASS"
