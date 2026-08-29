from django.contrib import admin
from django.utils.html import format_html

from .models import Property, PropertyImage, PropertyTour


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 3
    fields = ("preview", "image_url", "image_file", "caption", "room", "order")
    readonly_fields = ("preview",)

    @admin.display(description="")
    def preview(self, obj):
        if obj and obj.pk and obj.url:
            return format_html('<img src="{}" style="height:56px;border-radius:3px" />', obj.url)
        return "—"


class PropertyTourInline(admin.StackedInline):
    model = PropertyTour
    extra = 1
    fields = (
        "scene_id",
        "room_name",
        ("panorama_url", "panorama_file"),
        ("initial_yaw", "initial_pitch"),
        "hotspots",
        "order",
    )


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ("address", "city", "price", "listing_type", "status", "bedrooms", "bathrooms",
                    "square_footage", "is_featured")
    list_filter = ("listing_type", "status", "property_type", "city", "is_featured")
    list_editable = ("status", "is_featured")
    search_fields = ("address", "city", "zip_code", "title")
    prepopulated_fields = {"slug": ("city", "address")}
    autocomplete_fields = ("agent", "community")
    inlines = [PropertyImageInline, PropertyTourInline]
    fieldsets = (
        ("Listing", {"fields": ("title", "slug", "listing_type", "status", "property_type",
                                "price", "is_featured", "open_house_at")}),
        ("Location", {"fields": ("address", "city", "state", "zip_code", "neighborhood",
                                 "latitude", "longitude", "community")}),
        ("Facts", {"fields": ("bedrooms", "bathrooms", "square_footage", "lot_size",
                              "year_built", "hoa_fee")}),
        ("Copy (EN)", {"fields": ("description_en",)}),
        ("Copy (ES)", {"fields": ("description_es",)}),
        ("Lists", {"fields": ("highlights", "features")}),
        ("Assignment", {"fields": ("agent",)}),
    )
