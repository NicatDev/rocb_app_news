"""Server-side HTML cleanup for rich-text fields (CKEditor / API)."""

import re

import bleach
from django.conf import settings

try:
    from bleach.css_sanitizer import CSSSanitizer
except ImportError:  # bleach 6.x needs tinycss2 for inline styles
    CSSSanitizer = None  # type: ignore[misc, assignment]

_ALLOWED_TAGS = frozenset(
    [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'sub',
        'sup',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'a',
        'blockquote',
        'div',
        'span',
        'img',
        'figure',
        'figcaption',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
    ]
)

_RICH_TEXT_CSS_PROPERTIES = (
    'text-align',
    'margin',
    'margin-left',
    'margin-right',
    'margin-top',
    'margin-bottom',
    'padding',
    'padding-left',
    'padding-right',
    'width',
    'max-width',
    'height',
    'float',
    'display',
)


def _rich_text_css_sanitizer():
    if CSSSanitizer is None:
        return None
    return CSSSanitizer(allowed_css_properties=_RICH_TEXT_CSS_PROPERTIES)

_MEDIA_PREFIX = (getattr(settings, 'MEDIA_URL', '/media/') or '/media/').rstrip('/')
_MEDIA_HOST_PATTERN = re.compile(
    r'^https?://[^/]+' + re.escape(_MEDIA_PREFIX) + r'/',
    re.IGNORECASE,
)


def _is_allowed_img_src(value: str) -> bool:
    if not value:
        return False
    src = value.strip()
    if src.startswith('data:'):
        return False
    if src.startswith(('http://', 'https://')):
        return bool(_MEDIA_HOST_PATTERN.match(src)) or '/media/' in src.lower()
    if src.startswith(_MEDIA_PREFIX + '/') or src.startswith('/media/'):
        return True
    if src.startswith('media/'):
        return True
    if src.startswith('rich_text/'):
        return True
    return False


_ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'rel', 'target'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    '*': ['class', 'style', 'align'],
}

_IMG_SRC_RE = re.compile(
    r'(<img\b[^>]*\ssrc=)(["\'])([^"\']+)\2',
    re.IGNORECASE,
)


def canonical_media_path(url: str) -> str | None:
    """Normalize upload URLs to /media/... for storage and API output."""
    if not url or not str(url).strip():
        return None
    u = str(url).strip()
    if u.startswith('data:'):
        return None
    if u.startswith('rich_text/'):
        return f'{_MEDIA_PREFIX}/{u}'
    lower = u.lower()
    media_idx = lower.find('/media/')
    if media_idx >= 0:
        return u[media_idx:]
    if u.startswith(_MEDIA_PREFIX + '/'):
        return u
    if u.startswith('/media/'):
        return u
    if u.startswith('media/'):
        return '/' + u
    return None


def rewrite_html_media_urls(html: str, *, absolute: bool = False) -> str:
    """Rewrite <img src> to canonical /media/... or absolute APP_PUBLIC_ORIGIN URLs."""
    if not html:
        return ''

    origin = (getattr(settings, 'APP_PUBLIC_ORIGIN', '') or '').rstrip('/')

    def repl(match):
        prefix, quote, src = match.group(1), match.group(2), match.group(3)
        if not _is_allowed_img_src(src):
            return match.group(0)
        canon = canonical_media_path(src)
        if not canon:
            return match.group(0)
        new_src = f'{origin}{canon}' if absolute and origin else canon
        return f'{prefix}{quote}{new_src}{quote}'

    return _IMG_SRC_RE.sub(repl, str(html))


def sanitize_rich_html(value: str) -> str:
    if not value:
        return ''
    kwargs = {
        'tags': _ALLOWED_TAGS,
        'attributes': _ALLOWED_ATTRIBUTES,
        'strip': True,
    }
    css = _rich_text_css_sanitizer()
    if css is not None:
        kwargs['css_sanitizer'] = css
    cleaned = bleach.clean(str(value), **kwargs)
    return rewrite_html_media_urls(cleaned, absolute=False)
