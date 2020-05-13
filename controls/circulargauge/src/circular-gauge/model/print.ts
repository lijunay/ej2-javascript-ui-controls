import { print as printWindow, createElement} from '@syncfusion/ej2-base';
import { CircularGauge} from '../../index';
import { getElement } from '../utils/helper';
import { IPrintEventArgs } from './interface';
import { beforePrint } from './constants';


/**
 * Represent the print for gauge 
 * @hidden
 */
export class Print {
    private control: CircularGauge ;
    private printWindow: Window;

    /**
     * Constructor for gauge
     * @param control 
     */
    constructor(control: CircularGauge) {
        this.control = control;
    }

    /**
     * To print the gauge
     * @param elements 
     * @private
     */
    public print(elements?: string[] | string | Element): void {
        this.printWindow = window.open('', 'print', 'height=' + window.outerHeight + ',width=' + window.outerWidth + ',tabbar=no');
        this.printWindow.moveTo(0, 0);
        this.printWindow.resizeTo(screen.availWidth, screen.availHeight);
        let argsData: IPrintEventArgs = {
            cancel: false, htmlContent: this.getHTMLContent(elements), name: beforePrint
        };
        this.control.trigger('beforePrint', argsData, (beforePrintArgs: IPrintEventArgs) => {
            if (!argsData.cancel) {
                printWindow(argsData.htmlContent, this.printWindow);
            }
        });
    }

    /**
     * To get the html string of the gauge 
     * @param elements 
     * @private
     */
    public getHTMLContent(elements?: string[] | string | Element): Element {
        let div: Element = createElement('div');
        if (elements) {
            if (elements instanceof Array) {
                elements.forEach((value: string) => {
                    div.appendChild(getElement(value).cloneNode(true) as Element);
                });
            } else if (elements instanceof Element) {
                div.appendChild(elements.cloneNode(true) as Element);
            } else {
                div.appendChild(getElement(elements).cloneNode(true) as Element);
            }
        } else {
            div.appendChild(this.control.element.cloneNode(true) as Element);
        }
        return div;
    }


    protected getModuleName(): string {
        // Returns te module name
        return 'Print';
    }

    /**
     * To destroy the Print.
     * @return {void}
     * @private
     */
    public destroy(gauge: CircularGauge): void {
        // Destroy method performed here
    }


}