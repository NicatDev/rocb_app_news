from rest_framework import serializers
from dashboard.models import News


class PublicNewsSerializer(serializers.ModelSerializer):
    rtc_name = serializers.CharField(source='rtc.name', read_only=True, default=None)
    is_global = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = ['id', 'title', 'slug', 'content', 'image', 'rtc', 'rtc_name', 'is_global', 'created_at', 'status']

    def get_is_global(self, obj):
        return obj.rtc is None
