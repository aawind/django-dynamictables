# -*- coding: utf-8 -*-
from django import forms
from django.forms.widgets import Input

class InputGenerator(Input):
    def __init__(self, type='text', attrs='',*args, **kwargs):
        self.input_type = type
        super(InputGenerator, self).__init__(attrs,*args, **kwargs)
                 
class TextField(forms.CharField):
    widget = InputGenerator(attrs={'required': 'true', 'maxlength': '20'}, type='text')