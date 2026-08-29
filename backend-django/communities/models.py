from django.db import models


class Community(models.Model):
    """A California neighborhood / community landing page (spec §5.6, §11)."""

    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    state = models.CharField(max_length=2, default="CA")
    hero_image = models.URLField(blank=True)
    tagline_en = models.CharField(max_length=200, blank=True)
    tagline_es = models.CharField(max_length=200, blank=True)
    description_en = models.TextField(blank=True)
    description_es = models.TextField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    market_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='e.g. {"median_price": 4250000, "active_listings": 128, "median_dom": 41, "price_per_sqft": 1210}',
    )
    lifestyle_info = models.JSONField(
        default=list,
        blank=True,
        help_text='e.g. [{"category": "Dining", "items": ["..."]}]',
    )
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "communities"

    def __str__(self):
        return self.name
