"""
API URL routing.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CurrentUserView,
    ConcentrateurViewSet, CartonViewSet, PosteViewSet,
    ReceptionView, CommandeView, PoseView, DeposeView, TestView,
    StockStatsView
)

router = DefaultRouter()
router.register(r'concentrateurs', ConcentrateurViewSet, basename='concentrateur')
router.register(r'cartons', CartonViewSet, basename='carton')
router.register(r'postes', PosteViewSet, basename='poste')

urlpatterns = [
    # Auth
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    
    # Model endpoints (via router)
    path('', include(router.urls)),
    
    # Action endpoints
    path('actions/reception/', ReceptionView.as_view(), name='action-reception'),
    path('actions/commande/', CommandeView.as_view(), name='action-commande'),
    path('actions/pose/', PoseView.as_view(), name='action-pose'),
    path('actions/depose/', DeposeView.as_view(), name='action-depose'),
    path('actions/test/', TestView.as_view(), name='action-test'),
    
    # Dashboard
    path('dashboard/stocks/', StockStatsView.as_view(), name='dashboard-stocks'),
]
