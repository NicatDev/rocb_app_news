from rest_framework import viewsets, filters, generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from dashboard.models import News, RTCProfile
from .serializers import PublicNewsSerializer, MainSiteRTCProfileSerializer


class MainSiteGlobalNewsPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 50


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
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['order', 'created_at']
    ordering = ['order', '-created_at']

    def get_queryset(self):
        return (
            News.objects.filter(status='PUBLIC')
            .select_related('rtc')
            .prefetch_related('extra_images')
            .order_by('order', '-created_at')
        )


class MainSiteGlobalNewsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    News for the main ROCB website (rocbeurope.org): only global, public items.
    Global = rtc is null; status must be PUBLIC.
    """
    serializer_class = PublicNewsSerializer
    permission_classes = [AllowAny]
    pagination_class = MainSiteGlobalNewsPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['order', 'created_at']
    ordering = ['order', '-created_at']
    lookup_field = 'slug'
    lookup_value_regex = r'[^/]+'

    def get_queryset(self):
        return (
            News.objects.filter(status='PUBLIC', rtc__isnull=True)
            .select_related('rtc')
            .prefetch_related('extra_images')
            .order_by('order', '-created_at')
        )


class MainSiteRTCProfileListView(generics.ListAPIView):
    """
    Public RTC list for rocbeurope.org WCO Europe RTCs page.
    GET /api/v1/public/main-site/rtc-profiles/
    """

    serializer_class = MainSiteRTCProfileSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return RTCProfile.objects.filter(status='PUBLIC').order_by('name')
