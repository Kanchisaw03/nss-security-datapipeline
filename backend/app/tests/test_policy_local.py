from __future__ import annotations

import pytest

from backend.app.core.policy_engine import PolicyEngine


@pytest.mark.asyncio
async def test_policy_denies_without_consent():
    engine = PolicyEngine()
    allowed = await engine.allow_processing(
        data_principal_id="u",
        purpose="p",
        has_consent=False,
        is_minor=False,
        guardian_token_present=False,
    )
    assert allowed is False


@pytest.mark.asyncio
async def test_policy_denies_minor_without_guardian():
    engine = PolicyEngine()
    allowed = await engine.allow_processing(
        data_principal_id="u",
        purpose="p",
        has_consent=True,
        is_minor=True,
        guardian_token_present=False,
    )
    assert allowed is False


@pytest.mark.asyncio
async def test_policy_allows_adult_with_consent():
    engine = PolicyEngine()
    allowed = await engine.allow_processing(
        data_principal_id="u",
        purpose="p",
        has_consent=True,
        is_minor=False,
        guardian_token_present=False,
    )
    assert allowed is True


