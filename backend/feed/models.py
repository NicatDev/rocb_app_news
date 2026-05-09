from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from dashboard.models import RTCProfile, VisibilityMixin, VisibilityStatus

# ---------------------------------------------------------
# 4. Collaborative News & Gallery
# ---------------------------------------------------------
class RTCPost(VisibilityMixin, models.Model):
    """
    Mənbə: [5-8, 15-24] - Collaborative Portal & [25] News Highlights.
    Bu model tək mənbə (Single Source of Truth) rolunu oynayır.
    Status sahəsi VisibilityMixin-dən gəlir.
    """
    rtc = models.ForeignKey(RTCProfile, on_delete=models.CASCADE, related_name='posts', null=True, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True) # [15]
    
    title = models.CharField(max_length=255, verbose_name="Headline") # [8]
    description = models.CharField(max_length=500, blank=True, verbose_name="Short Description")
    content = models.TextField(verbose_name="Body Text") # [8]
    
    # Attachments [8] - "Ability to attach images or PDFs"
    image = models.ImageField(upload_to='news_images/', blank=True, null=True)
    media = models.FileField(upload_to='post_media/', blank=True, null=True)
    attachment = models.FileField(upload_to='news_attachments/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True) # [17] - Reverse chronological order

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        from config.sanitize_html import sanitize_rich_html

        if self.content:
            self.content = sanitize_rich_html(self.content)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


# ---------------------------------------------------------
# 5. Engagement (Comments & Upvotes)
# ---------------------------------------------------------
class RTCPostComment(models.Model):
    """
    RTCPost üçün şərhlər. İç-içə şərhlər (threaded comments) dəstəklənir.
    """
    post = models.ForeignKey(RTCPost, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author} on {self.post}"


class RTCPostUpvote(models.Model):
    """
    RTCPost üçün bəyənmələr (Upvotes).
    """
    post = models.ForeignKey(RTCPost, on_delete=models.CASCADE, related_name='upvotes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user') # Bir istifadəçi bir postu yalnız bir dəfə bəyənə bilər

    def __str__(self):
        return f"Upvote by {self.user} on {self.post}"
