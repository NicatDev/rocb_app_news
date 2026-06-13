from django.contrib import admin
from django.urls import path, include

from config.views_translate import TranslateHtmlView

admin.site.site_header = 'Rocb Europe Admin'
admin.site.site_title = 'Rocb Europe Admin'
admin.site.index_title = 'Rocb Europe Admin'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('ckeditor/', include('ckeditor_uploader.urls')),
    path('api/v1/', include('account.urls')),
    path('api/v1/dashboard/', include('dashboard.urls')),
    path('api/v1/admin/', include('rtc_admin.urls')),
    path('api/v1/public/', include('public_news.urls')),
    path('api/v1/feed/', include('feed.urls')),
    path('api/v1/rich-text/', include('config.urls_rich_text')),
    path('api/v1/translate/', TranslateHtmlView.as_view(), name='openai_translate'),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
