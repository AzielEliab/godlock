"""GodLock engine: receipts, Jeeves, rules, Lumen, logical Airlock.

Optional persistence writes jsonl/json under ``data_dir`` (default
``./.godlock``). ``persist=False`` is in-memory only. There is no wipe
path — persistence is for operators who want a log, not for evasion.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from godlock.abad import score_engagement
from godlock.config import DATA_DIR_NAME, DEFAULT_ROTATE_INTERVAL_S
from godlock.grid import Airlock, MirageGrid
from godlock.jeeves import analyze as jeeves_analyze
from godlock.lumen import decrypt_capsule, export_capsule, load_or_create_key
from godlock.receipts import Receipt, ReceiptStore
from godlock.rules import Rule, RulesTable


class GodLockEngine:
    def __init__(
        self,
        data_dir: str | Path | None = None,
        persist: bool = True,
        rotate_interval_s: float = DEFAULT_ROTATE_INTERVAL_S,
    ) -> None:
        if data_dir is None and persist:
            data_dir = Path.cwd() / DATA_DIR_NAME
        self.data_dir = Path(data_dir) if data_dir is not None else None
        self.persist = bool(persist)
        if self.persist and self.data_dir is not None:
            self.data_dir.mkdir(parents=True, exist_ok=True)
        self.grid = MirageGrid(rotate_interval_s=rotate_interval_s)
        self.airlock = Airlock(self.grid)
        self.receipts = ReceiptStore(data_dir=self.data_dir, persist=self.persist)
        self.rules = RulesTable(data_dir=self.data_dir, persist=self.persist)
        self._analyses: dict[str, dict[str, Any]] = {}
        # Capsule index: ids + hashes only. Never plaintext from disk.
        self._capsules: list[dict[str, str]] = []
        self.lumen_key = load_or_create_key(self.data_dir if self.persist else None)
        self._load_side_state()

    def _analyses_path(self) -> Path | None:
        if self.data_dir is None:
            return None
        return self.data_dir / "analyses.json"

    def _capsule_index_path(self) -> Path | None:
        if self.data_dir is None:
            return None
        return self.data_dir / "capsule_index.json"

    def _load_side_state(self) -> None:
        ap = self._analyses_path()
        if self.persist and ap is not None and ap.is_file():
            self._analyses = json.loads(ap.read_text(encoding="utf-8"))
        cp = self._capsule_index_path()
        if self.persist and cp is not None and cp.is_file():
            self._capsules = json.loads(cp.read_text(encoding="utf-8"))

    def _save_analyses(self) -> None:
        ap = self._analyses_path()
        if not self.persist or ap is None:
            return
        ap.write_text(json.dumps(self._analyses, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    def _save_capsule_index(self) -> None:
        cp = self._capsule_index_path()
        if not self.persist or cp is None:
            return
        cp.write_text(json.dumps(self._capsules, indent=2) + "\n", encoding="utf-8")

    @property
    def counter(self) -> int:
        return self.receipts.counter

    def score(self, text: str) -> dict[str, Any]:
        return score_engagement(text, extra_keywords=self.rules.extra_keywords())

    def submit(self, text: str) -> dict[str, Any]:
        if not (text or "").strip():
            raise ValueError("text is required")
        pair = self.airlock.open()
        receipt = Receipt.mint(text.strip(), pair)
        self.receipts.append(receipt)
        analysis = jeeves_analyze(receipt, extra_keywords=self.rules.extra_keywords())
        self._analyses[receipt.id] = analysis
        self._save_analyses()
        engagement = self.score(receipt.text)
        return {
            "receipt": receipt.as_dict(),
            "jeeves_analysis": analysis,
            "engagement": engagement,
            "counter": self.counter,
        }

    def merge(self, receipt_id: str, hardening: str) -> Rule:
        # Confirm the receipt exists (admin merge is tied to a logged stress test).
        self.receipts.get(receipt_id)
        if not (hardening or "").strip():
            analysis = self._analyses.get(receipt_id) or {}
            hardening = analysis.get("suggested_hardening") or ""
        if not hardening:
            raise ValueError("hardening text is required")
        return self.rules.merge(receipt_id, hardening)

    def analysis_for(self, receipt_id: str) -> dict[str, Any] | None:
        return self._analyses.get(receipt_id)

    def export_lumen(self, receipt_id: str, out: str | Path) -> dict[str, str]:
        receipt = self.receipts.get(receipt_id)
        analysis = self._analyses.get(receipt_id) or jeeves_analyze(receipt, extra_keywords=self.rules.extra_keywords())
        payload = {
            "receipt": receipt.as_dict(),
            "jeeves_analysis": analysis,
            "engagement": self.score(receipt.text),
        }
        info = export_capsule(payload, Path(out), self.lumen_key)
        record = {
            "capsule_id": info["capsule_id"],
            "sha256": info["sha256"],
            "receipt_id": receipt_id,
            "path": info["path"],
        }
        self._capsules.append(record)
        self._save_capsule_index()
        # One-way: do not return plaintext. Index is ids + hashes.
        return record

    def capsule_index(self) -> list[dict[str, str]]:
        # Strip path if we want to be stricter; keep path for the local operator.
        return [
            {"capsule_id": c["capsule_id"], "sha256": c["sha256"], "receipt_id": c["receipt_id"]}
            for c in self._capsules
        ]

    def resilience_score(self) -> float:
        """Mean ABAD engagement of logged receipts. Engineering default, not a proof."""
        recs = self.receipts.all()
        if not recs:
            return 0.0
        total = sum(self.score(r.text)["score"] for r in recs)
        return round(total / len(recs), 4)

    def stats(self) -> dict[str, Any]:
        recs = self.receipts.all()
        return {
            "counter": self.counter,
            "resilience_score": self.resilience_score(),
            "rules": len(self.rules),
            "capsules": len(self._capsules),
            "grid_nodes": self.grid.size,
            "grid_rotations": self.grid.rotations,
            "persist": self.persist,
            "recent_receipt_ids": [r.id for r in self.receipts.recent(20)],
            "bind_note": "core listens on 127.0.0.1; not an anonymity network",
            "receipt_count": len(recs),
        }

    def export_json(self) -> dict[str, Any]:
        """Plain JSON bundle for a kid Export button or a government study.

        Does not include the Lumen key. Receipt hashes are unchanged.
        """
        from godlock import __version__
        from godlock.config import AUTHOR, HONEST_BANNER

        return {
            "product": "godlock",
            "version": __version__,
            "author": AUTHOR,
            "banner": HONEST_BANNER,
            "stats": self.stats(),
            "receipts": [r.as_dict() for r in self.receipts.all()],
            "rules": [r.as_dict() for r in self.rules.all()],
        }

    def import_json(self, payload: Any) -> dict[str, Any]:
        """Load a JSON file of tests (submit text) or receipts (verify + keep).

        Tampered receipts FAIL and are not stored. Existing matching receipts
        are skipped. This does not rewrite hashes.
        """
        receipts_raw, texts = _parse_import(payload)
        if receipts_raw:
            loaded: list[str] = []
            skipped: list[str] = []
            failed: list[dict[str, str]] = []
            for raw in receipts_raw:
                try:
                    rec = Receipt(
                        id=str(raw["id"]),
                        timestamp=str(raw["timestamp"]),
                        ingress_node=str(raw["ingress_node"]),
                        egress_node=str(raw["egress_node"]),
                        text=str(raw["text"]),
                        hash=str(raw["hash"]),
                    )
                except (KeyError, TypeError) as exc:
                    failed.append({"error": f"bad receipt: {exc}"})
                    continue
                if not rec.verify():
                    failed.append({"id": rec.id, "error": "hash does not match — file was changed"})
                    continue
                try:
                    existing = self.receipts.get(rec.id)
                except KeyError:
                    existing = None
                if existing is not None:
                    if existing == rec:
                        skipped.append(rec.id)
                        continue
                    failed.append({"id": rec.id, "error": "same id, different data — not replaced"})
                    continue
                self.receipts.append(rec)
                loaded.append(rec.id)
            return {
                "mode": "receipts",
                "loaded": len(loaded),
                "skipped": len(skipped),
                "failed": failed,
                "ids": loaded,
            }

        submitted: list[dict[str, Any]] = []
        for text in texts:
            t = (text or "").strip()
            if not t:
                continue
            submitted.append(self.submit(t))
        if not submitted:
            raise ValueError("this JSON file has no tests")
        return {
            "mode": "texts",
            "submitted": len(submitted),
            "results": submitted,
        }


def _looks_like_receipt(item: dict[str, Any]) -> bool:
    return all(
        k in item for k in ("id", "timestamp", "ingress_node", "egress_node", "text", "hash")
    )


def _parse_import(payload: Any) -> tuple[list[dict[str, Any]], list[str]]:
    if isinstance(payload, (bytes, bytearray)):
        payload = payload.decode("utf-8")
    if isinstance(payload, str):
        payload = json.loads(payload)
    receipts: list[dict[str, Any]] = []
    texts: list[str] = []
    if isinstance(payload, list):
        for item in payload:
            if isinstance(item, str):
                texts.append(item)
            elif isinstance(item, dict):
                if _looks_like_receipt(item):
                    receipts.append(item)
                elif "text" in item:
                    texts.append(str(item["text"]))
        return receipts, texts
    if not isinstance(payload, dict):
        raise ValueError("JSON must be an object or a list")
    if isinstance(payload.get("receipts"), list):
        receipts.extend(r for r in payload["receipts"] if isinstance(r, dict))
    rec_one = payload.get("receipt")
    if isinstance(rec_one, dict) and _looks_like_receipt(rec_one):
        receipts.append(rec_one)
    if isinstance(payload.get("text"), str):
        texts.append(payload["text"])
    if isinstance(payload.get("texts"), list):
        texts.extend(str(t) for t in payload["texts"])
    if isinstance(payload.get("tests"), list):
        for t in payload["tests"]:
            if isinstance(t, str):
                texts.append(t)
            elif isinstance(t, dict) and "text" in t:
                texts.append(str(t["text"]))
    return receipts, texts


def decrypt_exported_capsule(path: str | Path, key: bytes) -> dict[str, Any]:
    """Test/operator helper. Not served by the HTTP API."""
    return decrypt_capsule(Path(path), key)
