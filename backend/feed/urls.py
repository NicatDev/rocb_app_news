from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedPostViewSet

router = DefaultRouter()
router.register(r'posts', FeedPostViewSet, basename='feed-posts')

urlpatterns = [
    path('', include(router.urls)),
]
