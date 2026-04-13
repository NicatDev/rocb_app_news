from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicNewsViewSet,
    MainSiteGlobalNewsViewSet,
    MainSiteRTCProfileListView,
)

router = DefaultRouter()
router.register(r'news', PublicNewsViewSet, basename='public-news')
router.register(r'main-site/news', MainSiteGlobalNewsViewSet, basename='main-site-global-news')

urlpatterns = [
    path('main-site/rtc-profiles/', MainSiteRTCProfileListView.as_view(), name='main-site-rtc-profiles'),
    path('', include(router.urls)),
]
