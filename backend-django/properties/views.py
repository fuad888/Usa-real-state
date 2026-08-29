from rest_framework import viewsets

from .filters import PropertyFilter
from .models import Property
from .serializers import PropertyDetailSerializer, PropertyListSerializer


class PropertyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        Property.objects.select_related("agent", "community")
        .prefetch_related("images", "tour_scenes")
        .all()
    )
    lookup_field = "slug"
    filterset_class = PropertyFilter
    search_fields = ["address", "city", "zip_code", "neighborhood", "title"]
    ordering_fields = ["price", "created_at", "square_footage", "bedrooms"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PropertyDetailSerializer
        return PropertyListSerializer
