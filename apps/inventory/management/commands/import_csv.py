"""
Management command to import concentrateurs from BDD_defi_EDF.csv.

Usage:
    python manage.py import_csv BDD_defi_EDF.csv
    python manage.py import_csv BDD_defi_EDF.csv --dry-run
"""
import csv
import logging
from datetime import datetime
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.inventory.models import Concentrateur, Carton, Poste, Etat, Affectation

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Import concentrateurs from BDD_defi_EDF.csv'
    
    def add_arguments(self, parser):
        parser.add_argument(
            'csv_file',
            type=str,
            help='Path to the CSV file to import'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Parse and validate without saving to database'
        )
        parser.add_argument(
            '--encoding',
            type=str,
            default='utf-8',
            help='CSV file encoding (default: utf-8)'
        )
    
    def handle(self, *args, **options):
        csv_path = Path(options['csv_file'])
        
        if not csv_path.exists():
            raise CommandError(f"File not found: {csv_path}")
        
        dry_run = options['dry_run']
        encoding = options['encoding']
        
        self.stdout.write(f"Importing from: {csv_path}")
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN - no changes will be saved"))
        
        stats = {
            'cartons_created': 0,
            'cartons_existing': 0,
            'concentrateurs_created': 0,
            'concentrateurs_updated': 0,
            'postes_created': 0,
            'errors': 0,
        }
        
        try:
            with open(csv_path, 'r', encoding=encoding, newline='') as f:
                # CSV uses semicolon separator
                reader = csv.DictReader(f, delimiter=';')
                
                self.stdout.write(f"Columns found: {reader.fieldnames}")
                
                rows = list(reader)
                total_rows = len(rows)
                self.stdout.write(f"Total rows to process: {total_rows}")
                
                if not dry_run:
                    with transaction.atomic():
                        self._process_all_rows(rows, stats)
                else:
                    self._process_all_rows(rows, stats, dry_run=True)
        
        except Exception as e:
            logger.error(f"Import failed: {e}")
            raise CommandError(f"Import failed: {e}")
        
        # Print stats
        self.stdout.write("\n=== Import Summary ===")
        self.stdout.write(f"Cartons created: {stats['cartons_created']}")
        self.stdout.write(f"Cartons existing: {stats['cartons_existing']}")
        self.stdout.write(f"Postes created: {stats['postes_created']}")
        self.stdout.write(f"Concentrateurs created: {stats['concentrateurs_created']}")
        self.stdout.write(f"Concentrateurs updated: {stats['concentrateurs_updated']}")
        
        if stats['errors'] > 0:
            self.stdout.write(self.style.ERROR(f"Errors: {stats['errors']}"))
        else:
            self.stdout.write(self.style.SUCCESS("Import completed successfully!"))
    
    def _process_all_rows(self, rows: list, stats: dict, dry_run: bool = False):
        """Process all CSV rows."""
        for row_num, row in enumerate(rows, start=2):
            try:
                self._process_row(row, stats, dry_run)
                
                # Progress indicator every 500 rows
                if row_num % 500 == 0:
                    self.stdout.write(f"  Processed {row_num} rows...")
                    
            except Exception as e:
                stats['errors'] += 1
                logger.error(f"Row {row_num}: {e}")
                if stats['errors'] <= 10:  # Only show first 10 errors
                    self.stdout.write(self.style.ERROR(f"Row {row_num}: {e}"))
    
    def _process_row(self, row: dict, stats: dict, dry_run: bool = False):
        """Process a single CSV row."""
        # Extract values from CSV columns (exact names from the file)
        num_carton = row.get('num_carton', '').strip()
        operateur = row.get('operateur', '').strip()
        n_serie = row.get('n_serie_concentrateur', '').strip()
        affectation = row.get('affectation', '').strip()
        etat = row.get('etat', '').strip()
        poste_pose = row.get('poste_pose', '').strip()
        date_affectation = row.get('date_affectation', '').strip()
        date_pose = row.get('date_pose', '').strip()
        date_dernier_etat = row.get('date_dernier_etat', '').strip()
        
        if not n_serie:
            raise ValueError("N° série manquant")
        
        # Get or create carton
        carton = None
        if num_carton and not dry_run:
            carton, created = Carton.objects.get_or_create(
                num_carton=num_carton,
                defaults={'operateur': operateur or 'Inconnu'}
            )
            if created:
                stats['cartons_created'] += 1
            else:
                stats['cartons_existing'] += 1
        elif dry_run:
            stats['cartons_created'] += 1
        
        # Get or create poste if specified
        poste_obj = None
        if poste_pose and not dry_run:
            # Determine BO from affectation
            bo = self._get_bo_from_affectation(affectation)
            if bo:
                poste_obj, created = Poste.objects.get_or_create(
                    code=poste_pose,
                    defaults={
                        'nom': poste_pose,
                        'base_operationnelle': bo
                    }
                )
                if created:
                    stats['postes_created'] += 1
        
        # Parse dates
        date_affectation_parsed = self._parse_date(date_affectation)
        date_pose_parsed = self._parse_date(date_pose)
        
        # Map values
        etat_mapped = self._map_etat(etat)
        affectation_mapped = self._map_affectation(affectation)
        
        # Create or update concentrateur
        if not dry_run:
            k, created = Concentrateur.objects.update_or_create(
                n_serie=n_serie,
                defaults={
                    'carton': carton,
                    'operateur': operateur or 'Inconnu',
                    'affectation': affectation_mapped,
                    'etat': etat_mapped,
                    'poste_pose': poste_obj,
                    'date_affectation': date_affectation_parsed,
                    'date_pose': date_pose_parsed,
                }
            )
            
            if created:
                stats['concentrateurs_created'] += 1
            else:
                stats['concentrateurs_updated'] += 1
        else:
            stats['concentrateurs_created'] += 1
    
    def _parse_date(self, value: str):
        """Parse date in DD/MM/YYYY format."""
        if not value:
            return None
        try:
            return datetime.strptime(value, '%d/%m/%Y').date()
        except ValueError:
            return None
    
    def _get_bo_from_affectation(self, value: str) -> str | None:
        """Get BO name from affectation for poste creation."""
        value_lower = value.lower().strip() if value else ''
        if 'nord' in value_lower:
            return 'BO Nord'
        elif 'centre' in value_lower:
            return 'BO Centre'
        elif 'sud' in value_lower:
            return 'BO Sud'
        return None
    
    def _map_etat(self, value: str) -> str:
        """Map CSV état value to model enum."""
        value_lower = value.lower().strip() if value else ''
        
        mapping = {
            'en_livraison': Etat.EN_LIVRAISON,
            'en livraison': Etat.EN_LIVRAISON,
            'livraison': Etat.EN_LIVRAISON,
            'en_stock': Etat.EN_STOCK,
            'en stock': Etat.EN_STOCK,
            'stock': Etat.EN_STOCK,
            'pose': Etat.POSE,
            'posé': Etat.POSE,
            'a_tester': Etat.A_TESTER,
            'à tester': Etat.A_TESTER,
            'a tester': Etat.A_TESTER,
            'tester': Etat.A_TESTER,
            'hs': Etat.HS,
            'hors service': Etat.HS,
        }
        
        return mapping.get(value_lower, Etat.EN_LIVRAISON)
    
    def _map_affectation(self, value: str) -> str:
        """Map CSV affectation value to model enum."""
        value_lower = value.lower().strip() if value else ''
        
        mapping = {
            'magasin': Affectation.MAGASIN,
            'bo nord': Affectation.BO_NORD,
            'bo_nord': Affectation.BO_NORD,
            'nord': Affectation.BO_NORD,
            'bo centre': Affectation.BO_CENTRE,
            'bo_centre': Affectation.BO_CENTRE,
            'centre': Affectation.BO_CENTRE,
            'bo sud': Affectation.BO_SUD,
            'bo_sud': Affectation.BO_SUD,
            'sud': Affectation.BO_SUD,
            'labo': Affectation.LABO,
            'laboratoire': Affectation.LABO,
        }
        
        return mapping.get(value_lower, Affectation.MAGASIN)
