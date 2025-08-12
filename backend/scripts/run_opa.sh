#!/usr/bin/env bash
set -euo pipefail

OPA_BIN=${OPA_BIN:-opa}
POLICY_DIR=backend/app/policy

exec "$OPA_BIN" run --server --addr :8181 $POLICY_DIR


