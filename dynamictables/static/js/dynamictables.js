/*! dynamictables - v0.0.1 - 2012-09-15
* https://github.com/..
* Includes: ..
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */

//{% load dajaxice_templatetags %}

//function DynamicTablesConsts() {
    DynamicTablesConsts_COL_ID_NUM = 1;
    DynamicTablesConsts_COL_TITLE_NUM = 0;
    DynamicTablesConsts_COL_TYPE_NUM = 2;

    DynamicTablesConsts_CELL_VALUE_NUM = 1;
    DynamicTablesConsts_CELL_ID_NUM = 0;

    DynamicTablesConsts_ROW_ID_NUM = 0;
    DynamicTablesConsts_ROW_DATA_NUM = 1;

    DynamicTablesConsts_VALUE_ONCLICK = "onclick='dynamicTables.enable_edit($(this));'";
//}

function DynamicTables() {
    var th = this;
    th.table_id_list = [];

    var tableDrawer = new TableDrawer();
    var editor = new Editor();
    var cell = new Cell();
    cell.editor = editor;
    cell.colsBuffer = tableDrawer.colsBuffer;

    th.validate_editor = function() {
        editor.validator.validate();
    }
    th.enable_edit = function($cell) {
        cell.$cell = $cell;
        cell.enable_edit();
    }
    th.appendRow = function() {
        tableDrawer.rowsEditor.appendRow();
    }
    th.removeRow = function(row_id) {
        tableDrawer.rowsEditor.removeRow();
    }
    th.pushTableId = function(id) {
        th.table_id_list.push(id);
    }
    th.activateFirstTable = function() {
        try {
            th.activateTableById(th.table_id_list[0]);
        } catch(e) {}
    }
    th.activateTableById = function(id) {
        Dajaxice.dynamictables.get_table(fillTableFromAjax, {'table':id});
    }
    th.activateTable = function($table) {
        th.activateTableById($table.attr('id'));
    }
    function fillTableFromAjax(data) {
        tableDrawer.data = data;
        tableDrawer.tablePanel = th.tablePanel;
        tableDrawer.draw();
    }
}

function TableDrawer() {
    var th = this;
    th.rowsEditor = new RowsEditor();
    th.colsBuffer = new ColsBuffer();
    var headDrawer =  new HeadDrawer(th.colsBuffer);
    var rowsDrawer = new RowsDrawer(th.colsBuffer);

    th.draw = function() {
        //try {
            headDrawer.data = th.data;
            rowsDrawer.data = th.data;
            th.tablePanel.innerHTML = "<table>" + headDrawer.draw() +
                rowsDrawer.draw() + "</table>";
        //} catch (e) {}
    }
}

function HeadDrawer(colsBuffer) {
    var th = this;
    th.colsBuffer = colsBuffer;
    var head = "";

    th.draw = function() {
        head = "";
        th.colsBuffer.clear();
        for (var i=0; i < th.data.columns.length; ++i) {
            var cellData = new CellData(th.data.columns[i]);
            fillCell(cellData);
        }
        return "<tr>"+head+"</tr>";
    }
    function fillCell(cellData) {
        head += "<td id='" + cellData.id + "'>" + cellData.title + "</td>";
        colsBuffer.push(cellData);
    }
    function CellData(cellArray) {
        this.id = cellArray[DynamicTablesConsts_COL_ID_NUM];
        this.title = cellArray[DynamicTablesConsts_COL_TITLE_NUM];
        this.type = cellArray[DynamicTablesConsts_COL_TYPE_NUM];
    }
}

function RowsDrawer(colsBuffer) {
    var th = this;
    var rowDrawer = new RowDrawer(colsBuffer);

    th.draw = function() {
        var allRowsHtml = "";
        for (var i=0; i < th.data.rows.length; ++i) {
            allRowsHtml += rowDrawer.draw(th.data.rows[i]);
                //getRowHtml(th.data.rows[i]);
        }
        allRowsHtml += "<tr><td><a href='#' onclick='dynamicTables.appendRow();'>Add row...</a></td></tr>";
        return allRowsHtml;
    }
}

function RowDrawer(colsBuffer) {
    this.draw = function(row) {
        colsBuffer.clearTempValues();
        colsBuffer.fillTempValues(row[DynamicTablesConsts_ROW_DATA_NUM]);
        return getTempSumToRow(row);
    }
    function getTempSumToRow(row) {
        var row_id = row[DynamicTablesConsts_ROW_ID_NUM];
        var rowHtml = "<tr id='" + row_id+ "'>";
        rowHtml += generateRowInner(row_id);
        return rowHtml + "</tr>";
    }
    function generateRowInner(row_id) {
        var rowHtml = "<tr id='" + row_id+ "'>";
        rowHtml += colsBuffer.toHtml();
        rowHtml += "<td><a href='#' onclick='dynamicTables.removeRow("+row_id+");'>Del row...</a></td>";
        return rowHtml + "</tr>";
    }
    this.getClearRowInner = function(row_id) {
        colsBuffer.clearTempValues();
        return generateRowInner(row_id);
    }
}

function ColsBuffer() {
    var th = this;
    th.temp = [];

    th.clear = function() {
        th.temp.length = 0;
    }
    th.push = function(cellData) {
        th.temp.push(cellData);
    }
    th.clearTempValues = function() {
        for (var j=0; j < th.temp.length; ++j) {
            th.temp[j].value = '';
        }
    }
    th.fillTempValues = function(rowData) {
        for (var j=0; j < rowData.length; ++j) {
            var id = rowData[j][DynamicTablesConsts_CELL_ID_NUM];
            for (var k=0; k < th.temp.length; ++k) {
                if (th.temp[k].id == id) {
                    th.temp[k].value = rowData[j][DynamicTablesConsts_CELL_VALUE_NUM];
                    break;
                }
            }
        }
    }
    th.toHtml = function() {
        var html = '';
        for (var j=0; j < th.temp.length; ++j) {
            html += "<td id='" + th.temp[j].id +
                "' " + DynamicTablesConsts_VALUE_ONCLICK + ">"
                + th.temp[j].value + "</td>";
        }
        return html;
    }
    th.getColumnType = function(columnId) {
        for (var i=0; i<th.temp.length; ++i) {
            if (th.temp[i].id==columnId) {
                return th.temp[i].type;
            }
        }
        return false;
    }
}

function EditorValidator(mainEditor) {
    var th = this;
    th.valuer = new Object;
    th.valuer.queue = {};
    th.valuer.id = 0;

    th.validate = function() {
        var editor = mainEditor.getEditorByType(mainEditor.type);
        editor.validator.validate_edit();
        mainEditor.clear_last_editor();
    }

    function doValidate(val, f_type, $cell) {
        th.valuer.queue[th.valuer.id]=$cell;
        var f = {'field':val+''};
        Dajaxice.dynamictables.send_form(updateCell, {'form':f,
            'f_type':f_type, 'id':th.valuer.id, 'col':$cell.attr('id'), 'row':$cell.parent().attr('id')});
        ++(th.valuer.id);
    }
    function updateCell(data) {
        var $cell = th.valuer.queue[data.id];
        var color = "#009900";
        if (data.errors.length) {
            color = "#ff0000";
        }
        $cell.css("border", "1px solid "+color);
    }
    th.getMainEditor = function() {
        return mainEditor;
    }
}

function SimpleEditorValidator(mainValidator) {
    var th = this;

    th.validate_edit = function() {
        var editor = mainValidator.getMainEditor();
        var val = editor.$instance.value;
        th.editor.$cell.text(val);
        mainValidator.doValidate(val, editor.type, editor.$cell);
    }
}

function DateEditorValidator(mainValidator) {
    var th = this;

    th.validate_edit = function() {
        var $dph = $('#datepicker_holder');
        th.editor.$instance.detach().prependTo($dph);
        var dt = th.editor.$instance.datepicker('getDate');
        var dt_s = $.datepicker.formatDate(
            'yy-mm-dd',
            th.editor.$instance.datepicker("getDate")
        );
        th.editor.$cell.text(dt_s);
        mainValidator.doValidate(dt_s, 'D', th.editor.$cell);
    }
}

function Editor() {
    var th = this;
    th.validator = new EditorValidator(this);
    var simpleEditor = new SimpleEditor(th.validator);
    var dateEditor = new DateEditor(th.validator);

    th.enableEditorInCell = function($cell, col_type) {
        th.value = $cell.text();
        th.type = col_type;
        var type_html = getTypeHtml(th.type);
        var editor = th.getEditorByType(th.type);
        editor.enableEditor($cell, type_html);
    }
    th.getEditorByType = function(type) {
        switch (type) {
            case 'C':
            case 'I':
                return simpleEditor;
            case 'D':
                return dateEditor;
        }
        return false;
    }
    function getTypeHtml(type) {
        if (type == 'C') {
            return 'text';
        } else if (type == 'I') {
            return 'int';
        }
        return '';
    }
    th.clear_last_editor = function() {
        th.type = false;
        th.$cell = false;
        th.$instance = false;
    }
}
function SimpleEditor(mainValidator) {
    var th = this;
    th.validator = new SimpleEditorValidator(mainValidator);
    th.validator.editor = this;

    th.enableEditor = function($cell, type) {
        $cell.html("<input type='"+type+"' value='"+$cell.text()+"' onblur='dynamicTables.validate_editor();' />");
        var editor = mainValidator.getMainEditor();
        editor.$cell = $cell;
        editor.$instance = $cell.children()[0];
        editor.$instance.focus();
    }
}
function DateEditor(mainValidator) {
    var th = this;
    th.validator = new DateEditorValidator(mainValidator);
    th.validator.editor = this;

    th.enableEditor = function($cell) {
        var $dp = $('#datepicker_holder>input');
        var editor = mainValidator.getMainEditor();
        $dp.val(editor.value);

        $dp.datepicker("setDate" , $cell.text());
        $cell.text('');

        $dp.detach().prependTo($cell);
        $dp.focus();
        th.editor.$instance = $dp;
        th.editor.$cell = $cell;
    }
}

function Cell() {
    var th = this;

    this.enable_edit = function() {
        var row = th.$cell.parent().attr('id');
        var col = th.$cell.attr('id');
        var col_type = th.colsBuffer.getColumnType(col);
        //getColumnType(col);

        if (isOnInput()) {
            return;
        }
        th.editor.enableEditorInCell(th.$cell, col_type);
    }
    function isOnInput() {
        var tg = false;
        try {
            tg = th.$cell.children()[0].tagName;
        } catch (e) {}
        if (tg == "input" || tg == "INPUT" ) {
            return true;
        }
        return false;
    }
}

function RowsEditor() {
    var th = this;
    var rowDrawer = new RowDrawer();
    
    this.appendRow = function() {
        var newRow = document.createElement('tr');
        newRow.innerHTML = rowDrawer.getClearRowInner(-1);
        newRow.setAttribute("id", '-1');
        var table = th.tablePanel.firstChild;
        table.insertBefore(newRow, table.lastChild);
        //table.appendChild(newRow);
    }
    this.removeRow = function(row_id) {
        //try {
        var row = getRowById(row_id);
        row.parentNode.removeChild(row);
        //} catch (e) {}
    }
    function getRowById(row_id) {
        try {
            var table = th.tablePanel.firstChild();
            for (var i=0; i<table.childNodes.length; ++i) {
                var row = table.childNodes[i];
                if (row.getAttribute('id')==row_id) {
                    return row;
                }
            }
        } catch (e) {}
        return false;
    }
}


//{% dajaxice_js_import %}


/* https://github.com/..
* Includes: ..
* Copyright (c) 2012 AUTHORS.txt; Licensed MIT, GPL */
