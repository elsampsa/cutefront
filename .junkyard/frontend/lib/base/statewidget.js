import { Widget } from './widget.js';


class StateWidget extends Widget { /*//DOC
    Implements state management for CuteFront.

    Manages widget state serialization to/from URL parameters and browser history.
    Widgets register with StateWidget using their serializationKey.
    When widgets emit state_change signals, StateWidget updates the URL.
    When browser navigation occurs (back/forward), StateWidget restores widget states.
    */
    constructor(id = 'state-manager') {
        super();
        this.id = id;
        this.createElement();
        this.createState();
    }
    createSignals() {
    }
    createElement() {
    }
    createState() {
        this.widgets = {};  // { serializationKey: widget }
        this.state = {};    // { serializationKey: serializationValue }
    }
    register(...widgets) { /*//DOC
        Register widgets for state management.
        Each widget must have:
        - serializationKey set via setSerializationKey()
        - signals.state_change signal
        - getState() returning { serializationKey, serializationValue, write }
        - setState(serializationValue) to restore state

        Initialization sequence:
        1. Build default state from widgets' current values
        2. Pull URL params - overwrites state for keys that exist in URL
        3. Push merged state to URL (enables shareable links)
        4. Apply merged state to all widgets
        */
        for (const widget of widgets) {
            const state = widget.getState();
            if (state === null) {
                this.err("register: widget", widget.id, "has no serializationKey configured, skipping");
                continue;
            }
            if (widget.signals.state_change == null) {
                this.err("register: widget", widget.id, "doesn't have state_change signal, skipping");
                continue;
            }
            const key = state.serializationKey;
            this.log(-1, "register: registering widget with key", key);
            this.widgets[key] = widget;
            // Step 1: Get widget's default/current value
            this.state[key] = state.serializationValue;
            // Connect widget's state_change signal to our slot
            widget.signals.state_change.connect(
                this.change_state_slot.bind(this)
            );
        }
        // Step 2: Pull from URL - overwrites this.state for keys present in URL
        this.pull();
        // Step 3: Write merged state (defaults + URL) to URL
        this.push0();
        // Step 4: Apply merged state to all widgets
        this.setStates();
        // Add event listener for browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            this.log(-1, "popstate", event);
            if (event.state && event.state.ignore) {
                this.log(-1, "popstate: ignoring");
                return;
            }
            // User clicked browser's back/forward buttons
            // Get state from URL and restore widget states
            this.pull();
            this.setStates();
        });
    }
    change_state_slot(obj) { /*//DOC
        Receives state change notifications from widgets.
        :param obj: { serializationKey: string, serializationValue: string, write: boolean }
        Updates internal state cache. If write is true, creates new browser history entry.
        */
        const { serializationKey, serializationValue, write } = obj;
        this.log(-1, "change_state_slot: received", obj);
        // Update our state cache
        this.state[serializationKey] = serializationValue;
        if (write) {
            // Create new history entry with all current state
            this.push();
        }
        // If write is false, we only update the cache - URL is written when a write=true comes in
    }
    setStates() { /*//DOC
        Restores all registered widgets' states from this.state cache.
        Called after pulling state from URL (e.g., on popstate).
        */
        for (const [key, value] of Object.entries(this.state)) {
            const widget = this.widgets[key];
            if (widget && value != null) {
                this.log(-1, "setStates: setting state for", key, "to", value);
                widget.setState(value);
            }
        }
    }
    pull() { /*//DOC
        Reads URL search parameters and updates this.state cache.
        Only updates keys that correspond to registered widgets.
        */
        this.log(-1, "pull: reading URL parameters");
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams.entries()) {
            this.log(-1, "pull: found param", key, "=", value);
            if (this.widgets.hasOwnProperty(key)) {
                this.state[key] = value;
            }
        }
        this.log(-1, "pull: state now", this.state);
    }
    push() { /*//DOC
        Creates a new browser history entry with the current state in URL.
        */
        const newUrl = this.genUrl();
        this.log(-1, "push: pushState", newUrl.href);
        window.history.pushState(
            { ignore: false }, null, newUrl.href
        );
    }
    push0() { /*//DOC
        Replaces the current URL without creating a new history entry.
        */
        const newUrl = this.genUrl();
        this.log(-1, "push0: replaceState", newUrl.href);
        history.replaceState(
            { ignore: false }, null, newUrl.href
        );
    }
    genUrl() { /*//DOC
        Generates a new URL with search parameters from this.state.
        :returns: URL object
        */
        const newUrl = new URL(window.location.href);
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of Object.entries(this.state)) {
            if (value != null) {
                searchParams.set(key, value);
            } else {
                searchParams.delete(key);
            }
        }
        newUrl.search = searchParams.toString();
        this.log(-1, "genUrl:", newUrl.href);
        return newUrl;
    }
}

export { StateWidget }
