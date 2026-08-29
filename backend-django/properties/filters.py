import django_filters as filters

from .models import Property


class PropertyFilter(filters.FilterSet):
    """MVP filter set from spec §5.2 (Phase-2 filters are marked below)."""

    price_min = filters.NumberFilter(field_name="price", lookup_expr="gte")
    price_max = filters.NumberFilter(field_name="price", lookup_expr="lte")
    beds = filters.NumberFilter(field_name="bedrooms", lookup_expr="gte")
    baths = filters.NumberFilter(field_name="bathrooms", lookup_expr="gte")
    sqft_min = filters.NumberFilter(field_name="square_footage", lookup_expr="gte")
    sqft_max = filters.NumberFilter(field_name="square_footage", lookup_expr="lte")
    type = filters.CharFilter(field_name="property_type", lookup_expr="iexact")
    city = filters.CharFilter(field_name="city", lookup_expr="icontains")
    community = filters.CharFilter(field_name="community__slug", lookup_expr="iexact")
    agent = filters.CharFilter(field_name="agent__slug", lookup_expr="iexact")
    zip = filters.CharFilter(field_name="zip_code", lookup_expr="iexact")
    # Phase 2 (spec §5.2) — already wired so the UI can enable them without a backend change.
    year_built_min = filters.NumberFilter(field_name="year_built", lookup_expr="gte")
    lot_size_min = filters.NumberFilter(field_name="lot_size", lookup_expr="gte")

    class Meta:
        model = Property
        fields = ["listing_type", "status", "is_featured"]
