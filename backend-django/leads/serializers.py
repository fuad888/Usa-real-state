from rest_framework import serializers

from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    # Honeypot: real users never see or fill this (spec §12). Bots usually do.
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)
    property_slug = serializers.SlugField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Lead
        fields = [
            "id", "type", "property", "property_slug", "agent", "name", "email", "phone",
            "message", "preferred_date", "preferred_time", "valuation_data",
            "consent_marketing", "source_locale", "website", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {"property": {"required": False}, "agent": {"required": False}}

    def validate(self, attrs):
        if attrs.pop("website", ""):
            raise serializers.ValidationError({"detail": "Rejected."})
        slug = attrs.pop("property_slug", "")
        if slug and not attrs.get("property"):
            from properties.models import Property

            attrs["property"] = Property.objects.filter(slug=slug).first()
        return attrs

    def create(self, validated_data):
        lead = super().create(validated_data)
        if lead.property and lead.property.agent and not lead.agent:
            lead.agent = lead.property.agent
            lead.save(update_fields=["agent"])
        return lead
