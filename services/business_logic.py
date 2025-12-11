"""
Business logic for concentrator state transitions.

All state changes must go through this service to ensure:
1. Proper permission checks
2. Atomic transactions
3. Audit trail creation
"""
import logging
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.inventory.models import Concentrateur, Carton, Poste, Etat, Affectation
from apps.tracking.models import Historique, ActionType
from apps.core.models import User

logger = logging.getLogger(__name__)


class TransitionError(Exception):
    """Raised when a state transition is not allowed."""
    pass


class PermissionError(Exception):
    """Raised when user doesn't have permission for an action."""
    pass


class ConcentrateurService:
    """
    Gestion des transitions d'état selon profil utilisateur.
    Chaque action métier encapsule validation + transition + audit.
    """
    
    # === PROFIL MAGASIN ===
    @classmethod
    @transaction.atomic
    def reception_carton(cls, num_carton: str, user: User) -> dict[str, Any]:
        """
        Magasin: réceptionne un carton, passe tous les K de en_livraison à en_stock.
        
        Args:
            num_carton: Carton number to receive
            user: User performing the action (must be 'magasin' profile)
            
        Returns:
            Dict with carton number, count of received K, and list of n_serie
            
        Raises:
            PermissionError: If user is not 'magasin' profile
        """
        if not user.is_magasin:
            raise PermissionError("Action réservée au profil Magasin")
        
        concentrateurs = Concentrateur.objects.filter(
            carton__num_carton=num_carton,
            etat=Etat.EN_LIVRAISON
        ).select_for_update()
        
        if not concentrateurs.exists():
            raise TransitionError(f"Aucun concentrateur en livraison trouvé pour le carton {num_carton}")
        
        updated = []
        for k in concentrateurs:
            ancien_etat = k.etat
            ancienne_affectation = k.affectation
            k.etat = Etat.EN_STOCK
            k.affectation = Affectation.MAGASIN
            k.save()
            
            cls._create_historique(
                k, user, ActionType.RECEPTION,
                ancien_etat=ancien_etat,
                nouvel_etat=Etat.EN_STOCK,
                ancienne_affectation=ancienne_affectation,
                nouvelle_affectation=Affectation.MAGASIN
            )
            updated.append(k.n_serie)
        
        logger.info(f"Réception carton {num_carton}: {len(updated)} concentrateurs par {user.username}")
        
        return {
            'carton': num_carton,
            'nb_recus': len(updated),
            'concentrateurs': updated
        }

    # === PROFIL BO COMMANDE ===
    @classmethod
    @transaction.atomic
    def commander_cartons(cls, operateur: str, nb_cartons: int, user: User) -> dict[str, Any]:
        """
        BO Commande: sélectionne des cartons par opérateur.
        Les K passent en_stock et sont affectés à la BO de l'utilisateur.
        
        Args:
            operateur: Operator name (e.g., 'Bouygues')
            nb_cartons: Number of cartons to order
            user: User performing the action (must be BO Commande profile)
            
        Returns:
            Dict with list of carton numbers and total K count
            
        Raises:
            PermissionError: If user is not BO Commande profile
        """
        if not user.is_bo_commande:
            raise PermissionError("Action réservée aux profils BO Commande")
        
        bo = user.base_operationnelle
        
        # Find cartons with available concentrators
        cartons_dispo = Carton.objects.filter(
            operateur=operateur,
            concentrateurs__affectation=Affectation.MAGASIN,
            concentrateurs__etat=Etat.EN_STOCK
        ).distinct()[:nb_cartons]
        
        result = {'cartons': [], 'total_k': 0}
        
        for carton in cartons_dispo:
            k_list = carton.concentrateurs.filter(
                affectation=Affectation.MAGASIN,
                etat=Etat.EN_STOCK
            ).select_for_update()
            
            for k in k_list:
                ancienne_affectation = k.affectation
                k.affectation = bo
                k.date_affectation = timezone.now().date()
                k.save()
                
                cls._create_historique(
                    k, user, ActionType.COMMANDE_BO,
                    ancienne_affectation=ancienne_affectation,
                    nouvelle_affectation=bo
                )
            
            result['cartons'].append(carton.num_carton)
            result['total_k'] += k_list.count()
        
        logger.info(f"Commande {nb_cartons} cartons {operateur} → {bo} par {user.username}: {result['total_k']} K")
        
        return result

    # === PROFIL BO TERRAIN (POSE) ===
    @classmethod
    @transaction.atomic
    def poser_concentrateur(cls, n_serie: str, poste_id: int, user: User) -> dict[str, Any]:
        """
        BO Terrain: pose un K sur un poste.
        
        K doit être en_stock et affecté à la BO de l'utilisateur.
        Passe à 'pose' avec poste_pose renseigné.
        
        Args:
            n_serie: Serial number of concentrator
            poste_id: ID of poste to install on
            user: User performing the action (must be BO Terrain profile)
            
        Returns:
            Dict with n_serie, poste code, and new state
            
        Raises:
            PermissionError: If user is not BO Terrain profile
            TransitionError: If K is not in correct state or not assigned to user's BO
        """
        if not user.is_bo_terrain:
            raise PermissionError("Action réservée aux profils BO Terrain")
        
        try:
            k = Concentrateur.objects.select_for_update().get(n_serie=n_serie)
        except Concentrateur.DoesNotExist:
            raise TransitionError(f"Concentrateur {n_serie} non trouvé")
        
        try:
            poste = Poste.objects.get(id=poste_id)
        except Poste.DoesNotExist:
            raise TransitionError(f"Poste {poste_id} non trouvé")
        
        # Validations
        if k.affectation != user.base_operationnelle:
            raise TransitionError(f"Ce K n'est pas affecté à {user.base_operationnelle}")
        if k.etat != Etat.EN_STOCK:
            raise TransitionError(f"Ce K n'est pas en stock (état actuel: {k.get_etat_display()})")
        if poste.base_operationnelle != user.base_operationnelle:
            raise TransitionError("Ce poste n'appartient pas à votre BO")
        
        # Vérifier qu'il n'y a pas déjà un concentrateur posé sur ce poste
        concentrateur_existant = Concentrateur.objects.filter(
            poste_pose=poste,
            etat=Etat.POSE
        ).exclude(n_serie=n_serie).first()
        
        if concentrateur_existant:
            raise TransitionError(
                f"Un concentrateur est déjà posé sur ce poste: {concentrateur_existant.n_serie}"
            )
        
        # Transition
        ancien_etat = k.etat
        k.etat = Etat.POSE
        k.poste_pose = poste
        k.date_pose = timezone.now().date()
        k.save()
        
        cls._create_historique(
            k, user, ActionType.POSE,
            ancien_etat=ancien_etat,
            nouvel_etat=Etat.POSE,
            poste=poste.code
        )
        
        logger.info(f"Pose {n_serie} sur {poste.code} par {user.username}")
        
        return {
            'n_serie': n_serie,
            'poste': poste.code,
            'etat': 'pose'
        }

    # === PROFIL BO TERRAIN (DEPOSE) ===
    @classmethod
    @transaction.atomic
    def deposer_concentrateur(cls, poste_id: int, n_serie: str, user: User) -> dict[str, Any]:
        """
        BO Terrain: dépose un K d'un poste.
        
        1. Recherche par poste de la BO
        2. Sélection du K à déposer
        3. Affectation au Labo pour test (état = a_tester)
        
        Args:
            poste_id: ID of poste to remove K from
            n_serie: Serial number of concentrator to remove
            user: User performing the action (must be BO Terrain profile)
            
        Returns:
            Dict with n_serie, old poste, and destination
            
        Raises:
            PermissionError: If user is not BO Terrain profile
            TransitionError: If K is not on specified poste or not in 'pose' state
        """
        if not user.is_bo_terrain:
            raise PermissionError("Action réservée aux profils BO Terrain")
        
        try:
            k = Concentrateur.objects.select_for_update().get(n_serie=n_serie)
        except Concentrateur.DoesNotExist:
            raise TransitionError(f"Concentrateur {n_serie} non trouvé")
        
        # Validations
        if k.poste_pose_id != poste_id:
            raise TransitionError("Ce K n'est pas sur ce poste")
        if k.etat != Etat.POSE:
            raise TransitionError("Ce K n'est pas en état 'posé'")
        
        # Transition: dépose → envoi labo
        ancien_etat = k.etat
        ancienne_affectation = k.affectation
        poste_code = k.poste_pose.code
        
        k.etat = Etat.A_TESTER
        k.affectation = Affectation.LABO
        k.poste_pose = None
        k.date_pose = None
        k.save()
        
        cls._create_historique(
            k, user, ActionType.DEPOSE,
            ancien_etat=ancien_etat,
            nouvel_etat=Etat.A_TESTER,
            ancienne_affectation=ancienne_affectation,
            nouvelle_affectation=Affectation.LABO,
            poste=poste_code
        )
        
        logger.info(f"Dépose {n_serie} de {poste_code} → Labo par {user.username}")
        
        return {
            'n_serie': n_serie,
            'ancien_poste': poste_code,
            'envoi': 'Labo'
        }

    # === PROFIL LABO ===
    @classmethod
    @transaction.atomic
    def tester_concentrateur(cls, n_serie: str, resultat_ok: bool, user: User) -> dict[str, Any]:
        """
        Labo: teste un K.
        
        - Si OK: état = en_stock, affectation = Magasin
        - Si HS: état = HS, affectation = vide
        
        Args:
            n_serie: Serial number of concentrator
            resultat_ok: True if test passed, False if failed
            user: User performing the action (must be 'labo' profile)
            
        Returns:
            Dict with n_serie and result
            
        Raises:
            PermissionError: If user is not 'labo' profile
            TransitionError: If K is not in 'a_tester' state
        """
        if not user.is_labo:
            raise PermissionError("Action réservée au profil Labo")
        
        try:
            k = Concentrateur.objects.select_for_update().get(n_serie=n_serie)
        except Concentrateur.DoesNotExist:
            raise TransitionError(f"Concentrateur {n_serie} non trouvé")
        
        if k.etat != Etat.A_TESTER:
            raise TransitionError("Ce K n'est pas en attente de test")
        
        ancien_etat = k.etat
        ancienne_affectation = k.affectation
        
        if resultat_ok:
            k.etat = Etat.EN_STOCK
            k.affectation = Affectation.MAGASIN
            action = ActionType.TEST_OK
        else:
            k.etat = Etat.HS
            k.affectation = ''
            action = ActionType.TEST_HS
        
        k.save()
        
        cls._create_historique(
            k, user, action,
            ancien_etat=ancien_etat,
            nouvel_etat=k.etat,
            ancienne_affectation=ancienne_affectation,
            nouvelle_affectation=k.affectation
        )
        
        result_str = 'OK' if resultat_ok else 'HS'
        logger.info(f"Test {n_serie}: {result_str} par {user.username}")
        
        return {
            'n_serie': n_serie,
            'resultat': result_str
        }

    # === HELPERS ===
    @classmethod
    def _create_historique(
        cls,
        k: Concentrateur,
        user: User,
        action: str,
        ancien_etat: str = '',
        nouvel_etat: str = '',
        ancienne_affectation: str = '',
        nouvelle_affectation: str = '',
        poste: str = '',
        commentaire: str = ''
    ) -> Historique:
        """Create an audit trail entry for a concentrator action."""
        return Historique.objects.create(
            concentrateur=k,
            action=action,
            user=user,
            ancien_etat=ancien_etat,
            nouvel_etat=nouvel_etat,
            ancienne_affectation=ancienne_affectation,
            nouvelle_affectation=nouvelle_affectation,
            poste=poste,
            commentaire=commentaire
        )
