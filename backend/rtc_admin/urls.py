from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RTCAdminViewSet,
    NewsAdminViewSet,
    EventsAdminViewSet,
    ResourcesAdminViewSet,
    ProjectsAdminViewSet,
    GalleryAdminViewSet
)

router = DefaultRouter()
router.register(r'my-rtc', RTCAdminViewSet, basename='my-rtc')
router.register(r'news', NewsAdminViewSet, basename='admin-news')
router.register(r'events', EventsAdminViewSet, basename='admin-events')
router.register(r'resources', ResourcesAdminViewSet, basename='admin-resources')
router.register(r'projects', ProjectsAdminViewSet, basename='admin-projects')
router.register(r'gallery', GalleryAdminViewSet, basename='admin-gallery')

urlpatterns = [
    path('', include(router.urls)),
]
