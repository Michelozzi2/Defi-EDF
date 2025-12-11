"""
DRF ViewSets and APIViews for all endpoints.
"""
import logging

from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie

from apps.core.models import User
from apps.inventory.models import Concentrateur, Carton, Poste, Etat, Affectation
from apps.tracking.models import Historique
from services.business_logic import ConcentrateurService, TransitionError, PermissionError

from .serializers import (
    UserSerializer, ConcentrateurListSerializer, ConcentrateurDetailSerializer,
    CartonSerializer, PosteSerializer, HistoriqueSerializer,
    ReceptionSerializer, CommandeSerializer, PoseSerializer, DeposeSerializer, TestSerializer
)
from .permissions import IsMagasin, IsBOCommande, IsBOTerrain, IsLabo

logger = logging.getLogger(__name__)


# === Auth Views ===

@method_decorator(ensure_csrf_cookie, name='dispatch')
class LoginAPIView(APIView):
    """
    Login endpoint that returns JSON and sets session cookie.
    Needs ensure_csrf_cookie to bootstrap the CSRF token for the SPA.
    """
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Identifiants invalides'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutAPIView(APIView):
    """Logout endpoint."""
    permission_classes = []

    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    """
    Public endpoint to fetch a CSRF token.
    Call this on Login page mount to ensure the cookie is set.
    """
    permission_classes = []
    
    def get(self, request):
        return Response({'detail': 'CSRF cookie set'})


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CurrentUserView(APIView):
    """Get current authenticated user profile."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# === Model ViewSets ===

class ConcentrateurViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Concentrateur.
    
    list: GET /api/v1/concentrateurs/
    retrieve: GET /api/v1/concentrateurs/{n_serie}/
    historique: GET /api/v1/concentrateurs/{n_serie}/historique/
    """
    permission_classes = [IsAuthenticated]
    # pagination_class = None  # Re-enabled pagination via settings.py default
    lookup_field = 'n_serie'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['etat', 'affectation', 'operateur', 'poste_pose']
    search_fields = ['n_serie', 'carton__num_carton']
    ordering_fields = ['n_serie', 'date_dernier_etat', 'created_at']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        return Concentrateur.objects.select_related('carton', 'poste_pose').all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConcentrateurDetailSerializer
        return ConcentrateurListSerializer
    
    @action(detail=True, methods=['get'])
    def historique(self, request, n_serie=None):
        """Get history for a specific concentrator."""
        concentrateur = self.get_object()
        historique = concentrateur.historique.select_related('user').all()[:50]
        serializer = HistoriqueSerializer(historique, many=True)
        return Response(serializer.data)


class CartonViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Carton."""
    permission_classes = [IsAuthenticated]
    serializer_class = CartonSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['operateur']
    search_fields = ['num_carton']
    
    def get_queryset(self):
        return Carton.objects.annotate(
            concentrateurs_count=Count('concentrateurs')
        ).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """Get cartons available for ordering (in Magasin, en_stock)."""
        operateur = request.query_params.get('operateur')
        
        queryset = Carton.objects.filter(
            concentrateurs__affectation=Affectation.MAGASIN,
            concentrateurs__etat=Etat.EN_STOCK
        ).distinct()
        
        if operateur:
            queryset = queryset.filter(operateur=operateur)
        
        queryset = queryset.annotate(
            concentrateurs_count=Count('concentrateurs')
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def en_livraison(self, request):
        """Get cartons with concentrateurs currently in delivery (en_livraison state)."""
        queryset = Carton.objects.filter(
            concentrateurs__etat=Etat.EN_LIVRAISON
        ).distinct().annotate(
            concentrateurs_count=Count('concentrateurs', filter=Q(concentrateurs__etat=Etat.EN_LIVRAISON))
        ).order_by('-created_at')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PosteViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Poste."""
    permission_classes = [IsAuthenticated]
    serializer_class = PosteSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['base_operationnelle', 'actif']
    search_fields = ['code', 'nom']
    
    def get_queryset(self):
        queryset = Poste.objects.filter(actif=True)
        
        # Auto-filter by user's BO if they have one
        user = self.request.user
        if user.base_operationnelle:
            queryset = queryset.filter(base_operationnelle=user.base_operationnelle)
        
        return queryset.order_by('code')


# === Action Views ===

class ReceptionView(APIView):
    """Magasin: receive a carton."""
    permission_classes = [IsMagasin]
    
    def post(self, request):
        serializer = ReceptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = ConcentrateurService.reception_carton(
                num_carton=serializer.validated_data['num_carton'],
                user=request.user
            )
            return Response(result, status=status.HTTP_200_OK)
        except (TransitionError, PermissionError) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CommandeView(APIView):
    """BO Commande: order cartons."""
    permission_classes = [IsBOCommande]
    
    def post(self, request):
        serializer = CommandeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = ConcentrateurService.commander_cartons(
                operateur=serializer.validated_data['operateur'],
                nb_cartons=serializer.validated_data['nb_cartons'],
                user=request.user
            )
            return Response(result, status=status.HTTP_200_OK)
        except (TransitionError, PermissionError) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PoseView(APIView):
    """BO Terrain: pose a concentrator on a poste."""
    permission_classes = [IsBOTerrain]
    
    def post(self, request):
        serializer = PoseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = ConcentrateurService.poser_concentrateur(
                n_serie=serializer.validated_data['n_serie'],
                poste_id=serializer.validated_data['poste_id'],
                user=request.user
            )
            return Response(result, status=status.HTTP_200_OK)
        except (TransitionError, PermissionError) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DeposeView(APIView):
    """BO Terrain: depose a concentrator from a poste."""
    permission_classes = [IsBOTerrain]
    
    def post(self, request):
        serializer = DeposeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = ConcentrateurService.deposer_concentrateur(
                poste_id=serializer.validated_data['poste_id'],
                n_serie=serializer.validated_data['n_serie'],
                user=request.user
            )
            return Response(result, status=status.HTTP_200_OK)
        except (TransitionError, PermissionError) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class TestView(APIView):
    """Labo: test a concentrator."""
    permission_classes = [IsLabo]
    
    def post(self, request):
        serializer = TestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = ConcentrateurService.tester_concentrateur(
                n_serie=serializer.validated_data['n_serie'],
                resultat_ok=serializer.validated_data['resultat_ok'],
                user=request.user
            )
            return Response(result, status=status.HTTP_200_OK)
        except (TransitionError, PermissionError) as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# === Dashboard Views ===

class StockStatsView(APIView):
    """Get stock statistics for dashboard."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Total count
        total = Concentrateur.objects.count()
        
        # By état
        by_etat_qs = Concentrateur.objects.values('etat').annotate(count=Count('id'))
        by_etat = {item['etat']: item['count'] for item in by_etat_qs}
        
        # By affectation
        by_affectation_qs = Concentrateur.objects.exclude(
            affectation=''
        ).values('affectation').annotate(count=Count('id'))
        by_affectation = {item['affectation']: item['count'] for item in by_affectation_qs}
        
        return Response({
            'total': total,
            'by_etat': by_etat,
            'by_affectation': by_affectation
        })
