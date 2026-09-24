"""Command-line interface for GodLock.

    godlock
    godlock ui
    godlock submit --text "..." [--out receipt.json]
    godlock doctor
    godlock --help

Human text is the default. Add ``--json`` for the same records as JSON.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Sequence

from godlock import __version__
from godlock.config import AUTHOR, DATA_DIR_NAME, DEFAULT_BIND_HOST, DEFAULT_BIND_PORT, MOTTO
from godlock.engine import GodLockEngine


def _data_dir(args: argparse.Namespace) -> Path:
    if getattr(args, "data_dir", None):
        return Path(args.data_dir)
    return Path.cwd() / DATA_DIR_NAME


def _engine(args: argparse.Namespace) -> GodLockEngine:
    persist = True if getattr(args, "persist", True) else False
    return GodLockEngine(data_dir=_data_dir(args), persist=persist)


def _print_json(obj: object) -> None:
    sys.stdout.write(json.dumps(obj, indent=2, ensure_ascii=False) + "\n")


def _fail(reason: str, hint: str) -> int:
    sys.stderr.write(f"{reason}\nTry: {hint}\n")
    return 2


def _wants_json(args: argparse.Namespace) -> bool:
    return bool(getattr(args, "as_json", False))


def _emit(args: argparse.Namespace, payload: object, human: str) -> None:
    if _wants_json(args):
        _print_json(payload)
    else:
        sys.stdout.write(human.rstrip() + "\n")


def top_help() -> str:
    return f"""godlock {__version__}

GodLock records a test on this computer and saves a receipt you can check.

usage:
  godlock [--data-dir DIR] <command> [--json]

commands:
  ui               Open the local page
  submit           Save a test and its receipt
  doctor           Check this install
  help             Show this help
  version          Show the version

advanced:
  serve            Same local page as ui
  score            Engagement reading for one text
  merge            Save a hardening from a receipt
  rules            List active rules
  stats            Counts in the data directory
  export           Save receipts to a JSON file
  import           Load a JSON file of tests or receipts
  export-lumen     Write an encrypted capsule

options:
  --data-dir DIR   Folder for receipts (default ./{DATA_DIR_NAME})
  --no-persist     Keep this run in memory
  --json           Print JSON for machines and agents
  -h, --help       Show this help

examples:
  godlock
  godlock ui
  godlock submit --text "Specified Fit phi"
  godlock doctor
  godlock stats --json

Open http://127.0.0.1:{DEFAULT_BIND_PORT}/ after godlock ui.
Author: {AUTHOR}
"""


def _welcome(as_json: bool) -> int:
    summary = "GodLock records a test on this computer and saves a receipt you can check."
    if as_json:
        _print_json(
            {
                "product": "godlock",
                "version": __version__,
                "author": AUTHOR,
                "summary": summary,
                "next": [
                    "godlock ui",
                    'godlock submit --text "your test"',
                    "godlock doctor",
                    "godlock --help",
                ],
            }
        )
        return 0
    sys.stdout.write(
        summary
        + "\n\n"
        + "Open the page:\n"
        + "  godlock ui\n\n"
        + "Or save a test from here:\n"
        + '  godlock submit --text "your test"\n\n'
        + "Check this install:\n"
        + "  godlock doctor\n\n"
        + f"Author: {AUTHOR}\n"
    )
    return 0


def _friendly_error(prog: str, message: str) -> str:
    low = message.lower()
    if "invalid choice" in low:
        match = re.search(r"invalid choice: '([^']*)'", message)
        name = match.group(1) if match else "that"
        return f'Unknown command "{name}".\nTry: godlock ui    or    godlock --help'
    if "unrecognized arguments" in low:
        return "Unknown option.\nTry: godlock --help"
    if "required" in low and "--text" in message:
        return 'This command needs --text.\nTry: godlock submit --text "your test"'
    if "required" in low and "--receipt" in message and "--out" in message:
        return "export-lumen needs --receipt and --out.\nTry: godlock export-lumen --receipt ID --out file.capsule"
    if "required" in low and "--receipt" in message:
        return "This command needs --receipt.\nTry: godlock merge --receipt ID"
    if "required" in low and "--out" in message:
        return "This command needs --out.\nTry: godlock export --out godlock.json"
    if "required" in low and "--file" in message:
        return "This command needs --file.\nTry: godlock import --file godlock.json"
    if "required" in low and "cmd" in low:
        return "GodLock needs a command.\nTry: godlock ui    or    godlock --help"
    cleaned = message.strip().rstrip(".")
    if cleaned:
        cleaned = cleaned[0].upper() + cleaned[1:]
    else:
        cleaned = "That command could not run"
    return f"{cleaned}.\nTry: {prog or 'godlock'} --help"


class HumanArgumentParser(argparse.ArgumentParser):
    def format_help(self) -> str:
        if self.prog == "godlock":
            return top_help()
        return super().format_help()

    def error(self, message: str) -> None:
        self.exit(2, _friendly_error(self.prog, message) + "\n")


def _add_json_flag(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--json", action="store_true", dest="as_json", help="Print JSON.")


def _build_parser() -> HumanArgumentParser:
    parser = HumanArgumentParser(
        prog="godlock",
        description="GodLock records a test on this computer and saves a receipt you can check.",
    )
    parser.add_argument(
        "--data-dir",
        default=None,
        help=f"Local data directory (default: ./{DATA_DIR_NAME}).",
    )
    persist = parser.add_mutually_exclusive_group()
    persist.add_argument(
        "--persist",
        dest="persist",
        action="store_true",
        default=True,
        help="Write receipts and rules under the data directory (default).",
    )
    persist.add_argument(
        "--no-persist",
        dest="persist",
        action="store_false",
        help="Keep this run in memory.",
    )

    sub = parser.add_subparsers(dest="cmd", required=False, metavar="command")

    def _serve(name: str, help_text: str) -> None:
        command = sub.add_parser(name, help=help_text)
        command.add_argument("--host", default=DEFAULT_BIND_HOST, help="Bind host (default 127.0.0.1).")
        command.add_argument("--port", type=int, default=DEFAULT_BIND_PORT, help="Bind port (default 8080).")

    _serve("ui", "Open the local page on this computer.")
    _serve("serve", "Same local page as ui.")

    p_sub = sub.add_parser("submit", help="Save a test and its receipt.")
    p_sub.add_argument("--text", required=True, help="Test text.")
    p_sub.add_argument("--out", default=None, help="Optional path to write the receipt JSON.")
    _add_json_flag(p_sub)

    p_score = sub.add_parser("score", help="Engagement reading for one text.")
    p_score.add_argument("--text", required=True)
    _add_json_flag(p_score)

    p_merge = sub.add_parser("merge", help="Save a hardening from a receipt.")
    p_merge.add_argument("--receipt", required=True, help="Receipt id.")
    p_merge.add_argument("--hardening", default="", help="Hardening text (default: suggested tip).")
    _add_json_flag(p_merge)

    _add_json_flag(sub.add_parser("rules", help="List active rules."))
    _add_json_flag(sub.add_parser("stats", help="Counts in the data directory."))

    p_ex = sub.add_parser("export-lumen", help="Write an encrypted capsule.")
    p_ex.add_argument("--receipt", required=True)
    p_ex.add_argument("--out", required=True, help="Output .capsule path.")
    _add_json_flag(p_ex)

    p_json_out = sub.add_parser("export", help="Save receipts as a JSON file.")
    p_json_out.add_argument("--out", required=True, help="Output JSON path.")
    _add_json_flag(p_json_out)

    p_json_in = sub.add_parser("import", help="Load a JSON file of tests or receipts.")
    p_json_in.add_argument("--file", required=True, help="Input JSON path.")
    _add_json_flag(p_json_in)

    p_doc = sub.add_parser("doctor", help="Check this install. No network.")
    _add_json_flag(p_doc)
    sub.add_parser("help", help="Show this help.")
    p_version = sub.add_parser("version", help="Show the version.")
    _add_json_flag(p_version)
    return parser


def _format_score(payload: dict) -> str:
    hits = payload.get("hits") or []
    shown = ", ".join(str(hit) for hit in hits) if hits else "none"
    return f"Engagement  {payload.get('score')}\nHits        {shown}"


def _format_submit(result: dict, out_path: str | None) -> str:
    receipt = result.get("receipt") or {}
    lines = [
        "Saved.",
        f"Receipt  {receipt.get('id', '')}",
        f"Tests    {result.get('counter', '')}",
    ]
    tip = ((result.get("jeeves_analysis") or {}).get("suggested_hardening") or "").strip()
    if tip:
        lines.append(f"Tip      {tip}")
    if out_path:
        lines.append(f"Wrote    {out_path}")
    return "\n".join(lines)


def _format_stats(stats: dict) -> str:
    return "\n".join(
        [
            f"Tests            {stats.get('counter', 0)}",
            f"Receipts         {stats.get('receipt_count', 0)}",
            f"Rules            {stats.get('rules', 0)}",
            f"Capsules         {stats.get('capsules', 0)}",
            f"Mean engagement  {stats.get('resilience_score', 0)}",
        ]
    )


def _format_rules(rules: list[dict]) -> str:
    if not rules:
        return "No rules yet."
    lines = [f"{len(rules)} rule" if len(rules) == 1 else f"{len(rules)} rules"]
    for rule in rules:
        lines.append(f"  {rule.get('id', '')}  {rule.get('hardening', '')}")
    return "\n".join(lines)


def _format_rule(rule: dict) -> str:
    return "\n".join(
        [
            "Rule saved.",
            f"Id         {rule.get('id', '')}",
            f"Receipt    {rule.get('receipt_id', '')}",
            f"Hardening  {rule.get('hardening', '')}",
        ]
    )


def _format_import(result: dict) -> str:
    if result.get("mode") == "texts":
        count = result.get("submitted", 0)
        noun = "test" if count == 1 else "tests"
        return f"Saved {count} {noun} from the file."
    failed = result.get("failed") or []
    lines = [
        f"Loaded        {result.get('loaded', 0)}",
        f"Already here  {result.get('skipped', 0)}",
        f"Failed        {len(failed)}",
    ]
    for item in failed:
        rid = item.get("id") or ""
        prefix = f"{rid} — " if rid else ""
        lines.append(f"  FAIL  {prefix}{item.get('error', '')}")
    return "\n".join(lines)


def _format_lumen(info: dict) -> str:
    return "\n".join(
        [
            "Capsule written.",
            f"Id       {info.get('capsule_id', '')}",
            f"SHA-256  {info.get('sha256', '')}",
            f"Receipt  {info.get('receipt_id', '')}",
            f"File     {info.get('path', '')}",
        ]
    )


def _run_serve(args: argparse.Namespace) -> int:
    import uvicorn

    from godlock.app import create_app

    loopback = {"127.0.0.1", "localhost", "::1"}
    if args.host not in loopback:
        return _fail(
            "That address is not loopback. GodLock listens on 127.0.0.1.",
            "godlock ui",
        )
    engine = _engine(args)
    from godlock.update import check_update, format_prompt

    update = check_update(__version__)
    prompt = format_prompt(update)
    if prompt:
        sys.stderr.write(prompt + "\n")
    app = create_app(
        engine=engine,
        persist=args.persist,
        data_dir=_data_dir(args),
        bind_host=args.host,
        bind_port=args.port,
        update=update,
    )
    sys.stdout.write(f"Open http://{args.host}:{args.port}/\n")
    sys.stdout.flush()
    uvicorn.run(app, host=args.host, port=args.port, log_level="info")
    return 0


def main(argv: Sequence[str] | None = None) -> int:
    parser = _build_parser()
    raw = list(sys.argv[1:] if argv is None else argv)
    as_json = "--json" in raw
    cleaned = [arg for arg in raw if arg != "--json"]
    try:
        args = parser.parse_args(cleaned)
    except SystemExit as exc:
        code = exc.code
        if code in (0, None):
            return 0
        if isinstance(code, int):
            return code
        return 2
    if as_json:
        args.as_json = True

    if not args.cmd:
        return _welcome(as_json)

    if args.cmd == "help":
        sys.stdout.write(parser.format_help())
        return 0

    if args.cmd == "version":
        from godlock.update import check_update, format_prompt

        update = check_update(__version__)
        prompt = format_prompt(update)
        if _wants_json(args):
            payload: dict[str, object] = {
                "product": "godlock",
                "version": __version__,
                "author": AUTHOR,
                "motto": MOTTO,
            }
            if update:
                payload["update"] = update
            if prompt:
                payload["prompt"] = prompt
            _print_json(payload)
            return 0
        sys.stdout.write(f"godlock {__version__}\n")
        sys.stdout.write(MOTTO + "\n")
        if prompt:
            sys.stdout.write(prompt + "\n")
        return 0

    if args.cmd == "doctor":
        from godlock.doctor import doctor_cli

        return doctor_cli(as_json=_wants_json(args))

    if args.cmd in ("serve", "ui"):
        return _run_serve(args)

    engine = _engine(args)

    if args.cmd == "submit":
        try:
            result = engine.submit(args.text)
        except ValueError as exc:
            return _fail(str(exc), 'godlock submit --text "your test"')
        if args.out:
            Path(args.out).write_text(
                json.dumps(result, indent=2, ensure_ascii=False) + "\n",
                encoding="utf-8",
            )
        _emit(args, result, _format_submit(result, args.out))
        return 0

    if args.cmd == "score":
        try:
            payload = engine.score(args.text)
        except ValueError as exc:
            return _fail(str(exc), 'godlock score --text "your test"')
        _emit(args, payload, _format_score(payload))
        return 0

    if args.cmd == "merge":
        try:
            rule = engine.merge(args.receipt, args.hardening)
        except KeyError as exc:
            return _fail(str(exc).strip("'\""), "godlock submit --text \"your test\"")
        except ValueError as exc:
            return _fail(str(exc), 'godlock merge --receipt ID --hardening "your rule"')
        body = rule.as_dict()
        _emit(args, body, _format_rule(body))
        return 0

    if args.cmd == "rules":
        body = [rule.as_dict() for rule in engine.rules.all()]
        _emit(args, body, _format_rules(body))
        return 0

    if args.cmd == "stats":
        body = engine.stats()
        _emit(args, body, _format_stats(body))
        return 0

    if args.cmd == "export":
        bundle = engine.export_json()
        try:
            Path(args.out).write_text(
                json.dumps(bundle, indent=2, ensure_ascii=False) + "\n",
                encoding="utf-8",
            )
        except OSError as exc:
            reason = exc.strerror or "could not write that file"
            return _fail(f"Could not write {args.out} ({reason}).", "godlock export --out godlock.json")
        summary = {"ok": True, "path": args.out, "receipts": len(bundle["receipts"])}
        count = summary["receipts"]
        noun = "receipt" if count == 1 else "receipts"
        _emit(args, summary, f"Saved {count} {noun} to {args.out}")
        return 0

    if args.cmd == "import":
        path = Path(args.file)
        if not path.is_file():
            return _fail(f"No file at {path}.", "godlock import --file godlock.json")
        try:
            raw = path.read_text(encoding="utf-8")
            result = engine.import_json(raw)
        except json.JSONDecodeError:
            return _fail("That file is not JSON.", "godlock import --file godlock.json")
        except UnicodeDecodeError:
            return _fail("That file could not be read as text.", "godlock import --file godlock.json")
        except ValueError as exc:
            return _fail(str(exc), "godlock import --file godlock.json")
        _emit(args, result, _format_import(result))
        failed = result.get("failed") or []
        return 1 if failed else 0

    if args.cmd == "export-lumen":
        try:
            info = engine.export_lumen(args.receipt, args.out)
        except KeyError as exc:
            return _fail(str(exc).strip("'\""), "godlock export-lumen --receipt ID --out file.capsule")
        except OSError as exc:
            reason = exc.strerror or "could not write that file"
            return _fail(
                f"Could not write {args.out} ({reason}).",
                "godlock export-lumen --receipt ID --out file.capsule",
            )
        _emit(args, info, _format_lumen(info))
        return 0

    return _fail(f'Unknown command "{args.cmd}".', "godlock --help")


if __name__ == "__main__":
    raise SystemExit(main())
