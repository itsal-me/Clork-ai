
from dotenv import load_dotenv
import os
load_dotenv()

from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
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
            return JsonResponse({'refresh': str(refresh), 'access': str(refresh.access_token)}, status=status.HTTP_200_OK)
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
        response = super().post(request, *args, **kwargs)  # Get the default token response
        access_token = AccessToken(response.data['access'])  # Decode the access token
        response.data['access_expires'] = access_token['exp']  # Add the expiration time
        return response

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)  # Get the default token response
        access_token = AccessToken(response.data['access'])  # Decode the new access token
        response.data['access_expires'] = access_token['exp']  # Add the expiration time
        return response


# class ChatView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         user_input = request.data.get('user_input')
#         if not user_input:
#             return JsonResponse({'error': 'User input is required'}, status=400)


#         openrouter_api_key = os.getenv('OPENROUTER_API_KEY')

#         response = requests.post(
#         url=os.getenv('OPENROUTER_API_URL'),
#         headers={
#             "Authorization": f"Bearer {openrouter_api_key}",
#             "Content-Type": "application/json",
#         },
#         data=json.dumps({
#             "model": "deepseek/deepseek-r1:free",
#             "messages": [
#             {
#                 "role": "user",
#                 "content": user_input
#             }
#             ],
            
#         })
#         )
        
#         try:

#             chat_response = response.json()['choices'][0]['message']['content']
            
#             if not chat_response:
#                 return JsonResponse({'error': 'No response from the model'}, status=500)

#         except requests.exceptions.RequestException as e:
   
#             return JsonResponse({'error': str(e)}, status=500)

#         Chat.objects.create(user=request.user, user_input=user_input, chat_response=chat_response)

#         return JsonResponse({'chat_response': chat_response}, status=status.HTTP_200_OK)

        
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
        chat = Chat.objects.filter(user=request.user).values('user_input', 'chat_response', 'timestamp').order_by('-timestamp')
        chat_history = [{'user_input': c['user_input'], 'chat_response': c['chat_response'], 'timestamp': c['timestamp']} for c in chat]
        return JsonResponse({'chat_history': chat_history}, status=status.HTTP_200_OK)
