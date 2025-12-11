from django.urls import path
from . import views

app_name = 'bo'

urlpatterns = [
    path('commande/', views.BOCommandeView.as_view(), name='commande'),
    path('terrain/', views.BOTerrainView.as_view(), name='terrain'),
]
