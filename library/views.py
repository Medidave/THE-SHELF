from django.shortcuts import render
from django.contrib.auth import logout

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
    
    return render(request, 'library/book_read.html')


