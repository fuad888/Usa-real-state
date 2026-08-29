from django.db import models


class Lead(models.Model):
    """Every inbound enquiry lands here — one inbox for the agent (spec §6, §11)."""

    TYPE_CHOICES = [
        ("showing", "Schedule a Showing"),
        ("question", "Ask a Question"),
        ("valuation", "AI Home Valuation"),
        ("contact", "General Contact"),
    ]
    STATUS_CHOICES = [("new", "New"), ("contacted", "Contacted"), ("closed", "Closed")]

    type = models.CharField(max_length=16, choices=TYPE_CHOICES, default="contact")
    property = models.ForeignKey(
        "properties.Property", null=True, blank=True, on_delete=models.SET_NULL, related_name="leads"
    )
    agent = models.ForeignKey(
        "agents.Agent", null=True, blank=True, on_delete=models.SET_NULL, related_name="leads"
    )

    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    message = models.TextField(blank=True)

    preferred_date = models.DateField(null=True, blank=True)
    preferred_time = models.CharField(max_length=40, blank=True)

    valuation_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='e.g. {"address": "...", "sqft": 2800, "zone": "beverly-hills", '
        '"condition": "updated", "estimated_min": 1200000, "estimated_max": 1350000}',
    )

    # TCPA consent (spec §18) — stored so the agent can prove opt-in.
    consent_marketing = models.BooleanField(default=False)
    source_locale = models.CharField(max_length=5, blank=True)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="new")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_type_display()} — {self.name}"
