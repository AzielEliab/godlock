"""Offline fixtures. No docker, no Ollama, no network."""

from __future__ import annotations

import os
from pathlib import Path

import pytest

from godlock.engine import GodLockEngine


@pytest.fixture(autouse=True)
def _offline_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("OLLAMA_HOST", raising=False)
    monkeypatch.delenv("GODLOCK_LUMEN_KEY", raising=False)


@pytest.fixture
def data_dir(tmp_path: Path) -> Path:
    d = tmp_path / "godlock-data"
    d.mkdir()
    return d


@pytest.fixture
def engine(data_dir: Path) -> GodLockEngine:
    return GodLockEngine(data_dir=data_dir, persist=True)


@pytest.fixture
def mem_engine() -> GodLockEngine:
    return GodLockEngine(data_dir=None, persist=False)
