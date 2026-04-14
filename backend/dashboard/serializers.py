from rest_framework import serializers
from .models import RTCProfile, RTCResource, RTCEvent, RTCEventFile, RTCProject, GalleryImage, News, NewsImage


class RTCProfileImportItemSerializer(serializers.Serializer):
    """Payload for bulk RTC profile import (matches external JSON shape)."""

    name = serializers.CharField(max_length=255)
    host_country = serializers.CharField(max_length=100)
    address = serializers.CharField()
    director_name = serializers.CharField(max_length=255)
    director_email = serializers.EmailField()
    director_bio = serializers.CharField(allow_null=True, required=False, allow_blank=True)
    contact_person_name = serializers.CharField(max_length=255)
    contact_person_email = serializers.EmailField(allow_null=True, required=False)
    phone_number = serializers.CharField(max_length=50)
    establishment_year = serializers.IntegerField(allow_null=True, required=False, min_value=1)
    mission_statement = serializers.CharField(allow_null=True, required=False, allow_blank=True)
    overview_text = serializers.CharField(allow_null=True, required=False, allow_blank=True)
    specialization_areas = serializers.CharField(allow_null=True, required=False, allow_blank=True)


class RTCProfileBulkImportSerializer(serializers.Serializer):
    rtc_profiles = RTCProfileImportItemSerializer(many=True)

class RTCResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = RTCResource
        fields = '__all__'
        read_only_fields = ['rtc']

class RTCEventFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RTCEventFile
        fields = ['id', 'file', 'uploaded_at']

class RTCEventSerializer(serializers.ModelSerializer):
    event_files = RTCEventFileSerializer(many=True, read_only=True)

    class Meta:
        model = RTCEvent
        fields = '__all__'
        read_only_fields = ['rtc']


class RTCProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = RTCProject
        fields = '__all__'
        read_only_fields = ['rtc']

class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = '__all__'
        read_only_fields = ['rtc']


class NewsImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsImage
        fields = ['id', 'image', 'order']


class NewsSerializer(serializers.ModelSerializer):
    extra_images = NewsImageSerializer(many=True, read_only=True)
    rtc_name = serializers.CharField(source='rtc.name', read_only=True, allow_null=True)

    class Meta:
        model = News
        fields = [
            'id',
            'rtc',
            'rtc_name',
            'title',
            'slug',
            'summary',
            'content',
            'image',
            'extra_images',
            'order',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['rtc']

class RTCProfileListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = RTCProfile
        # Only essential fields for the list view
        fields = [
            'id', 'name', 'slug', 'host_country', 'logo', 
            'specialization_areas', 'mission_statement', 'overview_text', 'coordinates',
            'owner_username'
        ]

class RTCProfileDetailSerializer(serializers.ModelSerializer):
    resources = RTCResourceSerializer(many=True, read_only=True)
    events = RTCEventSerializer(many=True, read_only=True)
    projects = RTCProjectSerializer(many=True, read_only=True)
    gallery = GalleryImageSerializer(many=True, read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = RTCProfile
        fields = '__all__'
class NewsIntegrationSerializer(serializers.ModelSerializer):
    extra_images = NewsImageSerializer(many=True, read_only=True)

    class Meta:
        model = News
        fields = [
            'id',
            'title',
            'slug',
            'summary',
            'content',
            'image',
            'extra_images',
            'order',
            'created_at',
            'updated_at',
        ]
