#!/usr/bin/env bash
set -euo pipefail

echo "Generating keys..."
python backend/scripts/gen_keys.py >/dev/null || true

export ALLOW_SQLITE_FALLBACK=true
export ALLOW_INMEMORY_CACHE_FALLBACK=true

TOKEN=$(python -c "from backend.app.auth.security import issue_dev_token; print(issue_dev_token(role='system', sub='demo'))")
echo "Token: $TOKEN"

echo "Creating consent..."
curl -s -X POST http://localhost:8000/api/consents \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"data_principal_id":"user-123","purpose":"research","scope":["email"],"expires_at":null}' | jq .

echo "Running ingest (allowed)..."
curl -s -X POST http://localhost:8000/api/ingest \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"data_principal_id":"user-123","purpose":"research","date_of_birth":"1990-01-01","payload":{"email":"a@example.com"}}' | jq .

echo "Withdrawing consent..."
curl -s -X DELETE http://localhost:8000/api/consents/1 -H "Authorization: Bearer $TOKEN" | jq .

echo "Running ingest (blocked)..."
curl -s -X POST http://localhost:8000/api/ingest \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"data_principal_id":"user-123","purpose":"research","date_of_birth":"1990-01-01","payload":{"email":"b@example.com"}}' | jq .


