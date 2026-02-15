from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUser(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name=_("avatar"))
    company = models.CharField(_("company"), max_length=255, blank=True)
    phone_number = models.CharField(_("phone number"), max_length=20, blank=True)
    field = models.CharField(_("field"), max_length=255, blank=True, help_text=_("Industry or sector"))

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")

    def __str__(self):
        return self.username
