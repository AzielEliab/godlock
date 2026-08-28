from __future__ import annotations

import json
from pathlib import Path

from godlock import __version__
from godlock.cli import main
from godlock.config import DEFAULT_BIND_HOST


def test_cli_version(capsys) -> None:
    assert main(["version"]) == 0
    out = capsys.readouterr().out
    assert __version__ in out
    assert "godlock" in out.lower()


def test_cli_score_and_submit(tmp_path: Path, capsys, monkeypatch) -> None:
    monkeypatch.chdir(tmp_path)
    data = tmp_path / "data"
    assert main(["--data-dir", str(data), "score", "--text", "lorem ipsum"]) == 0
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

    assert main(["--data-dir", str(data), "stats"]) == 0
    stats = json.loads(capsys.readouterr().out)
    assert stats["counter"] == 1


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
