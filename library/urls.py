from django.urls import path 
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login', views.log_in, name='login'),
    path('signup', views.sign_up, name='signup'),
    path('logout', views.log_out, name='logout'),
    path('book', views.read, name='book'),
    path('createMessage/<str:pk>/', views.createMessage, name='createMessage'),

]
