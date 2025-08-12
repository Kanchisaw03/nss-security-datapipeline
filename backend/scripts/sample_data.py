from __future__ import annotations

import asyncio
import json

from backend.app.db.session import get_session
from backend.app.models.orm import Consent


async def main() -> None:
    async with get_session() as session:
        c = Consent(
            data_principal_id="user-123",
            purpose="research",
            scope=json.dumps(["email", "age"]),
            active=True,
        )
        session.add(c)
    print("Inserted sample consent.")


if __name__ == "__main__":
    asyncio.run(main())


