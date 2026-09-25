from __future__ import annotations

import json
from pathlib import Path

from godlock import __version__
from godlock.cli import main
from godlock.config import DEFAULT_BIND_HOST


def test_cli_version(capsys, monkeypatch) -> None:
    monkeypatch.setattr("godlock.update.check_update", lambda version=None, **_kw: None)
    assert main(["version"]) == 0
    out = capsys.readouterr().out
    assert __version__ in out
    assert "godlock" in out.lower()
    assert "Update available" not in out


def test_cli_score_and_submit(tmp_path: Path, capsys, monkeypatch) -> None:
    monkeypatch.chdir(tmp_path)
    data = tmp_path / "data"
    assert main(["--data-dir", str(data), "score", "--text", "lorem ipsum", "--json"]) == 0
    scored = json.loads(capsys.readouterr().out)
    assert "score" in scored

    out_file = tmp_path / "receipt.json"
    assert (
        main(
            [
                "--data-dir",
                str(data),
                "submit",
                "--text",
                "phi ABAD Flower of Life",
                "--out",
                str(out_file),
            ]
        )
        == 0
    )
    payload = json.loads(out_file.read_text(encoding="utf-8"))
    assert payload["receipt"]["id"]
    assert payload["counter"] == 1
    capsys.readouterr()  # drain submit stdout

    assert main(["--data-dir", str(data), "stats", "--json"]) == 0
    stats = json.loads(capsys.readouterr().out)
    assert stats["counter"] == 1
    assert "resilience_score" in stats


def test_cli_serve_defaults_loopback() -> None:
    from godlock.cli import _build_parser

    args = _build_parser().parse_args(["serve"])
    assert args.host == DEFAULT_BIND_HOST
    assert args.host == "127.0.0.1"
    assert args.port == 8080


def test_cli_ui_defaults() -> None:
    from godlock.cli import _build_parser

    args = _build_parser().parse_args(["ui"])
    assert args.host == DEFAULT_BIND_HOST
    assert args.host == "127.0.0.1"
    assert args.port == 8080
    assert args.cmd in ("ui", "serve")


def test_help_lists_ui_and_version() -> None:
    from godlock.cli import _build_parser

    text = _build_parser().format_help()
    assert "ui" in text
    assert "version" in text
    assert "doctor" in text
    assert "import" in text
    assert "export" in text
    assert "127.0.0.1:8080" in text or "godlock ui" in text


def test_bare_command_is_welcome(capsys) -> None:
    assert main([]) == 0
    out = capsys.readouterr().out
    assert "godlock ui" in out
    assert "doctor" in out
    assert "Aziel Eliab" in out
    assert "the following arguments are required" not in out.lower()


def test_unknown_command_has_next_step(capsys) -> None:
    assert main(["bogus"]) == 2
    err = capsys.readouterr().err
    assert 'Unknown command "bogus"' in err
    assert "godlock --help" in err
    assert "Traceback" not in err


def test_submit_missing_text_has_next_step(capsys) -> None:
    assert main(["submit"]) == 2
    err = capsys.readouterr().err
    assert "--text" in err
    assert "Traceback" not in err


def test_score_human_default_and_json(tmp_path: Path, capsys, monkeypatch) -> None:
    monkeypatch.chdir(tmp_path)
    data = str(tmp_path / "data")
    assert main(["--data-dir", data, "score", "--text", "phi"]) == 0
    human = capsys.readouterr().out
    assert "Engagement" in human
    assert not human.lstrip().startswith("{")
    assert main(["--data-dir", data, "--json", "score", "--text", "phi"]) == 0
    payload = json.loads(capsys.readouterr().out)
    assert "score" in payload
    assert "hits" in payload


def test_cli_ui_refuses_non_loopback(capsys) -> None:
    assert main(["ui", "--host", "0.0.0.0"]) == 2
    err = capsys.readouterr().err
    assert "127.0.0.1" in err
    assert "VPN" in err or "loopback" in err.lower()
