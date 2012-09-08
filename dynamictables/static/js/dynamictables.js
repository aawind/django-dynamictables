/*! dynamictables - v0.0.1 - 2012-09-15
* https://github.com/..
* Includes: ..
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */

//{% load dajaxice_templatetags %}

function DynamicTables() {
    var th = this;
    var value_onclick = "onclick='enable_edit($(this));'";
    var temp = [];
    var last_editor = new Object;
    var valer = new Object;
    valer.queue = {};
    valer.id = 0;
    
    var COL_ID_NUM = 1;
    var COL_TITLE_NUM = 0;
    var COL_TYPE_NUM = 2;
    
    var CELL_VALUE_NUM = 1;
    var CELL_ID_NUM = 0;
    
    var ROW_ID_NUM = 0;
    var ROW_DATA_NUM = 1;
    
    function fillTable(data) {
        right_panel.innerHTML = "<table>" + getHeadHtml() + 
            getRowsHtml() + "</table>";
    }
    function getHeadHtml() {
        var head = "";
        temp.length = 0;
        
        function fillCell(cellData) {
            head += "<td id='" + cellData.id + "'>" + cellData.title + "</td>";
            temp.push(cellData);
        }
        function CellData(cellArray) {
            this.id = cellArray[COL_ID_NUM];
            this.title = cellArray[COL_TITLE_NUM];
            this.type = cellArray[COL_TYPE_NUM];
        }
        
        for (var i=0; i < data.columns.length; ++i) {
            var cellData = new CellData(data.columns[i]);
            fillCell(cellData);
        }
        return "<tr>"+head+"</tr>";
	}
    function getRowsHtml() {
        var allRowsHtml = "";
        
        function clearTempValues() {
            for (var j=0; j < temp.data.length; ++j) {
                temp[j].value = false;
            }
        }
        function fillTempValues(rowData) {
            for (var j=0; j < rowData.length; ++j) {
                var id = rowData[j][CELL_ID_NUM];
                for (var k=0; k < cols.length; ++k) {
                    if (temp[k].id == id) {
                        temp[k].value = rowData[j][CELL_VALUE_NUM];
                        break;
                    }
                }
            }
        }
        function getTempSumToRow(row) {
            var rowHtml = "<tr id='" + row[ROW_ID_NUM]+ "'>"; 
            for (var j=0; j < temp.length; ++j) {
                rowHtml += "<td id='" + temp[j].id + 
                    "' " + value_onclick + ">" + temp[j].value + "</td>";
            }
            return rowHtml + "</tr>";
        }
        function getRowHtml(row) {
            clearColsValues();
            fillColsValues(row[ROW_DATA_NUM]);
            return getTempSumToRow(row);
        }

        for (var i=0; i < data.rows.length; ++i) {
            allRowsHtml += getRowHtml(data.rows[i]);
        }        
        return allRowsHtml;
    }
    function getColumnType(columnId) {
        for (var i=0; i<temp.length; ++i) {
            if (temp[i].id==columnId) {
              return temp[i].type;
            }
        }
        return false;
    }
    function validate_editor() {
        switch (last_editor.type) {
        case 'C':
        case 'I':
            var val = last_editor.$instance.value;
            last_editor.$cell.text(val);
            validate(val, last_editor.type, last_editor.$cell);
            break;
        case 'D': 
            var $dph = $('#datepicker_holder');
            last_editor.$instance.detach().prependTo($dph);
            dt = last_editor.$instance.datepicker('getDate');
            dt_s = $.datepicker.formatDate(
                'yy-mm-dd',
                last_editor.$instance.datepicker("getDate")
            );
            last_editor.$cell.text(dt_s);
            validate(dt_s,'D',last_editor.$cell);
            break;
        }
        last_editor.type = false;
        last_editor.$cell = false;
        last_editor.$instance = false;
    }
    function isOnInput($cell) {
        var tg = false;
        try {
            tg = $cell.children()[0].tagName;
        } catch (e) {}
        if (tg == "input" || tg == "INPUT" ) {
            return true;
        }
        return false;
    }
    function enable_edit($cell) {
        var row = $cell.parent().attr('id');
        var col = $cell.attr('id');
        var col_type = getColumnType(col);
        
        if (isOnInput($cell)) {
            return;
        }
      
        current_edit.innerHTML = $cell.text();
      
        last_editor.type = col_type;
        
        function enableSimpleEditor($cell, type) {
            $cell.html("<input type='"+type+"' value='"+$cell.text()+"' onblur='validate_editor();' />");
            last_editor.$cell = $cell;
            last_editor.$instance = $cell.children()[0];
            last_editor.$instance.focus();
        }
        function enableDateEditor($cell) {
            var $dp = $('#datepicker_holder>input');
            $dp.val(current_edit.innerHTML);

            $dp.datepicker( "setDate" , $cell.text() );
            $cell.text('');

            $dp.detach().prependTo($cell);
            $dp.focus();
            last_editor.$instance = $dp;
            last_editor.$cell = $cell;
        }
        
        switch (col_type) {
        case 'C':
            enableSimpleEditor($cell, 'text');
            break;
        case 'I':
            enableSimpleEditor($cell, 'int');
            break;
        case 'D':
            enableDateEditor($cell);
            break;
        }
      
    }
    function activate_table_by_id(id) {
        Dajaxice.dynamictables.get_table(callback, {'table':id});
    }
    function activate_table($table) {
        activate_table_by_id($table.attr('id'));
    }
    
    function validate(val, f_type, $cell) {
        valer.queue[valer.id]=$cell;
        var f = {'field':val+''};
        Dajaxice.dynamictables.send_form(form_result, {'form':f,
            'f_type':f_type, 'id':valer.id, 'col':$cell.attr('id'), 'row':$cell.parent().attr('id')});
        ++(valer.id);
    }

    function form_result(data) {
        $cell = valer.queue[data.id];
        var color = "#009900";
        if (data.errors.length) color = "#ff0000";
        $cell.css("border", "1px solid "+color);
    }
}
        
$(function(){
  $.datepicker.setDefaults(
    $.extend($.datepicker.regional["ru"])
  );
  $("#datepicker").datepicker({ dateFormat: "yy-mm-dd" });
  $('#datepicker').blur(function (e) {validate_editor();});
});

//{% dajaxice_js_import %}


/* https://github.com/..
* Includes: ..
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
