"""
Core app - User model and profile management.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class Profil(models.TextChoices):
    """User profile types determining access permissions."""
    # Magasin
    MAGASIN = 'magasin', 'Magasin'
    
    # BO Nord
    BO_NORD_COMMANDE = 'bo_nord_commande', 'BO Nord - Commande'
    BO_NORD_TERRAIN = 'bo_nord_terrain', 'BO Nord - Pose/Dépose'
    
    # BO Centre
    BO_CENTRE_COMMANDE = 'bo_centre_commande', 'BO Centre - Commande'
    BO_CENTRE_TERRAIN = 'bo_centre_terrain', 'BO Centre - Pose/Dépose'
    
    # BO Sud
    BO_SUD_COMMANDE = 'bo_sud_commande', 'BO Sud - Commande'
    BO_SUD_TERRAIN = 'bo_sud_terrain', 'BO Sud - Pose/Dépose'
    
    # Labo & Admin
    LABO = 'labo', 'Laboratoire'
    ADMIN = 'admin', 'Administrateur'


class User(AbstractUser):
    """
    Custom user model with profile-based permissions.
    
    Profiles determine which actions a user can perform and
    which Base Opérationnelle (BO) they belong to.
    """
    profil = models.CharField(
        max_length=30,
        choices=Profil.choices,
        default=Profil.MAGASIN,
        verbose_name="Profil"
    )
    
    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
    
    @property
    def base_operationnelle(self) -> str | None:
        """Returns the BO associated with the user's profile (Nord/Centre/Sud or None)."""
        mapping = {
            'bo_nord_commande': 'BO Nord',
            'bo_nord_terrain': 'BO Nord',
            'bo_centre_commande': 'BO Centre',
            'bo_centre_terrain': 'BO Centre',
            'bo_sud_commande': 'BO Sud',
            'bo_sud_terrain': 'BO Sud',
        }
        return mapping.get(self.profil)
    
    @property
    def is_bo_commande(self) -> bool:
        """Check if user has BO Commande role (can order cartons)."""
        return self.profil in [
            Profil.BO_NORD_COMMANDE,
            Profil.BO_CENTRE_COMMANDE,
            Profil.BO_SUD_COMMANDE,
        ]
    
    @property
    def is_bo_terrain(self) -> bool:
        """Check if user has BO Terrain role (can pose/dépose)."""
        return self.profil in [
            Profil.BO_NORD_TERRAIN,
            Profil.BO_CENTRE_TERRAIN,
            Profil.BO_SUD_TERRAIN,
        ]
    
    @property
    def is_magasin(self) -> bool:
        """Check if user is Magasin profile."""
        return self.profil == Profil.MAGASIN
    
    @property
    def is_labo(self) -> bool:
        """Check if user is Labo profile."""
        return self.profil == Profil.LABO
    
    @property
    def is_admin_profile(self) -> bool:
        """Check if user is Admin profile."""
        return self.profil == Profil.ADMIN
    
    def __str__(self) -> str:
        return f"{self.username} ({self.get_profil_display()})"
