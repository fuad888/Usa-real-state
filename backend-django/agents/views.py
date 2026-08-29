from rest_framework import viewsets

from .models import Agent
from .serializers import AgentSerializer


class AgentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    lookup_field = "slug"
    search_fields = ["name", "title"]
