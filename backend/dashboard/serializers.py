from rest_framework import serializers
from .models import RTCProfile, RTCResource, RTCEvent, RTCEventFile, RTCProject, GalleryImage, News

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

class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = '__all__'
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
    class Meta:
        model = News
        fields = ['id', 'title', 'slug', 'content', 'image', 'created_at', 'updated_at']
