class TestingUrlManager { /*//DOC
    Centralized utility for managing testing-related URL parameters and test mode detection.

    Keeps all testing parameter names in one place and provides methods to:
    - Detect if we're in test mode
    - Get filtered testing parameters
    - Parse test mode flags

    Usage:
    ```javascript
    const testManager = new TestingUrlManager(window);
    const isTestMode = testManager.isTestMode();
    const params = testManager.getTestingParams();
    window.location.replace("landing.html" + params);
    ```
    */
    constructor(windowObj = window) {
        this.window = windowObj;
        // Centralized parameter names - modify here to change across entire app
        this.TESTING_PARAMS = {
            TESTING: 'testing',
            NETWORK_TESTING: 'network-testing',
            TEST_PANEL: 'test-panel'
        };
    }

    isTestMode() { /*//DOC
        Determine if we're in test mode based on URL parameters only
        File protocol no longer automatically enables test mode
        @returns {boolean} true if in test mode
        */
        return this.window.location.search.includes(`${this.TESTING_PARAMS.TESTING}=true`);
    }

    useMockDataSources() { /*//DOC
        Determine if we should use mock datasources instead of HTTP datasources
        Mock datasources are only used when running from file:// protocol
        URL parameter ?testing=true enables test features but uses real HTTP datasources
        @returns {boolean} true if mock datasources should be used
        */
        return this.window.location.protocol === 'file:';
    }

    getNetworkTestFlag() { /*//DOC
        Check if network testing is enabled
        @returns {boolean} true if network testing should be active
        */
        const isTestMode = this.isTestMode();
        return isTestMode && !this.window.location.search.includes(`${this.TESTING_PARAMS.NETWORK_TESTING}=false`);
    }

    getTestPanelFlag() { /*//DOC
        Check if test panel should be shown
        @returns {boolean} true if test panel should be available
        */
        const isTestMode = this.isTestMode();
        return isTestMode && !this.window.location.search.includes(`${this.TESTING_PARAMS.TEST_PANEL}=false`);
    }

    getTestingParams() { /*//DOC
        Get URL parameters string containing only testing-related parameters
        @returns {string} URL parameter string like "?testing=true&network-testing=false" or empty string
        */
        const urlParams = new URLSearchParams(this.window.location.search);
        const testingParams = new URLSearchParams();

        // Filter only testing-related parameters
        for (const [key, value] of urlParams.entries()) {
            if (Object.values(this.TESTING_PARAMS).includes(key)) {
                testingParams.set(key, value);
            }
        }

        const paramString = testingParams.toString();
        return paramString ? '?' + paramString : '';
    }

    getAllParams() { /*//DOC
        Get all current URL parameters as a string
        @returns {string} URL parameter string like "?foo=bar&baz=qux" or empty string
        */
        const paramString = this.window.location.search;
        return paramString || '';
    }
}

export { TestingUrlManager };
