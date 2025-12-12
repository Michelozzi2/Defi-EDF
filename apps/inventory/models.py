"""
Inventory app - Concentrateur, Carton, and Poste models.
"""
from django.db import models


class Operateur(models.TextChoices):
    """Telecom operators supplying concentrators."""
    BOUYGUES = 'Bouygues', 'Bouygues'
    ORANGE = 'Orange', 'Orange'
    SFR = 'SFR', 'SFR'


class Affectation(models.TextChoices):
    """Location/assignment of concentrators."""
    MAGASIN = 'Magasin', 'Magasin'
    BO_NORD = 'BO Nord', 'BO Nord'
    BO_CENTRE = 'BO Centre', 'BO Centre'
    BO_SUD = 'BO Sud', 'BO Sud'
    LABO = 'Labo', 'Labo'


class Etat(models.TextChoices):
    """State of a concentrator in its lifecycle."""
    EN_LIVRAISON = 'en_livraison', 'En livraison'
    EN_STOCK = 'en_stock', 'En stock'
    POSE = 'pose', 'Posé'
    A_TESTER = 'a_tester', 'À tester'
    EN_ATTENTE_RECONDITIONNEMENT = 'en_attente_recond', 'En attente reconditionnement'
    HS = 'HS', 'Hors service'


class Poste(models.Model):
    """
    Physical posts where concentrators can be installed.
    Each post belongs to a specific Base Opérationnelle.
    """
    code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        verbose_name="Code poste"
    )
    nom = models.CharField(
        max_length=100,
        verbose_name="Nom"
    )
    base_operationnelle = models.CharField(
        max_length=20,
        choices=[
            ('BO Nord', 'BO Nord'),
            ('BO Centre', 'BO Centre'),
            ('BO Sud', 'BO Sud'),
        ],
        verbose_name="Base opérationnelle"
    )
    actif = models.BooleanField(
        default=True,
        verbose_name="Actif"
    )
    
    class Meta:
        verbose_name = "Poste"
        verbose_name_plural = "Postes"
        ordering = ['base_operationnelle', 'code']
    
    def __str__(self) -> str:
        return f"{self.code} - {self.nom} ({self.base_operationnelle})"


class Carton(models.Model):
    """
    Carton containing multiple concentrators.
    Cartons are received from operators and tracked as units.
    """
    num_carton = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        verbose_name="Numéro carton"
    )
    operateur = models.CharField(
        max_length=100,
        choices=Operateur.choices,
        verbose_name="Opérateur"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date création"
    )
    is_reconditionne = models.BooleanField(
        default=False,
        verbose_name="Reconditionné"
    )
    
    class Meta:
        verbose_name = "Carton"
        verbose_name_plural = "Cartons"
        ordering = ['-created_at']
    
    def __str__(self) -> str:
        return f"{self.num_carton} ({self.operateur})"
    
    @property
    def nb_concentrateurs(self) -> int:
        """Number of concentrators in this carton."""
        return self.concentrateurs.count()


class Concentrateur(models.Model):
    """
    Individual concentrator unit tracked through its lifecycle.
    
    Lifecycle: en_livraison → en_stock → pose → a_tester → en_stock/HS
    """
    n_serie = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        verbose_name="N° série"
    )
    carton = models.ForeignKey(
        Carton,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='concentrateurs',
        verbose_name="Carton"
    )
    operateur = models.CharField(
        max_length=100,
        verbose_name="Opérateur"
    )
    affectation = models.CharField(
        max_length=20,
        choices=Affectation.choices,
        blank=True,
        default='',
        verbose_name="Affectation"
    )
    latitude = models.FloatField(null=True, blank=True, verbose_name="Latitude")
    longitude = models.FloatField(null=True, blank=True, verbose_name="Longitude")
    etat = models.CharField(
        max_length=20,
        choices=Etat.choices,
        default=Etat.EN_LIVRAISON,
        verbose_name="État"
    )
    poste_pose = models.ForeignKey(
        Poste,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='concentrateurs_poses',
        verbose_name="Poste de pose"
    )
    date_affectation = models.DateField(
        null=True,
        blank=True,
        verbose_name="Date affectation"
    )
    date_pose = models.DateField(
        null=True,
        blank=True,
        verbose_name="Date pose"
    )
    date_dernier_etat = models.DateField(
        auto_now=True,
        verbose_name="Date dernier état"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date création"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Dernière modification"
    )
    
    class Meta:
        verbose_name = "Concentrateur"
        verbose_name_plural = "Concentrateurs"
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['etat', 'affectation']),
            models.Index(fields=['operateur']),
            models.Index(fields=['carton', 'etat']),
        ]
    
    def __str__(self) -> str:
        return f"{self.n_serie} ({self.get_etat_display()})"
