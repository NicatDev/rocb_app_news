"""Authenticated image upload for CKEditor (React + django-ckeditor admin)."""

import os
import uuid

from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

_ALLOWED_CONTENT_TYPES = frozenset(
    {
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    }
)
_ALLOWED_EXTENSIONS = frozenset({'.jpg', '.jpeg', '.png', '.gif', '.webp'})
_MAX_BYTES = getattr(settings, 'RICH_TEXT_UPLOAD_MAX_BYTES', 5 * 1024 * 1024)


def _media_absolute_url(request, relative_path: str) -> str:
    """Build absolute URL for a file under MEDIA_ROOT (saved relative path)."""
    media_url = settings.MEDIA_URL
    if not media_url.endswith('/'):
        media_url += '/'
    path = relative_path.lstrip('/')
    return request.build_absolute_uri(f'{media_url}{path}')


class RichTextUploadView(APIView):
    """
  POST multipart field `upload` (CKEditor 5 default).
  Response: {"urls": {"default": "https://.../media/rich_text/..."}}
  """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded = request.FILES.get('upload')
        if not uploaded:
            return Response(
                {'error': {'message': 'No file uploaded.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if uploaded.size > _MAX_BYTES:
            return Response(
                {'error': {'message': 'File too large (max 5 MB).'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        content_type = (uploaded.content_type or '').lower()
        ext = os.path.splitext(uploaded.name or '')[1].lower()
        if content_type not in _ALLOWED_CONTENT_TYPES and ext not in _ALLOWED_EXTENSIONS:
            return Response(
                {'error': {'message': 'Only JPEG, PNG, GIF, and WebP images are allowed.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ext not in _ALLOWED_EXTENSIONS:
            ext = {
                'image/jpeg': '.jpg',
                'image/png': '.png',
                'image/gif': '.gif',
                'image/webp': '.webp',
            }.get(content_type, '.jpg')

        filename = f'rich_text/{uuid.uuid4().hex}{ext}'
        saved_path = default_storage.save(filename, uploaded)
        url = _media_absolute_url(request, saved_path)

        return Response({'urls': {'default': url}}, status=status.HTTP_201_CREATED)
