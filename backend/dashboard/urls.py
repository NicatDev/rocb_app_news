from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RTCProfileViewSet, RTCResourceViewSet, RTCEventViewSet, RTCProjectViewSet, RTCGalleryViewSet, NewsViewSet

router = DefaultRouter()
router.register(r'rtc-profiles', RTCProfileViewSet)
router.register(r'rtc-resources', RTCResourceViewSet)
router.register(r'rtc-events', RTCEventViewSet)
router.register(r'rtc-projects', RTCProjectViewSet)
router.register(r'rtc-gallery', RTCGalleryViewSet)
router.register(r'news', NewsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
