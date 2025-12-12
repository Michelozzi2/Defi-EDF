import pytest
from apps.inventory.models import Etat, Affectation, Concentrateur
from services.business_logic import ConcentrateurService, TransitionError, PermissionError

@pytest.mark.django_db
class TestConcentrateurService:
    
    # === RECEPTION ===
    def test_reception_carton_success(self, user_magasin, carton_livraison, concentrateur_livraison):
        """Test réception normale d'un carton."""
        result = ConcentrateurService.reception_carton(carton_livraison.num_carton, user_magasin)
        
        concentrateur_livraison.refresh_from_db()
        
        assert result['nb_recus'] == 1
        assert concentrateur_livraison.etat == Etat.EN_STOCK
        assert concentrateur_livraison.affectation == Affectation.MAGASIN
        
        # Verify history
        assert concentrateur_livraison.historique.count() == 1
        assert concentrateur_livraison.historique.first().action == 'reception'

    def test_reception_permission_denied(self, user_bo_commande, carton_livraison):
        """Un BO ne peut pas réceptionner."""
        with pytest.raises(PermissionError):
            ConcentrateurService.reception_carton(carton_livraison.num_carton, user_bo_commande)

    # === COMMANDE ===
    def test_commande_cartons_success(self, user_bo_commande, carton_livraison, concentrateur_livraison):
        """Test commande de matériel par un BO."""
        # Setup: mettre en stock d'abord
        concentrateur_livraison.etat = Etat.EN_STOCK
        concentrateur_livraison.affectation = Affectation.MAGASIN
        concentrateur_livraison.save()
        
        # Il faut 4 K dispo par carton pour commander (règle métier business_logic.py:125)
        # On va créer 3 autres K pour le test
        for i in range(3):
            Concentrateur.objects.create(
                n_serie=f'S-SUP-{i}',
                carton=carton_livraison,
                operateur='Bouygues',
                etat=Etat.EN_STOCK,
                affectation=Affectation.MAGASIN
            )
            
        result = ConcentrateurService.commander_cartons('Bouygues', 1, user_bo_commande)
        
        assert result['total_k'] == 4
        concentrateur_livraison.refresh_from_db()
        assert concentrateur_livraison.affectation == 'BO Nord'
        assert concentrateur_livraison.historique.last().action == 'commande_bo'

    # === POSE ===
    def test_pose_success(self, user_bo_terrain, concentrateur_livraison, poste_bo_nord):
        """Test pose d'un concentrateur."""
        # Setup: K en stock au BO
        concentrateur_livraison.etat = Etat.EN_STOCK
        concentrateur_livraison.affectation = 'BO Nord'
        concentrateur_livraison.save()
        
        result = ConcentrateurService.poser_concentrateur(
            concentrateur_livraison.n_serie,
            poste_bo_nord.id,
            user_bo_terrain
        )
        
        concentrateur_livraison.refresh_from_db()
        assert concentrateur_livraison.etat == Etat.POSE
        assert concentrateur_livraison.poste_pose == poste_bo_nord
        assert result['etat'] == 'pose'

    def test_pose_wrong_bo(self, user_bo_terrain, concentrateur_livraison, poste_bo_nord):
        """Impossible de poser si le K n'est pas affecté au BO."""
        concentrateur_livraison.etat = Etat.EN_STOCK
        concentrateur_livraison.affectation = 'BO Sud' # Wrong BO
        concentrateur_livraison.save()
        
        with pytest.raises(TransitionError) as exc:
            ConcentrateurService.poser_concentrateur(
                concentrateur_livraison.n_serie,
                poste_bo_nord.id,
                user_bo_terrain
            )
        assert "pas affecté à BO Nord" in str(exc.value)

    # === DEPOSE ===
    def test_depose_success(self, user_bo_terrain, concentrateur_livraison, poste_bo_nord):
        """Test dépose et envoi au labo."""
        # Setup: K posé
        concentrateur_livraison.etat = Etat.POSE
        concentrateur_livraison.affectation = 'BO Nord'
        concentrateur_livraison.poste_pose = poste_bo_nord
        concentrateur_livraison.save()
        
        result = ConcentrateurService.deposer_concentrateur(
            poste_bo_nord.id,
            concentrateur_livraison.n_serie,
            user_bo_terrain
        )
        
        concentrateur_livraison.refresh_from_db()
        assert concentrateur_livraison.etat == Etat.A_TESTER
        assert concentrateur_livraison.affectation == Affectation.LABO
        assert concentrateur_livraison.poste_pose is None

    # === LABO ===
    def test_labo_test_ok(self, user_labo, concentrateur_livraison):
        """Test labo OK."""
        # Setup: A tester
        concentrateur_livraison.etat = Etat.A_TESTER
        concentrateur_livraison.affectation = Affectation.LABO
        concentrateur_livraison.save()
        
        result = ConcentrateurService.tester_concentrateur(
            concentrateur_livraison.n_serie,
            True, # OK
            user_labo
        )
        
        concentrateur_livraison.refresh_from_db()
        assert concentrateur_livraison.etat == Etat.EN_ATTENTE_RECONDITIONNEMENT
        assert concentrateur_livraison.affectation == Affectation.MAGASIN
        assert concentrateur_livraison.carton is None # Détaché
