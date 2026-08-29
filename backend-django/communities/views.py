from rest_framework import viewsets

from .models import Community
from .serializers import CommunitySerializer


class CommunityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Community.objects.prefetch_related("properties").all()
    serializer_class = CommunitySerializer
    lookup_field = "slug"
    search_fields = ["name"]
    filterset_fields = ["is_featured"]
