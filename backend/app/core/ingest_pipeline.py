from __future__ import annotations

import json
from typing import Tuple

from ..models.schemas import IngestRequest
from ..db.session import get_session
from ..models.orm import IngestRecord
from .consent_service import ConsentService
from .policy_engine import PolicyEngine
from .deid import Deidentifier
from .merkle_audit import AuditLog
from .age_verifier import AgeVerifier


class IngestPipeline:
    def __init__(self) -> None:
        self.consent = ConsentService()
        self.policy = PolicyEngine()
        self.deid = Deidentifier()
        self.audit = AuditLog()
        self.age = AgeVerifier()

    async def run(self, req: IngestRequest) -> Tuple[bool, str, int | None]:
        is_minor, needs_guardian = self.age.check_minor(req.date_of_birth)
        if is_minor and needs_guardian and not req.guardian_consent_token:
            return False, "Guardian consent required", None

        has_consent = await self.consent.has_valid_consent(req.data_principal_id, req.purpose)
        decision = await self.policy.allow_processing(
            data_principal_id=req.data_principal_id,
            purpose=req.purpose,
            has_consent=has_consent,
            is_minor=is_minor,
            guardian_token_present=bool(req.guardian_consent_token),
        )
        if not decision:
            return False, "Policy denied", None

        transformed = self.deid.process(req.payload)
        async with get_session() as session:
            record = IngestRecord(
                data_principal_id=req.data_principal_id,
                purpose=req.purpose,
                payload=json.dumps(transformed),
            )
            session.add(record)
            await session.flush()
            await session.refresh(record)
        await self.audit.append_event(
            action="ingest_store",
            actor_id=req.data_principal_id,
            scope=req.purpose,
            payload={"record_id": record.id},
        )
        return True, "allowed", record.id


