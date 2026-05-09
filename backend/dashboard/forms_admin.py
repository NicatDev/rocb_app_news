from django import forms
from ckeditor.widgets import CKEditorWidget

from .models import News, NewsSection


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
