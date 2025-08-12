from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ConsentCreate(BaseModel):
    data_principal_id: str = Field(min_length=1)
    purpose: str = Field(min_length=1)
    scope: List[str]
    expires_at: Optional[datetime] = None


class ConsentRead(ConsentCreate):
    id: int
    active: bool


class IngestRequest(BaseModel):
    data_principal_id: str
    purpose: str
    date_of_birth: str
    guardian_consent_token: Optional[str] = None
    payload: dict


class IngestResponse(BaseModel):
    status: str
    record_id: Optional[int] = None


