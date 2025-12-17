import { Widget, Signal, randomID } from '../lib/base/widget.js';
import { TabWidget } from '../lib/base/tabwidget.js';
import { FapiItemListWidget } from './fapi_item_list.js'
import { FapiUserListWidget } from './fapi_user_list.js'
import { FapiUserInfoWidget } from './fapi_userinfowidget.js'
import { ChangePasswordWidget } from './changepassword.js'
import { AppearanceWidget } from './appearancewidget.js'
import { FormWidget } from '../lib/base/formwidget.js';

class DashboardSection extends Widget { /*//DOC
    Empty section
    */
    constructor() {
        super(null); // Creates floating element
        this.createElement();
        this.createState();
    }
    createSignals() {}
    createState() {}
    createElement() {
        this.autoElement();
        const uuid = randomID();
        this.element.id = uuid;
        this.element.innerHTML = `
            <h2>Home</h2>
            <p>Welcome to the home page.</p>
        `;
    }
}

class ItemsSection extends Widget { /*//DOC
    - "Add Item" button that launches formWidget
    - A fapiList that caches datums.  Inherits from FapiListWidget: each list item has a delete & update
      buttons & signals.  Update signal is internally connected to formWidget
    - formWidget handles create and update operations
    - delete signal from fapiList is intercepted and a dialog is shown to the user
    */
    constructor() {
        super(null);
        this.createElement();
        this.createState();
    }
    createSignals() {
        this.signals.delete_datum = new Signal(`Carries datum of the element to be deleted`);
    }
    datamodel_slot(schema) { /*//DOC
        forwards datamodel to formWidget
        */
        this.widgets.form.datamodel_slot(schema)
    }
    createState() {}
    createElement() {
        this.autoElement();
        const table_uuid = randomID();
        const button_uuid = randomID();
        this.element.innerHTML = `
            <h2>Items</h2>
            <p>This is the items page.</p>
            <button id="${button_uuid}" class="btn btn-primary mb-3">
                <i class="fas fa-plus"></i> Add Item
            </button>
            <table id="${table_uuid}" class="table table-striped"></table>
        `;
        // Get references
        const table_element = this.element.querySelector(`#${table_uuid}`);
        this.add_button = this.element.querySelector(`#${button_uuid}`);

        this.widgets.fapiList = new FapiItemListWidget(table_element);
        this.widgets.form = new FormWidget(randomID(), "Add Item"); // note datamodel_create signal is connected here to set the fields

        ///*// we can create an encapsulated API for this widget:
        // signals from form to out
        this.signals.create = this.widgets.form.signals.create;
        this.signals.update = this.widgets.form.signals.update;
        // signals from fapiList to out
        this.signals.page_changed = this.widgets.fapiList.signals.page_changed;
        this.signals.edit_datum = this.widgets.fapiList.signals.edit_datum;
        // this.signals.delete_datum is emitted by this.widgets.fapiList.signals.delete_datum
        //*/
        // internal signals into form
        this.widgets.fapiList.signals.edit_datum.connect((datum) => {
            this.widgets.form.current_datum_slot(datum); // updates the current data in the form
            this.widgets.form.update_slot(); // opens the dialog
        })
        // signals from fapiList to out
        this.widgets.fapiList.signals.delete_datum.connect((datum) => {
            // alert .. if ok, then emit
            let userConfirmed = confirm("Are you sure you want to delete this item?");
            this.log(1,"userConfirmed",userConfirmed);
            if (userConfirmed) {
                // User clicked "OK"
                this.log(1,"emitting delete_datum");
                this.signals.delete_datum.emit(datum)
            } else {
                // nada
            }
        })
        // "Add" click handler
        this.add_button.onclick = () => {
            this.widgets.form.create_slot()
        };

     }
}

/*TODO

Separate widget for each tab

SettingsSection should inherit TabWidget ..
.. let's write TabWidget accordingly
*/
class SettingsSection extends Widget {
    constructor() {
        super(null);
        this.createElement();
        this.createState();
    }
    set_datum_slot(datum) { /*//DOC
        propagate user datum to internal widget
        */
        this.widgets.tab.widgets.fapiUserInfo.set_datum_slot(datum)
    }
    createSignals() {}
    createState() {}
    createElement() {
        this.autoElement();
        const tab_uuid = randomID();
        this.element.innerHTML = `
            <h2>Settings</h2>
            <p>Adjust your settings here.</p>
            <div id="${tab_uuid}"></div>
        `;
    const tab_element = this.element.querySelector(`#${tab_uuid}`);
    // TODO: this section drives bootstrap crazy, why!?
    this.widgets.tab = new TabWidget(tab_element);
    this.widgets.tab.setItems({
        fapiUserInfo:   [new FapiUserInfoWidget(null), "User"],
        changePassword: [new ChangePasswordWidget(null), "Password"],
        appearance:     [new AppearanceWidget(null), "Appearance"]
        });
    this.signals.update_user_data = this.widgets.tab.widgets.fapiUserInfo.signals.update_user_data;
    this.signals.passwordChanged =  this.widgets.tab.widgets.changePassword.signals.passwordChanged;
    }
};

class AdminSection extends Widget { /*//DOC
    - "Add Item" button that launches formWidget
    - A fapiUserList that caches datums.  Inherits from FapiListWidget: each list item has a delete & update
      buttons & signals.  Update signal is internally connected to formWidget
    - formWidget handles create and update operations
    */
    constructor() {
        super(null);
        this.createElement();
        this.createState();
    }
    createSignals() {
        this.signals.delete_datum = new Signal(`Carries datum of the element to be deleted`);
    }
    datamodel_slot(schema) { /*//DOC
        forwards datamodel to formWidget
        */
        this.widgets.form.datamodel_slot(schema)
    }
    createState() {}
    createElement() {
        this.autoElement();
        const table_uuid = randomID();
        const button_uuid = randomID();
        this.element.innerHTML = `
            <h2>Admin</h2>
            <p>Admin controls and information.</p>
            <button id="${button_uuid}" class="btn btn-primary mb-3">
                <i class="fas fa-plus"></i> Add User
            </button>
            <table id="${table_uuid}" class="table table-striped"></table>
        `;
        // Get references
        const table_element = this.element.querySelector(`#${table_uuid}`);
        this.add_button = this.element.querySelector(`#${button_uuid}`);

        this.widgets.fapiUserList = new FapiUserListWidget(table_element);
        this.widgets.form = new FormWidget(randomID(), "Add User");

        ///*// we can create an encapsulated API for this widget:
        // signals from form to out // we could potentially do this to create an encapsulated API for this widget:
        this.signals.create = this.widgets.form.signals.create;
        this.signals.update = this.widgets.form.signals.update;
        // signal from fapiUserList to out
        this.signals.page_changed = this.widgets.fapiUserList.signals.page_changed;
        this.signals.edit_datum = this.widgets.fapiUserList.signals.edit_datum;
        //*/
        // internal signal to form
        this.widgets.fapiUserList.signals.edit_datum.connect((datum) => {
            this.widgets.form.current_datum_slot(datum); // updates the current data in the form
            this.widgets.form.update_slot(); // opens the dialog
        })
        // signal from fapiUserList to out
        this.widgets.fapiUserList.signals.delete_datum.connect((datum) => {
            // alert .. if ok, then emit
            let userConfirmed = confirm("Are you sure you want to delete this user?");
            if (userConfirmed) {
                // User clicked "OK"
                this.signals.delete_datum.emit(datum)
            } else {
                // nada
            }
        })
        // Add click handler
        this.add_button.onclick = () => {
            this.widgets.form.create_slot()
        };
    }
}

export { DashboardSection, ItemsSection, SettingsSection, AdminSection };
