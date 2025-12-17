/*
Password-related form fields and validation requirements.

This file contains:
- PasswordRequirement: Base class for password validation rules
- SimplePasswordRequirement: Basic length and complexity validation
- PasswordFormField: Password input with visibility toggle and optional confirmation matching
*/

import { randomID } from './widget.js';
import { BaseFormField } from './formfield.js';

class PasswordRequirement { /*//DOC
    Base class for password validation requirements.

    Subclasses implement specific password policies (length, complexity, entropy, etc.)
    */
    check(password) { /*//DOC
        Validates a password against this requirement.

        Arguments:
        password - The password string to validate

        Returns:
        {valid: boolean, error: string|null}
        - valid: true if password meets requirement, false otherwise
        - error: null if valid, error message string if invalid

        Subclasses must implement this method.
        */
        throw new Error("check() must be implemented by subclass");
    }
}

class SimplePasswordRequirement extends PasswordRequirement { /*//DOC
    Basic password requirement: minimum length of 8 characters.

    Future enhancements could add complexity checks (uppercase, lowercase, numbers, symbols).
    */
    constructor(minLength = 8) {
        super();
        this.minLength = minLength;
    }

    check(password) { /*//DOC
        Validates that password meets minimum length requirement.

        Returns:
        {valid: true, error: null} if password is long enough
        {valid: false, error: "message"} if password is too short
        */
        const str = String(password);

        if (str.length < this.minLength) {
            return {
                valid: false,
                error: `Password must be at least ${this.minLength} characters`
            };
        }

        return { valid: true, error: null };
    }
}

class StrongPasswordRequirement extends PasswordRequirement { /*//DOC
    Strong password requirement: minimum 8 characters with uppercase, lowercase, number and special character.
    */
    constructor(minLength = 8) {
        super();
        this.minLength = minLength;
    }

    check(password) { /*//DOC
        Validates that password meets strong requirements:
        - At least minLength characters (default 8)
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character

        Returns:
        {valid: true, error: null} if password meets all requirements
        {valid: false, error: "message"} if password fails any requirement
        */
        const str = String(password);

        if (str.length < this.minLength) {
            return {
                valid: false,
                error: `Password must be at least ${this.minLength} characters`
            };
        }

        // Check for uppercase, lowercase, digit, and special character
        const hasUppercase = /[A-Z]/.test(str);
        const hasLowercase = /[a-z]/.test(str);
        const hasDigit = /\d/.test(str);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(str);

        if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
            return {
                valid: false,
                error: 'Password must include uppercase, lowercase, number and special character'
            };
        }

        return { valid: true, error: null };
    }
}

class PasswordFormField extends BaseFormField { /*//DOC
    A form field for password input with a visibility toggle button.

    Features:
    - Eye icon button to show/hide password
    - Optional friend parameter for password confirmation matching
    - Optional setRequirement() for password complexity requirements

    Example:
    const passwordField = new PasswordFormField("Password", "Enter your password")
        .setRequirement(new SimplePasswordRequirement());
    const confirmField = new PasswordFormField("Confirm Password", "Re-enter password", {friend: passwordField});
    */
    constructor(label, help = undefined, options = {}) {
        super(label, help);
        this.friend = options.friend || null;  // optional friend field for matching
        this.requirement = null;  // optional PasswordRequirement instance
        this.toggleButton = null;
        this.isVisible = false;
        this.autocomplete = "current-password";  // default: for login/existing password
        this.useTextFieldHack = false;  // Use text field styled as password to avoid browser detection
    }

    setNewPassword(disableSuggestions = false) { /*//DOC
        Marks this field as for a NEW password (user creation/password reset).
        Tells browser not to autofill with saved passwords.

        Arguments:
        disableSuggestions - If true, completely disables browser password dropdown (default: false)

        Returns:
        this (for method chaining)

        Example:
        new PasswordFormField("Password").setNewPassword()
        new PasswordFormField("Password").setNewPassword(true) // no dropdown at all
        */
        if (disableSuggestions) {
            // Ultimate workaround: use text field with password styling
            // Browsers can't detect this as a password field, so no autofill/dropdown
            this.useTextFieldHack = true;
            this.autocomplete = "off";
        } else {
            this.autocomplete = "new-password";
        }
        return this;
    }

    setRequirement(requirement) { /*//DOC
        Sets a password requirement for validation.

        Arguments:
        requirement - A PasswordRequirement instance (e.g., SimplePasswordRequirement)

        Returns:
        this (for method chaining)

        Example:
        passwordField.setRequirement(new SimplePasswordRequirement(10))
        */
        this.requirement = requirement;
        return this;  // Enable method chaining
    }

    createElement(unique_name) { /*//DOC
        Creates an HTML password input field with a visibility toggle button.
        */
        let uniquename = unique_name + "-" + randomID();
        let buttonId = randomID();
        let fakeUsername = randomID();
        this.element = document.createElement("div");
        this.element.classList.add("mb-3");

        var line = `
        <label for="${uniquename}" class="form-label">${this.label}</label>
        `;

        // Add hidden fake username field to confuse browser's autofill detection
        if (this.autocomplete.startsWith("nope-")) {
            line += `<input type="text" id="${fakeUsername}" autocomplete="username" style="position:absolute;opacity:0;pointer-events:none;height:0;width:0;" tabindex="-1">`;
        }

        line += `
        <div class="input-group has-validation">`;

        if (this.useTextFieldHack) {
            // Text field styled as password - browsers won't detect it as password field
            line += `
            <input type="text" class="form-control" id="${uniquename}"
                   autocomplete="${this.autocomplete}"
                   inputmode="text"
                   style="-webkit-text-security: disc; text-security: disc;"
                   data-lpignore="true" data-form-type="other">`;
        } else {
            // Normal password field
            line += `
            <input type="password" class="form-control" id="${uniquename}"
                   autocomplete="${this.autocomplete}"
                   data-lpignore="true" data-form-type="other">`;
        }

        line += `
            <button class="btn btn-outline-secondary" type="button" id="${buttonId}">
                <i class="bi bi-eye-slash"></i>
            </button>
            <div class="valid-feedback">ok!</div>
            <div class="invalid-feedback"></div>
        </div>
        `;

        if (this.help != undefined) {
            line += `
            <div class="form-text">${this.help}</div>
            `;
        }

        this.element.innerHTML = line;

        this.input = this.element.getElementsByTagName("input").item(0);
        this.valid_msg = this.element.getElementsByClassName("valid-feedback").item(0);
        this.toggleButton = this.element.querySelector(`#${buttonId}`);

        // Setup toggle button click handler
        this.toggleButton.onclick = () => {
            this.isVisible = !this.isVisible;
            if (this.useTextFieldHack) {
                // Using text field hack - toggle CSS styling instead of input type
                if (this.isVisible) {
                    // Password is now visible - remove masking
                    this.input.style.webkitTextSecurity = 'none';
                    this.input.style.textSecurity = 'none';
                    this.toggleButton.innerHTML = '<i class="bi bi-eye"></i>';
                } else {
                    // Password is now hidden - restore masking
                    this.input.style.webkitTextSecurity = 'disc';
                    this.input.style.textSecurity = 'disc';
                    this.toggleButton.innerHTML = '<i class="bi bi-eye-slash"></i>';
                }
            } else {
                // Normal password field - toggle input type
                if (this.isVisible) {
                    // Password is now visible - show open eye
                    this.input.type = "text";
                    this.toggleButton.innerHTML = '<i class="bi bi-eye"></i>';
                } else {
                    // Password is now hidden - show closed/slashed eye
                    this.input.type = "password";
                    this.toggleButton.innerHTML = '<i class="bi bi-eye-slash"></i>';
                }
            }
        };

        // Clear validation warnings when user starts typing
        this.input.addEventListener("input", () => {
            this.clearWarnings();
        });
    }

    check(value) { /*//DOC
        Validates the password field.

        Validation steps:
        1. Check if password is empty
        2. If requirement is set, check against it
        3. If friend field exists, check that passwords match

        Returns:
        {value: string, error: null} if valid
        {value: null, error: "error message"} if invalid
        */
        const str = String(value);

        // Check if empty
        if (str.length < 1) {
            return { value: null, error: "Password cannot be empty" };
        }

        // Check against requirement if set
        if (this.requirement != null) {
            const reqResult = this.requirement.check(str);
            if (!reqResult.valid) {
                return { value: null, error: reqResult.error };
            }
        }

        // If this field has a friend, check that they match
        if (this.friend != null) {
            const friendValue = this.friend.input.value;
            if (str !== friendValue) {
                return { value: null, error: "Passwords do not match" };
            }
        }

        return { value: str, error: null };
    }

    fillValid() { /*//DOC
        Fills the field with valid password test data.
        If this field has a friend (confirmation field), copies the friend's value.
        Otherwise, adapts based on whether a requirement is set.
        */
        if (this.friend != null) {
            // If this is a confirmation field, match the friend's value
            const friendValue = this.friend.input.value;
            if (friendValue) {
                this.set(friendValue);
            } else {
                // Friend is empty, fill friend first
                this.friend.fillValid();
                this.set(this.friend.input.value);
            }
        } else if (this.requirement != null) {
            // If there's a requirement, use a password that meets it
            // StrongPasswordRequirement needs: uppercase, lowercase, digit, special char
            this.set("ValidPass123!");
        } else {
            // Simple password without requirement
            this.set("password123");
        }
    }

    fillInvalid() { /*//DOC
        Fills the field with invalid password test data.
        If there's a requirement, uses a password that fails it.
        Otherwise, uses empty string.
        */
        if (this.requirement != null) {
            // Password that fails requirement (too short, no special chars, etc.)
            this.set("short");
        } else {
            // Empty password (always invalid)
            this.set("");
        }
    }
}

export { PasswordRequirement, SimplePasswordRequirement, StrongPasswordRequirement, PasswordFormField };
