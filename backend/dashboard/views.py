from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import RTCProfile, RTCResource, RTCEvent, RTCProject, GalleryImage, News
from .serializers import (
    RTCProfileListSerializer, 
    RTCProfileDetailSerializer,
    RTCResourceSerializer,
    RTCEventSerializer,
    RTCProjectSerializer,
    GalleryImageSerializer,
    NewsSerializer
)
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 100

class RTCProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RTCProfile.objects.all()
    permission_classes = [AllowAny] # Publicly accessible for the dashboard list

    def get_serializer_class(self):
        if self.action == 'list':
            return RTCProfileListSerializer
        return RTCProfileDetailSerializer

class RTCResourceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RTCResource.objects.all().order_by('-created_at')
    serializer_class = RTCResourceSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['rtc', 'resource_type']
    search_fields = ['title', 'description']

class RTCEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RTCEvent.objects.all().order_by('-event_date')
    serializer_class = RTCEventSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['rtc', 'topic', 'event_date']
    search_fields = ['title', 'summary']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Time filter: upcoming or past
        time_filter = self.request.query_params.get('time_filter')
        if time_filter == 'upcoming':
            from django.utils import timezone
            queryset = queryset.filter(event_date__gte=timezone.now().date()).order_by('event_date')
        elif time_filter == 'past':
            from django.utils import timezone
            queryset = queryset.filter(event_date__lt=timezone.now().date()).order_by('-event_date')
        
        # Exact date filtering
        original_date = self.request.query_params.get('event_date')
        if original_date:
            queryset = queryset.filter(event_date=original_date)
        
        return queryset

class RTCProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RTCProject.objects.all().order_by('-created_at')
    serializer_class = RTCProjectSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['rtc']
    search_fields = ['name', 'description', 'partners']

class RTCGalleryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GalleryImage.objects.all().order_by('-created_at')
    serializer_class = GalleryImageSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['rtc']

class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = News.objects.all().order_by('-created_at')
    serializer_class = NewsSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['rtc']
    search_fields = ['title', 'content']
