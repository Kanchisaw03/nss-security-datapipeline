from __future__ import annotations

from backend.app.auth.security import issue_dev_token


def test_issue_dev_token_roundtrip():
    token = issue_dev_token("system", "user-x")
    assert isinstance(token, str) and token.count(".") == 2


