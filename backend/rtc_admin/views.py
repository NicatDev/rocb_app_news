from rest_framework import viewsets, permissions, status, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.decorators import action
from dashboard.models import RTCProfile, RTCResource, RTCEvent, RTCEventFile, RTCProject, GalleryImage, News
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

    def _handle_files(self, instance, request):
        """Handle file uploads and deletions for an event instance."""
        # Handle deletions
        deleted_files = request.data.getlist('deleted_files')
        if deleted_files:
            RTCEventFile.objects.filter(id__in=deleted_files, event=instance).delete()

        # Handle new files
        files = request.FILES.getlist('files')
        for f in files:
            RTCEventFile.objects.create(event=instance, file=f)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Save instance with RTC
        rtc = RTCProfile.objects.filter(owner=request.user).first()
        if rtc:
            instance = serializer.save(rtc=rtc)
        else:
            instance = serializer.save()

        # Handle files
        self._handle_files(instance, request)

        # Re-serialize to include event_files
        output_serializer = self.get_serializer(instance)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        # Handle files
        self._handle_files(instance, request)

        # Re-serialize to include updated event_files
        output_serializer = self.get_serializer(instance)
        return Response(output_serializer.data)

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
