"""GitHub-side SEO / crawl-aid alignment. Does not touch Worker HTML."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
README = (ROOT / "README.md").read_text(encoding="utf-8")
SKILL = (ROOT / "SKILL.md").read_text(encoding="utf-8")
LLMS = (ROOT / "docs" / "llms.txt").read_text(encoding="utf-8")
AI = (ROOT / "docs" / "ai.txt").read_text(encoding="utf-8")
CITE = json.loads((ROOT / "docs" / "cite.json").read_text(encoding="utf-8"))
CFF = (ROOT / "CITATION.cff").read_text(encoding="utf-8")
PYPROJECT = (ROOT / "pyproject.toml").read_text(encoding="utf-8")

FORBIDDEN_COMPLETENESS = (
    "same completeness as the Digital Library",
    "matching Digital Library Software completeness",
    "full live aziel-runtime suite",
)

REQUIRED_IDS = (
    "https://www.azieleliab.com/#aziel",
    "https://www.azieleliab.com/runtime#runtime",
)

REQUIRED_LINKS = (
    "https://www.azieleliab.com/",
    "https://www.azielcorpuslibrary.net/",
    "https://godlock.uk",
    "https://github.com/AzielEliab/aziel-runtime",
    "https://aziel-runtime.vibelock.workers.dev/",
    "https://github.com/AzielEliab/fraggate",
    "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime",
)

AI_CLIENTS = (
    "ChatGPT (GPT Actions / OpenAI)",
    "Grok (xAI)",
    "Venice",
    "Claude (Anthropic)",
    "Cursor (MCP)",
    "Glama (MCP)",
    "Perplexity",
    "Microsoft Copilot / Bing",
    "Google Gemini / Vertex",
    "Mistral",
    "Meta AI",
    "Apple Intelligence surfaces",
    "Amazon Q tooling",
    "DuckAssist",
    "You.com",
    "Cohere",
)


def test_readme_does_not_claim_digital_library_completeness():
    for phrase in FORBIDDEN_COMPLETENESS:
        assert phrase not in README
        assert phrase not in LLMS
        assert phrase not in AI
        assert phrase not in json.dumps(CITE)


def test_readme_godlock_first_softwares():
    assert "GodLock-first" in README
    assert "Softwares heading → list" in README or "heading → list" in README
    assert "not" in README.lower() and "Digital Library completeness" in README


def test_runtime_version_and_glama_primary():
    for text in (README, SKILL, LLMS, AI, CFF):
        assert "2.0.0-rc1" in text
        assert "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime" in text
        assert "secondary" in text.lower() or "Worker is secondary" in text or "workers.dev" in text


def test_entity_graph_and_ecosystem():
    for text in (README, SKILL, LLMS, AI, CFF):
        for needle in REQUIRED_IDS:
            assert needle in text
    for text in (README, SKILL, LLMS):
        for link in REQUIRED_LINKS:
            assert link in text


def test_identity_aziel_eliab_only():
    for text in (README, SKILL, LLMS):
        assert "Aziel Eliab only" in text
        assert "Author: Aziel Eliab" in text or "Author: Aziel Eliab only" in text or "**Author: Aziel Eliab only.**" in text


def test_full_ai_client_set():
    for text in (README, SKILL, LLMS, AI):
        for client in AI_CLIENTS:
            assert client in text
    for client in AI_CLIENTS:
        assert client in CITE["ai_clients"]


def test_cite_json_graph():
    assert CITE["author"] == "Aziel Eliab"
    assert CITE["identity"] == "Aziel Eliab"
    assert CITE["person_id"] == "https://www.azieleliab.com/#aziel"
    assert CITE["runtime_id"] == "https://www.azieleliab.com/runtime#runtime"
    assert CITE["runtime_version"] == "2.0.0-rc1"
    assert CITE["runtime_glama"] == "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime"
    assert CITE["kernel"] == "https://github.com/AzielEliab/fraggate"
    assert CITE["doi"] is None
    assert "GodLock-first" in CITE["software_note"]
    assert "Digital Library completeness" in CITE["software_note"]
    hrefs = {row["href"] for row in CITE["ecosystem"]}
    assert "https://www.azieleliab.com/" in hrefs
    assert "https://www.azielcorpuslibrary.net/" in hrefs
    assert "https://godlock.uk/" in hrefs
    assert "https://github.com/AzielEliab/aziel-runtime" in hrefs
    assert "https://aziel-runtime.vibelock.workers.dev/" in hrefs
    assert "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime" in hrefs
    assert "https://github.com/AzielEliab/fraggate" in hrefs


def test_pyproject_discovery_urls():
    assert 'Homepage = "https://godlock.uk"' in PYPROJECT
    assert "https://www.azieleliab.com/" in PYPROJECT
    assert "https://www.azielcorpuslibrary.net/" in PYPROJECT
    assert "https://github.com/AzielEliab/aziel-runtime" in PYPROJECT
    assert "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime" in PYPROJECT
    assert "https://github.com/AzielEliab/fraggate" in PYPROJECT


def test_citation_cff_identity():
    assert "given-names: Aziel" in CFF
    assert "family-names: Eliab" in CFF
    assert "url: https://godlock.uk" in CFF
    assert "Do not invent a DOI" in CFF


def test_github_about_record():
    about = json.loads((ROOT / "docs" / "github-about.json").read_text(encoding="utf-8"))
    assert about["homepage"] == "https://godlock.uk"
    assert about["description"].startswith("GodLock.uk")
    assert "GodLock-first" in about["description"]
    assert "2.0.0-rc1" in about["description"]
    assert "Aziel Eliab" in about["description"]
    for topic in ("godlock", "aziel-eliab", "mcp", "fraggate", "aziel-runtime", "glama"):
        assert topic in about["topics"]
    assert len(about["topics"]) <= 20
