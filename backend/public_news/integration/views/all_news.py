from public_news.integration.base import BaseIntegrationNewsListView
from public_news.integration.querysets import base_public_news_queryset


class AllNewsListView(BaseIntegrationNewsListView):
    """
    All PUBLIC news (global + RTC-linked).
    GET /api/v1/public/main-site/integration/news/all/
    """

    def integration_queryset(self):
        return base_public_news_queryset()
