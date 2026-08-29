import logging

from rest_framework import mixins, viewsets

from .models import Lead
from .serializers import LeadSerializer

logger = logging.getLogger(__name__)


class LeadViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Public, unauthenticated, throttled (spec §12)."""

    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    throttle_scope = "leads"

    def perform_create(self, serializer):
        lead = serializer.save()
        # Demo: notification is logged, not sent (spec §19 Mock vs Real).
        logger.info(
            "NEW LEAD [%s] %s <%s> phone=%s property=%s",
            lead.type, lead.name, lead.email, lead.phone, lead.property_id,
        )
