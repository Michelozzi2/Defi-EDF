from django.core.management.base import BaseCommand
from apps.inventory.models import Concentrateur
import random

class Command(BaseCommand):
    help = 'Populate missing GPS coordinates for concentrators based on their affectation'

    def handle(self, *args, **options):
        # Zone centers (approximate)
        ZONE_CENTERS = {
            "BO Nord": (42.6973, 9.4500),   # Bastia area
            "BO Sud": (41.9192, 8.7386),    # Ajaccio area
            "BO Centre": (42.3094, 9.1490), # Corte area
            "Magasin": (42.5500, 9.4000),   # Near Bastia
            "Labo": (42.6000, 9.3000),      # Near Bastia
        }

        qs = Concentrateur.objects.exclude(affectation='')
        count = 0
        
        for c in qs:
            # Only update if missing (or force update if you want to regenerate all)
            if c.latitude is None or c.longitude is None:
                center = ZONE_CENTERS.get(c.affectation)
                if center:
                    # Add random jitter (approx 10-20km radius)
                    # 0.1 degree lat is ~11km
                    c.latitude = center[0] + random.uniform(-0.10, 0.10)
                    c.longitude = center[1] + random.uniform(-0.10, 0.10)
                    c.save()
                    count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {count} concentrators with GPS coordinates'))
