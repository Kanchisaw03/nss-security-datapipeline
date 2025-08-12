from __future__ import annotations

import asyncio
import os
from datetime import datetime, timedelta

from sqlalchemy import delete, select

from ..db.session import get_session
from ..models.orm import IngestRecord
from .merkle_audit import AuditLog


RETENTION_MINUTES = int(os.getenv("RETENTION_MINUTES", "60"))


async def run_once() -> None:
    cutoff = datetime.utcnow() - timedelta(minutes=RETENTION_MINUTES)
    audit = AuditLog()
    async with get_session() as session:
        stmt = select(IngestRecord).where(IngestRecord.created_at < cutoff)
        result = await session.execute(stmt)
        olds = list(result.scalars().all())
        for r in olds:
            await audit.append_event(action="logical_delete", actor_id="system", scope=r.purpose, payload={"record_id": r.id})
        await session.flush()
        if olds:
            # physical delete
            ids = [r.id for r in olds]
            await session.execute(delete(IngestRecord).where(IngestRecord.id.in_(ids)))
            for rid in ids:
                await audit.append_event(action="physical_delete", actor_id="system", scope="retention", payload={"record_id": rid})


async def main() -> None:
    interval = int(os.getenv("RETENTION_POLL_SECONDS", "60"))
    while True:
        await run_once()
        await asyncio.sleep(interval)


if __name__ == "__main__":
    asyncio.run(main())


