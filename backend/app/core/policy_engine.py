from __future__ import annotations

import os

import httpx


class PolicyEngine:
    def __init__(self) -> None:
        self.opa_url = os.getenv("OPA_URL", "http://localhost:8181")
        self.use_opa = os.getenv("USE_OPA", "false").lower() == "true"

    async def allow_processing(
        self,
        *,
        data_principal_id: str,
        purpose: str,
        has_consent: bool,
        is_minor: bool,
        guardian_token_present: bool,
    ) -> bool:
        if self.use_opa:
            # Expect a policy package: data.nss.allow
            async with httpx.AsyncClient(timeout=2.0) as client:
                try:
                    resp = await client.post(
                        f"{self.opa_url}/v1/data/nss/allow",
                        json={
                            "input": {
                                "data_principal_id": data_principal_id,
                                "purpose": purpose,
                                "has_consent": has_consent,
                                "is_minor": is_minor,
                                "guardian_token_present": guardian_token_present,
                            }
                        },
                    )
                    resp.raise_for_status()
                    decision = resp.json().get("result", False)
                    return bool(decision)
                except Exception:  # noqa: BLE001
                    # Fallback to local decision if OPA fails
                    return self._local_rule(has_consent, is_minor, guardian_token_present)
        return self._local_rule(has_consent, is_minor, guardian_token_present)

    @staticmethod
    def _local_rule(has_consent: bool, is_minor: bool, guardian_token_present: bool) -> bool:
        if not has_consent:
            return False
        if is_minor and not guardian_token_present:
            return False
        return True


