/*LLM: Beginning of file "formfield.js"

This file contains FormField classes that can be used with FormWidget.

Each FormField class encapsulates:
- Its own HTML rendering
- Validation logic (check method)
- Getting/setting values
- Bootstrap validation feedback display

FormField instances are passed directly to FormWidget's datamodel_slot:

datamodel = {
    name: new FreeStringFormField("First Name", "Enter your first name"),
    age: new IntegerFormField("Age", "Age in years"),
    active: new BooleanFormField("Active", "Is this user active?")
}

For more complex fields that need signals/slots (like SelectFormField), we have
BaseFormFieldWidget that extends Widget.
*/

import { Widget, Signal, randomID } from './widget.js';

class BaseFormField { /*//DOC
    Base class for all form field types.

    Each form field knows how to:
    - Render itself as HTML
    - Validate its input
    - Get and set its value
    - Display validation feedback

    Subclasses must implement the check() method.
    */
    constructor(label, help = undefined) {
        this.label = label;
        this.help = help;
        this.element = null;
        this.input = null;
        this.valid_msg = null;
    }

    createElement(unique_name) { /*//DOC
        Creates the HTML structure for this form field.

        Arguments:
        unique_name - A unique prefix for HTML element IDs (provided by FormWidget)

        This base implementation creates a standard text input.
        Subclasses can override to create different input types.
        */
        let uniquename = unique_name + "-" + randomID();
        this.element = document.createElement("div");
        this.element.classList.add("mb-3");

        var line = `
        <label for="${uniquename}" class="form-label">${this.label}</label>
        <input class="form-control" id="${uniquename}">
        <div class="valid-feedback">ok!</div>
        `;

        if (this.help != undefined) {
            line += `
            <div class="form-text">${this.help}</div>
            `;
        }

        this.element.innerHTML = line;

        // Cache the input field and feedback message
        this.input = this.element.getElementsByTagName("input").item(0);
        this.valid_msg = this.element.getElementsByClassName("valid-feedback").item(0);

        // Clear validation warnings when user starts typing
        this.input.addEventListener("input", () => {
            this.clearWarnings();
        });
    }

    getElement() { /*//DOC
        Returns the HTML element for this form field.
        Used by FormWidget to append the field to the form.
        */
        return this.element;
    }

    clearWarnings() { /*//DOC
        Removes validation styling (both valid and invalid) from the input field.
        */
        this.input.classList.remove("is-valid");
        this.input.classList.remove("is-invalid");
    }

    clear() { /*//DOC
        Resets the field to its default empty state and clears validation styling.
        */
        this.input.value = "";
        this.clearWarnings();
    }

    fillValid() { /*//DOC
        Fills the field with valid test data for debugging/testing purposes.
        Base implementation provides generic valid text.
        Subclasses should override with more appropriate data.
        */
        this.set("Valid text");
    }

    fillInvalid() { /*//DOC
        Fills the field with invalid test data for debugging/testing purposes.
        Base implementation provides empty string (invalid for most fields).
        Subclasses should override with more appropriate invalid data.
        */
        this.set("");
    }

    get() { /*//DOC
        Gets the current value from the input field and validates it.

        Returns:
        The validated value, or null if validation failed.

        Side effects:
        Updates the input field's validation styling and feedback message.
        */
        let res = this.check(this.input.value);
        if (res.value == null) {
            // Validation failed
            this.input.classList.remove("is-valid");
            this.input.classList.add("is-invalid");
            this.valid_msg.classList.remove("valid-feedback");
            this.valid_msg.classList.add("invalid-feedback");
            this.valid_msg.innerHTML = res.error;
            return null;
        } else {
            // Validation succeeded
            this.input.classList.add("is-valid");
            this.input.classList.remove("is-invalid");
            this.valid_msg.classList.add("valid-feedback");
            this.valid_msg.classList.remove("invalid-feedback");
            this.valid_msg.innerHTML = '';
            return res.value;
        }
    }

    set(value) { /*//DOC
        Sets the value of the input field.

        Arguments:
        value - The value to set
        */
        this.input.value = value;
    }

    disable() { /*//DOC
        Disables the input field, making it non-editable and non-focusable.
        Handles cross-browser differences (Firefox shows cursor in readOnly fields).
        */
        this.input.readOnly = true;
        this.input.setAttribute('tabindex', '-1');
        this.input.style.cursor = 'default';
        this.input.style.pointerEvents = 'none';
    }

    enable() { /*//DOC
        Enables the input field, making it editable and focusable.
        */
        this.input.readOnly = false;
        this.input.removeAttribute('tabindex');
        this.input.style.cursor = 'text';
        this.input.style.pointerEvents = '';
    }

    check(value) { /*//DOC
        Validates the input value.

        Arguments:
        value - The value to validate

        Returns:
        A json object: {value: validated_value_or_null, error: error_message_or_null}

        Subclasses must implement this method.
        */
        throw new Error("check() must be implemented by subclass");
    }
}

class FreeStringFormField extends BaseFormField { /*//DOC
    A form field for free-form string input.

    Validates that the string is not empty.
    */
    constructor(label, help = undefined) {
        super(label, help);
    }

    check(value) { /*//DOC
        Validates that the string is not empty.

        Returns:
        {value: string, error: null} if valid
        {value: null, error: "error message"} if invalid
        */
        const str = String(value);
        if (str.length < 1) {
            return { value: null, error: "This field cannot be empty" };
        }
        return { value: str, error: null };
    }
}

class IntegerFormField extends BaseFormField { /*//DOC
    A form field for integer input.

    Validates that the input is a valid integer.
    */
    constructor(label, help = undefined) {
        super(label, help);
    }

    createElement(unique_name) { /*//DOC
        Creates an HTML number input field.
        */
        let uniquename = unique_name + "-" + randomID();
        this.element = document.createElement("div");
        this.element.classList.add("mb-3");

        var line = `
        <label for="${uniquename}" class="form-label">${this.label}</label>
        <input type="number" class="form-control" id="${uniquename}">
        <div class="valid-feedback">ok!</div>
        `;

        if (this.help != undefined) {
            line += `
            <div class="form-text">${this.help}</div>
            `;
        }

        this.element.innerHTML = line;

        this.input = this.element.getElementsByTagName("input").item(0);
        this.valid_msg = this.element.getElementsByClassName("valid-feedback").item(0);

        // Clear validation warnings when user starts typing
        this.input.addEventListener("input", () => {
            this.clearWarnings();
        });
    }

    check(value) { /*//DOC
        Validates that the input is a valid integer.

        Returns:
        {value: number, error: null} if valid
        {value: null, error: "error message"} if invalid
        */
        const str = String(value);
        if (str.length < 1) {
            return { value: null, error: "This field cannot be empty" };
        }
        const num = Number(str);
        if (isNaN(num)) {
            return { value: null, error: "Please enter a valid number" };
        }
        if (!Number.isInteger(num)) {
            return { value: null, error: "Please enter an integer value" };
        }
        return { value: num, error: null };
    }

    fillValid() { /*//DOC
        Fills the field with valid integer test data.
        */
        this.set(42);
    }

    fillInvalid() { /*//DOC
        Fills the field with invalid test data (not an integer).
        */
        this.set("not a number");
    }
}

class BooleanFormField extends BaseFormField { /*//DOC
    A form field for boolean input, rendered as a checkbox.

    Validates boolean values (always succeeds).
    */
    constructor(label, help = undefined) {
        super(label, help);
    }

    createElement(unique_name) { /*//DOC
        Creates an HTML checkbox input field.
        */
        let uniquename = unique_name + "-" + randomID();
        this.element = document.createElement("div");
        this.element.classList.add("mb-3", "form-check");

        var line = `
        <input type="checkbox" class="form-check-input" id="${uniquename}">
        <label class="form-check-label" for="${uniquename}">${this.label}</label>
        <div class="valid-feedback">ok!</div>
        `;

        if (this.help != undefined) {
            line += `
            <div class="form-text">${this.help}</div>
            `;
        }

        this.element.innerHTML = line;

        this.input = this.element.getElementsByTagName("input").item(0);
        this.valid_msg = this.element.getElementsByClassName("valid-feedback").item(0);

        // Clear validation warnings when user interacts with checkbox
        this.input.addEventListener("change", () => {
            this.clearWarnings();
        });
    }

    set(value) { /*//DOC
        Sets the checkbox state based on the provided boolean value.

        Arguments:
        value - Boolean value to set
        */
        this.input.checked = Boolean(value);
    }

    get() { /*//DOC
        Gets the current checkbox state and validates it.

        Returns:
        Boolean value (validation always succeeds for checkboxes)
        */
        let res = this.check(this.input.checked);
        if (res.value == null) {
            // This shouldn't happen for boolean fields, but handle it anyway
            this.input.classList.remove("is-valid");
            this.input.classList.add("is-invalid");
            this.valid_msg.classList.remove("valid-feedback");
            this.valid_msg.classList.add("invalid-feedback");
            this.valid_msg.innerHTML = res.error;
            return null;
        } else {
            this.input.classList.add("is-valid");
            this.input.classList.remove("is-invalid");
            this.valid_msg.classList.add("valid-feedback");
            this.valid_msg.classList.remove("invalid-feedback");
            this.valid_msg.innerHTML = '';
            return res.value;
        }
    }

    clear() { /*//DOC
        Resets the checkbox to unchecked state and clears validation styling.
        */
        this.input.checked = false;
        this.clearWarnings();
    }

    check(value) { /*//DOC
        Validates the boolean value (always succeeds).

        Returns:
        {value: boolean, error: null}
        */
        return { value: Boolean(value), error: null };
    }

    fillValid() { /*//DOC
        Fills the field with valid boolean test data (checked).
        */
        this.set(true);
    }

    fillInvalid() { /*//DOC
        Fills the field with invalid boolean test data.
        Note: For checkboxes, all values are technically valid.
        This sets it to unchecked (false) as the "less common" state.
        */
        this.set(false);
    }
}

class EmailFormField extends BaseFormField { /*//DOC
    A form field for email input with email validation.
    */
    constructor(label, help = undefined) {
        super(label, help);
    }

    createElement(unique_name) { /*//DOC
        Creates an HTML email input field.
        */
        let uniquename = unique_name + "-" + randomID();
        this.element = document.createElement("div");
        this.element.classList.add("mb-3");

        var line = `
        <label for="${uniquename}" class="form-label">${this.label}</label>
        <input type="email" class="form-control" id="${uniquename}">
        <div class="valid-feedback">ok!</div>
        `;

        if (this.help != undefined) {
            line += `
            <div class="form-text">${this.help}</div>
            `;
        }

        this.element.innerHTML = line;

        this.input = this.element.getElementsByTagName("input").item(0);
        this.valid_msg = this.element.getElementsByClassName("valid-feedback").item(0);

        // Clear validation warnings when user starts typing
        this.input.addEventListener("input", () => {
            this.clearWarnings();
        });
    }

    check(value) { /*//DOC
        Validates that the input is a valid email address.

        Returns:
        {value: string, error: null} if valid
        {value: null, error: "error message"} if invalid
        */
        const str = String(value);

        if (str.length < 1) {
            return { value: null, error: "Email cannot be empty" };
        }

        // Basic email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(str)) {
            return { value: null, error: "Please enter a valid email address" };
        }

        return { value: str, error: null };
    }

    fillValid() { /*//DOC
        Fills the field with valid email test data.
        */
        this.set("test@example.com");
    }

    fillInvalid() { /*//DOC
        Fills the field with invalid email test data.
        */
        this.set("not-an-email");
    }
}

class TextAreaFormField extends BaseFormField { /*//DOC
    A form field for multi-line text input.

    Can optionally specify rows (default: 3).
    */
    constructor(label, help = undefined, options = {}) {
        super(label, help);
        this.rows = options.rows || 3;
    }

    createElement(unique_name) { /*//DOC
        Creates an HTML textarea field.
        */
        let uniquename = unique_name + "-" + randomID();
        this.element = document.createElement("div");
        this.element.classList.add("mb-3");

        var line = `
        <label for="${uniquename}" class="form-label">${this.label}</label>
        <textarea class="form-control" id="${uniquename}" rows="${this.rows}"></textarea>
        <div class="valid-feedback">ok!</div>
        `;

        if (this.help != undefined) {
            line += `
            <div class="form-text">${this.help}</div>
            `;
        }

        this.element.innerHTML = line;

        this.input = this.element.getElementsByTagName("textarea").item(0);
        this.valid_msg = this.element.getElementsByClassName("valid-feedback").item(0);

        // Clear validation warnings when user starts typing
        this.input.addEventListener("input", () => {
            this.clearWarnings();
        });
    }

    check(value) { /*//DOC
        Validates that the textarea is not empty.

        Returns:
        {value: string, error: null} if valid
        {value: null, error: "error message"} if invalid
        */
        const str = String(value);

        if (str.length < 1) {
            return { value: null, error: "This field cannot be empty" };
        }

        return { value: str, error: null };
    }

    fillValid() { /*//DOC
        Fills the field with valid multi-line text test data.
        */
        this.set("This is a valid\nmulti-line text\nfor testing purposes.");
    }

    fillInvalid() { /*//DOC
        Fills the field with invalid test data (empty).
        */
        this.set("");
    }
}

// Widget-based FormFields for more complex scenarios

class BaseFormFieldWidget extends Widget { /*//DOC
    Base class for Widget-based form fields that need signals/slots.

    These are more complex form fields that can receive data from backend via signals.

    Like BaseFormField, they must implement:
    - createElement(unique_name)
    - getElement()
    - get()
    - set(value)
    - clear()
    - clearWarnings()
    - check(value)
    */
    constructor(label, help = undefined) {
        super();  // Widget constructor
        this.label = label;
        this.help = help;
        this.element = null;
        this.input = null;
        this.valid_msg = null;
    }

    createSignals() {
        // Subclasses can add their own signals
    }

    getElement() { /*//DOC
        Returns the HTML element for this form field.
        Used by FormWidget to append the field to the form.
        */
        return this.element;
    }

    clearWarnings() { /*//DOC
        Removes validation styling (both valid and invalid) from the input field.
        */
        this.input.classList.remove("is-valid");
        this.input.classList.remove("is-invalid");
    }

    clear() { /*//DOC
        Resets the field to its default empty state and clears validation styling.
        Subclasses should override this.
        */
        throw new Error("clear() must be implemented by subclass");
    }

    get() { /*//DOC
        Gets the current value from the input field and validates it.
        Returns the validated value, or null if validation failed.
        Subclasses should override this.
        */
        throw new Error("get() must be implemented by subclass");
    }

    set(value) { /*//DOC
        Sets the value of the input field.
        Subclasses should override this.
        */
        throw new Error("set() must be implemented by subclass");
    }

    disable() { /*//DOC
        Disables the input field, making it non-editable and non-focusable.
        Handles cross-browser differences (Firefox shows cursor in readOnly fields).
        */
        this.input.readOnly = true;
        this.input.setAttribute('tabindex', '-1');
        this.input.style.cursor = 'default';
        this.input.style.pointerEvents = 'none';
    }

    enable() { /*//DOC
        Enables the input field, making it editable and focusable.
        */
        this.input.readOnly = false;
        this.input.removeAttribute('tabindex');
        this.input.style.cursor = 'text';
        this.input.style.pointerEvents = '';
    }

    check(value) { /*//DOC
        Validates the input value.
        Returns a json object: {value: validated_value_or_null, error: error_message_or_null}
        Subclasses must implement this.
        */
        throw new Error("check() must be implemented by subclass");
    }

    createElement(unique_name) { /*//DOC
        Creates the HTML structure for this form field.
        Subclasses must implement this.
        */
        throw new Error("createElement() must be implemented by subclass");
    }

    fillValid() { /*//DOC
        Fills the field with valid test data for debugging/testing purposes.
        Subclasses should override with appropriate data.
        */
        throw new Error("fillValid() must be implemented by subclass");
    }

    fillInvalid() { /*//DOC
        Fills the field with invalid test data for debugging/testing purposes.
        Subclasses should override with appropriate invalid data.
        */
        throw new Error("fillInvalid() must be implemented by subclass");
    }
}

class SelectFormField extends BaseFormFieldWidget { /*//DOC
    A dropdown/select form field that can receive options via signals.

    Example:
    selectField = new SelectFormField("Country", "Select your country")
    datamodel = {
        country: selectField
    }

    // Later, set options from backend:
    backendDataSource.signals.countries.connect((countries) =>
        selectField.set_options_slot(countries)
    )

    Options format: [{value: "US", label: "United States"}, {value: "UK", label: "United Kingdom"}, ...]
    */
    constructor(label, help = undefined) {
        super(label, help);
        this.options = [];  // Array of {value, label} objects
    }

    createSignals() {
        // Could add signals here if needed in the future
    }

    set_options_slot(options) { /*//DOC
        Sets the available options for the select field.

        Arguments:
        options - Array of {value: string, label: string} objects

        Example:
        selectField.set_options_slot([
            {value: "us", label: "United States"},
            {value: "uk", label: "United Kingdom"},
            {value: "ca", label: "Canada"}
        ])
        */
        this.options = options;
        this.renderOptions();
    }

    renderOptions() { /*//DOC
        Re-renders the select options based on current this.options.
        */
        if (this.input == null) {
            return;
        }

        // Save current value
        const currentValue = this.input.value;

        // Clear existing options
        this.input.innerHTML = '';

        // Add empty/default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "-- Please select --";
        this.input.appendChild(defaultOption);

        // Add all options
        for (const opt of this.options) {
            const option = document.createElement("option");
            option.value = opt.value;
            option.textContent = opt.label;
            this.input.appendChild(option);
        }

        // Restore previous value if it still exists
        if (currentValue) {
            this.input.value = currentValue;
        }
    }

    createElement(unique_name) { /*//DOC
        Creates an HTML select field.
        */
        let uniquename = unique_name + "-" + randomID();
        this.element = document.createElement("div");
        this.element.classList.add("mb-3");

        var line = `
        <label for="${uniquename}" class="form-label">${this.label}</label>
        <select class="form-select" id="${uniquename}">
            <option value="">-- Please select --</option>
        </select>
        <div class="valid-feedback">ok!</div>
        `;

        if (this.help != undefined) {
            line += `
            <div class="form-text">${this.help}</div>
            `;
        }

        this.element.innerHTML = line;

        this.input = this.element.getElementsByTagName("select").item(0);
        this.valid_msg = this.element.getElementsByClassName("valid-feedback").item(0);

        // Clear validation warnings when user changes selection
        this.input.addEventListener("change", () => {
            this.clearWarnings();
        });

        // Render options if we already have them
        this.renderOptions();
    }

    clear() { /*//DOC
        Resets the select to the default empty option.
        */
        this.input.value = "";
        this.clearWarnings();
    }

    set(value) { /*//DOC
        Sets the selected value.

        Arguments:
        value - The value to select (must match one of the option values)
        */
        this.input.value = value;
    }

    get() { /*//DOC
        Gets the current selected value and validates it.

        Returns:
        The selected value, or null if validation failed.
        */
        let res = this.check(this.input.value);
        if (res.value == null) {
            // Validation failed
            this.input.classList.remove("is-valid");
            this.input.classList.add("is-invalid");
            this.valid_msg.classList.remove("valid-feedback");
            this.valid_msg.classList.add("invalid-feedback");
            this.valid_msg.innerHTML = res.error;
            return null;
        } else {
            // Validation succeeded
            this.input.classList.add("is-valid");
            this.input.classList.remove("is-invalid");
            this.valid_msg.classList.add("valid-feedback");
            this.valid_msg.classList.remove("invalid-feedback");
            this.valid_msg.innerHTML = '';
            return res.value;
        }
    }

    check(value) { /*//DOC
        Validates that a value has been selected.

        Returns:
        {value: string, error: null} if valid
        {value: null, error: "error message"} if invalid
        */
        const str = String(value);

        if (str.length < 1) {
            return { value: null, error: "Please select an option" };
        }

        return { value: str, error: null };
    }

    fillValid() { /*//DOC
        Fills the field with valid test data (first available option).
        Note: Requires options to be set via set_options_slot() first.
        */
        if (this.options.length > 0) {
            this.set(this.options[0].value);
        } else {
            this.log(-1, "fillValid: No options available, cannot fill");
        }
    }

    fillInvalid() { /*//DOC
        Fills the field with invalid test data (empty selection).
        */
        this.set("");
    }
}

export { BaseFormField, FreeStringFormField, IntegerFormField, BooleanFormField, EmailFormField, TextAreaFormField, BaseFormFieldWidget, SelectFormField };
/*LLM: End of file "formfield.js" */
