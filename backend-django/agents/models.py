from django.db import models


class Agent(models.Model):
    """A listing agent (spec §11)."""

    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    title = models.CharField(max_length=140, blank=True)
    photo_url = models.URLField(blank=True)
    bio_en = models.TextField(blank=True)
    bio_es = models.TextField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    license_number = models.CharField(max_length=40, blank=True)
    specialties = models.JSONField(default=list, blank=True, help_text='e.g. ["Luxury Estates", "New Development"]')
    neighborhoods = models.JSONField(default=list, blank=True, help_text='e.g. ["Beverly Hills", "Bel Air"]')
    career_stats = models.JSONField(
        default=dict,
        blank=True,
        help_text='e.g. {"total_sales_volume": "$412M", "homes_sold": 168, "years_experience": 14}',
    )
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name
