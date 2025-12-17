import { Widget, Signal, randomID } from './widget.js';

class FormWidget extends Widget {  /*//DOC
    An adaptable input form as a popup window.

    The ctor takes in as an extra argument the title of the popup window

    Uses FormField instances (from formfield.js) as child widgets

    The "id" argument here does not try to attach to an existing HTML
    element in the DOM - feel free to use any id you wish (randomID is recommended)
    */
    constructor(id, title="Popup Title") {
        super(id);
        this.id = id
        this.title = title;
        this.unique_name = `${id}-Form`
        this.createElement();
        this.createState();
    }
    createSignals() {
        this.signals.create = new Signal(`Carries a json object corresponding to the newly created record`);
        this.signals.update = new Signal(`Carries a json object corresponding to an updated record`);
    }
    datamodel_slot(datamodel) { /*//DOC
        The datamodel to which the input form should adapt to.

        Argument datamodel is a json object where the key is a unique name identifying
        a column (say "name", "surname", etc.) and the value is an instantiated FormField object.

        Example:

        import { FreeStringFormField, IntegerFormField, BooleanFormField } from './formfield.js';

        datamodel = {
            name: new FreeStringFormField("First Name", "Enter your first name"),
            surname: new FreeStringFormField("Last Name", "Enter your last name"),
            age: new IntegerFormField("Age", "Age in years"),
            active: new BooleanFormField("Active", "Is this person active?")
        }

        widget.datamodel_slot(datamodel);

        Each FormField instance knows how to:
        - Render itself as HTML
        - Validate its input (via its check() method)
        - Get and set its value
        - Display validation feedback
        */
        this.input_fields = new Object();
        this.element.innerHTML = '';
        this.datamodel = datamodel;
        console.log("datamodel_slot", datamodel)
        this.log(-1, "datamodel_slot", datamodel)

        // Iterate over the datamodel and create the form fields
        for (const [key, field] of Object.entries(this.datamodel)) {
            // Each field is already an instantiated FormField object
            // We just need to call createElement() on it
            field.createElement(this.unique_name);
            this.input_fields[key] = field;
            this.element.appendChild(field.getElement());
        }

        // Check if debug mode should be activated now that we have a datamodel
        if (this.debug_mode_activated) {
            this._setupDebugFeatures();
        }
    }
    current_datum_slot(datum) { /*//DOC
        Set's the current datum.  Each keys: same keys as in the datamodel
        (as in datamodel_slot). Value: the value of the field.
        */
        if (this.datamodel == null) {
            this.err("current_datum_slot: please call datamodel_slot first");
            return;
        }
        // clear any old data
        this.clear();
        // sets the current data in the form fields
        this.log(-1, "current_datum_slot got:", datum)
        if (datum == null) {
            this.current_datum = null;
            return;
        }
        this.current_datum = structuredClone(datum);
        /*
        run over input fields, previously created by calling
        datamodel_slot and fills input fields values from current_datum

        current_datum may have "hidden" fields (like uuid) not described
        by the datamodel: these are not visible / editable in the form fields

        you could also subclass a simplified version that hard-codes
        the input fields
        */
        for (const [key, input_field] of Object.entries(this.input_fields)) {
            // put into the form all fields defined by the datamodel
            let value = this.current_datum[key]
            if (value == undefined ) {
                // this.err("current_datum_slot: got unexpected key", key)
                // this is perfectly normal:
                // for example: the form represent a create op
                // keys correspond to create op
                // but we're using it also for update
                // the datum for update is missing for example the passwd field (as it should)
                this.log(-1, "current_datum_slot: datum is missing the key", key)
            }
            else {
                input_field.set(datum[key])
            }
        }
    }
    create_slot() { /*//DOC Opens the form dialog with empty fields
        */
        if (this.datamodel == null) {
            this.err("create_slot: please call datamodel_slot first");
            return;
        }
        this.current_datum = null;
        this.clear(); // empty the fields
        this.bootstrap_modal.toggle(); // show form
    }
    update_slot() { /*//DOC Opens dialog in "update" mode
        this.current_datum must be != null
        and form fields have been earlier filled with
        call to current_datum_slot
        */
        if (this.datamodel == null) {
            this.err("update_slot: please call datamodel_slot first");
            return;
        }
        if (this.current_datum == null) {
            // can't update non-existing datum
            this.err("update_slot: current_datum is null -> can't update")
            return;
        }
        this.clearWarnings(); // cleanup warnings
        this.bootstrap_modal.toggle(); // show form
    }
    activate_debug_slot() { /*//DOC
        Activates debug mode by setting a flag and calling helper method if datamodel exists.
        This method is timing-independent - it can be called before or after datamodel_slot.
        */
        super.activate_debug_slot(); // cascade to subwidgets first

        if (this.element == null) {
            this.err("activate_debug_slot: element is null");
            return;
        }

        // Set the flag that debug mode has been requested
        this.debug_mode_activated = true;
        this.log(-1, "activate_debug_slot: debug mode flag set");

        // If datamodel already exists, set up debug features now
        if (this.datamodel != null) {
            this._setupDebugFeatures();
        } else {
            this.log(-1, "activate_debug_slot: datamodel not yet set, will activate when datamodel arrives");
        }
    }

    _setupDebugFeatures() { /*//DOC
        Internal helper method that actually adds debug buttons and activates debug on form fields.
        This is called by either activate_debug_slot() or datamodel_slot(), whichever comes second.
        */
        if (this.debug_buttons_added) {
            this.log(-1, "_setupDebugFeatures: debug buttons already added");
            return;
        }

        this.log(-1, "_setupDebugFeatures: adding debug buttons and activating form fields");

        // Create container for debug buttons
        const debugContainer = document.createElement("div");
        debugContainer.classList.add("mt-3", "d-flex", "gap-2");

        // Create fillValid button
        const fillValidButton = document.createElement("button");
        fillValidButton.type = "button";
        fillValidButton.classList.add("btn", "btn-success", "btn-sm");
        fillValidButton.textContent = "fillValid";
        fillValidButton.onclick = () => {
            this.fillValid();
        };

        // Create fillInvalid button
        const fillInvalidButton = document.createElement("button");
        fillInvalidButton.type = "button";
        fillInvalidButton.classList.add("btn", "btn-danger", "btn-sm");
        fillInvalidButton.textContent = "fillInvalid";
        fillInvalidButton.onclick = () => {
            this.fillInvalid();
        };

        // Add buttons to container
        debugContainer.appendChild(fillValidButton);
        debugContainer.appendChild(fillInvalidButton);

        // Append to form element
        this.element.appendChild(debugContainer);

        // Activate debug on all form fields
        for (const field of Object.values(this.input_fields)) {
            if (field.activate_debug_slot) {
                field.activate_debug_slot();
            }
        }

        this.debug_buttons_added = true;
        this.log(-1, "_setupDebugFeatures: debug features fully activated");
    }
    createState() {
        this.datamodel = null;
        this.current_datum = null;
        this.input_fields = new Object();
        this.debug_mode_activated = false; // Flag: has activate_debug_slot been called?
        this.debug_buttons_added = false;  // Flag: have debug buttons actually been added to DOM?
    }
    createElement() {
        /* Here we use the bootstrap modal API that assumes
        that the API pops up from a certain button
        (instead we want it to pop-up from a signal!)

        It would actually be better to do this without the bootstrap API
        But here we use bootstrap, so be it.

        So first, we need to demangle the bootstrap modal API:
        In order for the JS API to work, some html must first
        be inserted into the DOM, like this:

        <div class="modal fade" id="exampleModal" tabindex="-1"
        aria-labelledby="exampleModalLabel" aria-hidden="true">
        </div>
        */
        this.scaffold = document.createElement("div");
        this.scaffold.classList.add("modal")
        this.scaffold.classList.add("fade")
        this.scaffold.id = this.id
        this.scaffold.setAttribute("tabindex", "-1")
        this.scaffold.setAttribute("aria-labelledby", `${this.id}Label`)
        this.scaffold.setAttribute("ariaHidden", true)
        this.scaffold.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="${this.id}Label">${this.title}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
            <div class="modal-body">
            </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" type="submit">Save</button>
                </div>
            </div>
        </div>
        `
        var body = document.getElementsByTagName("body").item(0)
        body.appendChild(this.scaffold)
        this.bootstrap_modal = new bootstrap.Modal(this.scaffold);
        this.element = this.bootstrap_modal._element;
        // We have now in this.bootstrap_modal that obeys
        // the bootstrap JS API
        // let's get a handle to the modal save button
        const matches_btn = this.element.getElementsByClassName("btn-primary");
        this.save_button = matches_btn.item(0);
        // handle to the popup body:
        const matches_body = this.element.getElementsByClassName("modal-body");
        this.body = matches_body.item(0);
        // let's add a form therein:
        this.element = document.createElement("form");
        this.body.appendChild(this.element);
        this.save_button.onclick = (event) => {
            this.checkInput()
        }
    }
    clear () {
        Object.entries(this.input_fields).forEach(([key, input_field])=> input_field.clear());
    }
    clearWarnings () {
        Object.entries(this.input_fields).forEach(([key, input_field])=> input_field.clearWarnings());
    }
    checkInput() { // checks input & if ok, sends signals with the new/updated data
        this.log(-1, "checkInput")
        var create = false; // create or update?
        // create a new empty datum or update the old one
        if (this.current_datum == null) { // C
            var datum = new Object()
            create = true;
        }
        else { // U
            datum = this.current_datum
            // datamodel / form fields will be overwritten
            // hidden fields such as uuid are not touched
        }
        let fail = false
        for (const [key, input_field] of Object.entries(this.input_fields)) {
            // calling get performs check on the fields
            // & writes a warning for the user is something went wrong
            var value = input_field.get()
            if (value == null) {
                fail = true
            }
            datum[key] = value
        }
        if (fail) { // checking one of the fields failed
            // if failed, then don't close the form yet
        }
        else if (create) {
            this.signals.create.emit(datum);
            this.bootstrap_modal.toggle(); // success! hide popup
        }
        else {
            this.signals.update.emit(datum);
            this.bootstrap_modal.toggle(); // success! hide popup
        }
    }
} // FormWidget

export { FormWidget }
