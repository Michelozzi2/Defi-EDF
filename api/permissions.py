"""
DRF Permissions for profile-based access control.
"""
import logging
from rest_framework.permissions import BasePermission

logger = logging.getLogger(__name__)


class IsMagasin(BasePermission):
    """Allow users with 'magasin' or 'admin' profile."""
    message = "Action réservée au profil Magasin"
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            logger.warning("IsMagasin: User not authenticated")
            return False
        
        has_permission = request.user.is_magasin or request.user.is_admin_profile
        logger.info(f"IsMagasin check: user={request.user.username}, profil={request.user.profil}, allowed={has_permission}")
        return has_permission


class IsBOCommande(BasePermission):
    """Allow users with BO Commande or admin profile."""
    message = "Action réservée aux profils BO Commande"
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_bo_commande or request.user.is_admin_profile


class IsBOTerrain(BasePermission):
    """Allow users with BO Terrain or admin profile."""
    message = "Action réservée aux profils BO Terrain"
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_bo_terrain or request.user.is_admin_profile


class IsLabo(BasePermission):
    """Allow users with 'labo' or 'admin' profile."""
    message = "Action réservée au profil Labo"
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.is_labo or request.user.is_admin_profile


class IsAdminProfile(BasePermission):
    """Only allow users with 'admin' profile."""
    message = "Action réservée au profil Admin"
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_profile
