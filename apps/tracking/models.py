"""
Tracking app - Historique (audit trail) for concentrator actions.
"""
from django.conf import settings
from django.db import models


class ActionType(models.TextChoices):
    """Types of actions that can be performed on concentrators."""
    RECEPTION = 'reception', 'Réception magasin'
    COMMANDE_BO = 'commande_bo', 'Commande vers BO'
    POSE = 'pose', 'Pose sur poste'
    DEPOSE = 'depose', 'Dépose du poste'
    TEST_OK = 'test_ok', 'Test OK'
    TEST_HS = 'test_hs', 'Test HS'
    MODIFICATION = 'modification', 'Modification manuelle'


class Historique(models.Model):
    """
    Audit trail for all concentrator state changes.
    
    Records who did what, when, and captures before/after states.
    """
    concentrateur = models.ForeignKey(
        'inventory.Concentrateur',
        on_delete=models.CASCADE,
        related_name='historique',
        verbose_name="Concentrateur"
    )
    action = models.CharField(
        max_length=20,
        choices=ActionType.choices,
        verbose_name="Action"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Utilisateur"
    )
    ancien_etat = models.CharField(
        max_length=20,
        blank=True,
        default='',
        verbose_name="Ancien état"
    )
    nouvel_etat = models.CharField(
        max_length=20,
        blank=True,
        default='',
        verbose_name="Nouvel état"
    )
    ancienne_affectation = models.CharField(
        max_length=20,
        blank=True,
        default='',
        verbose_name="Ancienne affectation"
    )
    nouvelle_affectation = models.CharField(
        max_length=20,
        blank=True,
        default='',
        verbose_name="Nouvelle affectation"
    )
    poste = models.CharField(
        max_length=100,
        blank=True,
        default='',
        verbose_name="Poste"
    )
    commentaire = models.TextField(
        blank=True,
        default='',
        verbose_name="Commentaire"
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date/Heure"
    )
    
    class Meta:
        verbose_name = "Historique"
        verbose_name_plural = "Historiques"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['concentrateur', '-timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
        ]
    
    def __str__(self) -> str:
        return f"{self.concentrateur.n_serie} - {self.get_action_display()} ({self.timestamp:%d/%m/%Y %H:%M})"
