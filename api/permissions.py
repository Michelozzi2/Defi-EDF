"""
DRF Permissions for profile-based access control.
"""
from rest_framework.permissions import BasePermission


class IsMagasin(BasePermission):
    """Only allow users with 'magasin' profile."""
    message = "Action réservée au profil Magasin"
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_magasin


class IsBOCommande(BasePermission):
    """Only allow users with BO Commande profile."""
    message = "Action réservée aux profils BO Commande"
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_bo_commande


class IsBOTerrain(BasePermission):
    """Only allow users with BO Terrain profile."""
    message = "Action réservée aux profils BO Terrain"
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_bo_terrain


class IsLabo(BasePermission):
    """Only allow users with 'labo' profile."""
    message = "Action réservée au profil Labo"
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_labo


class IsAdminProfile(BasePermission):
    """Only allow users with 'admin' profile."""
    message = "Action réservée au profil Admin"
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_profile
