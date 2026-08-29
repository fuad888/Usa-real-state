from rest_framework import serializers

from .models import Community


class CommunitySerializer(serializers.ModelSerializer):
    active_listings = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = [
            "id", "name", "slug", "state", "hero_image", "tagline_en", "tagline_es",
            "description_en", "description_es", "latitude", "longitude",
            "market_data", "lifestyle_info", "is_featured", "active_listings",
        ]

    def get_active_listings(self, obj):
        return obj.properties.exclude(status="sold").count()
