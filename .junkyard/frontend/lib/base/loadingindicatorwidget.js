import { Widget, Signal, randomID } from './widget.js';

class LoadingIndicatorWidget extends Widget { /*//DOC
    A floating overlay widget that shows loading progress with timer-based states.

    Time-based display states:
    - 0-200ms: Silent (no display - operation feels instant)
    - 200ms-2s: Show spinner only
    - 2s-5s: Show "Network delay... please wait"
    - 5s+: Show "Network operation took too long"

    Tracks multiple datasources simultaneously.
    */
    constructor(id) {
        super(id);
        this.createElement();
        this.createState();
    }

    createSignals() {
        // No signals emitted by this widget - it's purely a visual indicator
    }

    createState() {
        if (this.element == null) {
            return;
        }
        this.activeOperations = new Set(); // Track active operations
        this.startTime = null;
        this.timerIds = {
            showSpinner: null,
            showDelay: null,
            showTooLong: null
        };
    }

    createElement() {
        this.autoElement();
        if (this.element == null) {
            this.err("could not find element with id", this.id);
            return;
        }

        // Create floating overlay (initially hidden)
        this.element.innerHTML = `
        <div class="loading-overlay position-fixed top-0 start-0 w-100 h-100 align-items-center justify-content-center"
             style="z-index: 2000; background-color: rgba(0, 0, 0, 0.3); display: none;">
            <div class="card shadow-lg p-4 text-center" style="min-width: 300px;">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="loading-message">
                    <strong>Loading...</strong>
                </div>
            </div>
        </div>
        `;

        this.overlay = this.element.querySelector('.loading-overlay');
        this.message_div = this.element.querySelector('.loading-message');
    }

    loading_start_slot(operation) { /*//DOC
        Slot for receiving loading_start signal from DataSourceWidget(s).
        :param operation: Operation name (e.g., 'read', 'create', 'update', 'delete')
        */
        this.log(-1, "loading_start_slot:", operation);

        this.activeOperations.add(operation);

        // If this is the first operation, start the timers
        if (this.activeOperations.size === 1) {
            this._startLoading();
        }
    }

    loading_success_slot(operation) { /*//DOC
        Slot for receiving loading_success signal from DataSourceWidget(s).
        :param operation: Operation name that completed successfully
        */
        this.log(-1, "loading_success_slot:", operation);
        this._stopOperation(operation);
    }

    loading_error_slot(data) { /*//DOC
        Slot for receiving loading_error signal from DataSourceWidget(s).
        :param data: {operation: str, error: object}
        */
        this.log(-1, "loading_error_slot:", data);
        this._stopOperation(data.operation);
    }

    _startLoading() {
        this.startTime = Date.now();

        // Clear any existing timers
        this._clearTimers();

        // Timer 1: Show spinner after 200ms (silent before that)
        this.timerIds.showSpinner = setTimeout(() => {
            this._showState('spinner');
        }, 200);

        // Timer 2: Show "network delay" message after 2 seconds
        this.timerIds.showDelay = setTimeout(() => {
            this._showState('delay');
        }, 2000);

        // Timer 3: Show "took too long" message after 5 seconds
        this.timerIds.showTooLong = setTimeout(() => {
            this._showState('toolong');
        }, 5000);
    }

    _showState(state) {
        if (this.activeOperations.size === 0) {
            // Operation completed before this timer fired
            return;
        }

        const elapsed = Date.now() - this.startTime;
        this.log(-1, `_showState: ${state}, elapsed: ${elapsed}ms, active ops:`, this.activeOperations);

        switch(state) {
            case 'spinner':
                this.overlay.style.display = 'flex';
                this.message_div.innerHTML = '<strong>Loading...</strong>';
                break;

            case 'delay':
                this.overlay.style.display = 'flex';
                this.message_div.innerHTML = `
                    <strong>Network delay...</strong>
                    <div class="text-muted small mt-2">Please wait</div>
                `;
                break;

            case 'toolong':
                this.overlay.style.display = 'flex';
                this.message_div.innerHTML = `
                    <strong class="text-warning">Network operation took too long</strong>
                    <div class="text-muted small mt-2">Still waiting for response...</div>
                    <div class="text-muted small">Elapsed: ${Math.round(elapsed / 1000)}s</div>
                `;
                break;
        }
    }

    _stopOperation(operation) {
        this.activeOperations.delete(operation);

        // If all operations are complete, hide the overlay
        if (this.activeOperations.size === 0) {
            this._hideOverlay();
        }
    }

    _hideOverlay() {
        this.log(-1, "_hideOverlay");
        this._clearTimers();
        this.overlay.style.display = 'none';
        this.startTime = null;
    }

    _clearTimers() {
        Object.values(this.timerIds).forEach(id => {
            if (id !== null) {
                clearTimeout(id);
            }
        });
        this.timerIds = {
            showSpinner: null,
            showDelay: null,
            showTooLong: null
        };
    }

} // LoadingIndicatorWidget

export { LoadingIndicatorWidget };
