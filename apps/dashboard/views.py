from django.shortcuts import redirect, get_object_or_404
from django.views.generic import TemplateView, View
from django.contrib.auth.mixins import LoginRequiredMixin

from apps.inventory.models import Concentrateur


class HomeRedirectView(LoginRequiredMixin, View):
    """
    Redirect users to their profile-appropriate home page.
    """
    def get(self, request):
        user = request.user
        
        if user.is_magasin:
            return redirect('magasin:reception')
        elif user.is_bo_commande:
            return redirect('bo:commande')
        elif user.is_bo_terrain:
            return redirect('bo:terrain')
        elif user.is_labo:
            return redirect('labo:test')
        else:
            # Admin or unknown -> dashboard
            return redirect('dashboard:dashboard')


class DashboardView(LoginRequiredMixin, TemplateView):
    """Main dashboard with stock statistics and charts."""
    template_name = 'pages/dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Stock statistics
        from django.db.models import Count
        from apps.inventory.models import Etat, Affectation
        
        context['total_concentrateurs'] = Concentrateur.objects.count()
        context['stats_by_etat'] = Concentrateur.objects.values('etat').annotate(
            count=Count('id')
        ).order_by('etat')
        context['stats_by_affectation'] = Concentrateur.objects.exclude(
            affectation=''
        ).values('affectation').annotate(
            count=Count('id')
        ).order_by('affectation')
        
        return context


class SearchView(LoginRequiredMixin, TemplateView):
    """Search concentrators and view history."""
    template_name = 'pages/search.html'


class ConcentrateurDetailView(LoginRequiredMixin, TemplateView):
    """Detail view for a single concentrator with history."""
    template_name = 'pages/concentrateur_detail.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        n_serie = self.kwargs['n_serie']
        context['concentrateur'] = get_object_or_404(Concentrateur, n_serie=n_serie)
        context['historique'] = context['concentrateur'].historique.select_related('user').all()[:20]
        return context
