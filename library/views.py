from django.shortcuts import render
from django.contrib.auth import logout
from django.http import JsonResponse
from .models import *

# Create your views here.
def home(request):
    
    
    return render(request, 'library/home.html')

def log_in(request):
    
    
    return render(request, 'account/login.html')

def sign_up(request):
    
    
    return render(request, 'account/signup.html')


def log_out(request):
    logout(request)
    
    return render(request, 'account/login.html')

def read(request):
    messages = Message.objects.all()
    
    context = {
        'messages': messages,
    }
    
    return render(request, 'library/book_read.html', context)



def createMessage(request, pk):
    if request.method == 'POST':
        message = request.POST.get('message')
        # print(message)
        # print("\n\n\n")
    Message.objects.create(
        user=request.user,
        message=message
    )
    
    json_message = []
    messages = Message.objects.all()
    for message in messages:
        if message.user.last_name == request.user.last_name:
            is_user = True
        else:
            is_user = False
            
        json_message.append(
            {
                'user_name': message.user.first_name + " " + message.user.last_name,
                'message': message.message,
                'created': message.created,
                'is_user': is_user,
            }
        )
    
    print(message)
    
    return JsonResponse({'status': 'success', 'message': 'Project usstared', 'json_message': json_message})
