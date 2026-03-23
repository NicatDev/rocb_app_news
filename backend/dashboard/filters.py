import django_filters
from .models import News

class NewsFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name="created_at", lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name="created_at", lookup_expr='lte')

    class Meta:
        model = News
        fields = ['date_from', 'date_to']
