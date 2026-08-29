"""Export the seeded demo dataset as a static JSON snapshot for the frontend.

    python manage.py dump_demo_json

The frontend prefers the live Django API, but falls back to this snapshot when
the API is unreachable — so `next build` and the deployed demo keep rendering
even if only the frontend is running (see frontend/lib/api.ts).
"""

import json
import pathlib

from django.core.management.base import BaseCommand

from agents.models import Agent
from agents.serializers import AgentSerializer
from communities.models import Community
from communities.serializers import CommunitySerializer
from insights.models import Article
from insights.serializers import ArticleDetailSerializer
from properties.models import Property
from properties.serializers import PropertyDetailSerializer

DEST = pathlib.Path(__file__).resolve().parents[4] / "frontend" / "lib" / "demo-data.json"


class Command(BaseCommand):
    help = "Write frontend/lib/demo-data.json from the current database."

    def handle(self, *args, **opts):
        payload = {
            "properties": PropertyDetailSerializer(
                Property.objects.select_related("agent", "community")
                .prefetch_related("images", "tour_scenes"),
                many=True,
            ).data,
            "agents": AgentSerializer(Agent.objects.all(), many=True).data,
            "communities": CommunitySerializer(Community.objects.all(), many=True).data,
            "insights": ArticleDetailSerializer(Article.objects.select_related("author"),
                                                many=True).data,
        }
        DEST.parent.mkdir(parents=True, exist_ok=True)
        DEST.write_text(json.dumps(payload, indent=1, default=str) + "\n")
        self.stdout.write(self.style.SUCCESS(f"wrote {DEST} "
                                             f"({len(payload['properties'])} listings)"))
