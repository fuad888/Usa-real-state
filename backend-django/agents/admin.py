from django.contrib import admin

from .models import Agent


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ("name", "title", "email", "phone", "order")
    list_editable = ("order",)
    search_fields = ("name", "title", "email")
    prepopulated_fields = {"slug": ("name",)}
    fieldsets = (
        (None, {"fields": ("name", "slug", "title", "photo_url", "order")}),
        ("Contact", {"fields": ("phone", "email", "license_number")}),
        ("Bio", {"fields": ("bio_en", "bio_es")}),
        ("Expertise", {"fields": ("specialties", "neighborhoods", "career_stats")}),
    )
