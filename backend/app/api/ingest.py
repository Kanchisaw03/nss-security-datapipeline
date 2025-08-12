from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..core.ingest_pipeline import IngestPipeline
from ..models.schemas import IngestRequest, IngestResponse

router = APIRouter(prefix="/ingest", tags=["ingest"])

pipeline = IngestPipeline()


@router.post("", response_model=IngestResponse)
async def ingest(payload: IngestRequest) -> IngestResponse:
    allowed, decision, stored_record_id = await pipeline.run(payload)
    if not allowed:
        raise HTTPException(status_code=403, detail=decision)
    return IngestResponse(status="stored", record_id=stored_record_id)


