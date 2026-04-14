from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils.text import slugify
from rest_framework import viewsets, filters, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import RTCProfile, RTCResource, RTCEvent, RTCProject, GalleryImage, News
from .serializers import (
    RTCProfileListSerializer,
    RTCProfileDetailSerializer,
    RTCResourceSerializer,
    RTCEventSerializer,
    RTCProjectSerializer,
    GalleryImageSerializer,
    NewsSerializer,
    NewsIntegrationSerializer,
    RTCProfileBulkImportSerializer,
)
from .filters import NewsFilter
from rest_framework.pagination import PageNumberPagination

User = get_user_model()
RTC_OWNER_DEFAULT_PASSWORD = "pass-123"

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 100

class RTCProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RTCProfile.objects.all().order_by('order', 'name')
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
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['rtc']
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['order', 'created_at', 'title']
    ordering = ['order', '-created_at']

    def get_queryset(self):
        return (
            News.objects.all()
            .select_related('rtc')
            .prefetch_related('extra_images')
            .order_by('order', '-created_at')
        )

class NewsIntegrationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = News.objects.filter(rtc__isnull=True, status='PUBLIC')
    serializer_class = NewsIntegrationSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = NewsFilter
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['order', 'created_at', 'title']
    ordering = ['order', '-created_at']

    def get_queryset(self):
        return (
            News.objects.filter(rtc__isnull=True, status='PUBLIC')
            .select_related('rtc')
            .prefetch_related('extra_images')
            .order_by('order', '-created_at')
        )


class RTCProfileBulkImportView(APIView):
    """
    POST JSON: { "rtc_profiles": [ { ... } ] }
    Hər element üçün: rtc_<host_country_slug> istifadəçisi (pass: pass-123) və ona bağlı RTCProfile.
    Yalnız admin.
    """

    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = RTCProfileBulkImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items = serializer.validated_data["rtc_profiles"]

        results = []
        errors = []

        for index, item in enumerate(items):
            username = f"rtc_{slugify(item['host_country'])}"
            try:
                with transaction.atomic():
                    user, user_created = User.objects.get_or_create(
                        username=username,
                        defaults={
                            "email": item["director_email"],
                            "is_active": True,
                        },
                    )
                    user.set_password(RTC_OWNER_DEFAULT_PASSWORD)
                    if not user.email:
                        user.email = item["director_email"]
                    user.save()

                    establishment = item.get("establishment_year")
                    if establishment is None:
                        establishment = 2000

                    defaults = {
                        "name": item["name"],
                        "host_country": item["host_country"],
                        "address": item["address"],
                        "director_name": item["director_name"],
                        "director_email": item["director_email"],
                        "director_bio": item.get("director_bio"),
                        "contact_person_name": item["contact_person_name"],
                        "contact_person_email": item.get("contact_person_email"),
                        "phone_number": item["phone_number"],
                        "establishment_year": establishment,
                        "mission_statement": item.get("mission_statement") or "",
                        "overview_text": item.get("overview_text") or "",
                        "specialization_areas": item.get("specialization_areas") or "",
                    }

                    profile, profile_created = RTCProfile.objects.update_or_create(
                        owner=user,
                        defaults=defaults,
                    )

                    results.append(
                        {
                            "index": index,
                            "username": username,
                            "user_created": user_created,
                            "profile_id": str(profile.id),
                            "profile_created": profile_created,
                        }
                    )
            except Exception as exc:
                errors.append({"index": index, "username": username, "error": str(exc)})

        return Response(
            {"results": results, "errors": errors},
            status=status.HTTP_200_OK,
        )

