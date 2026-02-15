from rest_framework import serializers
from .models import RTCPost, RTCPostComment, RTCPostUpvote


class CommentAuthorSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    avatar = serializers.ImageField(read_only=True)


class RTCPostCommentSerializer(serializers.ModelSerializer):
    author_info = CommentAuthorSerializer(source='author', read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = RTCPostComment
        fields = ['id', 'post', 'author', 'author_info', 'parent', 'content', 'reply_count', 'created_at', 'updated_at']
        read_only_fields = ['author', 'post', 'created_at', 'updated_at']

    def get_reply_count(self, obj):
        return obj.replies.count()


class RTCPostSerializer(serializers.ModelSerializer):
    author_info = CommentAuthorSerializer(source='author', read_only=True)
    rtc_name = serializers.CharField(source='rtc.name', read_only=True, default=None)
    is_global = serializers.SerializerMethodField()
    upvote_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_upvoted = serializers.SerializerMethodField()
    latest_comment = serializers.SerializerMethodField()

    class Meta:
        model = RTCPost
        fields = [
            'id', 'rtc', 'rtc_name', 'is_global', 'author', 'author_info',
            'title', 'description', 'content', 'image', 'attachment', 'status',
            'upvote_count', 'comment_count', 'is_upvoted', 'latest_comment',
            'created_at'
        ]
        read_only_fields = ['author', 'created_at']

    def get_is_global(self, obj):
        return obj.rtc is None

    def get_upvote_count(self, obj):
        return obj.upvotes.count()

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_is_upvoted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.upvotes.filter(user=request.user).exists()
        return False

    def get_latest_comment(self, obj):
        latest = obj.comments.order_by('-created_at').first()
        if latest:
            return RTCPostCommentSerializer(latest).data
        return None
