/**
 * Context Menu default sample
 */
import { Browser } from '@syncfusion/ej2-base';
import { CheckBox, ChangeEventArgs } from '@syncfusion/ej2-buttons';
import { Menu, MenuModel } from './../../src/menu/index';
import { MenuEventArgs, MenuItemModel } from '../../src/common/index';
import { enableRipple } from '@syncfusion/ej2-base';

enableRipple(true);

let menuItems: MenuItemModel[] = [
    {
        text: 'Home'
    },
    {
        text: 'Book Categories',
        id: 'books',
        items: [
            {
                text: 'Cookbooks',
                items: [
                    {
                        text: 'Desserts'
                    },
                    {
                        text: 'South Indian Cooks'
                    },
                    {
                        text: 'Cooking tips'
                    }
                ]
            },
            {
                text: 'Children',
                id: 'children',
                items: [
                    {
                        text: 'Tales'
                    },
                    {
                        text: 'Animals'
                    },
                    {
                        text: 'Dreams',
                        id: 'dreams'
                    }
                ]
            },
            {
                text: 'technologies',
                id: 'technologies',
                items: [
                    {
                        text: 'Programming Languages'
                    },
                    {
                        text: 'Wifi Hacking'
                    },
                    {
                        text: 'Upcoming Tech'
                    }
                ]
            }
        ]
    },
    {
        text: 'Purchase'
    },
    {
        text: 'Contact Us'
    },
    {
        separator: true,
    },
    {
        text: 'Login',
        id: 'login'
    }
];

let menuOptions: MenuModel = {
    items: menuItems,
    beforeItemRender: (args: MenuEventArgs) => {
        if (args.item.url) {
            args.element.getElementsByTagName('a')[0].setAttribute('target', '_blank');
        }
    }
};

let menuObj: Menu = new Menu(menuOptions, '#menu');

if (Browser.isDevice) {
    document.body.classList.add('e-bigger');
}
let checkBoxObj: CheckBox = new CheckBox({ label: 'Enable Touch Mode', checked: Browser.isDevice ? true : false, change: onChange });
checkBoxObj.appendTo('#touchMode');

let hamburgerCHKObj: CheckBox = new CheckBox({ label: 'Hamburger Mode', checked: menuObj.hamburgerMode, change: onModeChange });
hamburgerCHKObj.appendTo('#hamburgerMode');

document.getElementById('material').onclick = (e: Event) => {
    document.body.classList.remove('darkBG');
    enableRipple(true);
    menuObj.refresh();
    document.getElementById('theme').setAttribute('href', './theme-files/material.css');
};
document.getElementById('fabric').onclick = (e: Event) => {
    document.body.classList.remove('darkBG');
    enableRipple(false);
    menuObj.refresh();
    document.getElementById('theme').setAttribute('href', './theme-files/fabric.css');
};
document.getElementById('bootstrap').onclick = (e: Event) => {
    document.body.classList.remove('darkBG');
    enableRipple(false);
    menuObj.refresh();
    document.getElementById('theme').setAttribute('href', './theme-files/bootstrap.css');
};
document.getElementById('highcontrast').onclick = (e: Event) => {
    document.body.classList.add('darkBG');
    enableRipple(false);
    menuObj.refresh();
    document.getElementById('theme').setAttribute('href', './theme-files/highcontrast.css');
};
document.getElementById('materialdark').onclick = (e : Event) => {
    document.body.classList.add('darkBG');
    enableRipple(false);
    menuObj.refresh();
    document.getElementById('theme').setAttribute('href', './theme-files/material-dark.css');
};
document.getElementById('bootstrapdark').onclick = (e : Event) => {
    document.body.classList.add('darkBG');
    enableRipple(false);
    menuObj.refresh();
    document.getElementById('theme').setAttribute('href', './theme-files/bootstrap-dark.css');
};
document.getElementById('fabricdark').onclick = (e : Event) => {
    document.body.classList.add('darkBG');
    enableRipple(false);
    menuObj.refresh();
    document.getElementById('theme').setAttribute('href', './theme-files/fabric-dark.css');
};
document.getElementById('bootstrap4').onclick = (e : Event) => {
    document.body.classList.remove('darkBG');
    enableRipple(false);
    menuObj.refresh();
    document.getElementById('theme').setAttribute('href', './theme-files/bootstrap4.css');
};

// function to handle the CheckBox change event
function onChange(args: ChangeEventArgs): void {
    if (args.checked) {
        menuObj.cssClass = 'e-bigger';
    } else {
        menuObj.cssClass = '';
    }
}

function onModeChange(args: ChangeEventArgs): void {
    menuObj.hamburgerMode = args.checked;
    menuObj.showItemOnClick = args.checked;
}
