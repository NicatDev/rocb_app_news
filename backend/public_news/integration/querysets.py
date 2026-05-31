"""Shared queryset helpers for main-site news integration APIs."""

from django.db.models import DateTimeField
from django.db.models.functions import Cast, Coalesce

from dashboard.models import News


def base_public_news_queryset():
    """PUBLIC news ordered for main-site integration lists."""
    return (
        News.objects.filter(status='PUBLIC')
        .select_related('rtc')
        .prefetch_related('extra_images', 'sections')
        .annotate(
            effective_published_at=Coalesce(
                Cast('news_date', DateTimeField()),
                'created_at',
            )
        )
        .order_by('order', '-effective_published_at')
    )
