from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin

from .models import Carton, Poste, Operateur


class ReceptionView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    """View for Magasin profile to receive cartons."""
    template_name = 'pages/magasin/reception.html'
    
    def test_func(self):
        return self.request.user.is_magasin


class BOCommandeView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    """View for BO Commande profile to order cartons."""
    template_name = 'pages/bo/commande.html'
    
    def test_func(self):
        return self.request.user.is_bo_commande
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['operateurs'] = Operateur.choices
        context['bo'] = self.request.user.base_operationnelle
        return context


class BOTerrainView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    """View for BO Terrain profile to pose/dépose concentrators."""
    template_name = 'pages/bo/terrain.html'
    
    def test_func(self):
        return self.request.user.is_bo_terrain
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        bo = self.request.user.base_operationnelle
        context['postes'] = Poste.objects.filter(
            base_operationnelle=bo,
            actif=True
        )
        context['bo'] = bo
        return context
