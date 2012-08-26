# -*- coding: utf-8 -*-
from django import forms
from django.contrib import admin
from django.contrib.flatpages.models import FlatPage
from django.contrib.flatpages.admin import FlatpageForm
from django.utils.translation import ugettext_lazy as _
from django.forms.util import flatatt, ErrorDict, ErrorList
from models import *

class ColumnAdmin(admin.ModelAdmin):
    list_display = ('name', 'val_type')

class RowForm(forms.ModelForm):
    class Meta:
        model = Row
    
class RowAdmin(admin.ModelAdmin):
    list_display = ('name', 'val_type')
    
admin.site.register(Table)
admin.site.register(Column, ColumnAdmin)
admin.site.register(Row)
admin.site.register(CharValue)
admin.site.register(IntValue)
admin.site.register(DateValue)