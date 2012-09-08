/*! dynamictables - v0.0.1 - 2012-09-15
* https://github.com/..
* Includes: ..
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */

//{% load dajaxice_templatetags %}

function DynamicTables() {
    var th = this;
    var value_onclick = "onclick='dynamicTables.enable_edit($(this));'";
    var temp = [];
    var last_editor = new Object;
    var valuer = new Object;
    valuer.queue = {};
    valuer.id = 0;
    var table_id_list = [];
    
    var COL_ID_NUM = 1;
    var COL_TITLE_NUM = 0;
    var COL_TYPE_NUM = 2;
    
    var CELL_VALUE_NUM = 1;
    var CELL_ID_NUM = 0;
    
    var ROW_ID_NUM = 0;
    var ROW_DATA_NUM = 1;
    
    function fillTable(data) {
        try {
            th.tablePanel.innerHTML = "<table>" + getHeadHtml(data) +
                getRowsHtml(data) + "</table>";
        } catch (e) {}
    }
    function getHeadHtml(data) {
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
    function clearTempValues() {
        for (var j=0; j < temp.length; ++j) {
            temp[j].value = '';
        }
    }
    function generateRowInner(row_id) {
        var rowHtml = "<tr id='" + row_id+ "'>";
        for (var j=0; j < temp.length; ++j) {
            rowHtml += "<td id='" + temp[j].id +
                "' " + value_onclick + ">" + temp[j].value + "</td>";
        }
        rowHtml += "<td><a href='#' onclick='dynamicTables.removeRow("+row_id+");'>Del row...</a></td>";
        return rowHtml + "</tr>";
    }
    function getClearRowInner(row_id) {
        clearTempValues();
        return generateRowInner(row_id);
    }
    function getRowsHtml(data) {
        var allRowsHtml = "";

        function fillTempValues(rowData) {
            for (var j=0; j < rowData.length; ++j) {
                var id = rowData[j][CELL_ID_NUM];
                for (var k=0; k < temp.length; ++k) {
                    if (temp[k].id == id) {
                        temp[k].value = rowData[j][CELL_VALUE_NUM];
                        break;
                    }
                }
            }
        }
        function getTempSumToRow(row) {
            var row_id = row[ROW_ID_NUM];
            var rowHtml = "<tr id='" + row_id+ "'>";
            rowHtml += generateRowInner(row_id);
            return rowHtml + "</tr>";
        }
        function getRowHtml(row) {
            clearTempValues();
            fillTempValues(row[ROW_DATA_NUM]);
            return getTempSumToRow(row);
        }

        for (var i=0; i < data.rows.length; ++i) {
            allRowsHtml += getRowHtml(data.rows[i]);
        }
        allRowsHtml += "<tr><td><a href='#' onclick='dynamicTables.appendRow();'>Add row...</a></td></tr>";
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
    this.validate_editor = function() {
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
    this.enable_edit = function($cell) {
        var row = $cell.parent().attr('id');
        var col = $cell.attr('id');
        var col_type = getColumnType(col);
        
        if (isOnInput($cell)) {
            return;
        }

        last_editor.value = $cell.text();
      
        last_editor.type = col_type;
        
        function enableSimpleEditor($cell, type) {
            $cell.html("<input type='"+type+"' value='"+$cell.text()+"' onblur='dynamicTables.validate_editor();' />");
            last_editor.$cell = $cell;
            last_editor.$instance = $cell.children()[0];
            last_editor.$instance.focus();
        }
        function enableDateEditor($cell) {
            var $dp = $('#datepicker_holder>input');
            $dp.val(last_editor.value);

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

    function getRowById(row_id) {
        try {
            var table = th.tablePanel.firstChild();
            for (var i=0; i<table.childNodes.length; ++i) {
                var row = table.childNodes[i];
                if (row.id==row_id) {
                    return row;
                }
            }
        } catch (e) {}
        return false;
    }

    this.appendRow = function() {
        var newRow = document.createElement('tr');
        newRow.innerHTML = getClearRowInner(-1);
        newRow.setAttribute("id", '-1');
        var table = th.tablePanel.firstChild;
        table.appendChild(newRow);
    }
    this.removeRow = function(row_id) {
        //try {
            var row = getRowById(row_id);
            var table = th.tablePanel.firstChild;
            table.removeChild(row);
        //} catch (e) {}
    }


    function validate(val, f_type, $cell) {
        valuer.queue[valuer.id]=$cell;
        var f = {'field':val+''};
        Dajaxice.dynamictables.send_form(updateCell, {'form':f,
            'f_type':f_type, 'id':valuer.id, 'col':$cell.attr('id'), 'row':$cell.parent().attr('id')});
        ++(valuer.id);
    }

    function updateCell(data) {
        var $cell = valuer.queue[data.id];
        var color = "#009900";
        if (data.errors.length) {
            color = "#ff0000";
        }
        $cell.css("border", "1px solid "+color);
    }

    this.pushTableId = function(id) {
        table_id_list.push(id);
    }
    this.activateFirstTable = function() {
        try {
            th.activateTableById(table_id_list[0]);
        } catch(e) {}
    }
    this.activateTableById = function(id) {
        Dajaxice.dynamictables.get_table(fillTable, {'table':id});
    }
    this.activateTable = function($table) {
        th.activateTableById($table.attr('id'));
    }
}

//{% dajaxice_js_import %}


/* https://github.com/..
* Includes: ..
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
