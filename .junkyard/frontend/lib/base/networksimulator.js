/* Network Simulators for testing HTTP and Mock data sources
 *
 * These classes can be plugged into data sources to simulate various network conditions:
 * - Delays (fixed delays, jitter)
 * - HTTP errors (4xx, 5xx status codes)
 * - Network failures
 *
 * Usage:
 *   dataSource.setNetworkSimulator(new DelaySimulator(500));
 *   dataSource.setNetworkSimulator(new ErrorSimulator(404, 'Not Found'));
 *   dataSource.setNetworkSimulator(null); // disable simulation
 */

class NetworkSimulator { /*//DOC
    Base class for network simulators.
    Subclasses override the execute() method to modify fetch behavior.
    */
    async execute(fetchFn) { /*//DOC
        Executes the fetch function, potentially with modifications.
        :param fetchFn: Function that performs the actual fetch
        :returns: Response object

        Default implementation just passes through to the fetch function.
        Subclasses can add delays, throw errors, or modify the response.
        */
        return await fetchFn();
    }

    getDescription() { /*//DOC
        Returns a human-readable description of the simulation.
        Used for UI display.
        */
        return "None";
    }
}

class DelaySimulator extends NetworkSimulator { /*//DOC
    Simulates network delay by waiting before executing the fetch.
    Useful for testing loading states and slow network conditions.
    */
    constructor(delayMs) {
        super();
        this.delayMs = delayMs;
    }

    async execute(fetchFn) {
        // Wait for the specified delay
        await new Promise(resolve => setTimeout(resolve, this.delayMs));
        // Then execute the actual fetch
        return await fetchFn();
    }

    getDescription() {
        return `${this.delayMs}ms delay`;
    }
}

class JitterSimulator extends NetworkSimulator { /*//DOC
    Simulates variable network delay (jitter) by waiting a random amount of time.
    Each request gets a random delay between minMs and maxMs.
    */
    constructor(minMs, maxMs) {
        super();
        this.minMs = minMs;
        this.maxMs = maxMs;
    }

    async execute(fetchFn) {
        // Calculate random delay between min and max
        const delay = this.minMs + Math.random() * (this.maxMs - this.minMs);
        await new Promise(resolve => setTimeout(resolve, delay));
        return await fetchFn();
    }

    getDescription() {
        return `${this.minMs}-${this.maxMs}ms jitter`;
    }
}

class ErrorSimulator extends NetworkSimulator { /*//DOC
    Simulates HTTP error responses without actually making a network request.
    Returns a Response object with the specified status code and error message.
    */
    constructor(statusCode, statusText = '', errorBody = null) {
        super();
        this.statusCode = statusCode;
        this.statusText = statusText || this._getDefaultStatusText(statusCode);
        this.errorBody = errorBody || { detail: this.statusText };
    }

    async execute(fetchFn) {
        // Don't call fetchFn at all - just return error response
        return new Response(JSON.stringify(this.errorBody), {
            status: this.statusCode,
            statusText: this.statusText,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    getDescription() {
        return `${this.statusCode} ${this.statusText}`;
    }

    _getDefaultStatusText(code) {
        const statusTexts = {
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            500: 'Internal Server Error',
            502: 'Bad Gateway',
            503: 'Service Unavailable',
            504: 'Gateway Timeout'
        };
        return statusTexts[code] || 'Error';
    }
}

class FailureSimulator extends NetworkSimulator { /*//DOC
    Simulates random network failures.
    Each request has a failureRate chance (0.0-1.0) of failing with a network error.
    */
    constructor(failureRate) {
        super();
        this.failureRate = failureRate; // 0.0 to 1.0
    }

    async execute(fetchFn) {
        if (Math.random() < this.failureRate) {
            // Simulate network failure by throwing an error
            throw new Error('Simulated network failure');
        }
        return await fetchFn();
    }

    getDescription() {
        return `${Math.round(this.failureRate * 100)}% failure rate`;
    }
}

class TimeoutSimulator extends NetworkSimulator { /*//DOC
    Simulates request timeout by aborting the fetch after a specified time.
    Uses AbortController to properly cancel the request.
    */
    constructor(timeoutMs) {
        super();
        this.timeoutMs = timeoutMs;
    }

    async execute(fetchFn) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            // Execute fetch with abort signal
            // Note: fetchFn needs to accept and use the signal
            return await fetchFn(controller.signal);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    getDescription() {
        return `${this.timeoutMs}ms timeout`;
    }
}

export {
    NetworkSimulator,
    DelaySimulator,
    JitterSimulator,
    ErrorSimulator,
    FailureSimulator,
    TimeoutSimulator
};
