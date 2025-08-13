from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, List, Optional

from ..db.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.orm import AuditEvent


def _hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


class MerkleTree:
    def __init__(self) -> None:
        self.leaves: List[str] = []

    def append(self, leaf_data: Dict[str, Any]) -> int:
        leaf_hash = _hash(json.dumps(leaf_data, sort_keys=True).encode())
        self.leaves.append(leaf_hash)
        return len(self.leaves) - 1

    def root(self) -> Optional[str]:
        nodes = self.leaves[:]
        if not nodes:
            return None
        while len(nodes) > 1:
            nxt: List[str] = []
            for i in range(0, len(nodes), 2):
                left = nodes[i]
                right = nodes[i + 1] if i + 1 < len(nodes) else left
                nxt.append(_hash((left + right).encode()))
            nodes = nxt
        return nodes[0]

    def proof(self, index: int) -> List[str]:
        # Simple sibling list proof for demonstration
        proof: List[str] = []
        nodes = self.leaves[:]
        idx = index
        if idx < 0 or idx >= len(nodes):
            return []
        level = nodes
        while len(level) > 1:
            nxt: List[str] = []
            for i in range(0, len(level), 2):
                left = level[i]
                right = level[i + 1] if i + 1 < len(level) else left
                if i == idx ^ 1 or i + 1 == idx:
                    sibling = right if idx == i else left
                    proof.append(sibling)
                nxt.append(_hash((left + right).encode()))
            idx //= 2
            level = nxt
        return proof


class AuditLog:
    def __init__(self) -> None:
        self.tree = MerkleTree()

    async def append_event(
        self,
        *,
        action: str,
        actor_id: str,
        scope: str,
        payload: Dict[str, Any],
        session: Optional[AsyncSession] = None,
    ) -> int:
        event_payload = {
            "action": action,
            "actor_id": actor_id,
            "scope": scope,
            "payload": payload,
        }
        self.tree.append(event_payload)
        root = self.tree.root()
        if session is not None:
            event = AuditEvent(
                action=action,
                actor_id=actor_id,
                scope=scope,
                payload=json.dumps(payload),
                merkle_root=root,
            )
            session.add(event)
            await session.flush()
            await session.refresh(event)
            return event.id
        async with get_session() as owned_session:
            event = AuditEvent(
                action=action,
                actor_id=actor_id,
                scope=scope,
                payload=json.dumps(payload),
                merkle_root=root,
            )
            owned_session.add(event)
            await owned_session.flush()
            await owned_session.refresh(event)
            return event.id

    async def get_inclusion_proof(self, event_id: int) -> Optional[Dict[str, Any]]:
        async with get_session() as session:
            db_obj = await session.get(AuditEvent, event_id)
            if not db_obj:
                return None
            # This simplistic in-memory tree won't persist across restarts; in production persist leaves
            return {"event_id": event_id, "merkle_root": db_obj.merkle_root, "proof": []}


