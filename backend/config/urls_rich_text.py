from django.urls import path

from .rich_text_upload import RichTextUploadView

urlpatterns = [
    path('upload/', RichTextUploadView.as_view(), name='rich-text-upload'),
]
