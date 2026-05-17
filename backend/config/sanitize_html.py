"""Server-side HTML cleanup for rich-text fields (CKEditor / API)."""

import re

import bleach
from bleach.css_sanitizer import CSSSanitizer
from django.conf import settings

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

_RICH_TEXT_CSS = CSSSanitizer(
    allowed_css_properties=[
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
    ],
)

_MEDIA_PREFIX = (getattr(settings, 'MEDIA_URL', '/media/') or '/media/').rstrip('/')
_MEDIA_HOST_PATTERN = re.compile(
    r'^https?://[^/]+' + re.escape(_MEDIA_PREFIX) + r'/',
    re.IGNORECASE,
)


def _is_allowed_img_src(value: str) -> bool:
    if not value:
        return False
    src = value.strip()
    if src.startswith(('http://', 'https://')):
        return bool(_MEDIA_HOST_PATTERN.match(src)) or '/media/' in src.lower()
    if src.startswith(_MEDIA_PREFIX + '/') or src.startswith('/media/'):
        return True
    if src.startswith('media/'):
        return True
    return False


def _img_attr_filter(tag, name, value):
    if name == 'src':
        return _is_allowed_img_src(value)
    return name in ('alt', 'title', 'width', 'height')


_ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'rel', 'target'],
    'img': _img_attr_filter,
    '*': ['class', 'style', 'align'],
}


def sanitize_rich_html(value: str) -> str:
    if not value:
        return ''
    return bleach.clean(
        str(value),
        tags=_ALLOWED_TAGS,
        attributes=_ALLOWED_ATTRIBUTES,
        css_sanitizer=_RICH_TEXT_CSS,
        strip=True,
    )
