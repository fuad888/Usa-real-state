"""API routes — spec §12."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from agents.views import AgentViewSet
from communities.views import CommunityViewSet
from insights.views import ArticleViewSet
from leads.views import LeadViewSet
from properties.views import PropertyViewSet

router = DefaultRouter()
router.register("properties", PropertyViewSet, basename="property")
router.register("agents", AgentViewSet, basename="agent")
router.register("communities", CommunityViewSet, basename="community")
router.register("insights", ArticleViewSet, basename="insight")
router.register("leads", LeadViewSet, basename="lead")

urlpatterns = [path("", include(router.urls))]
