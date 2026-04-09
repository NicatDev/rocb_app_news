from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicNewsViewSet, MainSiteGlobalNewsViewSet

router = DefaultRouter()
router.register(r'news', PublicNewsViewSet, basename='public-news')
router.register(r'main-site/news', MainSiteGlobalNewsViewSet, basename='main-site-global-news')

urlpatterns = [
    path('', include(router.urls)),
]
