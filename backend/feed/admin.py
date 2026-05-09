from django.contrib import admin

from .forms_admin import RTCPostAdminForm
from .models import RTCPost, RTCPostComment, RTCPostUpvote


@admin.register(RTCPost)
class RTCPostAdmin(admin.ModelAdmin):
    form = RTCPostAdminForm
    list_display = ('title', 'rtc', 'author', 'status', 'created_at')
    list_filter = ('status', 'rtc')
    search_fields = ('title', 'description', 'content')
    readonly_fields = ('created_at',)


admin.site.register(RTCPostComment)
admin.site.register(RTCPostUpvote)
