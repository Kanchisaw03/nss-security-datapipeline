from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Optional

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

JWT_PRIVATE_KEY_PATH = os.getenv("JWT_PRIVATE_KEY_PATH", "backend/app/auth/keys/dev_rsa_private.pem")
JWT_PUBLIC_KEY_PATH = os.getenv("JWT_PUBLIC_KEY_PATH", "backend/app/auth/keys/dev_rsa_public.pem")
JWT_ISSUER = os.getenv("JWT_ISSUER", "nss.local")
JWT_AUDIENCE = os.getenv("JWT_AUDIENCE", "nss.clients")
JWT_ALG = os.getenv("JWT_ALG", "RS256")


def _read_key(path: str) -> str:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return ""


def issue_dev_token(role: str, sub: str) -> str:
    private_key = _read_key(JWT_PRIVATE_KEY_PATH)
    if not private_key:
        raise RuntimeError("Private key not found. Run make gen-keys.")
    now = int(time.time())
    payload = {
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
        "sub": sub,
        "role": role,
        "iat": now,
        "exp": now + 3600,
    }
    return jwt.encode(payload, private_key, algorithm=JWT_ALG)


security = HTTPBearer(auto_error=False)


@dataclass
class Principal:
    subject: str
    role: str


async def auth_dependency(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Principal:
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing authorization")
    token = credentials.credentials
    public_key = _read_key(JWT_PUBLIC_KEY_PATH)
    try:
        claims = jwt.decode(token, public_key, algorithms=[JWT_ALG], audience=JWT_AUDIENCE, issuer=JWT_ISSUER)
    except jwt.PyJWTError as exc:  # type: ignore[attr-defined]
        raise HTTPException(status_code=401, detail="Invalid token") from exc
    role = claims.get("role", "data_principal")
    return Principal(subject=str(claims.get("sub", "unknown")), role=str(role))


class RateLimiterMiddleware:
    def __init__(self, app):
        self.app = app
        self.limit_per_minute = int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
        self.cache: dict[str, tuple[int, int]] = {}

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        key = scope.get("client", ("", ""))[0]
        now = int(time.time())
        window = now // 60
        count, w = self.cache.get(key, (0, window))
        if w != window:
            count = 0
            w = window
        count += 1
        self.cache[key] = (count, w)
        if count > self.limit_per_minute:
            from starlette.responses import JSONResponse

            await JSONResponse({"detail": "Rate limit exceeded"}, status_code=429)(scope, receive, send)
            return
        await self.app(scope, receive, send)


