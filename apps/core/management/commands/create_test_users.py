"""
Management command to create test users for all profiles.
"""
from django.core.management.base import BaseCommand
from apps.core.models import User, Profil


class Command(BaseCommand):
    help = 'Create test users for all profiles'
    
    def handle(self, *args, **options):
        test_users = [
            ('admin', 'admin@edf.fr', 'admin123', Profil.ADMIN),
            ('magasin', 'magasin@edf.fr', 'magasin123', Profil.MAGASIN),
            ('bo_nord_cmd', 'bonord.cmd@edf.fr', 'bonord123', Profil.BO_NORD_COMMANDE),
            ('bo_nord_terrain', 'bonord.terrain@edf.fr', 'bonord123', Profil.BO_NORD_TERRAIN),
            ('bo_centre_cmd', 'bocentre.cmd@edf.fr', 'bocentre123', Profil.BO_CENTRE_COMMANDE),
            ('bo_centre_terrain', 'bocentre.terrain@edf.fr', 'bocentre123', Profil.BO_CENTRE_TERRAIN),
            ('bo_sud_cmd', 'bosud.cmd@edf.fr', 'bosud123', Profil.BO_SUD_COMMANDE),
            ('bo_sud_terrain', 'bosud.terrain@edf.fr', 'bosud123', Profil.BO_SUD_TERRAIN),
            ('labo', 'labo@edf.fr', 'labo123', Profil.LABO),
        ]
        
        for username, email, password, profil in test_users:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'profil': profil,
                    'is_staff': profil == Profil.ADMIN,
                    'is_superuser': profil == Profil.ADMIN,
                }
            )
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f"Created: {username} ({profil}) - password: {password}")
                )
            else:
                self.stdout.write(f"Exists: {username}")
        
        self.stdout.write(self.style.SUCCESS("\nAll test users ready!"))
