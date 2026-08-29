"""Market ticker source (spec §4.2).

Demo behaviour: values come from `ticker/values.json`, which the agent edits
weekly through the Django admin or by hand. The response is shaped exactly as
the Phase-1 FRED + MLS aggregation will be, so the frontend never changes.

Phase 1 wiring (not enabled in the demo — no FRED_API_KEY is invented here):
  MORTGAGE30US  -> 30-year fixed rate
  MSPUS / CASTHPI -> price levels
A scheduled job refreshes values.json; `updated_at` tells the UI how fresh it is.
"""

from __future__ import annotations

import json
import os
import pathlib

VALUES_PATH = pathlib.Path(__file__).with_name("values.json")

FALLBACK = {
    "updated_at": "2026-08-24T09:00:00Z",
    "source": "manual",
    "items": [
        {"label": "Median CA Home Price", "value": "$875,400", "change": "+2.1% YoY", "trend": "up"},
        {"label": "30-Yr Fixed Rate", "value": "6.42%", "change": "-0.08 WoW", "trend": "down"},
        {"label": "Avg. Days on Market", "value": "34", "change": "-3 MoM", "trend": "down"},
        {"label": "Price / Sq Ft", "value": "$612", "change": "+1.4% YoY", "trend": "up"},
        {"label": "Active Listings, LA County", "value": "9,842", "change": "+5.6% MoM", "trend": "up"},
        {"label": "Months of Supply", "value": "2.7", "change": "flat", "trend": "flat"},
    ],
}


def load() -> dict:
    if VALUES_PATH.exists():
        try:
            return json.loads(VALUES_PATH.read_text())
        except json.JSONDecodeError:
            pass
    return FALLBACK


def fred_configured() -> bool:
    return bool(os.getenv("FRED_API_KEY"))
