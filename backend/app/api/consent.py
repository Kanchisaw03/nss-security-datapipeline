from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..core.consent_service import ConsentService
from ..models.schemas import ConsentCreate, ConsentRead

router = APIRouter(prefix="/consents", tags=["consent"])

service = ConsentService()


@router.post("", response_model=ConsentRead)
async def create_consent(payload: ConsentCreate) -> ConsentRead:
    consent = await service.create_consent(payload)
    return consent


@router.get("/{consent_id}", response_model=ConsentRead)
async def get_consent(consent_id: int) -> ConsentRead:
    consent = await service.get_consent(consent_id)
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    return consent


@router.delete("/{consent_id}")
async def delete_consent(consent_id: int) -> dict[str, str]:
    deleted = await service.withdraw_consent(consent_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Consent not found")
    return {"status": "deleted"}


