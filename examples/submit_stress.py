#!/usr/bin/env python3
"""Submit a synthetic ABAD-aware stress test through the GodLock engine.

Writes artifacts under examples/_out/. Offline. No Ollama.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from godlock.engine import GodLockEngine
from godlock.lumen import decrypt_capsule


def main() -> int:
    out = Path(__file__).resolve().parent / "_out"
    out.mkdir(exist_ok=True)
    data = out / "data"
    engine = GodLockEngine(data_dir=data, persist=True)

    text = (
        "Counter-argument: the Aziel Sequence does not converge on phi, "
        "sqrt(2) is unrelated to the Flower of Life, and corkscrew growth "
        "cannot layer A-B-A-D."
    )
    result = engine.submit(text)
    receipt_path = out / "receipt.json"
    receipt_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"wrote {receipt_path}")
    print(f"receipt {result['receipt']['id']}")
    print(f"ingress {result['receipt']['ingress_node']} -> egress {result['receipt']['egress_node']}")
    print(f"counter {result['counter']}")
    print(f"jeeves: {result['jeeves_analysis']['suggested_hardening']}")

    rule = engine.merge(
        result["receipt"]["id"],
        result["jeeves_analysis"]["suggested_hardening"],
    )
    print(f"merged rule {rule.id} keywords={list(rule.keywords)}")

    capsule = out / "stress.capsule"
    info = engine.export_lumen(result["receipt"]["id"], capsule)
    print(f"capsule {info['capsule_id']} sha256={info['sha256']}")
    opened = decrypt_capsule(capsule, engine.lumen_key)
    assert opened["receipt"]["id"] == result["receipt"]["id"]
    print("lumen roundtrip ok")
    print(json.dumps(engine.stats(), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
