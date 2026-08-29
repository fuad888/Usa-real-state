from rest_framework import serializers

from .models import Agent


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = [
            "id", "name", "slug", "title", "photo_url", "bio_en", "bio_es",
            "phone", "email", "license_number", "specialties", "neighborhoods", "career_stats",
        ]
