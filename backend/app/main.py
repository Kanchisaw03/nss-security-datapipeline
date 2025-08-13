from __future__ import annotations

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Counter, Histogram, generate_latest
from starlette.requests import Request
from starlette.responses import PlainTextResponse

from .api import consent, ingest, audit, health
from .auth.security import RateLimiterMiddleware, auth_dependency
from .core.logging_setup import configure_logging

load_dotenv()

configure_logging()

REQUEST_COUNT = Counter(
    "http_requests_total", "Total HTTP requests", ["method", "endpoint", "status"]
)
REQUEST_LATENCY = Histogram(
    "http_request_latency_seconds", "Request latency", ["endpoint"]
)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    # Startup
    yield
    # Shutdown
    await asyncio.sleep(0)


app = FastAPI(
    title=os.getenv("APP_NAME", "NSS Secure Data Platform"),
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimiterMiddleware)


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    endpoint = request.url.path
    with REQUEST_LATENCY.labels(endpoint=endpoint).time():
        response = await call_next(request)
    REQUEST_COUNT.labels(
        method=request.method, endpoint=endpoint, status=str(response.status_code)
    ).inc()
    return response


@app.get("/metrics")
async def metrics() -> PlainTextResponse:
    return PlainTextResponse(generate_latest().decode("utf-8"))


# Routers
app.include_router(health.router, prefix="/api")
app.include_router(consent.router, prefix="/api", dependencies=[Depends(auth_dependency)])
app.include_router(ingest.router, prefix="/api", dependencies=[Depends(auth_dependency)])
app.include_router(audit.router, prefix="/api", dependencies=[Depends(auth_dependency)])


