from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for custom User model."""
    list_display = ('username', 'email', 'profil', 'is_staff', 'is_active')
    list_filter = ('profil', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Profil EDF', {'fields': ('profil',)}),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Profil EDF', {'fields': ('profil',)}),
    )
