from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from django.db.models import Q
from dashboard.models import RTCProfile
from .models import RTCPost, RTCPostComment, RTCPostUpvote
from .serializers import RTCPostSerializer, RTCPostCommentSerializer


# ---------------------------------------------------------
# Pagination
# ---------------------------------------------------------
class FeedCursorPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


# ---------------------------------------------------------
# Filters
# ---------------------------------------------------------
class FeedFilter(django_filters.FilterSet):
    news_type = django_filters.CharFilter(method='filter_news_type')

    class Meta:
        model = RTCPost
        fields = ['news_type', 'status']

    def filter_news_type(self, queryset, name, value):
        if value == 'global':
            return queryset.filter(rtc__isnull=True)
        elif value == 'rtc':
            return queryset.filter(rtc__isnull=False)
        return queryset


# ---------------------------------------------------------
# ViewSets
# ---------------------------------------------------------
class FeedPostViewSet(viewsets.ModelViewSet):
    """
    Feed posts API. Only shows INTERNAL and PUBLIC posts (not PENDING).
    Supports search, filter by news_type (global/rtc), and load-more pagination.
    """
    serializer_class = RTCPostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = FeedCursorPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = FeedFilter
    search_fields = ['title', 'description', 'content']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return RTCPost.objects.exclude(status='PENDING').select_related('rtc', 'author')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_rtcs(self, request):
        """Return RTCs where the current user is owner or member."""
        rtcs = RTCProfile.objects.filter(
            Q(owner=request.user) | Q(members=request.user)
        ).distinct().order_by('order', 'name').values('id', 'name')
        return Response(list(rtcs))

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upvote(self, request, pk=None):
        """Toggle upvote on a post."""
        post = self.get_object()
        upvote, created = RTCPostUpvote.objects.get_or_create(post=post, user=request.user)
        if not created:
            upvote.delete()
            return Response({'status': 'removed', 'upvote_count': post.upvotes.count()})
        return Response({'status': 'added', 'upvote_count': post.upvotes.count()})

    @action(detail=True, methods=['get', 'post'], permission_classes=[IsAuthenticatedOrReadOnly])
    def comments(self, request, pk=None):
        """List or create comments for a post."""
        post = self.get_object()

        if request.method == 'GET':
            comments = RTCPostComment.objects.filter(post=post, parent__isnull=True).select_related('author')
            serializer = RTCPostCommentSerializer(comments, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            if not request.user.is_authenticated:
                return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
            serializer = RTCPostCommentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(author=request.user, post=post)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
