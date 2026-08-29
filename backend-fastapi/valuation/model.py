"""The demo estimate itself.

    value = sqft x zone $/sqft x size x condition x property-type x age
          + marginal land value for lot area beyond the footprint (capped)

It is a transparent formula, not an AVM. Every response carries the
`disclaimer` field, and the UI is required to show it (spec §5.4).
"""

from __future__ import annotations

from .zones import CONDITIONS, PROPERTY_TYPE_FACTORS, REFERENCE_SQFT, ZONES

DISCLAIMER = (
    "This is a preliminary estimate generated from public averages, not an appraisal, "
    "a broker price opinion, or an offer. Speak with an agent for a valuation based on "
    "comparable sales."
)


def _size_factor(sqft: int) -> tuple[float, str]:
    """Bigger houses sell for less per square foot. Gentle power curve, clamped."""
    f = (REFERENCE_SQFT / max(sqft, 1)) ** 0.22
    f = min(1.25, max(0.65, f))
    if f > 1.02:
        return f, "Below-average size for the area"
    if f < 0.98:
        return f, "Above-average size for the area"
    return f, "Typical size for the area"


def _age_factor(year_built: int | None) -> tuple[float, str]:
    if not year_built:
        return 1.0, "No year built supplied"
    if year_built >= 2015:
        return 1.06, "Recent construction (2015 or newer)"
    if year_built >= 2000:
        return 1.02, "Built 2000–2014"
    if year_built >= 1980:
        return 1.0, "Built 1980–1999"
    if year_built >= 1950:
        return 0.97, "Built 1950–1979"
    return 0.95, "Built before 1950"


def estimate(sqft: int, zone: str, condition: str, lot_size: int | None = None,
             property_type: str = "single_family", year_built: int | None = None) -> dict:
    z = ZONES.get(zone) or ZONES["other-la"]
    cond_factor, cond_label = CONDITIONS.get(condition, CONDITIONS["updated"])
    type_factor = PROPERTY_TYPE_FACTORS.get(property_type, 1.0)
    age_factor, age_label = _age_factor(year_built)

    size_factor, size_label = _size_factor(sqft)

    structure = sqft * z.price_per_sqft * size_factor * cond_factor * type_factor * age_factor

    # Only land materially beyond the building footprint carries extra value, and
    # never more than a third of the structure — otherwise acreage runs away.
    land = 0.0
    if lot_size:
        excess = max(0, lot_size - sqft * 1.6)
        land = min(excess * z.lot_value_per_sqft, structure * 0.35)

    midpoint = structure + land
    low = midpoint * (1 - z.spread)
    high = midpoint * (1 + z.spread)

    def r(v: float) -> int:
        return int(round(v / 25_000.0) * 25_000)

    return {
        "estimated_min": r(low),
        "estimated_max": r(high),
        "estimated_mid": r(midpoint),
        "currency": "USD",
        "price_per_sqft": round(midpoint / sqft) if sqft else None,
        "zone": {"slug": z.slug, "label": z.label, "baseline_price_per_sqft": z.price_per_sqft},
        "breakdown": [
            {"label": f"{sqft:,} sq ft at ${z.price_per_sqft:,}/sq ft in {z.label}",
             "value": r(sqft * z.price_per_sqft)},
            {"label": size_label, "value": f"x{size_factor:.2f}"},
            {"label": f"{cond_label} adjustment", "value": f"x{cond_factor:.2f}"},
            {"label": age_label, "value": f"x{age_factor:.2f}"},
            *([{"label": "Land beyond the building footprint", "value": r(land)}] if land else []),
        ],
        "disclaimer": DISCLAIMER,
    }
