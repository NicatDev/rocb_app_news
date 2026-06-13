from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .openai_translate import OpenAITranslateError, translate_html


class TranslateHtmlView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        html = request.data.get('html', '')
        source_lang = request.data.get('source_language', 'en')
        target_lang = request.data.get('target_language', 'ru')

        if not isinstance(html, str) or not html.strip():
            return Response({'detail': 'HTML content is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            translated = translate_html(html, source_lang, target_lang)
        except OpenAITranslateError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        return Response({'html': translated})
