from django.conf import settings
from rest_framework import serializers
from dashboard.models import News, RTCProfile
from dashboard.serializers import NewsImageSerializer, serialize_news_sections_ordered


class PublicNewsSerializer(serializers.ModelSerializer):
    rtc_name = serializers.CharField(source='rtc.name', read_only=True, default=None)
    is_global = serializers.SerializerMethodField()
    extra_images = NewsImageSerializer(many=True, read_only=True)
    sections = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'slug',
            'summary',
            'content',
            'image',
            'rtc',
            'rtc_name',
            'is_global',
            'extra_images',
            'sections',
            'order',
            'news_date',
            'created_at',
            'status',
        ]

    def get_is_global(self, obj):
        return obj.rtc is None

    def get_sections(self, obj):
        return serialize_news_sections_ordered(obj)


class MainSiteRTCProfileSerializer(serializers.ModelSerializer):
    """
    ROCB main site (rocbeurope.org) — RTC list with absolute image URLs and RTC app deep links.
    """

    logo = serializers.SerializerMethodField()
    flag_url = serializers.SerializerMethodField()
    detail_url = serializers.SerializerMethodField()

    class Meta:
        model = RTCProfile
        fields = ['id', 'name', 'slug', 'host_country', 'logo', 'flag_url', 'detail_url', 'order']

    def _absolute_media_url(self, file_field) -> str | None:
        if not file_field:
            return None
        url = file_field.url
        if str(url).startswith('http://') or str(url).startswith('https://'):
            return str(url)
        base = getattr(settings, 'APP_PUBLIC_ORIGIN', '').rstrip('/')
        path = url if str(url).startswith('/') else f'/{url}'
        return f'{base}{path}' if base else path

    def get_logo(self, obj):
        return self._absolute_media_url(obj.logo)

    def get_flag_url(self, obj):
        return self._absolute_media_url(obj.logo)

    def get_detail_url(self, obj):
        base = getattr(settings, 'RTC_PUBLIC_APP_BASE_URL', '').rstrip('/')
        if not base:
            return f'/rtc-dashboard/{obj.id}'
        return f'{base}/rtc-dashboard/{obj.id}'
