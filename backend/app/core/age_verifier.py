from __future__ import annotations

from datetime import date, datetime
from typing import Tuple


class AgeVerifier:
    def check_minor(self, dob_str: str) -> Tuple[bool, bool]:
        try:
            dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
        except ValueError:
            return False, False
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        is_minor = age < 18
        needs_guardian = is_minor
        return is_minor, needs_guardian


