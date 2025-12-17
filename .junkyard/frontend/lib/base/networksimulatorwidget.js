import { Widget, Signal, randomID } from './widget.js';
import {
    NetworkSimulator,
    DelaySimulator,
    ErrorSimulator
} from './networksimulator.js';

class NetworkSimulatorWidget extends Widget { /*//DOC
    A floating, collapsible widget for simulating network conditions.
    Provides radio button options for different error codes and network delays.
    Emits a signal when the simulation state changes.
    */
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }

    createSignals() {
        this.signals.simulator_changed = new Signal("Emitted when network simulation changes. Carries NetworkSimulator instance or null");
    }

    createState() {
        if (this.element == null) {
            return;
        }
        this.currentMode = 'none';
        this.delayValue = 500; // default delay in ms
        this._updateHeader();
    }

    createElement() {
        this.autoElement();
        if (this.element == null) {
            this.err("could not find element with id", this.id);
            return;
        }

        // Generate unique IDs
        let header_id = randomID();
        let collapse_id = randomID();
        let delay_input_id = randomID();

        // Create floating widget HTML with Bootstrap 5 accordion for collapse
        this.element.innerHTML = `
        <div class="position-fixed bottom-0 end-0 m-3" style="z-index: 1050; max-width: 350px;">
            <div class="card shadow">
                <div class="accordion" id="${this.id}-accordion">
                    <div class="accordion-item border-0">
                        <h2 class="accordion-header" id="${header_id}">
                            <button class="accordion-button collapsed p-2" type="button" data-bs-toggle="collapse"
                                    data-bs-target="#${collapse_id}" aria-expanded="false" aria-controls="${collapse_id}">
                                <span id="${header_id}-text" class="fw-bold">NETWORK SIMULATION: INACTIVE</span>
                            </button>
                        </h2>
                        <div id="${collapse_id}" class="accordion-collapse collapse" aria-labelledby="${header_id}">
                            <div class="accordion-body p-3">
                                <div class="mb-2">
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="sim-mode" id="mode-none" value="none" checked>
                                        <label class="form-check-label" for="mode-none">None (Normal)</label>
                                    </div>
                                </div>

                                <hr class="my-2">
                                <small class="text-muted">HTTP Errors:</small>

                                <div class="mb-2">
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="sim-mode" id="mode-400" value="400">
                                        <label class="form-check-label" for="mode-400">400 Bad Request</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="sim-mode" id="mode-401" value="401">
                                        <label class="form-check-label" for="mode-401">401 Unauthorized</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="sim-mode" id="mode-403" value="403">
                                        <label class="form-check-label" for="mode-403">403 Forbidden</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="sim-mode" id="mode-404" value="404">
                                        <label class="form-check-label" for="mode-404">404 Not Found</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="sim-mode" id="mode-500" value="500">
                                        <label class="form-check-label" for="mode-500">500 Internal Server Error</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="sim-mode" id="mode-503" value="503">
                                        <label class="form-check-label" for="mode-503">503 Service Unavailable</label>
                                    </div>
                                </div>

                                <hr class="my-2">
                                <small class="text-muted">Network Conditions:</small>

                                <div class="mb-2">
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="sim-mode" id="mode-delay" value="delay">
                                        <label class="form-check-label" for="mode-delay">Network Delay</label>
                                    </div>
                                    <div class="ms-4 mt-2" id="delay-input-container">
                                        <div class="input-group input-group-sm">
                                            <input type="number" class="form-control" id="${delay_input_id}"
                                                   value="500" min="0" max="10000" step="50">
                                            <span class="input-group-text">ms</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

        // Get handles to elements
        this.header_text = this.element.querySelector(`#${header_id}-text`);
        this.delay_input = this.element.querySelector(`#${delay_input_id}`);
        this.radio_buttons = this.element.querySelectorAll('input[name="sim-mode"]');

        // Set up event handlers for radio buttons
        this.radio_buttons.forEach(radio => {
            radio.onclick = () => {
                this.currentMode = radio.value;
                this._handleModeChange();
            };
        });

        // Set up event handler for delay input
        this.delay_input.oninput = () => {
            this.delayValue = parseInt(this.delay_input.value) || 0;
            if (this.currentMode === 'delay') {
                this._handleModeChange();
            }
        };
    }

    _handleModeChange() {
        let simulator = null;

        if (this.currentMode === 'none') {
            simulator = null;
        }
        else if (this.currentMode === 'delay') {
            simulator = new DelaySimulator(this.delayValue);
        }
        else {
            // HTTP error code
            const statusCode = parseInt(this.currentMode);
            simulator = new ErrorSimulator(statusCode);
        }

        this._updateHeader();
        this.signals.simulator_changed.emit(simulator);
    }

    _updateHeader() {
        if (this.currentMode === 'none') {
            this.header_text.innerHTML = 'NETWORK SIMULATION: INACTIVE';
            this.header_text.classList.remove('text-danger');
            this.header_text.classList.add('text-muted');
        }
        else {
            let description = '';
            if (this.currentMode === 'delay') {
                description = `${this.delayValue}ms delay`;
            }
            else {
                description = `${this.currentMode} Error`;
            }
            this.header_text.innerHTML = `⚠️ NETWORK SIMULATION: ${description.toUpperCase()}`;
            this.header_text.classList.remove('text-muted');
            this.header_text.classList.add('text-danger');
        }
    }

    reset_slot() { /*//DOC
        Resets the simulator to normal (inactive) mode
        */
        if (this.element == null) {
            return;
        }
        // Find and check the "none" radio button
        const noneRadio = this.element.querySelector('#mode-none');
        if (noneRadio) {
            noneRadio.checked = true;
            this.currentMode = 'none';
            this._handleModeChange();
        }
    }

} // NetworkSimulatorWidget

export { NetworkSimulatorWidget };
