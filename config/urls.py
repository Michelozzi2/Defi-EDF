"""
URL configuration for EDF Tracker project.
"""
from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Authentication
    path('login/', auth_views.LoginView.as_view(template_name='pages/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    
    # API
    path('api/v1/', include('api.urls')),
    
    # Frontend views
    path('', include('apps.dashboard.urls')),
    path('magasin/', include('apps.inventory.urls_magasin')),
    path('bo/', include('apps.inventory.urls_bo')),
    path('labo/', include('apps.tracking.urls')),
]
