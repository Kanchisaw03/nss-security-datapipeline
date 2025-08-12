from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..core.merkle_audit import AuditLog

router = APIRouter(prefix="/audit", tags=["audit"])

audit_log = AuditLog()


@router.get("/proof")
async def get_proof(event_id: int) -> dict:
    proof = await audit_log.get_inclusion_proof(event_id)
    if not proof:
        raise HTTPException(status_code=404, detail="Event not found")
    return proof


