"""
Management command to create sample data for testing.
"""
from django.core.management.base import BaseCommand
from apps.inventory.models import Carton, Concentrateur, Poste, Etat, Affectation, Operateur


class Command(BaseCommand):
    help = 'Create sample data for testing'
    
    def handle(self, *args, **options):
        # Create Postes
        postes_data = [
            # BO Nord
            ('POSTE-N001', 'Poste Nord 1', 'BO Nord'),
            ('POSTE-N002', 'Poste Nord 2', 'BO Nord'),
            ('POSTE-N003', 'Poste Nord 3', 'BO Nord'),
            # BO Centre
            ('POSTE-C001', 'Poste Centre 1', 'BO Centre'),
            ('POSTE-C002', 'Poste Centre 2', 'BO Centre'),
            ('POSTE-C003', 'Poste Centre 3', 'BO Centre'),
            # BO Sud
            ('POSTE-S001', 'Poste Sud 1', 'BO Sud'),
            ('POSTE-S002', 'Poste Sud 2', 'BO Sud'),
            ('POSTE-S003', 'Poste Sud 3', 'BO Sud'),
        ]
        
        for code, nom, bo in postes_data:
            poste, created = Poste.objects.get_or_create(
                code=code,
                defaults={'nom': nom, 'base_operationnelle': bo}
            )
            if created:
                self.stdout.write(f"Created poste: {code}")
        
        # Create Cartons with Concentrateurs
        cartons_data = [
            ('CB71B001', 'Bouygues', Affectation.MAGASIN, Etat.EN_LIVRAISON, [
                'KB71O001', 'KB71O002', 'KB71O003', 'KB71O004'
            ]),
            ('CB71B002', 'Bouygues', Affectation.MAGASIN, Etat.EN_LIVRAISON, [
                'KB71O005', 'KB71O006', 'KB71O007', 'KB71O008'
            ]),
            ('CB71B003', 'Bouygues', Affectation.MAGASIN, Etat.EN_STOCK, [
                'KB71O009', 'KB71O010', 'KB71O011', 'KB71O012'
            ]),
            ('CB71B004', 'Bouygues', Affectation.MAGASIN, Etat.EN_STOCK, [
                'KB71O013', 'KB71O014', 'KB71O015', 'KB71O016'
            ]),
            ('CB71B005', 'Bouygues', Affectation.BO_NORD, Etat.EN_STOCK, [
                'KB71O017', 'KB71O018', 'KB71O019', 'KB71O020'
            ]),
        ]
        
        for num_carton, operateur, affectation, etat, n_series in cartons_data:
            carton, created = Carton.objects.get_or_create(
                num_carton=num_carton,
                defaults={'operateur': operateur}
            )
            if created:
                self.stdout.write(f"Created carton: {num_carton}")
            
            for n_serie in n_series:
                k, created = Concentrateur.objects.get_or_create(
                    n_serie=n_serie,
                    defaults={
                        'carton': carton,
                        'operateur': operateur,
                        'affectation': affectation,
                        'etat': etat,
                    }
                )
                if created:
                    self.stdout.write(f"  Created K: {n_serie}")
        
        # Create some concentrateurs in different states for testing
        special_k = [
            ('KB71O100', 'Bouygues', Affectation.LABO, Etat.A_TESTER),
            ('KB71O101', 'Bouygues', Affectation.LABO, Etat.A_TESTER),
            ('KB71O102', 'Bouygues', '', Etat.HS),
        ]
        
        for n_serie, operateur, affectation, etat in special_k:
            k, created = Concentrateur.objects.get_or_create(
                n_serie=n_serie,
                defaults={
                    'operateur': operateur,
                    'affectation': affectation,
                    'etat': etat,
                }
            )
            if created:
                self.stdout.write(f"Created special K: {n_serie} ({etat})")
        
        self.stdout.write(self.style.SUCCESS("\nSample data created!"))
        self.stdout.write(f"  Postes: {Poste.objects.count()}")
        self.stdout.write(f"  Cartons: {Carton.objects.count()}")
        self.stdout.write(f"  Concentrateurs: {Concentrateur.objects.count()}")
