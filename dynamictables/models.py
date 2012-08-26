# -*- coding: utf-8 -*-
from django.db import models
"""    
class Tables(models.Model):
    name = models.CharField(max_length=50)
    columns = models.ManyToManyField('Columns')
    rows = models.ManyToManyField('Rows')
    
class Columns(models.Model):
    name = models.CharField(max_length=50)
    value_type = models.ManyToManyField('Columns')

class Rows(models.Model):
    name = models.CharField(max_length=50)

    
# сами значения
class CharValues(models.Model):
    values = models.CharField(max_length=50)
    row = models.ForeignKey('AllRows')
    
class IntValues(models.Model):
    values = models.IntegerField()
    row = models.ForeignKey('AllRows')
    
class DateValues(models.Model):
    values = models.DateField()
    row = models.ForeignKey('AllRows')
""" 

    
class Table(models.Model):
    name = models.CharField(max_length=50)
    #columns = models.ManyToManyField('Column')
    def __unicode__(self):
        return self.name

class Column(models.Model):
    TYPE_CHOICES = (
        ('C', 'Char'),
        ('I', 'Int'),
        ('D', 'Date'),
    )
    name = models.CharField(max_length=50)
    val_type = models.CharField(max_length=1, choices=TYPE_CHOICES)
    table = models.ForeignKey(Table)
    
    def __unicode__(self):
        return self.name
    
class Row(models.Model):
    def __unicode__(self):
        arr = []
        table = [ False, ]
        def get_arr(vals_set, arr, table):
            for v in vals_set.all():
                arr += [str(v)]
                if not table[0]:
                    try:
                        table[0] = str(v.column.table)#_set.get())
                        print "table =", table
                    except:# DoesNotExist:
                        pass
        get_arr(self.charvalue_set, arr, table)
        get_arr(self.intvalue_set, arr, table)
        get_arr(self.datevalue_set, arr, table)
        s = ", ".join(arr)
        return " ".join([str(self.id), ":", "table", "=", str(table[0]), ":", s])
"""
class Value(models.Model):
    column = models.ForeignKey(Column)
    row = models.ForeignKey(Row)
    
    char_value = models.CharField(max_length=50,blank=True)
    int_value = models.IntegerField(blank=True,default=0)
    date_value = models.DateField(blank=True)
    def __unicode__(self):
        s = "-"
        if self.column.val_type == 'C':
            s = str(self.char_value)
        elif self.column.val_type == 'I':
            s = str(self.int_value)
        elif self.column.val_type == 'D':
            s = str(self.date_value)
        return " ".join([self.column.name, "=", s])
"""
        
#-----------------

class Value(models.Model):
    column = models.ForeignKey(Column)
    row = models.ForeignKey(Row)
    
    class Meta:
        abstract = True
        
    def __unicode__(self):
        return " ".join([self.column.name, "=", str(self.value)])

class CharValue(Value):
    value = models.CharField(max_length=50,blank=True)
    #def get_value(self):
    #    return self.value
    
class IntValue(Value):
    value = models.IntegerField(blank=True,default=0)
    
class DateValue(Value):
    value = models.DateField(blank=True)

"""
class ParamsValues(models.Model):

    name = models.CharField(max_length=20)
    slug = models.SlugField(blank=True)

    class Meta:
        ordering = ("name",)

    def __unicode__(self):
        return self.name

    @models.permalink
    def get_absolute_url(self):
        return ("room", (self.slug,))

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super(ChatRoom, self).save(*args, **kwargs)
"""