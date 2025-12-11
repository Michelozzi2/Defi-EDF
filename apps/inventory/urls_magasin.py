from django.urls import path
from . import views

app_name = 'magasin'

urlpatterns = [
    path('', views.ReceptionView.as_view(), name='reception'),
]
