from rest_framework import serializers

from agents.serializers import AgentSerializer

from .models import Property, PropertyImage, PropertyTour


class PropertyImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ["id", "url", "caption", "room", "order"]

    def get_url(self, obj):
        url = obj.url
        request = self.context.get("request")
        if request and url and url.startswith("/"):
            return request.build_absolute_uri(url)
        return url


class PropertyTourSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyTour
        fields = ["id", "scene_id", "room_name", "url", "initial_yaw", "initial_pitch", "hotspots", "order"]

    def get_url(self, obj):
        url = obj.url
        request = self.context.get("request")
        if request and url and url.startswith("/"):
            return request.build_absolute_uri(url)
        return url


class PropertyListSerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    price = serializers.FloatField()
    bathrooms = serializers.FloatField()
    community_slug = serializers.CharField(source="community.slug", read_only=True, default=None)
    community_name = serializers.CharField(source="community.name", read_only=True, default=None)
    agent_slug = serializers.CharField(source="agent.slug", read_only=True, default=None)
    agent_name = serializers.CharField(source="agent.name", read_only=True, default=None)
    has_tour = serializers.BooleanField(read_only=True)
    price_per_sqft = serializers.IntegerField(read_only=True)

    class Meta:
        model = Property
        fields = [
            "id", "slug", "title", "address", "city", "state", "zip_code", "neighborhood",
            "latitude", "longitude", "price", "listing_type", "status", "property_type",
            "bedrooms", "bathrooms", "square_footage", "lot_size", "year_built", "hoa_fee",
            "is_featured", "open_house_at", "community_slug", "community_name",
            "agent_slug", "agent_name",
            "has_tour", "price_per_sqft", "images", "created_at",
        ]


class PropertyDetailSerializer(PropertyListSerializer):
    agent = AgentSerializer(read_only=True)
    tour_scenes = PropertyTourSerializer(many=True, read_only=True)

    class Meta(PropertyListSerializer.Meta):
        fields = PropertyListSerializer.Meta.fields + [
            "description_en", "description_es", "highlights", "features", "agent", "tour_scenes",
        ]
