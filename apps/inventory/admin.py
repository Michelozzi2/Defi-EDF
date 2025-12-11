from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin

from .models import Carton, Concentrateur, Poste


class ConcentrateurResource(resources.ModelResource):
    """Import/Export resource for Concentrateur."""
    class Meta:
        model = Concentrateur
        fields = ('n_serie', 'operateur', 'affectation', 'etat', 'date_affectation', 'date_pose')
        import_id_fields = ('n_serie',)


class ConcentrateurInline(admin.TabularInline):
    """Inline for Concentrateurs in Carton admin."""
    model = Concentrateur
    extra = 0
    readonly_fields = ('n_serie', 'etat', 'affectation')
    can_delete = False
    show_change_link = True


@admin.register(Poste)
class PosteAdmin(admin.ModelAdmin):
    list_display = ('code', 'nom', 'base_operationnelle', 'actif')
    list_filter = ('base_operationnelle', 'actif')
    search_fields = ('code', 'nom')
    ordering = ('base_operationnelle', 'code')


@admin.register(Carton)
class CartonAdmin(admin.ModelAdmin):
    list_display = ('num_carton', 'operateur', 'nb_concentrateurs', 'created_at')
    list_filter = ('operateur', 'created_at')
    search_fields = ('num_carton',)
    inlines = [ConcentrateurInline]
    readonly_fields = ('nb_concentrateurs',)
    
    def nb_concentrateurs(self, obj):
        return obj.nb_concentrateurs
    nb_concentrateurs.short_description = "Nb concentrateurs"


@admin.register(Concentrateur)
class ConcentrateurAdmin(ImportExportModelAdmin):
    resource_class = ConcentrateurResource
    list_display = ('n_serie', 'operateur', 'etat', 'affectation', 'poste_pose', 'date_dernier_etat')
    list_filter = ('etat', 'affectation', 'operateur', 'date_dernier_etat')
    search_fields = ('n_serie', 'carton__num_carton')
    raw_id_fields = ('carton', 'poste_pose')
    readonly_fields = ('created_at', 'updated_at', 'date_dernier_etat')
    
    fieldsets = (
        ('Identification', {
            'fields': ('n_serie', 'carton', 'operateur')
        }),
        ('État & Affectation', {
            'fields': ('etat', 'affectation', 'poste_pose')
        }),
        ('Dates', {
            'fields': ('date_affectation', 'date_pose', 'date_dernier_etat', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
