from dotenv import load_dotenv
import os
load_dotenv()

from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Chat
import requests
import json

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import AccessToken

from django.utils import timezone
import logging
logger = logging.getLogger(__name__)

class RegisterView(APIView):
    def post(self, request):
        username=request.data.get('username')
        password=request.data.get('password')

        if not username or not password:
            return JsonResponse({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password)
        refresh = RefreshToken.for_user(user)
        return JsonResponse({'refresh': str(refresh), 'access': str(refresh.access_token)}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        username=request.data.get('username')
        password=request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                'refresh': str(refresh), 
                'access': str(refresh.access_token),
                'is_admin': user.is_superuser  # Add this to identify admin users
            }, status=status.HTTP_200_OK)
        return JsonResponse({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return JsonResponse({'success': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        access_token = AccessToken(response.data['access'])
        response.data['access_expires'] = access_token['exp']
        return response


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        access_token = AccessToken(response.data['access'])
        response.data['access_expires'] = access_token['exp']
        return response


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_input = request.data.get('user_input')
        if not user_input:
            return JsonResponse({'error': 'User input is required'}, status=400)

        formatted_prompt = (
            "You are a movie expert. Only identify film dialogues.\n"
            "If the dialogue is from a TV series or unknown, respond exactly with: 'Dialogue not found'.\n\n"
            f"Dialogue: \"{user_input}\"\nAnswer:"
        )

        openrouter_api_key = os.getenv('OPENROUTER_API_KEY')

        response = requests.post(
            url=os.getenv('OPENROUTER_API_URL'),
            headers={
                "Authorization": f"Bearer {openrouter_api_key}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "deepseek/deepseek-r1:free",
                "messages": [
                    {
                        "role": "user",
                        "content": formatted_prompt
                    }
                ]
            })
        )

        try:
            chat_response = response.json()['choices'][0]['message']['content'].strip()
            if not chat_response:
                return JsonResponse({'error': 'No response from the model'}, status=500)
        except (requests.exceptions.RequestException, KeyError) as e:
            return JsonResponse({'error': str(e)}, status=500)

        # Save to DB
        Chat.objects.create(user=request.user, user_input=user_input, chat_response=chat_response)

        if chat_response.strip().lower() == "dialogue not found":
            chat_response = (
                "Sorry, I couldn't identify this dialogue as part of any known film. "
                "It may belong to a TV series or is not widely recognized in film history."
            )

        return JsonResponse({'chat_response': chat_response}, status=200)


class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.query_params.get('user_id')
        
        # If user_id is provided and request.user is admin, return that user's history
        if user_id and request.user.is_superuser:
            try:
                user = User.objects.get(id=user_id)
                chat = Chat.objects.filter(user=user).values('user_input', 'chat_response', 'timestamp').order_by('-timestamp')
            except User.DoesNotExist:
                return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Otherwise return the current user's history
            chat = Chat.objects.filter(user=request.user).values('user_input', 'chat_response', 'timestamp').order_by('-timestamp')
            
        chat_history = [{'user_input': c['user_input'], 'chat_response': c['chat_response'], 'timestamp': c['timestamp']} for c in chat]
        return JsonResponse({'chat_history': chat_history}, status=status.HTTP_200_OK)




class UserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        try:
            # Ensure we're returning JSON by explicitly setting safe=False
            users = User.objects.all().values(
                'id', 
                'username', 
                'is_superuser', 
                'date_joined',
                'last_login',
                'is_active'
            )
            
            # Convert QuerySet to list and format dates
            users_list = []
            for user in users:
                users_list.append({
                    'id': user['id'],
                    'username': user['username'],
                    'is_admin': user['is_superuser'],
                    'is_active': user['is_active'],
                    'date_joined': user['date_joined'].isoformat() if user['date_joined'] else None,
                    'last_login': user['last_login'].isoformat() if user['last_login'] else None
                })
       
            return JsonResponse({
                'status': 'success',
                'users': users_list
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in UserListView: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'Failed to fetch users',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, user_id):
        try:
            user_to_delete = User.objects.get(id=user_id)
            
            # Prevent admin from deleting themselves
            if user_to_delete == request.user:
                return JsonResponse({'error': 'You cannot delete yourself'}, status=status.HTTP_400_BAD_REQUEST)
                
            user_to_delete.delete()
            return JsonResponse({'success': 'User deleted successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        

class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        today = timezone.now().date()
        active_today = User.objects.filter(last_login__date=today).count()
        total_chats = Chat.objects.count()
        
        return JsonResponse({
            'total_users': total_users,
            'active_today': active_today,
            'total_chats': total_chats
        }, status=status.HTTP_200_OK)