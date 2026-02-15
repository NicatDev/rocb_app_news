from rest_framework import viewsets, permissions, status, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.decorators import action
from dashboard.models import RTCProfile, RTCResource, RTCEvent, RTCProject, GalleryImage, News
from dashboard.serializers import (
    RTCProfileDetailSerializer, 
    RTCResourceSerializer, 
    RTCEventSerializer, 
    RTCProjectSerializer, 
    GalleryImageSerializer, 
    NewsSerializer
)
from .permissions import IsRTCOwner

class RTCAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet for RTC Owners to manage their RTC Profile.
    """
    serializer_class = RTCProfileDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsRTCOwner]
 
    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous:
            return RTCProfile.objects.none()
        return RTCProfile.objects.filter(owner=user)

    def perform_update(self, serializer):
        serializer.save()

class BaseRTCRelatedViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet for models related to an RTC (News, Events, etc.)
    Ensures that users can only manage items belonging to their RTC.
    """
    permission_classes = [permissions.IsAuthenticated, IsRTCOwner]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous:
            return self.model.objects.none()
        
        # Determine the user's RTC
        # Assuming one RTC per owner
        # We need to filter by the related 'rtc' field
        
        # First, find the RTC owned by the user
        rtc_profile = RTCProfile.objects.filter(owner=user).first()
        
        if not rtc_profile:
             return self.model.objects.none()
             
        return self.model.objects.filter(rtc=rtc_profile).order_by('-created_at' if hasattr(self.model, 'created_at') else '-id')

    def perform_create(self, serializer):
        # Automatically assign the RTC owned by the user
        rtc = RTCProfile.objects.filter(owner=self.request.user).first()
        if rtc:
            serializer.save(rtc=rtc)
        else:
            # Handle case where user implies they are an owner but have no RTC
            # This should ideally be caught by permissions or frontend logic
            serializer.save()

class NewsAdminViewSet(BaseRTCRelatedViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    model = News
    search_fields = ['title', 'content']
    filterset_fields = ['status']

class EventsAdminViewSet(BaseRTCRelatedViewSet):
    queryset = RTCEvent.objects.all()
    serializer_class = RTCEventSerializer
    model = RTCEvent
    search_fields = ['title', 'topic', 'summary']
    filterset_fields = ['status']

class ResourcesAdminViewSet(BaseRTCRelatedViewSet):
    queryset = RTCResource.objects.all()
    serializer_class = RTCResourceSerializer
    model = RTCResource
    search_fields = ['title', 'description']
    filterset_fields = ['status', 'resource_type']
class ProjectsAdminViewSet(BaseRTCRelatedViewSet):
    queryset = RTCProject.objects.all()
    serializer_class = RTCProjectSerializer
    model = RTCProject
    search_fields = ['name', 'description', 'partners']
    filterset_fields = ['status']

class GalleryAdminViewSet(BaseRTCRelatedViewSet):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    model = GalleryImage
    search_fields = ['caption']
    filterset_fields = ['status']
