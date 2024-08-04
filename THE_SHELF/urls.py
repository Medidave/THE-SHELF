
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('', include('library.urls')),
    path('users/', include('library.urls')),

]

# Configure admin titles
admin.site.site_header = "THE_SHELF"
admin.site.site_title = "THE_SHELF"