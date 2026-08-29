from django.contrib import admin

from .models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("created_at", "type", "name", "email", "phone", "property", "agent", "status")
    list_filter = ("type", "status", "created_at")
    list_editable = ("status",)
    search_fields = ("name", "email", "phone", "message")
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "valuation_data", "source_locale")
    autocomplete_fields = ("property", "agent")

    @admin.action(description="Mark selected leads as contacted")
    def mark_contacted(self, request, queryset):
        queryset.update(status="contacted")

    actions = ["mark_contacted"]
