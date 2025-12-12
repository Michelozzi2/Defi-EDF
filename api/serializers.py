"""
DRF Serializers for all models.
"""
from rest_framework import serializers

from apps.core.models import User, Profil
from apps.inventory.models import Concentrateur, Carton, Poste, Etat, Affectation
from apps.tracking.models import Historique


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    base_operationnelle = serializers.CharField(read_only=True)
    profil_display = serializers.CharField(source='get_profil_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'profil', 'profil_display', 'base_operationnelle'
        ]


class PosteSerializer(serializers.ModelSerializer):
    """Serializer for Poste model."""
    class Meta:
        model = Poste
        fields = ['id', 'code', 'nom', 'base_operationnelle', 'actif']


class CartonSerializer(serializers.ModelSerializer):
    """Serializer for Carton model."""
    nb_concentrateurs = serializers.IntegerField(source='concentrateurs_count', read_only=True)
    
    class Meta:
        model = Carton
        fields = ['id', 'num_carton', 'operateur', 'nb_concentrateurs', 'created_at']


class ConcentrateurListSerializer(serializers.ModelSerializer):
    """Serializer for Concentrateur list view (minimal fields)."""
    etat_display = serializers.CharField(source='get_etat_display', read_only=True)
    carton = serializers.CharField(source='carton.num_carton', read_only=True, allow_null=True)
    poste_code = serializers.CharField(source='poste_pose.code', read_only=True, allow_null=True)
    
    class Meta:
        model = Concentrateur
        fields = [
            'id', 'n_serie', 'operateur', 'etat', 'etat_display',
            'affectation', 'carton', 'poste_code', 'date_dernier_etat'
        ]


class ConcentrateurDetailSerializer(serializers.ModelSerializer):
    """Serializer for Concentrateur detail view (all fields)."""
    etat_display = serializers.CharField(source='get_etat_display', read_only=True)
    carton = CartonSerializer(read_only=True)
    poste_pose = PosteSerializer(read_only=True)
    
    class Meta:
        model = Concentrateur
        fields = [
            'id', 'n_serie', 'operateur', 'etat', 'etat_display',
            'affectation', 'carton', 'poste_pose',
            'date_affectation', 'date_pose', 'date_dernier_etat',
            'created_at', 'updated_at'
        ]


class HistoriqueSerializer(serializers.ModelSerializer):
    """Serializer for Historique (audit trail)."""
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True, allow_null=True)
    concentrateur = serializers.CharField(source='concentrateur.n_serie', read_only=True)
    
    class Meta:
        model = Historique
        fields = [
            'id', 'action', 'action_display', 'user_name', 'concentrateur',
            'ancien_etat', 'nouvel_etat',
            'ancienne_affectation', 'nouvelle_affectation',
            'poste', 'commentaire', 'timestamp'
        ]


# === Action Serializers (for POST requests) ===

class ReceptionSerializer(serializers.Serializer):
    """Input serializer for carton reception action."""
    num_carton = serializers.CharField(max_length=50)


class CommandeSerializer(serializers.Serializer):
    """Input serializer for carton order action."""
    operateur = serializers.CharField(max_length=100)
    nb_cartons = serializers.IntegerField(min_value=1, max_value=100)


class PoseSerializer(serializers.Serializer):
    """Input serializer for concentrator pose action."""
    n_serie = serializers.CharField(max_length=50)
    poste_id = serializers.IntegerField()


class DeposeSerializer(serializers.Serializer):
    """Input serializer for concentrator depose action."""
    poste_id = serializers.IntegerField()
    n_serie = serializers.CharField(max_length=50)


class TestSerializer(serializers.Serializer):
    """Input serializer for concentrator test action."""
    n_serie = serializers.CharField(max_length=50)
    resultat_ok = serializers.BooleanField()


# === Dashboard Serializers ===

class StockStatsSerializer(serializers.Serializer):
    """Serializer for stock statistics."""
    total = serializers.IntegerField()
    by_etat = serializers.DictField()
    by_affectation = serializers.DictField()
