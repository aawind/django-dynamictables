from django.utils import simplejson
from dajaxice.decorators import dajaxice_register

from models import *

@dajaxice_register
def get_table(request, table):
    tables = Table.objects.filter(id=int(table))
    
    cols = tables[0].column_set.all()
    cols_count = len(cols)
    
    rows = []
    
    k = [0,]
    
    def get_values(column, rows, k, vals_set):
        #vals = [ [v.row.id, v.value] for v in column.charvalue_set.all()]
        for v in vals_set:
            #print v.row.id
            row = False
            for r in rows:
                if r[0] == v.row.id:
                    row = r
            if not row:
                rows += [ [v.row.id, []] ]
                row = rows[len(rows)-1]
            has = False
            for col in row[1]:
                if col[0] == column.id:
                    col[1] = str(v.value)
                    has = True
            if not has:
                row[1] += [ [column.id, str(v.value)] ]
                    
        
        
    def get_all_values(column, rows, k):
      
        get_values(column, rows, k, column.charvalue_set.all())
        get_values(column, rows, k, column.intvalue_set.all())
        get_values(column, rows, k, column.datevalue_set.all())
      
        k[0] += 1
                    
        return [column.name, column.id, column.val_type]
    
    try:
        columns = [get_all_values(column, rows, k) for column in cols]
    except:
        columns = False
    
    print rows
        
    return simplejson.dumps({'message':'Hello World = '+str(table), 'columns':columns, 'rows':rows })

"""
from dajaxice.utils import deserialize_form

@dajaxice_register
def send_form(request, form):
    form = ExampleForm(deserialize_form(form))
    if form.is_valid():
        ...
    ...
"""