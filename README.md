## NSS Secure Data Platform — DPDPA-compliant (Prototype)

This repository is a production-ready prototype of the "NSS Secure Data Platform" with DPDPA-aligned controls. It is designed to run locally without Docker and to be demoable by a hackathon team while remaining auditable for reviewers.

### What’s included

- FastAPI backend (Python 3.11+)
- PostgreSQL for primary storage (with optional dev fallback)
- Redis cache for low-latency consent checks (with optional in-memory fallback)
- Event-driven invalidation via Redis pub/sub (or in-process fallback)
- Policy engine integration (OPA optional; Python fallback provided)
- Merkle-based append-only audit log with inclusion proofs
- JWT auth (RS256) + RBAC
- Minimal Rights Portal UI stub
- Scripts for DB init, key generation, running OPA
- GitHub Actions CI (lint, type check, tests)
- Unit and integration tests

### High-level components

- Consent Service (CRUD + cache + audit + sync adapter stub)
- Ingest Pipeline (age verification → consent check → policy enforcement → de-identification → storage)
- Policy Engine (OPA Rego policies with Python fallback)
- Audit Store (append-only Merkle tree)
- Rights Manager (APIs stub + orchestration)
- Breach Notifier (service skeleton; full implementation added in subsequent steps)
- Retention Manager (scheduler skeleton)

### Quick start (Windows/macOS/Linux)

Prereqs:

- Python 3.11+
- PostgreSQL 14+
- Redis 6+
- Optional: OPA binary for policy evaluation

If you don’t have PostgreSQL or Redis available, the app can start with dev fallbacks by setting environment variables below. PostgreSQL is preferred for all demos and tests.

#### 1) Clone and set up environment

```bash
git clone <your-fork-or-local-path> nss-secure-data-platform
cd nss-secure-data-platform
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
cp .env.example .env
```

#### 2) Generate JWT keys (dev only)

```bash
python backend/scripts/gen_keys.py
```

#### 3) Configure database and cache

Edit `.env` to set:

- `DATABASE_URL` (e.g., `postgresql+asyncpg://postgres:postgres@localhost:5432/nss`)
- `REDIS_URL` (e.g., `redis://localhost:6379/0`)

Dev fallbacks (not for production):

- `ALLOW_SQLITE_FALLBACK=true` to use a local SQLite file if PostgreSQL is unavailable
- `ALLOW_INMEMORY_CACHE_FALLBACK=true` to use in-memory cache if Redis is unavailable

#### 4) Initialize schema and sample data

```bash
python backend/scripts/create_tables.py
python backend/scripts/sample_data.py
```

#### 5) Run the app

```bash
make run
# or
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Open `http://localhost:8000/docs` for API docs.

### Demo flow (end-to-end)

Assuming `.env` defaults and keys generated. Get a system token for demo:

```bash
python -c "from backend.app.auth.security import issue_dev_token; print(issue_dev_token(role='system', sub='demo-system'))"
```

Export it as `TOKEN`:

```bash
export TOKEN=eyJ...  # paste output
```

1. Create consent

```bash
curl -X POST http://localhost:8000/api/consents \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "data_principal_id": "user-123",
    "purpose": "research",
    "scope": ["email", "age"],
    "expires_at": null
  }'
```

2. Ingest allowed (adult)

```bash
curl -X POST http://localhost:8000/api/ingest \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "data_principal_id": "user-123",
    "date_of_birth": "1990-01-01",
    "purpose": "research",
    "payload": {"email": "a@example.com", "age": 34, "ssn": "123-45-6789"}
  }'
```

3. Withdraw consent → subsequent ingest blocked

```bash
curl -X DELETE http://localhost:8000/api/consents/1 \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:8000/api/ingest \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "data_principal_id": "user-123",
    "date_of_birth": "1990-01-01",
    "purpose": "research",
    "payload": {"email": "b@example.com", "age": 34}
  }'
```

Expected: 403 blocked after consent withdrawal.

### Running OPA (optional)

Use `backend/scripts/run_opa.sh` or `backend/scripts/run_opa.ps1` to start OPA with included policies under `backend/app/policy/`. Set `OPA_URL` in `.env`. If not set, the built-in Python policy evaluation fallback is used.

### Make targets

```bash
make setup-db       # run DB init scripts
make run            # start FastAPI app
make test           # run tests
make gen-keys       # generate dev RSA keys
make start-retention
```

### Local dependency install guides

See detailed commands and links in the end of this file.

### Repository layout

```
backend/
  app/
    api/
    auth/
    core/
    db/
    models/
    policy/
    tests/
  scripts/
ui/rights_portal/
docs/
.github/workflows/
```

### Security notes

- Dev keys are for local testing only; rotate keys using provided script for any real environment
- Sensitive fields are encrypted at-rest via app-level crypto stubs; swap with KMS in production
- Rate limiting and input validation enabled on key endpoints

### Setup guides (Windows/macOS/Linux)

- PostgreSQL: `https://www.postgresql.org/download/`
- Redis: `https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/`
- OPA: `https://www.openpolicyagent.org/docs/latest/#running-opa`

Example PostgreSQL commands (Linux/macOS):

```bash
createdb nss
psql -d nss -c "CREATE USER nss WITH PASSWORD 'nss'; GRANT ALL PRIVILEGES ON DATABASE nss TO nss;"
export DATABASE_URL=postgresql+asyncpg://nss:nss@localhost:5432/nss
```

Windows tips:

- Install PostgreSQL via EnterpriseDB installer, ensure `psql` on PATH
- Use Redis MSI installer or run Redis on WSL; otherwise enable in-memory fallback

### License

Apache-2.0
