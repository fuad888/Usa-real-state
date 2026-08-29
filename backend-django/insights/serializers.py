from rest_framework import serializers

from agents.serializers import AgentSerializer

from .models import Article


class ArticleListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = [
            "id", "slug", "title_en", "title_es", "excerpt_en", "excerpt_es",
            "cover_image", "category", "read_minutes", "published_at",
        ]


class ArticleDetailSerializer(ArticleListSerializer):
    author = AgentSerializer(read_only=True)

    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + ["body_en", "body_es", "author"]
