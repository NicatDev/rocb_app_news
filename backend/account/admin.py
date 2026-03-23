from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models.user import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff']
    
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('avatar', 'company', 'phone_number', 'field')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('avatar', 'company', 'phone_number', 'field')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)