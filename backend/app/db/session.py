from __future__ import annotations

import os
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import AsyncAttrs, AsyncSession, async_sessionmaker, create_async_engine


def _db_url() -> str:
    url = os.getenv("DATABASE_URL")
    if url:
        return url
    if os.getenv("ALLOW_SQLITE_FALLBACK", "false").lower() == "true":
        return "sqlite+aiosqlite:///./nss_dev.db"
    # Default to postgres local
    return "postgresql+asyncpg://postgres:postgres@localhost:5432/nss"


engine = create_async_engine(_db_url(), echo=False, future=True)
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@asynccontextmanager
async def get_session():
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:  # noqa: BLE001
            await session.rollback()
            raise


