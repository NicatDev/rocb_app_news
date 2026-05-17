from django.db.models import DateTimeField
from django.db.models.functions import Cast, Coalesce
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, filters, generics
from rest_framework.exceptions import NotFound
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
        if value == 'rtc':
            return queryset.filter(rtc__isnull=False)
        return queryset


class PublicNewsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public API for News. Only returns news with status=PUBLIC.
    Supports search and filtering by news_type (global/rtc).
    Detail: GET /public/news/<slug>/ (matches app frontend /news/:slug).
    """
    serializer_class = PublicNewsSerializer
    permission_classes = [AllowAny]
    pagination_class = PublicNewsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PublicNewsFilter
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['order', 'effective_published_at', 'news_date', 'created_at']
    ordering = ['order', '-effective_published_at']
    lookup_field = 'slug'
    lookup_value_regex = r'[^/]+'

    def get_queryset(self):
        return (
            News.objects.filter(status='PUBLIC')
            .select_related('rtc')
            .prefetch_related('extra_images', 'sections')
            .annotate(
                effective_published_at=Coalesce(
                    Cast('news_date', DateTimeField()),
                    'created_at',
                )
            )
            .order_by('order', '-effective_published_at')
        )

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup = self.kwargs.get(self.lookup_url_kwarg or self.lookup_field)
        try:
            return queryset.get(slug=lookup)
        except News.DoesNotExist:
            if lookup is not None and str(lookup).isdigit():
                return get_object_or_404(queryset, pk=int(lookup))
            raise NotFound()


class MainSiteGlobalNewsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    News for the main ROCB website (rocbeurope.org): all items with status=PUBLIC
    (global and RTC-linked).
    """
    serializer_class = PublicNewsSerializer
    permission_classes = [AllowAny]
    pagination_class = MainSiteGlobalNewsPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['order', 'effective_published_at', 'news_date', 'created_at']
    ordering = ['order', '-effective_published_at']
    lookup_field = 'slug'
    lookup_value_regex = r'[^/]+'

    def get_queryset(self):
        return (
            News.objects.filter(status='PUBLIC')
            .select_related('rtc')
            .prefetch_related('extra_images', 'sections')
            .annotate(
                effective_published_at=Coalesce(
                    Cast('news_date', DateTimeField()),
                    'created_at',
                )
            )
            .order_by('order', '-effective_published_at')
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
        return RTCProfile.objects.filter(status='PUBLIC').order_by('order', 'name')
