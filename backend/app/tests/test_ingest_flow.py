from __future__ import annotations


import pytest
from httpx import AsyncClient

from backend.app.main import app
from backend.app.auth.security import issue_dev_token
from backend.app.db.base import Base
from backend.app.db.session import engine


@pytest.mark.asyncio
async def test_ingest_allowed(tmp_path, monkeypatch):
    # Ensure fresh DB
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    token = issue_dev_token("system", "test")

    # Create consent
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post(
            "/api/consents",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "data_principal_id": "user-abc",
                "purpose": "research",
                "scope": ["email"],
                "expires_at": None,
            },
        )
        assert resp.status_code == 200
        # Ingest
        resp2 = await ac.post(
            "/api/ingest",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "data_principal_id": "user-abc",
                "purpose": "research",
                "date_of_birth": "1990-01-01",
                "payload": {"email": "x@example.com"},
            },
        )
        assert resp2.status_code == 200
        body = resp2.json()
        assert body["status"] == "stored"
        assert body["record_id"] is not None


@pytest.mark.asyncio
async def test_ingest_blocked_without_consent(monkeypatch):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    token = issue_dev_token("system", "test")
    async with AsyncClient(app=app, base_url="http://test") as ac:
        resp = await ac.post(
            "/api/ingest",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "data_principal_id": "user-no-consent",
                "purpose": "research",
                "date_of_birth": "1990-01-01",
                "payload": {"email": "y@example.com"},
            },
        )
        assert resp.status_code == 403


