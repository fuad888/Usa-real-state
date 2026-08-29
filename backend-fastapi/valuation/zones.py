"""Zone coefficients for the demo valuation model.

These are hand-set demo values, calibrated against the fictional seed inventory
in spec §14 so the Sell estimate and the listing prices tell a consistent story.
They are NOT market data. In Phase 1 they are replaced by rolling medians
computed from closed MLS comparables; this module keeps its shape so nothing
else in the service changes.

`price_per_sqft` is quoted for a 3,000 sq ft reference home — `model.py` applies
a size factor because larger homes sell for less per foot.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Zone:
    slug: str
    label: str
    price_per_sqft: int          # baseline $/sq ft for a mid-condition home
    lot_value_per_sqft: int      # marginal value of land beyond the house footprint
    spread: float                # half-width of the quoted range, as a fraction


ZONES = {
    z.slug: z
    for z in [
        Zone("beverly-hills", "Beverly Hills", 780, 95, 0.075),
        Zone("bel-air", "Bel Air / Holmby Hills", 760, 85, 0.085),
        Zone("malibu", "Malibu", 1450, 110, 0.095),
        Zone("santa-monica", "Santa Monica", 1080, 70, 0.070),
        Zone("pacific-palisades", "Pacific Palisades", 900, 70, 0.075),
        Zone("brentwood", "Brentwood", 700, 60, 0.070),
        Zone("calabasas", "Calabasas / Hidden Hills", 640, 12, 0.080),
        Zone("studio-city", "Studio City / Sherman Oaks", 620, 30, 0.075),
        Zone("west-hollywood", "West Hollywood", 720, 55, 0.075),
        Zone("other-la", "Other Los Angeles County", 520, 22, 0.095),
    ]
}

# The reference size the $/sq ft figures above are quoted at.
REFERENCE_SQFT = 3000

# Condition multipliers (spec §5.4 step 2).
CONDITIONS = {
    "original": (0.84, "Original condition"),
    "updated": (0.96, "Updated"),
    "renovated": (1.09, "Fully renovated"),
    "luxury": (1.22, "Luxury renovation"),
}

PROPERTY_TYPE_FACTORS = {
    "single_family": 1.0,
    "estate": 1.05,
    "townhome": 0.93,
    "condo": 0.88,
}
