from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.HomeRedirectView.as_view(), name='home'),
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    path('search/', views.SearchView.as_view(), name='search'),
    path('concentrateur/<str:n_serie>/', views.ConcentrateurDetailView.as_view(), name='concentrateur_detail'),
]
