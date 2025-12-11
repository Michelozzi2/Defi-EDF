from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin


class LaboTestView(LoginRequiredMixin, UserPassesTestMixin, TemplateView):
    """View for Labo profile to test concentrators."""
    template_name = 'pages/labo/test.html'
    
    def test_func(self):
        return self.request.user.is_labo
