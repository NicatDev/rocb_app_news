from django import forms
from ckeditor.widgets import CKEditorWidget

from .models import RTCPost


class RTCPostAdminForm(forms.ModelForm):
    class Meta:
        model = RTCPost
        fields = '__all__'
        widgets = {
            'content': CKEditorWidget(config_name='default'),
        }
