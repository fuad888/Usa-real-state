import builtins

from django.db import models


class Property(models.Model):
    """A listing (spec §11).

    Demo note: coordinates are plain floats rather than a PostGIS point so the
    project runs on SQLite. Swapping in django.contrib.gis for production only
    requires replacing these two fields with a PointField.
    """

    LISTING_BUY = "buy"
    LISTING_RENT = "rent"
    LISTING_TYPES = [(LISTING_BUY, "For Sale"), (LISTING_RENT, "For Rent")]

    STATUS_CHOICES = [
        ("new", "New"),
        ("open_house", "Open House"),
        ("price_reduced", "Price Reduced"),
        ("pending", "Pending"),
        ("coming_soon", "Coming Soon"),
        ("sold", "Sold"),
    ]

    PROPERTY_TYPES = [
        ("single_family", "Single Family"),
        ("condo", "Condo"),
        ("townhome", "Townhome"),
        ("estate", "Estate"),
    ]

    slug = models.SlugField(max_length=200, unique=True)
    title = models.CharField(max_length=200)
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2, default="CA")
    zip_code = models.CharField(max_length=10, blank=True)
    neighborhood = models.CharField(max_length=120, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    price = models.DecimalField(max_digits=12, decimal_places=2)
    listing_type = models.CharField(max_length=8, choices=LISTING_TYPES, default=LISTING_BUY)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="new")
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES, default="single_family")

    bedrooms = models.PositiveSmallIntegerField(default=0)
    bathrooms = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    square_footage = models.PositiveIntegerField(default=0)
    lot_size = models.PositiveIntegerField(default=0, help_text="Square feet")
    year_built = models.PositiveSmallIntegerField(null=True, blank=True)
    hoa_fee = models.PositiveIntegerField(null=True, blank=True, help_text="Monthly, USD")

    description_en = models.TextField(blank=True)
    description_es = models.TextField(blank=True)
    highlights = models.JSONField(default=list, blank=True, help_text='e.g. ["Canyon-to-ocean views"]')
    features = models.JSONField(default=list, blank=True, help_text='e.g. ["Pool", "3-Car Garage"]')

    agent = models.ForeignKey(
        "agents.Agent", null=True, blank=True, on_delete=models.SET_NULL, related_name="properties"
    )
    community = models.ForeignKey(
        "communities.Community", null=True, blank=True, on_delete=models.SET_NULL, related_name="properties"
    )

    is_featured = models.BooleanField(default=False)
    open_house_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_featured", "-created_at"]
        verbose_name_plural = "properties"

    def __str__(self):
        return f"{self.address}, {self.city}"

    @property
    def has_tour(self):
        return self.tour_scenes.exists()

    @property
    def price_per_sqft(self):
        if not self.square_footage:
            return None
        return round(float(self.price) / self.square_footage)


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="images")
    image_url = models.URLField(
        blank=True, help_text="External URL. Leave blank if uploading a file below."
    )
    image_file = models.ImageField(upload_to="properties/", blank=True, null=True)
    caption = models.CharField(max_length=200, blank=True, help_text="Also used as alt text (spec §18, ADA)")
    room = models.CharField(max_length=60, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.property.address} — {self.caption or self.order}"

    @builtins.property
    def url(self):
        if self.image_file:
            return self.image_file.url
        return self.image_url


class PropertyTour(models.Model):
    """One 360° panorama scene. Hotspots link scenes together (spec §5.3)."""

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name="tour_scenes")
    scene_id = models.SlugField(max_length=60, help_text="Unique within this property, e.g. 'living-room'")
    room_name = models.CharField(max_length=80)
    panorama_url = models.URLField(blank=True, help_text="Equirectangular image URL")
    panorama_file = models.ImageField(upload_to="tours/", blank=True, null=True)
    initial_yaw = models.FloatField(default=0)
    initial_pitch = models.FloatField(default=0)
    hotspots = models.JSONField(
        default=list,
        blank=True,
        help_text='e.g. [{"yaw": 120, "pitch": -5, "target": "kitchen", "text": "Kitchen"}]',
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        unique_together = [("property", "scene_id")]

    def __str__(self):
        return f"{self.property.address} — {self.room_name}"

    @builtins.property
    def url(self):
        if self.panorama_file:
            return self.panorama_file.url
        return self.panorama_url
