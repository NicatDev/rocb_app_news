from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from dashboard.models import News
from .serializers import PublicNewsSerializer


class PublicNewsPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50


class PublicNewsFilter(django_filters.FilterSet):
    """Custom filter to handle 'news_type' param: global, rtc, or all."""
    news_type = django_filters.CharFilter(method='filter_news_type')

    class Meta:
        model = News
        fields = ['news_type']

    def filter_news_type(self, queryset, name, value):
        if value == 'global':
            return queryset.filter(rtc__isnull=True)
        elif value == 'rtc':
            return queryset.filter(rtc__isnull=False)
        return queryset.filter(status='PUBLIC')


class PublicNewsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public API for News. Only returns news with status=PUBLIC.
    Supports search and filtering by news_type (global/rtc).
    """
    serializer_class = PublicNewsSerializer
    permission_classes = [AllowAny]
    pagination_class = PublicNewsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PublicNewsFilter
    search_fields = ['title', 'content']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return News.objects.filter(status='PUBLIC').select_related('rtc')
