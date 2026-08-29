from django.db import models


class Article(models.Model):
    """Editorial content — market reports and guides (spec §5.8, §11)."""

    CATEGORY_CHOICES = [
        ("market_report", "Market Report"),
        ("neighborhood_guide", "Neighborhood Guide"),
        ("buying_guide", "Buying Guide"),
        ("selling_guide", "Selling Guide"),
    ]

    slug = models.SlugField(max_length=200, unique=True)
    title_en = models.CharField(max_length=200)
    title_es = models.CharField(max_length=200, blank=True)
    excerpt_en = models.TextField(blank=True)
    excerpt_es = models.TextField(blank=True)
    body_en = models.TextField(blank=True, help_text="Markdown-ish; blank line separates paragraphs")
    body_es = models.TextField(blank=True)
    cover_image = models.URLField(blank=True)
    category = models.CharField(max_length=24, choices=CATEGORY_CHOICES, default="market_report")
    author = models.ForeignKey(
        "agents.Agent", null=True, blank=True, on_delete=models.SET_NULL, related_name="articles"
    )
    read_minutes = models.PositiveSmallIntegerField(default=4)
    published_at = models.DateTimeField()

    class Meta:
        ordering = ["-published_at"]

    def __str__(self):
        return self.title_en
