from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from django.conf import settings

from .openai_translate import OpenAITranslateError, translate_html


class TranslateHtmlView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        """Lightweight check — is translation configured on this server?"""
        api_key = getattr(settings, 'OPENAI_API_KEY', '') or ''
        try:
            import requests  # noqa: F401
            has_requests = True
        except ImportError:
            has_requests = False
        return Response({
            'configured': bool(api_key) and has_requests,
            'has_api_key': bool(api_key),
            'has_requests': has_requests,
            'model': getattr(settings, 'OPENAI_TRANSLATE_MODEL', 'gpt-4o-mini'),
        })

    def post(self, request):
        html = request.data.get('html', '')
        source_lang = request.data.get('source_language', 'en')
        target_lang = request.data.get('target_language', 'ru')

        if not isinstance(html, str) or not html.strip():
            return Response({'detail': 'HTML content is required.'}, status=status.HTTP_400_BAD_REQUEST)

        api_key = getattr(settings, 'OPENAI_API_KEY', '') or ''
        if not api_key:
            return Response(
                {'detail': 'OpenAI API key is not configured on the server (set OPENAI_API_KEY in backend/.env).'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            import requests  # noqa: F401
        except ImportError:
            return Response(
                {'detail': 'Python requests package is missing on the server. Run: pip install requests'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            translated = translate_html(html, source_lang, target_lang)
        except OpenAITranslateError as exc:
            message = str(exc)
            if 'API key' in message or 'not configured' in message:
                code = status.HTTP_503_SERVICE_UNAVAILABLE
            else:
                code = status.HTTP_502_BAD_GATEWAY
            return Response({'detail': message}, status=code)

        return Response({'html': translated})
