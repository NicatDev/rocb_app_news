from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('account.urls')),
    path('api/v1/dashboard/', include('dashboard.urls')),
    path('api/v1/admin/', include('rtc_admin.urls')),
    path('api/v1/public/', include('public_news.urls')),
    path('api/v1/feed/', include('feed.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
