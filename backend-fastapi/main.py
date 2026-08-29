"""Sol & Stone AI services (spec §2, §12).

Two endpoints, deliberately small and stateless:
  POST /ai/valuation  — the Sell page's conversational estimate
  GET  /ai/ticker     — the market ticker strip under the navbar

Leads are *not* written here; the chat widget posts the finished estimate to
Django's /api/leads/ so every enquiry lands in one admin inbox.
"""

from __future__ import annotations

import os
import time
from collections import defaultdict, deque

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ticker.data import fred_configured, load as load_ticker
from valuation.model import estimate
from valuation.zones import CONDITIONS, PROPERTY_TYPE_FACTORS, ZONES

load_dotenv()

app = FastAPI(
    title="Sol & Stone AI Services",
    version="0.1.0",
    description="Valuation and market-data services for the Sol & Stone demo.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in os.getenv(
        "CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",") if o],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------------- #
# Rate limiting — /ai/valuation is public and unauthenticated (spec §12).
# In-process and per-IP; put a real limiter in front of it in production.
# --------------------------------------------------------------------------- #
_HITS: dict[str, deque[float]] = defaultdict(deque)
_WINDOW = 60.0
_MAX_PER_WINDOW = 20


def _rate_limit(request: Request) -> None:
    ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    hits = _HITS[ip]
    while hits and now - hits[0] > _WINDOW:
        hits.popleft()
    if len(hits) >= _MAX_PER_WINDOW:
        raise HTTPException(status_code=429, detail="Too many requests. Try again in a minute.")
    hits.append(now)


class ValuationRequest(BaseModel):
    sqft: int = Field(..., ge=200, le=60_000, description="Interior living area")
    zone: str = Field(..., description="Zone slug from GET /ai/valuation/zones")
    condition: str = Field("updated", description="original | updated | renovated | luxury")
    lot_size: int | None = Field(None, ge=0, le=5_000_000, description="Lot area in sq ft")
    property_type: str = Field("single_family")
    year_built: int | None = Field(None, ge=1800, le=2100)
    address: str | None = Field(None, max_length=200)
    # Honeypot: hidden in the UI, so anything here is a bot (spec §12).
    website: str | None = Field(None, max_length=200)


class ValuationResponse(BaseModel):
    estimated_min: int
    estimated_max: int
    estimated_mid: int
    currency: str
    price_per_sqft: int | None
    zone: dict
    breakdown: list
    disclaimer: str


@app.get("/health")
def health():
    return {"status": "ok", "ticker_source": "fred" if fred_configured() else "manual"}


@app.get("/ai/valuation/zones")
def zones():
    """Options the Sell chat offers, so the copy lives in one place."""
    return {
        "zones": [{"slug": z.slug, "label": z.label} for z in ZONES.values()],
        "conditions": [{"slug": k, "label": v[1]} for k, v in CONDITIONS.items()],
        "property_types": [{"slug": k, "label": k.replace("_", " ").title()}
                           for k in PROPERTY_TYPE_FACTORS],
    }


@app.post("/ai/valuation", response_model=ValuationResponse)
def valuation(body: ValuationRequest, request: Request):
    _rate_limit(request)
    if body.website:
        raise HTTPException(status_code=400, detail="Rejected.")
    return estimate(
        sqft=body.sqft,
        zone=body.zone,
        condition=body.condition,
        lot_size=body.lot_size,
        property_type=body.property_type,
        year_built=body.year_built,
    )


@app.get("/ai/ticker")
def ticker(if_none_match: str | None = Header(default=None)):
    data = load_ticker()
    data["live"] = fred_configured()
    return data
