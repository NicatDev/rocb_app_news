import logging

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .openai_translate import OpenAITranslateError, probe_openai, translate_html

logger = logging.getLogger(__name__)


class TranslateHtmlView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        """Lightweight check — is translation configured on this server?"""
        api_key = getattr(settings, 'OPENAI_API_KEY', '') or ''

        if request.query_params.get('test') == '1':
            if not api_key:
                return Response(
                    {'openai': 'error', 'detail': 'OpenAI API key is not configured.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            try:
                probe_openai()
            except OpenAITranslateError as exc:
                return Response(
                    {'openai': 'error', 'detail': str(exc)},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            except Exception as exc:
                logger.exception('OpenAI probe failed')
                return Response(
                    {'openai': 'error', 'detail': f'Unexpected server error: {exc}'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            return Response({'openai': 'ok', 'model': getattr(settings, 'OPENAI_TRANSLATE_MODEL', 'gpt-4o-mini')})

        return Response({
            'configured': bool(api_key),
            'has_api_key': bool(api_key),
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
            translated = translate_html(html, source_lang, target_lang)
        except OpenAITranslateError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as exc:
            logger.exception('Translate endpoint failed')
            return Response(
                {'detail': f'Translation failed on server: {exc}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({'html': translated})
