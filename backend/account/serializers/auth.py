from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from dashboard.models import RTCProfile

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'company', 'phone_number', 'field')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            company=validated_data.get('company', ''),
            phone_number=validated_data.get('phone_number', ''),
            field=validated_data.get('field', ''),
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['is_rtc_owner'] = hasattr(user, 'rtc_profile')
        
        return token


class UserRTCSerializer(serializers.ModelSerializer):
    class Meta:
        model = RTCProfile
        fields = ('id', 'name')


class ProfileSerializer(serializers.ModelSerializer):
    my_rtcs = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'avatar', 'company', 'phone_number', 'field',
            'date_joined', 'my_rtcs'
        )
        read_only_fields = ('id', 'username', 'date_joined', 'my_rtcs')

    def get_my_rtcs(self, obj):
        from django.db.models import Q
        rtcs = RTCProfile.objects.filter(
            Q(owner=obj) | Q(members=obj)
        ).distinct().order_by('order', 'name').only('id', 'name')
        return UserRTCSerializer(rtcs, many=True).data
