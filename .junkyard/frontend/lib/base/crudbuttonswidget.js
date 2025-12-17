import { Widget, Signal } from './widget.js';

class CrudButtonsWidget extends Widget { /*//DOC
    This widget features a group of buttons:
    
    New
    Edit
    Delete

    When current_datum_slot receives a datum, Edit and Delete
    buttons are activated.

    When current_datum_slot receives null, Edit and Delete
    buttons are deacticated.

    Sends outgoing signals according to the clicked button
    */
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }
    createSignals() {
        this.signals.create = new Signal(`Sent when New is clicked: requests a C (create) operation.  Carries nothing`);
        this.signals.update = new Signal(`Sent when Edit is clicked: requests a U (update) operation. Carries nothing`);
        this.signals.delete = new Signal(`Sent when Delete is clicked: requests a D (delete).  Carries uuid of the datum`);
    }
    current_datum_slot(datum) { /*//DOC
        Receives a generic datum json object.  The datum should have key "uuid".
        The value of the key uuid is cached and used by the "delete" signal.
        */
        if (datum == null) { // no datum to del / edit
            this.del_button.disabled = true;
            this.edit_button.disabled = true;
            this.datum_uuid = null;
        }
        else {
            this.del_button.disabled = false;
            this.edit_button.disabled = false;
            this.datum_uuid = structuredClone(datum.uuid)
        }
    }
    createState() {
        if (this.element == null) {
            return
        }
        this.del_button.disabled = true;
        this.edit_button.disabled = true;
    }
    createElement() {
        this.element = document.getElementById(this.id)
        if (this.element == null) {
            this.err("could not find element with id", this.id)
            return
        }
        this.new_button = document.createElement("button");
        this.edit_button = document.createElement("button");
        this.del_button = document.createElement("button");

        this.new_button.classList.add("btn");
        this.new_button.classList.add("btn-outline-primary");
        this.edit_button.classList.add("btn");
        this.edit_button.classList.add("btn-outline-primary");
        this.del_button.classList.add("btn");
        this.del_button.classList.add("btn-outline-primary");

        this.new_button.innerHTML = 'New';
        this.edit_button.innerHTML = 'Edit';
        this.del_button.innerHTML = 'Delete';
        this.element.appendChild(this.new_button);
        this.element.appendChild(this.edit_button);
        this.element.appendChild(this.del_button);
        // a dummy string (which is not used) is emitted with the signal
        this.new_button.onclick = (event) => {
            this.signals.create.emit("create");
        }
        this.edit_button.onclick = (event) => {
            this.signals.update.emit("update");
        }
        this.del_button.onclick = (event) => {
            // delete signal carries the uuid of the current datum
            this.signals.delete.emit(this.datum_uuid);
        }
    }

} // CrudButtonsWidget

export { CrudButtonsWidget }
