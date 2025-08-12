PY=python

.PHONY: run test gen-keys setup-db start-retention lint typecheck format

run:
	uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

test:
	pytest -q

gen-keys:
	$(PY) backend/scripts/gen_keys.py

setup-db:
	$(PY) backend/scripts/create_tables.py
	$(PY) backend/scripts/sample_data.py

start-retention:
	$(PY) backend/app/core/retention_manager.py

lint:
	ruff check .

typecheck:
	mypy backend

format:
	black backend

