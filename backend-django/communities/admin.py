from django.contrib import admin

from .models import Community


@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ("name", "state", "is_featured", "order")
    list_editable = ("is_featured", "order")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}
    fieldsets = (
        (None, {"fields": ("name", "slug", "state", "hero_image", "is_featured", "order")}),
        ("Copy (EN)", {"fields": ("tagline_en", "description_en")}),
        ("Copy (ES)", {"fields": ("tagline_es", "description_es")}),
        ("Map", {"fields": ("latitude", "longitude")}),
        ("Market data & lifestyle", {"fields": ("market_data", "lifestyle_info")}),
    )
