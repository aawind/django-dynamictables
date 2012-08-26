from django import forms

class CharForm(forms.Form):
    field = forms.CharField()

class IntForm(forms.Form):
    field = forms.IntegerField()
    
class DateForm(forms.Form):
    field = forms.DateField()