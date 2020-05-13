import { Dialog } from '@syncfusion/ej2-popups';
import { PivotView } from '../../pivotview';
import { DrillThroughEventArgs } from '../base/interface';
import { createElement, setStyleAttribute, remove, isNullOrUndefined, isBlazor } from '@syncfusion/ej2-base';
import * as cls from '../../common/base/css-constant';
import { Grid, ColumnModel, Reorder, Resize, ColumnChooser, Toolbar } from '@syncfusion/ej2-grids';
import { VirtualScroll, Selection, Edit, Page, CommandColumn } from '@syncfusion/ej2-grids';
import { IDataSet, INumberIndex, IDataOptions, PivotEngine } from '../../base/engine';
import * as events from '../../common/base/constant';
import { OlapEngine } from '../../base/olap/engine';

/**
 * `DrillThroughDialog` module to create drill-through dialog.
 */
/** @hidden */
export class DrillThroughDialog {
    public parent: PivotView;
    /** @hidden */
    public dialogPopUp: Dialog;
    /** @hidden */
    public drillThroughGrid: Grid;
    /** @hidden */
    public indexString: string[] = [];
    private isUpdated: boolean = false;
    private gridIndexObjects: INumberIndex = {};
    private engine: PivotEngine | OlapEngine;
    private gridData: IDataSet[] = [];

    /**
     * Constructor for the dialog action.
     * @hidden
     */
    constructor(parent?: PivotView) {
        this.parent = parent;
        this.engine = this.parent.dataType === 'olap' ? this.parent.olapEngineModule : this.parent.engineModule;
    }

    /** @hidden */
    public showDrillThroughDialog(eventArgs: DrillThroughEventArgs): void {
        this.gridData = eventArgs.rawData;
        this.removeDrillThroughDialog();
        let drillThroughDialog: HTMLElement = createElement('div', {
            id: this.parent.element.id + '_drillthrough',
            className: cls.DRILLTHROUGH_DIALOG
        });
        this.parent.element.appendChild(drillThroughDialog);
        this.dialogPopUp = new Dialog({
            animationSettings: { effect: 'Fade' },
            allowDragging: false,
            header: this.parent.localeObj.getConstant('details'),
            content: this.createDrillThroughGrid(eventArgs),
            beforeOpen: () => {
                /* tslint:disable:align */
                this.drillThroughGrid.setProperties({
                    dataSource: this.parent.editSettings.allowEditing ?
                        this.dataWithPrimarykey(eventArgs) : this.gridData,
                    height: !this.parent.editSettings.allowEditing ? 300 : 220
                }, false);
            },
            beforeClose: () => {
                if (this.parent.editSettings.allowEditing && this.isUpdated) {
                    let count: number = Object.keys(this.gridIndexObjects).length;
                    let addItems: IDataSet[] = [];
                    /* tslint:disable:no-string-literal */
                    for (let item of this.drillThroughGrid.dataSource as IDataSet[]) {
                        if (isNullOrUndefined(item['__index']) || item['__index'] === '') {
                            for (let field of this.engine.fields) {
                                if (isNullOrUndefined(item[field])) {
                                    delete item[field];
                                }
                            }
                            delete item['__index'];
                            addItems.push(item);
                        } else if (count > 0) {
                            if (isBlazor() && this.parent.editSettings.allowCommandColumns) {
                                this.parent.engineModule.data[Number(item['__index'])] = item;
                            }
                            delete this.gridIndexObjects[item['__index'].toString()];
                            count--;
                        }
                    }
                    count = 0;
                    if (isBlazor() && this.parent.enableVirtualization) {
                        let currModule: DrillThroughDialog = this;
                        /* tslint:disable:no-any */
                        (currModule.parent as any).interopAdaptor.invokeMethodAsync(
                            'PivotInteropMethod', 'updateRawData', {
                            'AddItem': addItems, 'RemoveItem': currModule.gridIndexObjects, 'ModifiedItem': currModule.gridData
                        }).then((data: any) => {
                            currModule.parent.updateBlazorData(data, currModule.parent);
                            currModule.parent.allowServerDataBinding = false;
                            currModule.parent.setProperties({ pivotValues: currModule.parent.engineModule.pivotValues }, true);
                            delete (currModule.parent as any).bulkChanges.pivotValues;
                            currModule.parent.allowServerDataBinding = true;
                            currModule.isUpdated = false;
                            currModule.gridIndexObjects = {};
                        });
                        /* tslint:enable:no-any */
                    } else {
                        let items: IDataSet[] = [];
                        let data: IDataSet[] = (this.parent.allowDataCompression && this.parent.enableVirtualization) ?
                            this.parent.engineModule.actualData : this.parent.engineModule.data;
                        for (let item of data as IDataSet[]) {
                            delete item['__index'];
                            if (this.gridIndexObjects[count.toString()] === undefined) {
                                items.push(item);
                            }
                            count++;
                        }
                        /* tslint:enable:no-string-literal */
                        items = items.concat(addItems);
                        this.parent.setProperties({ dataSourceSettings: { dataSource: items } }, true);
                        (this.engine as PivotEngine).updateGridData(this.parent.dataSourceSettings as IDataOptions);
                        this.parent.pivotValues = this.engine.pivotValues;
                    }
                }
                if (!(isBlazor() && this.parent.enableVirtualization)) {
                    this.isUpdated = false;
                    this.gridIndexObjects = {};
                }
            },
            isModal: true,
            visible: true,
            showCloseIcon: true,
            locale: this.parent.locale,
            enableRtl: this.parent.enableRtl,
            width: this.parent.isAdaptive ? '100%' : '60%',
            position: { X: 'center', Y: 'center' },
            closeOnEscape: true,
            target: document.body,
            close: this.removeDrillThroughDialog.bind(this)
        });
        this.dialogPopUp.isStringTemplate = true;
        this.dialogPopUp.appendTo(drillThroughDialog);
        // this.dialogPopUp.element.querySelector('.e-dlg-header').innerHTML = this.parent.localeObj.getConstant('details');
        setStyleAttribute(this.dialogPopUp.element, { 'visibility': 'visible' });
    }

    private removeDrillThroughDialog(): void {
        if (this.dialogPopUp && !this.dialogPopUp.isDestroyed) {
            this.dialogPopUp.destroy();
        }
        let dialogElement: HTMLElement = document.getElementById(this.parent.element.id + '_drillthrough');
        if (dialogElement) {
            remove(dialogElement);
        }
        if (document.getElementById(this.parent.element.id + '_drillthroughgrid_ccdlg')) {
            remove(document.getElementById(this.parent.element.id + '_drillthroughgrid_ccdlg'));
        }
    }

    /* tslint:disable:max-func-body-length */
    private createDrillThroughGrid(eventArgs: DrillThroughEventArgs): HTMLElement {
        let drillThroughBody: HTMLElement =
            createElement('div', { id: this.parent.element.id + '_drillthroughbody', className: cls.DRILLTHROUGH_BODY_CLASS });
        let drillThroughBodyHeader: HTMLElement =
            createElement('div', {
                id: this.parent.element.id +
                    '_drillthroughbodyheader', className: cls.DRILLTHROUGH_BODY_HEADER_CONTAINER_CLASS
            });
        if (eventArgs.rowHeaders !== '') {
            drillThroughBodyHeader.innerHTML = '<span class=' +
                cls.DRILLTHROUGH_BODY_HEADER_COMMON_CLASS + '><span class=' + cls.DRILLTHROUGH_BODY_HEADER_CLASS + '>' +
                this.parent.localeObj.getConstant('row') + '</span> :<span class=' +
                cls.DRILLTHROUGH_BODY_HEADER_VALUE_CLASS + '>' + eventArgs.rowHeaders + '</span></span>';
        }
        if (eventArgs.columnHeaders !== '') {
            drillThroughBodyHeader.innerHTML = drillThroughBodyHeader.innerHTML + '<span class=' +
                cls.DRILLTHROUGH_BODY_HEADER_COMMON_CLASS + '><span class=' +
                cls.DRILLTHROUGH_BODY_HEADER_CLASS + '>' + this.parent.localeObj.getConstant('column') +
                '</span> :<span class=' + cls.DRILLTHROUGH_BODY_HEADER_VALUE_CLASS + '>' +
                eventArgs.columnHeaders + '</span></span>';
        }
        if (eventArgs.value !== '') {
            let measure: string = eventArgs.value.split('(')[0];
            let value: string = eventArgs.value.split('(')[1].split(')')[0];
            if (value !== '0') {
                drillThroughBodyHeader.innerHTML = drillThroughBodyHeader.innerHTML + '<span class=' +
                    cls.DRILLTHROUGH_BODY_HEADER_COMMON_CLASS + '><span class=' +
                    cls.DRILLTHROUGH_BODY_HEADER_CLASS + '>' +
                    measure + '</span> :<span class=' + cls.DRILLTHROUGH_BODY_HEADER_VALUE_CLASS + '>' + value + '</span></span>';
            }
        }
        let toolbarItems: string[] = ['ColumnChooser'];
        if (this.parent.editSettings.allowEditing) {
            if (this.parent.editSettings.allowCommandColumns) {
                toolbarItems = ['ColumnChooser', 'Add'];
            } else if (this.parent.editSettings.mode === 'Batch') {
                toolbarItems = ['ColumnChooser', 'Add', 'Delete', 'Update', 'Cancel'];
            } else if (this.parent.editSettings.mode === 'Dialog') {
                toolbarItems = ['ColumnChooser', 'Add', 'Edit', 'Delete'];
            } else {
                toolbarItems = ['ColumnChooser', 'Add', 'Edit', 'Delete', 'Update', 'Cancel'];
            }
        }
        let drillThroughGrid: HTMLElement =
            createElement('div', { id: this.parent.element.id + '_drillthroughgrid', className: cls.DRILLTHROUGH_GRID_CLASS });
        Grid.Inject(Selection, Reorder, Resize, Toolbar, ColumnChooser);
        this.drillThroughGrid = new Grid({
            gridLines: 'Default',
            allowResizing: true,
            allowReordering: true,
            showColumnChooser: true,
            enableHover: false,
            toolbar: toolbarItems,
            columns: eventArgs.gridColumns,
            locale: this.parent.locale,
            enableRtl: this.parent.enableRtl,
            enableVirtualization: !this.parent.editSettings.allowEditing,
            allowPaging: this.parent.editSettings.allowEditing
        });
        if (isBlazor()) {
            /* tslint:disable-next-line */
            (this.drillThroughGrid as any)['isJsComponent'] = true;
        }
        if (this.parent.dataType === 'olap') {
            this.formatData();
        }
        let dialogModule: DrillThroughDialog = this;
        this.parent.trigger(events.beginDrillThrough, {
            cellInfo: eventArgs,
            gridObj: isBlazor() ? undefined : this.drillThroughGrid,
            type: 'editing'
        });
        if (this.parent.editSettings.allowEditing) {
            Grid.Inject(Edit, Page);
            this.drillThroughGrid.editSettings = this.parent.editSettings;
            if (this.parent.editSettings.allowCommandColumns) {
                this.drillThroughGrid.editSettings.mode = 'Normal';
                this.drillThroughGrid.editSettings.allowEditOnDblClick = false;
                Grid.Inject(CommandColumn);
                (this.drillThroughGrid.columns as ColumnModel[]).push({
                    headerText: this.parent.localeObj.getConstant('manageRecords'), width: 160, showInColumnChooser: false,
                    commands: [
                        { type: 'Edit', buttonOption: { iconCss: ' e-icons e-edit', cssClass: 'e-flat' } },
                        { type: 'Delete', buttonOption: { iconCss: 'e-icons e-delete', cssClass: 'e-flat' } },
                        { type: 'Save', buttonOption: { iconCss: 'e-icons e-update', cssClass: 'e-flat' } },
                        { type: 'Cancel', buttonOption: { iconCss: 'e-icons e-cancel-icon', cssClass: 'e-flat' } }]
                });
            } else {
                this.drillThroughGrid.editSettings.allowEditOnDblClick = this.parent.editSettings.allowEditOnDblClick;
            }
            /* tslint:disable:align */
            (this.drillThroughGrid.columns as ColumnModel[]).push({
                field: '__index', visible: false, isPrimaryKey: true, type: 'string', showInColumnChooser: false
            });
            /* tslint:disable-next-line:no-any */
            this.drillThroughGrid.actionComplete = (args: any) => {
                if (args.requestType === 'batchsave' || args.requestType === 'save' || args.requestType === 'delete') {
                    dialogModule.isUpdated = true;
                }
                if ((dialogModule.drillThroughGrid.editSettings.mode === 'Normal' && args.requestType === 'save' &&
                    dialogModule.drillThroughGrid.element.querySelectorAll('.e-tbar-btn:hover').length > 0 &&
                    !dialogModule.parent.editSettings.allowCommandColumns) || args.requestType === 'batchsave') {
                    dialogModule.dialogPopUp.hide();
                }
            };
            this.drillThroughGrid.beforeBatchSave = () => {
                dialogModule.isUpdated = true;
            };
            /* tslint:enable:align */
        } else {
            Grid.Inject(VirtualScroll);
        }
        document.body.appendChild(drillThroughGrid);
        this.drillThroughGrid.isStringTemplate = true;
        this.drillThroughGrid.appendTo(drillThroughGrid);
        drillThroughBody.appendChild(drillThroughBodyHeader);
        drillThroughBody.appendChild(drillThroughGrid);
        return drillThroughBody;
    }
    /** @hidden */
    public frameGridColumns(rawData: IDataSet[]): ColumnModel[] {
        let keys: string[] = this.parent.dataType === 'olap' ? rawData[0] ? Object.keys(rawData[0]) : [] :
            Object.keys(this.engine.fieldList);
        let columns: ColumnModel[] = [];
        if (this.parent.dataType === 'olap') {
            for (let key of keys) {
                columns.push({
                    field: key.replace(/_x005B_|_x0020_|_x005D_|_x0024_/g, '').replace('].[', '').split('.').reverse().join(''),
                    headerText: key.replace(/_x005B_|_x005D_|_x0024_/g, '').replace(/_x0020_/g, ' ').
                        replace('].[', '').split('.').reverse().join('.'),
                    width: 120,
                    visible: true,
                    validationRules: { required: true },
                    type: 'string'
                });
            }
        } else {
            for (let key of keys) {
                if (this.engine.fieldList[key].aggregateType !== 'CalculatedField') {
                    let editType: string = '';
                    if (this.engine.fieldList[key].type === 'number') {
                        editType = 'numericedit';
                    } else if (this.engine.fieldList[key].type === 'date') {
                        editType = 'datepickeredit';
                    } else {
                        editType = 'defaultedit';
                    }
                    columns.push({
                        field: key,
                        headerText: this.engine.fieldList[key].caption,
                        width: 120,
                        visible: this.engine.fieldList[key].isSelected,
                        validationRules: { required: true },
                        editType: editType,
                        type: 'string'
                    });
                }
            }
        }
        return columns;
    }

    private formatData(): void {
        let index: number = 0;
        while (index < this.gridData.length) {
            let data: IDataSet = this.gridData[index];
            let keys: string[] = Object.keys(this.gridData[index]);
            let newData: IDataSet = {};
            let i: number = 0;
            while (i < keys.length) {
                let key: string = keys[i].replace(/_x005B_|_x0020_|_x005D_|_x0024_/g, '').replace('].[', '').split('.').reverse().join('');
                newData[key] = data[keys[i]];
                i++;
            }
            this.gridData[index] = newData;
            index++;
        }
    }

    private dataWithPrimarykey(eventArgs: DrillThroughEventArgs): IDataSet[] {
        let indexString: string[] = this.indexString.length > 0 ? this.indexString : Object.keys(eventArgs.currentCell.indexObject);
        let rawData: IDataSet[] = this.gridData;
        let count: number = 0;
        for (let item of rawData) {
            /* tslint:disable-next-line:no-string-literal */
            item['__index'] = indexString[count];
            this.gridIndexObjects[indexString[count].toString()] = Number(indexString[count]);
            count++;
        }
        return rawData;
    }
}