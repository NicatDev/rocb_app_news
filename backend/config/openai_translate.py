"""OpenAI HTML translation helper (API key from OPENAI_API_KEY env only)."""
from __future__ import annotations

import json
import re
import ssl
import urllib.error
import urllib.request
from typing import List

from django.conf import settings

LANG_NAMES = {
    'en': 'English',
    'ru': 'Russian',
    'az': 'Azerbaijani',
}

MAX_HTML_LENGTH = getattr(settings, 'OPENAI_TRANSLATE_MAX_HTML_LENGTH', 48000)
CHUNK_SIZE = getattr(settings, 'OPENAI_TRANSLATE_CHUNK_SIZE', 6000)
REQUEST_TIMEOUT = getattr(settings, 'OPENAI_TRANSLATE_TIMEOUT', 45)
OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions'


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


def _openai_chat(payload: dict, api_key: str, timeout: int = REQUEST_TIMEOUT) -> dict:
    """Call OpenAI chat/completions using stdlib urllib (same SSL stack as curl)."""
    body = json.dumps(payload).encode('utf-8')
    request = urllib.request.Request(
        OPENAI_CHAT_URL,
        data=body,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    context = ssl.create_default_context()

    try:
        with urllib.request.urlopen(request, timeout=timeout, context=context) as response:
            raw = response.read().decode('utf-8')
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode('utf-8', errors='replace')
        try:
            data = json.loads(raw)
            err_msg = data.get('error', {}).get('message') if isinstance(data, dict) else ''
        except (json.JSONDecodeError, ValueError):
            err_msg = raw[:500]
        if not err_msg:
            err_msg = raw[:500] or str(exc)
        if exc.code == 429:
            raise OpenAITranslateError(
                'OpenAI quota exceeded. Add billing/credits at platform.openai.com and try again.'
            ) from exc
        raise OpenAITranslateError(f'OpenAI request failed ({exc.code}): {err_msg}') from exc
    except urllib.error.URLError as exc:
        raise OpenAITranslateError(f'Could not reach OpenAI: {exc.reason}') from exc
    except TimeoutError as exc:
        raise OpenAITranslateError('OpenAI request timed out. Try again or reduce page size.') from exc

    try:
        return json.loads(raw)
    except (json.JSONDecodeError, ValueError) as exc:
        raise OpenAITranslateError(f'Invalid OpenAI response: {raw[:500]}') from exc


def _extract_content(data: dict) -> str:
    try:
        content = data['choices'][0]['message']['content']
    except (KeyError, IndexError, TypeError) as exc:
        raise OpenAITranslateError('Unexpected OpenAI response format.') from exc

    content = (content or '').strip()
    if content.startswith('```'):
        content = re.sub(r'^```(?:html)?\s*', '', content)
        content = re.sub(r'\s*```$', '', content)
    return content.strip()


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

    data = _openai_chat(payload, api_key)
    return _extract_content(data)


def probe_openai() -> None:
    """Minimal OpenAI call to verify key and outbound HTTPS from the server."""
    api_key = getattr(settings, 'OPENAI_API_KEY', '') or ''
    if not api_key:
        raise OpenAITranslateError('OpenAI API key is not configured.')

    model = getattr(settings, 'OPENAI_TRANSLATE_MODEL', 'gpt-4o-mini')
    payload = {
        'model': model,
        'max_tokens': 5,
        'messages': [{'role': 'user', 'content': 'Reply with ok'}],
    }
    _openai_chat(payload, api_key, timeout=30)


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
