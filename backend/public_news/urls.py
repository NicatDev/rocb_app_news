from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicNewsViewSet

router = DefaultRouter()
router.register(r'news', PublicNewsViewSet, basename='public-news')

urlpatterns = [
    path('', include(router.urls)),
]
