from django.urls import path
from . import views

from rest_framework_simplejwt.views import (
    # TokenObtainPairView,  # For obtaining access and refresh tokens
    # TokenRefreshView,  # For refreshing access tokens
    TokenVerifyView,  # For verifying tokens
)

from chat.views import CustomTokenObtainPairView, CustomTokenRefreshView, UserListView, UserDeleteView, AdminStatsView

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('chat/', views.ChatView.as_view(), name='chat'),
    # path('chat/<int:id>/', views.chat, name='chat'),
    path('chat/history/', views.ChatHistoryView.as_view(), name='history'),
    # path('chat/history/<int:id>/', views.history, name='history'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:user_id>/', UserDeleteView.as_view(), name='user_delete'),
    path('stats/', AdminStatsView.as_view(), name='admin_stats'),


    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

]

