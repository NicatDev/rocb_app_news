from public_news.integration.base import BaseIntegrationNewsListView
from public_news.integration.querysets import base_public_news_queryset


class RegionNewsListView(BaseIntegrationNewsListView):
    """
    PUBLIC news linked to an RTC profile (regional).
    GET /api/v1/public/main-site/integration/news/from-region/
    """

    def integration_queryset(self):
        return base_public_news_queryset().filter(rtc__isnull=False)
