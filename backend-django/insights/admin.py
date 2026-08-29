from django.contrib import admin

from .models import Article


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title_en", "category", "author", "published_at")
    list_filter = ("category", "published_at")
    search_fields = ("title_en", "title_es")
    prepopulated_fields = {"slug": ("title_en",)}
    autocomplete_fields = ("author",)
    fieldsets = (
        (None, {"fields": ("slug", "category", "author", "cover_image", "read_minutes", "published_at")}),
        ("English", {"fields": ("title_en", "excerpt_en", "body_en")}),
        ("Español", {"fields": ("title_es", "excerpt_es", "body_es")}),
    )
