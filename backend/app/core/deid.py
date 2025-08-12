from __future__ import annotations

import hashlib
from typing import Any, Dict


class Deidentifier:
    def __init__(self) -> None:
        self.redact_fields = {"ssn", "aadhar", "pan"}

    def process(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        result: Dict[str, Any] = {}
        for key, value in payload.items():
            if key in self.redact_fields and isinstance(value, str):
                result[key] = "[REDACTED]"
            elif key.endswith("_hash") and isinstance(value, str):
                result[key] = hashlib.sha256(value.encode()).hexdigest()
            else:
                result[key] = value
        return result


