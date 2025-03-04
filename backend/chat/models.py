from django.db import models
from django.contrib.auth.models import User


class Chat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    user_input = models.TextField()
    chat_response=models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)



