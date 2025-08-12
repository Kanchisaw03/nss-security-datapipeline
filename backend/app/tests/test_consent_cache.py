from __future__ import annotations

import asyncio

import pytest

from backend.app.core.consent_service import ConsentService
from backend.app.models.schemas import ConsentCreate
from backend.app.db.base import Base
from backend.app.db.session import engine


@pytest.mark.asyncio
async def test_consent_cache_flow(monkeypatch):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    svc = ConsentService()
    created = await svc.create_consent(
        ConsentCreate(data_principal_id="c1", purpose="research", scope=["email"], expires_at=None)
    )
    assert created.active is True
    assert await svc.has_valid_consent("c1", "research") is True
    assert await svc.withdraw_consent(created.id) is True
    assert await svc.has_valid_consent("c1", "research") is False


