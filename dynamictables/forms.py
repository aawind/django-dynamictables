from django import forms
import widget

class CharForm(forms.Form):
    field = widget.TextField()

class IntForm(forms.Form):
    field = forms.IntegerField()
    
class DateForm(forms.Form):
    field = forms.DateField()