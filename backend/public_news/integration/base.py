from rest_framework import filters, generics
from rest_framework.permissions import AllowAny

from public_news.serializers import PublicNewsSerializer
from public_news.views import MainSiteGlobalNewsPagination


class BaseIntegrationNewsListView(generics.ListAPIView):
    """Base list for rocbeurope.org integration (search + pagination)."""

    serializer_class = PublicNewsSerializer
    permission_classes = [AllowAny]
    pagination_class = MainSiteGlobalNewsPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['order', 'effective_published_at', 'news_date', 'created_at']
    ordering = ['order', '-effective_published_at']

    def get_queryset(self):
        return self.filter_queryset(self.integration_queryset())

    def integration_queryset(self):
        raise NotImplementedError
