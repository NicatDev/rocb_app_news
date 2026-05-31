from public_news.integration.base import BaseIntegrationNewsListView
from public_news.integration.querysets import base_public_news_queryset


class RocbEuropeNewsListView(BaseIntegrationNewsListView):
    """
    PUBLIC news not linked to any RTC profile (ROCB Europe / global).
    GET /api/v1/public/main-site/integration/news/rocb-europe/
    """

    def integration_queryset(self):
        return base_public_news_queryset().filter(rtc__isnull=True)
