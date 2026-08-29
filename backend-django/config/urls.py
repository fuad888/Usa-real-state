"""Root URL configuration (spec §12)."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "Sol & Stone"
admin.site.site_title = "Sol & Stone Admin"
admin.site.index_title = "Listings, agents & leads"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("config.api_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
