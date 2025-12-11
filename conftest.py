import pytest
from rest_framework.test import APIClient
from apps.core.models import User
from apps.inventory.models import Concentrateur, Carton, Poste, Affectation, Etat

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user_magasin(db):
    return User.objects.create_user(
        username='magasin',
        password='password',
        profil='magasin'
    )

@pytest.fixture
def user_bo_commande(db):
    return User.objects.create_user(
        username='bo_commande',
        password='password',
        profil='bo_nord_commande'
    )

@pytest.fixture
def user_bo_terrain(db):
    return User.objects.create_user(
        username='bo_terrain',
        password='password',
        profil='bo_nord_terrain'
    )

@pytest.fixture
def user_labo(db):
    return User.objects.create_user(
        username='labo',
        password='password',
        profil='labo'
    )

@pytest.fixture
def carton_livraison(db):
    return Carton.objects.create(
        num_carton='CARTON001',
        operateur='Bouygues'
    )

@pytest.fixture
def concentrateur_livraison(db, carton_livraison):
    return Concentrateur.objects.create(
        n_serie='S12345',
        carton=carton_livraison,
        operateur='Bouygues',
        etat=Etat.EN_LIVRAISON
    )

@pytest.fixture
def poste_bo_nord(db):
    return Poste.objects.create(
        code='POSTE01',
        nom='Poste Test',
        base_operationnelle='BO Nord'
    )
