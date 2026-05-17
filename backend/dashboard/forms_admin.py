from django import forms
from ckeditor.widgets import CKEditorWidget

from .models import News, NewsSection, RTCProfile


class NewsAdminForm(forms.ModelForm):
    class Meta:
        model = News
        fields = '__all__'
        widgets = {
            'content': CKEditorWidget(config_name='default'),
        }


class NewsSectionInlineForm(forms.ModelForm):
    class Meta:
        model = NewsSection
        fields = '__all__'
        widgets = {
            'content': CKEditorWidget(config_name='default'),
        }


class RTCProfileAdminForm(forms.ModelForm):
    class Meta:
        model = RTCProfile
        fields = '__all__'
        widgets = {
            'mission_statement': CKEditorWidget(config_name='default'),
            'overview_text': CKEditorWidget(config_name='default'),
            'director_bio': CKEditorWidget(config_name='default'),
            'specialization_areas': CKEditorWidget(config_name='default'),
        }
