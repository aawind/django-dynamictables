from django.contrib.auth.decorators import user_passes_test
from django.shortcuts import get_object_or_404, render, redirect, render_to_response
from django.template import RequestContext

from models import Table
from forms import *

def main(request, template="main.html"):
    """
    Homepage - lists all tables.
    """
    context = {
      "tables": Table.objects.all(),
      "charform": CharForm(),
      "intform": IntForm(),
      "dateform": DateForm()
    }
    return render(request, template, context)
    
def form(request, template="form.html"):
    """
    Formpage - get form by type.
    """
    f = False
    form_type = False
    if 'type' in request.GET:
        tp = request.GET['type']
        form_type = tp
        if tp == 'C':
            f = CharForm
        elif tp == 'I':
            f = IntForm
        elif tp == 'D':
            f = DateForm
        else:
            form_type = False
            
    if request.method == 'POST':
        if f:
          f = f(request.POST)
          if f.is_valid():
              cd = f.cleaned_data
              print "data:", cd['field']
    else:
        if f:
          f = f()
            
    context = {
      "form": f,
      "form_type": form_type,
    }
    #return render(request, template, context)
    
    return render_to_response(template, context,
                              context_instance=RequestContext(request))