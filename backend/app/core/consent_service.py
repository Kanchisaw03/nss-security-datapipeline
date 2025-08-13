from __future__ import annotations

import asyncio
import json
import os
from typing import Optional, List

import redis.asyncio as aioredis

from ..db.session import get_session
from ..models.orm import Consent
from ..models.schemas import ConsentCreate, ConsentRead, ConsentUpdate
from .merkle_audit import AuditLog


class ConsentCache:
    def __init__(self) -> None:
        url = os.getenv("REDIS_URL")
        self.allow_fallback = os.getenv("ALLOW_INMEMORY_CACHE_FALLBACK", "false").lower() == "true"
        self.memory_cache: dict[str, str] = {}
        self.redis: Optional[aioredis.Redis] = None
        if url:
            try:
                self.redis = aioredis.from_url(url, decode_responses=True)
            except Exception:  # noqa: BLE001
                self.redis = None

    async def get(self, key: str) -> Optional[str]:
        if self.redis is not None:
            try:
                return await self.redis.get(key)
            except Exception:  # noqa: BLE001
                pass
        if self.allow_fallback:
            return self.memory_cache.get(key)
        return None

    async def set(self, key: str, value: str, ttl_seconds: int = 300) -> None:
        if self.redis is not None:
            try:
                await self.redis.set(key, value, ex=ttl_seconds)
                return
            except Exception:  # noqa: BLE001
                pass
        if self.allow_fallback:
            self.memory_cache[key] = value

    async def delete(self, key: str) -> None:
        if self.redis is not None:
            try:
                await self.redis.delete(key)
                return
            except Exception:  # noqa: BLE001
                pass
        if self.allow_fallback:
            self.memory_cache.pop(key, None)


class ConsentService:
    def __init__(self) -> None:
        self.cache = ConsentCache()
        self.audit = AuditLog()

    @staticmethod
    def _cache_key(data_principal_id: str, purpose: str) -> str:
        return f"consent:{data_principal_id}:{purpose}"

    async def create_consent(self, payload: ConsentCreate) -> ConsentRead:
        async with get_session() as session:
            consent = Consent(
                data_principal_id=payload.data_principal_id,
                purpose=payload.purpose,
                scope=json.dumps(payload.scope),
                expires_at=payload.expires_at,
                active=True,
            )
            session.add(consent)
            await session.flush()
            await session.refresh(consent)
            await self.audit.append_event(
                action="consent_create",
                actor_id="system",
                scope=payload.purpose,
                payload={"consent_id": consent.id},
                session=session,
            )
            await self.cache.set(
                self._cache_key(payload.data_principal_id, payload.purpose),
                json.dumps({"active": True, "scope": payload.scope}),
            )
            return ConsentRead(
                id=consent.id,
                data_principal_id=consent.data_principal_id,
                purpose=consent.purpose,
                scope=json.loads(consent.scope),
                expires_at=consent.expires_at,
                active=consent.active,
            )

    async def get_consent(self, consent_id: int) -> Optional[ConsentRead]:
        async with get_session() as session:
            db_obj = await session.get(Consent, consent_id)
            if not db_obj:
                return None
            return ConsentRead(
                id=db_obj.id,
                data_principal_id=db_obj.data_principal_id,
                purpose=db_obj.purpose,
                scope=json.loads(db_obj.scope),
                expires_at=db_obj.expires_at,
                active=db_obj.active,
            )

    async def list_consents(self, *, data_principal_id: Optional[str], purpose: Optional[str]) -> List[ConsentRead]:
        async with get_session() as session:
            from sqlalchemy import select

            stmt = select(Consent)
            if data_principal_id:
                stmt = stmt.where(Consent.data_principal_id == data_principal_id)
            if purpose:
                stmt = stmt.where(Consent.purpose == purpose)
            result = await session.execute(stmt)
            consents = result.scalars().all()
            return [
                ConsentRead(
                    id=c.id,
                    data_principal_id=c.data_principal_id,
                    purpose=c.purpose,
                    scope=json.loads(c.scope),
                    expires_at=c.expires_at,
                    active=c.active,
                )
                for c in consents
            ]

    async def update_consent(self, consent_id: int, payload: ConsentUpdate) -> Optional[ConsentRead]:
        async with get_session() as session:
            db_obj = await session.get(Consent, consent_id)
            if not db_obj:
                return None
            if payload.purpose is not None:
                db_obj.purpose = payload.purpose
            if payload.scope is not None:
                db_obj.scope = json.dumps(payload.scope)
            if payload.expires_at is not None:
                db_obj.expires_at = payload.expires_at
            if payload.active is not None:
                db_obj.active = payload.active
            await session.flush()
            await self.audit.append_event(
                action="consent_update",
                actor_id="system",
                scope=db_obj.purpose,
                payload={"consent_id": db_obj.id},
                session=session,
            )
            return ConsentRead(
                id=db_obj.id,
                data_principal_id=db_obj.data_principal_id,
                purpose=db_obj.purpose,
                scope=json.loads(db_obj.scope),
                expires_at=db_obj.expires_at,
                active=db_obj.active,
            )
    async def withdraw_consent(self, consent_id: int) -> bool:
        async with get_session() as session:
            db_obj = await session.get(Consent, consent_id)
            if not db_obj:
                return False
            db_obj.active = False
            await session.flush()
            await self.audit.append_event(
                action="consent_withdraw",
                actor_id="system",
                scope=db_obj.purpose,
                payload={"consent_id": db_obj.id},
                session=session,
            )
            await self.cache.delete(self._cache_key(db_obj.data_principal_id, db_obj.purpose))
            return True

    async def has_valid_consent(self, data_principal_id: str, purpose: str) -> bool:
        key = self._cache_key(data_principal_id, purpose)
        cached = await self.cache.get(key)
        if cached:
            try:
                info = json.loads(cached)
                return bool(info.get("active"))
            except Exception:  # noqa: BLE001
                return False
        # fallback to DB
        async with get_session() as session:
            from sqlalchemy import select

            stmt = (
                select(Consent)
                .where(Consent.data_principal_id == data_principal_id)
                .where(Consent.purpose == purpose)
                .where(Consent.active.is_(True))
            )
            result = await session.execute(stmt)
            consent: Optional[Consent] = result.scalars().first()
            if consent:
                await self.cache.set(key, json.dumps({"active": True, "scope": json.loads(consent.scope)}))
                return True
            return False


