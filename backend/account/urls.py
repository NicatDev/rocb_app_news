from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from account.views.auth import RegisterView, CustomLoginView, ProfileView

urlpatterns = [
    path('auth/login/', CustomLoginView.as_view(), name='token_obtain_pair'),
    path('auth/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/profile/', ProfileView.as_view(), name='user_profile'),
]
