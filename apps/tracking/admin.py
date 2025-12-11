from django.contrib import admin
from .models import Historique


@admin.register(Historique)
class HistoriqueAdmin(admin.ModelAdmin):
    list_display = ('concentrateur', 'action', 'user', 'ancien_etat', 'nouvel_etat', 'timestamp')
    list_filter = ('action', 'timestamp', 'user')
    search_fields = ('concentrateur__n_serie', 'user__username', 'commentaire')
    raw_id_fields = ('concentrateur', 'user')
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        # Historique should only be created through business logic
        return False
    
    def has_change_permission(self, request, obj=None):
        # Historique should not be modified
        return False
