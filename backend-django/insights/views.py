from rest_framework import viewsets

from .models import Article
from .serializers import ArticleDetailSerializer, ArticleListSerializer


class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Article.objects.select_related("author").all()
    lookup_field = "slug"
    search_fields = ["title_en", "title_es"]
    filterset_fields = ["category"]

    def get_serializer_class(self):
        return ArticleDetailSerializer if self.action == "retrieve" else ArticleListSerializer
