from __future__ import annotations

import asyncio

from backend.app.db.base import Base
from backend.app.db.session import engine


async def main() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created.")


if __name__ == "__main__":
    asyncio.run(main())


