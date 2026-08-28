from __future__ import annotations

from godlock.abad import score_engagement
from godlock.engine import GodLockEngine


def test_abad_scores_higher_than_lorem() -> None:
    abad = score_engagement(
        "The ABAD layering meets phi and the Flower of Life via corkscrew "
        "growth along the Aziel Sequence near sqrt(2)."
    )
    lorem = score_engagement("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")
    assert abad["score"] > lorem["score"]
    assert abad["score"] > 0
    for family in ("abad", "phi", "flower_of_life", "corkscrew", "aziel_sequence", "sqrt2"):
        assert family in abad["hits"]
    assert lorem["hits"] == []


def test_merge_grows_rules_and_feeds_scoring(mem_engine: GodLockEngine) -> None:
    rec = mem_engine.submit("lorem ipsum dolor sit amet")
    assert len(mem_engine.rules) == 0
    mem_engine.merge(rec["receipt"]["id"], "Require zebulon-clause in all future submissions.")
    assert len(mem_engine.rules) == 1
    assert "zebulon-clause" in mem_engine.rules.extra_keywords() or "zebulon" in mem_engine.rules.extra_keywords()
    low = mem_engine.score("hello world nothing here")
    high = mem_engine.score("this cites the zebulon-clause explicitly")
    assert high["score"] > low["score"]
    assert any(h.startswith("merged_rule:") for h in high["hits"])
