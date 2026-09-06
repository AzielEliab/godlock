from __future__ import annotations

from godlock.update import (
    DOWNLOAD,
    UPDATE_CHECK_PATH,
    check_update,
    compare_versions,
    format_prompt,
    parse_update_doc,
)


def test_compare_versions() -> None:
    assert compare_versions("0.2.0", "0.1.0") == 1
    assert compare_versions("0.1.0", "0.2.0") == -1
    assert compare_versions("0.1.0", "0.1.0") == 0
    assert compare_versions("v1.0.0", "1.0") == 0


def test_parse_update_doc_flags_newer_pull_version() -> None:
    doc = parse_update_doc({"version": "0.2.0", "download": DOWNLOAD}, "0.1.0")
    assert doc is not None
    assert doc["update_available"] is True
    assert doc["forced"] is False
    assert doc["latest"] == "0.2.0"
    assert doc["download"] == DOWNLOAD


def test_check_update_prefers_runtime_endpoint() -> None:
    calls: list[str] = []

    def fake(url: str):
        calls.append(url)
        return {
            "ok": True,
            "update_available": True,
            "latest": "0.2.0",
            "download": DOWNLOAD,
        }

    doc = check_update("0.1.0", fetch=fake)
    assert doc is not None
    assert UPDATE_CHECK_PATH in calls[0]
    assert "slug=godlock" in calls[0]
    assert "version=0.1.0" in calls[0]
    assert doc["update_available"] is True
    assert doc["forced"] is False
    assert "Counted download" in format_prompt(doc)
    assert DOWNLOAD in format_prompt(doc)


def test_check_update_falls_back_to_pull() -> None:
    def fake(url: str):
        if UPDATE_CHECK_PATH in url:
            return {"error": "not found"}
        return {"slug": "godlock", "version": "0.2.0", "download": DOWNLOAD}

    doc = check_update("0.1.0", fetch=fake)
    assert doc is not None
    assert doc["latest"] == "0.2.0"
    assert doc["update_available"] is True


def test_check_update_offline_is_silent() -> None:
    assert check_update("0.1.0", fetch=lambda _url: None) is None
    assert format_prompt(None) == ""


def test_cli_version_surfaces_prompt(capsys, monkeypatch) -> None:
    from godlock.cli import main

    monkeypatch.setattr(
        "godlock.update.check_update",
        lambda version=None, **_kw: {
            "ok": True,
            "version": "0.1.0",
            "latest": "0.2.0",
            "update_available": True,
            "download": DOWNLOAD,
            "forced": False,
        },
    )
    assert main(["version"]) == 0
    out = capsys.readouterr().out
    assert "0.1.0" in out
    assert "Update available" in out
    assert DOWNLOAD in out
    assert "overwrite" in out.lower()
