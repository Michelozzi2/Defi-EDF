from django.urls import path
from . import views

app_name = 'labo'

urlpatterns = [
    path('', views.LaboTestView.as_view(), name='test'),
]
