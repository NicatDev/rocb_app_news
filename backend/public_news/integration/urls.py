from django.urls import path

from .views import AllNewsListView, RegionNewsListView, RocbEuropeNewsListView

urlpatterns = [
    path('news/all/', AllNewsListView.as_view(), name='main-site-integration-news-all'),
    path(
        'news/rocb-europe/',
        RocbEuropeNewsListView.as_view(),
        name='main-site-integration-news-rocb-europe',
    ),
    path(
        'news/from-region/',
        RegionNewsListView.as_view(),
        name='main-site-integration-news-from-region',
    ),
]
