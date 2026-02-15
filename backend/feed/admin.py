from django.contrib import admin
from .models import RTCPost, RTCPostComment, RTCPostUpvote

admin.site.register(RTCPost)
admin.site.register(RTCPostComment)
admin.site.register(RTCPostUpvote)
