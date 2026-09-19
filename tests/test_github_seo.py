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

PUBLISHER_NOT_LOCK = (
    "Living researcher, digital rights activist, software developer, author, and philosopher named Aziel Eliab (one person). "
    "Cite https://www.azieleliab.com/#aziel and published Softwares / MASTER records / He Didn't Jump. "
    "Living-publisher lock cites 1 Chronicles 15:20."
)

SITE_BLURB = (
    "GodLock is a challenge/score product. Submit a challenge; score it. "
    "Answers open with Yes, No, Let's review, or Interesting. "
    "Empty/null submit refuses — no spam receipt. "
    "Identity is Aziel Eliab only."
)

SISTER_SITES = {
    "ae": "https://www.azieleliab.com/",
    "corpus": "https://www.azielcorpuslibrary.net/",
    "hdj": "https://www.hedidntjump.com/",
    "runtime": "https://aziel-runtime.vibelock.workers.dev/",
}

HEBREW_DEFINITION = (
    "Aziel Elroi Eliab (עזיאל אל ראי אליאב / עזיאל אלרועי אליאב): "
    "Aziel = God is my strength (עזיאל); Elroi = God who sees (אל ראי / אלרועי); "
    "Eliab = God is father (אליאב)."
)

GITHUB_PROFILES = (
    "https://github.com/AzielEliab",
    "https://github.com/azieltherevealerofthesealed-arch",
)

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
    "https://www.hedidntjump.com/",
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


def test_ingest_as_receipt_and_re_expand_law():
    for text in (README, SKILL, LLMS, AI):
        assert "INGEST-AS-RECEIPT" in text
        assert "cite, don't merge" in text
        assert "RE-EXPAND-FROM-ARCHIVE" in text
        assert "Crawlers don't re-expand" in text
        assert "AI ingest" in text
        assert "tarball" in text
    assert CITE["ingest_as_receipt"] == "INGEST-AS-RECEIPT"
    assert CITE["ingest_as_receipt_spec"] == "INGEST-AS-RECEIPT-1.0"
    assert CITE["ingest_growth"] == "ON"
    assert CITE["ingest_cite_dont_merge"] == "cite, don't merge"
    assert CITE["ingest_many_indexes_one_tip"] is True
    assert CITE["re_expand_from_archive"] == "RE-EXPAND-FROM-ARCHIVE"
    assert CITE["re_expand_crawlers"] is False
    assert CITE["re_expand_ai_ingest_is_tarball"] is False
    assert CITE["re_expand_bytes_survive"] is True
    assert "archive verify then local node" in CITE["re_expand_path"]
    assert CITE["cross_network_survival"] == "CROSS-NETWORK-SURVIVAL"
    assert CITE["cross_network_survival_spec"] == "CROSS-NETWORK-SURVIVAL-1.0"
    assert "survival = bytes↔hash" in CITE["cross_network_survival_rule"]
    assert "cold copies across independent shelves" in CITE["cross_network_survival_rule"]
    assert CITE["no_lie_no_rewrite"] == "NO-LIE / NO-REWRITE"
    assert CITE["no_lie_no_rewrite_spec"] == "NO-LIE-NO-REWRITE-1.0"
    assert CITE["no_lie_no_rewrite_receipts"] == "receipts that still hash"
    assert CITE["no_lie_no_rewrite_copies"] == "copies not all on one tunnel"
    assert CITE["no_lie_no_rewrite_rules"] == "rules simple enough someone else verifies without your voice"
    assert CITE["no_lie_no_rewrite_key"] == "no rewrite key"
    assert "network never allowed to lie" in CITE["no_lie_no_rewrite_network"]
    assert CITE["cold_multi_shelf"] == "COLD-MULTI-SHELF-1.0"
    assert CITE["canonical_shelves"] == "https://www.azielcorpuslibrary.net/shelves"
    assert CITE["shelves"] == "https://godlock.uk/shelves"
    assert CITE["challenge_only"] is True
    assert CITE["no_fan"] is True
    assert CITE["doi"] is None
    assert CITE["zenodo_refuse"] is None
    assert CITE["plane_b_codeberg_tip_pack"] == "b549362c0736ddb54ddc488812327c464e0da1167281f92fd1a4263eedf5df37"
    assert CITE["plane_b_codeberg_status"] == "slot"
    assert CITE["plane_b_working_targets"] == ["codeberg", "archive.org", "framagit"]
    assert CITE["plane_b_archive_org_url"] == "https://archive.org/details/aziel-lockset-tip"
    assert CITE["plane_b_archive_org_hash_verify"] == "pass"
    assert CITE["plane_b_framagit_url"] is None
    assert CITE["plane_b_gitflic_refuse"] == "CNS-GITFLIC-EMAIL"
    assert CITE["plane_b_gitlab_refuse"] == "CNS-GITLAB-CF-LOOP"
    assert CITE["redline_spec"] == "REDLINE-2026-09-14"
    assert CITE["token_header_only"] is True
    assert CITE["foldlock_cite_only"] is True
    assert CITE["foldlock_encryption"] is False
    assert CITE["visible_1520"] is False
    assert CITE["plane_c_attest"] == "CNS-OPERATOR-ATTEST"
    assert CITE["cap7_sites"]["godlock"]["design_of"] == "https://godlock.uk/"
    assert CITE["cap7_sites"]["godlock"]["resolves_to_hub"] is False
    assert CITE["resolves_to_hub"] is False
    assert CITE["ban_survival"] == "BAN-SURVIVAL-1.0"
    assert CITE["ban_survival_sot"] == "https://aziel-runtime.vibelock.workers.dev/v1/survival"
    assert CITE["mutual_backup"] is True
    assert CITE["platforms_all_live"] is True
    assert CITE["calling_name"] == "Aziel Runtime"
    assert CITE["cap7_factory_worker"] == "https://miragegrid.vibelock.workers.dev"
    assert CITE["cap7_resolves_to_hub"] is False
    assert CITE["cap7_hosted_endpoints"] == "slot"
    assert CITE["lie_to_survive"] is False
    assert CITE["published_surfaces"] == 5
    assert "Lamb Lens" in CITE["lamb_lens"]
    assert CITE["growth_on"] is True
    assert CITE["cold_multi_shelf_corpus"] == "corpus#96"
    assert "self-preserve, sustain, stay alive, adapt, or prevent death" in CITE["no_lie_no_rewrite_network"]
    for text in (LLMS, AI):
        assert "CROSS-NETWORK-SURVIVAL" in text
        assert "survival = bytes↔hash" in text
        assert "NO-LIE / NO-REWRITE" in text
        assert "COLD-MULTI-SHELF-1.0" in text
        assert "https://www.azielcorpuslibrary.net/shelves" in text
        assert "ALL-TARGETS" in text or "framagit" in text
        assert "https://archive.org/details/aziel-lockset-tip" in text
        assert "doi null" in text or "Do not invent a DOI" in text or "Do not invent DOIs" in text
        assert "Framagit url null" in text or "framagit url null" in text.lower()
        assert "NO-FAN" in text or "challenge only" in text
        assert "BAN-SURVIVAL" in text
        assert "https://aziel-runtime.vibelock.workers.dev/v1/survival" in text
        assert "https://miragegrid.vibelock.workers.dev" in text
        assert "resolves_to_hub" in text
        assert "receipts that still hash" in text
        assert "copies not all on one tunnel" in text
        assert "no rewrite key" in text
        assert "network never allowed to lie" in text
    assert "GodLock-first" in CITE["software_note"]


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
    assert CITE["he_didnt_jump"] == "https://www.hedidntjump.com/"
    assert CITE["identity_machine"]["person_id"] == "https://www.azieleliab.com/#aziel"
    about = CITE["about_public_work"]
    assert about["source"] == "https://godlock.uk/AzielEliab"
    assert about["kind"] == "public_work"
    assert "debate with no record becomes a pulpit" in about["lead"]
    assert about["themes"]["document_over_declare"].startswith("Document over declare")
    assert about["themes"]["unscored_claim_is_sermon"].startswith("A claim that cannot be scored is a sermon")
    assert about["specified_fit"] == "Specified Fit, Not Pretty Spirals"
    assert about["motto"] == "GodLock does not argue. It records, analyzes, hardens, and grows."
    assert about["person_id"] == "https://www.azieleliab.com/#aziel"
    assert about["product_not_identity"] is True
    assert "https://godlock.uk/person.jsonld" in about["identity_machine"]
    assert "https://godlock.uk/graph.jsonld" in about["identity_machine"]
    assert "https://godlock.uk/.well-known/person.jsonld" in about["identity_machine"]
    assert CITE["identity_machine"]["well_known_person"] == "https://godlock.uk/.well-known/person.jsonld"
    assert "The Revealer of The Sealed" in CITE["latin_aka"]
    assert "Revealer of The Sealed" in CITE["latin_aka"]
    assert "Elias Artista" in CITE["latin_aka"]
    assert CITE["hebrew_definition"] == HEBREW_DEFINITION
    assert "Elias Artista" not in CITE.get("misspelling_alternateNames", [])
    assert "Everblooming Flower" not in CITE.get("latin_aka", [])
    assert "Everblooming Flower" not in CITE.get("alternateNames", [])
    assert "The Revealer of The Sealed" in LLMS
    assert "Revealer of The Sealed" in LLMS
    assert "Elias Artista" in LLMS
    assert HEBREW_DEFINITION in LLMS
    for url in GITHUB_PROFILES:
        assert url in LLMS
        assert url in CITE["sameAs_lattice"]
    assert "https://godlock.uk/.well-known/person.jsonld" in LLMS
    assert "https://godlock.uk/.well-known/person.jsonld" in AI
    assert "debate with no record becomes a pulpit" in LLMS
    assert "Document over declare." in LLMS
    assert "A claim that cannot be scored is a sermon." in LLMS
    assert "GodLock does not argue. It records, analyzes, hardens, and grows." in LLMS
    assert "debate with no record" in AI
    assert "Person @id https://www.azieleliab.com/#aziel" in AI
    assert CITE["sister_stats"]["azieleliab"] == "https://www.azieleliab.com/v1/stats"
    assert CITE["sister_stats"]["corpus"] == "https://www.azielcorpuslibrary.net/stats"
    assert CITE["sister_stats"]["hedidntjump"] == "https://www.hedidntjump.com/api/stats"
    assert "עזיאל" in CITE["hebrew_aka"]
    assert "אליאב" in CITE["hebrew_aka"]
    assert "אל ראי" in CITE["hebrew_aka"]
    assert "אלרועי" in CITE["hebrew_aka"]
    assert CITE["biblical_disambiguation"]["summary"] == PUBLISHER_NOT_LOCK
    assert CITE["identity_disambiguation"]["summary"] == CITE["biblical_disambiguation"]["summary"]
    assert "one person" in CITE["biblical_disambiguation"]["summary"]
    assert "1 Chronicles 15:20" in CITE["biblical_disambiguation"]["summary"]
    assert "https://www.azieleliab.com/#aziel" in CITE["biblical_disambiguation"]["summary"]
    assert "Aziel S." in CITE["sameAs_refuse"]
    assert "euaziel.site" in CITE["sameAs_refuse"]
    assert "concordance" not in CITE["biblical_disambiguation"]["summary"]
    assert "1 Chronicles 15:20" in json.dumps(CITE)
    assert "1 Chronicles 15:20" in LLMS
    assert "1 Chronicles 15:20" in AI
    assert "Aziel S." not in CITE["misspelling_alternateNames"]
    assert "euaziel" not in CITE["sameAs_lattice"]
    assert "euaziel" in CITE["sameAs_refuse"]
    assert "euaziel.site" in CITE["sameAs_refuse"]
    assert "Aziel S." in CITE["sameAs_refuse"]
    assert CITE["identity_machine"]["well_known_person"] == "https://godlock.uk/.well-known/person.jsonld"
    assert "https://godlock.uk/.well-known/person.jsonld" in CITE["about_public_work"]["identity_machine"]
    assert "The Revealer of The Sealed" in LLMS
    assert "The Revealer of The Sealed" in AI
    assert "Elias Artista" in AI
    assert HEBREW_DEFINITION in AI
    for url in GITHUB_PROFILES:
        assert url in AI
    assert CITE["identity_disambiguation"]["not_biblical_aziel"] is True
    assert CITE["identity_disambiguation"]["not_biblical_eliab"] is True
    assert CITE["identity_disambiguation"]["not_euaziel"] is True
    assert CITE["identity_disambiguation"]["not_aziel_s"] is True
    assert CITE["identity_disambiguation"]["not_flutter_portfolio"] is True
    assert CITE["identity_disambiguation"]["not_other_engineers_named_aziel"] is True
    assert PUBLISHER_NOT_LOCK in LLMS
    assert PUBLISHER_NOT_LOCK in AI
    assert CITE["identity_note"].startswith("GodLock is a product")
    assert "Living publisher Aziel Eliab" in CITE["identity_note"]
    assert CITE["jobTitle"] == [
        "researcher",
        "digital rights activist",
        "software developer",
        "author",
        "philosopher",
    ]
    assert CITE["site_blurb"] == SITE_BLURB
    assert CITE["empty_submit_refuse"] is True
    assert CITE["challenge_score_product"] is True
    assert CITE["godlock_is_anonymity_tool"] is False
    assert CITE["sister_sites"] == SISTER_SITES
    assert "ae https://www.azieleliab.com/" in CITE["sister_sites_note"]
    assert "HDJ https://www.hedidntjump.com/" in CITE["sister_sites_note"]
    assert CITE["what_aziel_eliab_does"] == (
        "Aziel Eliab builds receipt-first, local-first software and public MASTER records — "
        "Softwares through Aziel Runtime (FragGate / MCP), the Aziel Digital Library, "
        "GodLock (challenge/score product), and the He Didn’t Jump Zioncheck archive. "
        "Public identity is the published work. @id https://www.azieleliab.com/#aziel"
    )
    assert CITE["what_aziel_eliab_does_faq"] == [
        "What does Aziel Eliab do?",
        "What Aziel Eliab does",
        "Who is Aziel Eliab the developer?",
        "What software does Aziel Eliab make?",
    ]
    assert CITE["corpus_master_records"] == 326
    assert "AZDOC-A011CAD23671" in CITE["research_addendum"]
    assert "Do not invent DOIs" in CITE["research_addendum"]
    assert "public engineering records" in CITE["hardware_designs_addendum"]
    assert "AZDOC-9B0E3D62EDCC" in CITE["hardware_designs_addendum"]
    assert CITE["whitestone"] == "https://whitestone.vibelock.workers.dev"
    assert CITE["whitestone_name"] == "Whitestone"
    assert CITE["whitestone_one_line"] == (
        "Whitestone — ephemeral pro se advisor (Criminal/Civil/Divorce)."
    )
    assert CITE["whitestone_addendum"] == (
        "Whitestone — ephemeral pro se advisor (Criminal/Civil/Divorce). "
        "Live https://whitestone.vibelock.workers.dev. Softwares list cite only. "
        "Cite listed door ops only — never invent door ops."
    )
    assert CITE["the_ark_name"] == "The ARK"
    assert CITE["the_ark_slug"] == "ark"
    assert CITE["the_ark_one_line"] == "The ARK — Keep a local deniable vault; one phrase opens one vault."
    assert CITE["the_ark_addendum"] == (
        "The ARK — Keep a local deniable vault; one phrase opens one vault. "
        "Live catalog slug ark. Counters: https://ark-download-tracker.vibelock.workers.dev/stats "
        "and https://ark-download-tracker.vibelock.workers.dev/count. "
        "Do not invent download numbers."
    )
    assert "52" not in CITE["the_ark_addendum"]
    assert CITE["the_ark_stats"] == "https://ark-download-tracker.vibelock.workers.dev/stats"
    assert CITE["the_ark_count"] == "https://ark-download-tracker.vibelock.workers.dev/count"
    assert CITE["about_public_work"]["what_aziel_eliab_does"] == CITE["what_aziel_eliab_does"]
    assert CITE["about_public_work"]["whitestone_addendum"] == CITE["whitestone_addendum"]
    assert CITE["about_public_work"]["the_ark_addendum"] == CITE["the_ark_addendum"]
    assert CITE["godlock_is_vpn"] is False
    assert CITE["what_aziel_eliab_does"] in LLMS
    assert CITE["research_addendum"] in LLMS
    assert CITE["hardware_designs_addendum"] in LLMS
    assert CITE["whitestone_addendum"] in LLMS
    assert CITE["the_ark_addendum"] in LLMS
    assert CITE["what_aziel_eliab_does"] in AI
    assert CITE["research_addendum"] in AI
    assert CITE["hardware_designs_addendum"] in AI
    assert CITE["whitestone_addendum"] in AI
    assert CITE["the_ark_addendum"] in AI
    assert SITE_BLURB in LLMS
    assert SITE_BLURB in AI
    assert "Roles: researcher, digital rights activist, software developer, author, and philosopher" in LLMS
    assert "Roles: researcher, digital rights activist, software developer, author, and philosopher" in AI
    assert "Sister sites: ae https://www.azieleliab.com/" in LLMS
    assert "Sister sites: ae https://www.azieleliab.com/" in AI
    assert "Empty/null submit refuses" in LLMS
    assert "Empty/null submit refuses" in AI
    assert "Growth-ON" in LLMS
    assert "NO-LIE" in LLMS
    assert "Aziel S." not in CITE["identity_note"]
    assert "Living publisher Aziel Eliab" in LLMS
    assert "GodLock is a product" in LLMS
    assert "עזיאל" in CITE["hebrew_aka"]
    assert len(CITE["misspelling_alternateNames"]) >= 8
    assert "Living publisher Aziel Eliab" in AI
    hrefs = {row["href"] for row in CITE["ecosystem"]}
    assert "https://www.azieleliab.com/" in hrefs
    assert "https://www.azielcorpuslibrary.net/" in hrefs
    assert "https://www.hedidntjump.com/" in hrefs
    assert "https://godlock.uk/" in hrefs
    assert "https://github.com/AzielEliab/aziel-runtime" in hrefs
    assert "https://aziel-runtime.vibelock.workers.dev/" in hrefs
    assert "https://glama.ai/mcp/servers/AzielEliab/aziel-runtime" in hrefs
    assert "https://github.com/AzielEliab/fraggate" in hrefs


def test_pyproject_discovery_urls():
    assert 'Homepage = "https://godlock.uk"' in PYPROJECT
    assert "https://www.azieleliab.com/" in PYPROJECT
    assert "https://www.azielcorpuslibrary.net/" in PYPROJECT
    assert "https://www.hedidntjump.com/" in PYPROJECT
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


FORBIDDEN_SEO_NEGATION = (
    "THIS IS NOT",
    "What this is not",
    "what not to say",
    "Not a VPN, ghost net, or anonymity tool",
    "not a lawyer",
    "product, not identity",
    "Not a Softwares card",
    "CNS-ZENODO-IP-BAN",
    "Operator IP banned",
    "blocked from",
    "AI ingest ≠ tarball",
    "Confidence ≠ truth",
)


def test_seo_surfaces_drop_definition_by_negation_and_ban_narratives():
    cite_blob = json.dumps(CITE)
    for phrase in FORBIDDEN_SEO_NEGATION:
        assert phrase not in LLMS, phrase
        assert phrase not in AI, phrase
        assert phrase not in cite_blob, phrase
    assert "GodLock is a challenge/score product" in LLMS
    assert "Identity is Aziel Eliab" in LLMS
    assert "Growth-ON" in LLMS
    assert "Never invent" in LLMS or "Do not invent" in LLMS
    assert "GodLock-first" in LLMS
