"""OpenAI HTML translation helper (API key from OPENAI_API_KEY env only)."""
from __future__ import annotations

import json
import re
from typing import List

import requests
from django.conf import settings

LANG_NAMES = {
    'en': 'English',
    'ru': 'Russian',
    'az': 'Azerbaijani',
}

MAX_HTML_LENGTH = getattr(settings, 'OPENAI_TRANSLATE_MAX_HTML_LENGTH', 48000)
CHUNK_SIZE = getattr(settings, 'OPENAI_TRANSLATE_CHUNK_SIZE', 6000)
REQUEST_TIMEOUT = getattr(settings, 'OPENAI_TRANSLATE_TIMEOUT', 90)


class OpenAITranslateError(Exception):
    pass


def _language_label(code: str) -> str:
    return LANG_NAMES.get((code or '').lower(), code or 'English')


def _split_html(html: str, max_len: int = CHUNK_SIZE) -> List[str]:
    html = html or ''
    if len(html) <= max_len:
        return [html]

    chunks: List[str] = []
    start = 0
    while start < len(html):
        end = min(start + max_len, len(html))
        if end < len(html):
            split_at = html.rfind('</', start, end)
            if split_at > start + max_len // 3:
                end = split_at + html[split_at:].find('>') + 1
        chunks.append(html[start:end])
        start = end
    return chunks


def _call_openai(html: str, source_lang: str, target_lang: str) -> str:
    api_key = getattr(settings, 'OPENAI_API_KEY', '') or ''
    if not api_key:
        raise OpenAITranslateError('OpenAI API key is not configured.')

    model = getattr(settings, 'OPENAI_TRANSLATE_MODEL', 'gpt-4o-mini')
    source = _language_label(source_lang)
    target = _language_label(target_lang)

    payload = {
        'model': model,
        'temperature': 0.2,
        'messages': [
            {
                'role': 'system',
                'content': (
                    'You translate HTML for a public website. '
                    'Preserve every HTML tag, attribute, class, id, href, src, and structure exactly. '
                    'Translate only human-readable text nodes. '
                    'Do not add markdown fences or explanations. Return only translated HTML.'
                ),
            },
            {
                'role': 'user',
                'content': f'Translate from {source} to {target}:\n\n{html}',
            },
        ],
    }

    response = requests.post(
        'https://api.openai.com/v1/chat/completions',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        json=payload,
        timeout=REQUEST_TIMEOUT,
    )

    if response.status_code >= 400:
        detail = response.text[:500]
        raise OpenAITranslateError(f'OpenAI request failed ({response.status_code}): {detail}')

    data = response.json()
    try:
        content = data['choices'][0]['message']['content']
    except (KeyError, IndexError, TypeError) as exc:
        raise OpenAITranslateError('Unexpected OpenAI response format.') from exc

    content = content.strip()
    if content.startswith('```'):
        content = re.sub(r'^```(?:html)?\s*', '', content)
        content = re.sub(r'\s*```$', '', content)
    return content.strip()


def translate_html(html: str, source_lang: str, target_lang: str) -> str:
    html = html or ''
    if not html.strip():
        return html

    source_lang = (source_lang or 'en').lower()
    target_lang = (target_lang or 'en').lower()
    if source_lang == target_lang:
        return html

    if len(html) > MAX_HTML_LENGTH:
        raise OpenAITranslateError(f'HTML exceeds maximum length ({MAX_HTML_LENGTH} characters).')

    parts = _split_html(html)
    translated_parts = [_call_openai(part, source_lang, target_lang) for part in parts]
    return ''.join(translated_parts)
