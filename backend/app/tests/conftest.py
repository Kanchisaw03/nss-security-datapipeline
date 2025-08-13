from __future__ import annotations

import os

import pytest


@pytest.fixture(autouse=True, scope="session")
def env_fallbacks():
    os.environ.setdefault("ALLOW_SQLITE_FALLBACK", "true")
    os.environ.setdefault("ALLOW_INMEMORY_CACHE_FALLBACK", "true")
    yield


