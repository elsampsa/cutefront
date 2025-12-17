import { DataSource } from './datasource.js';

class HTTPDataSource extends DataSource {
    constructor() {
        super();
        this.baseUrl = '';
        this.authModel = null;
        this.paginationStrategy = null;
        this.networkSimulator = null;
    }

    setBaseUrl(url) {
        this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
        return this;
    }

    setAuthModel(authModel) {
        this.authModel = authModel;
        return this;
    }

    setPaginationStrategy(strategy) {
        this.paginationStrategy = strategy;
        return this;
    }

    setNetworkSimulator(simulator) { /*//DOC
        Sets a network simulator for testing purposes.
        :param simulator: NetworkSimulator instance (or null to disable)
        :returns: this (for method chaining)
        */
        this.networkSimulator = simulator;
        return this;
    }

    // ===== HELPER METHODS =====

    _buildRequestConfig(endpoint, options) { /*//DOC
        Builds base request configuration with URL and headers.
        :param endpoint: URL path (e.g. '/data' or '/data/123')
        :param options: fetch options (method, body, headers, etc.)
        :returns: Request config object {url, method, headers, body}
        */
        return {
            url: `${this.baseUrl}/${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
    }

    _applyAuth(requestConfig) { /*//DOC
        Applies authentication headers to request config if authModel is available.
        :param requestConfig: Request config object
        :returns: Modified request config
        */
        if (this.authModel) {
            Object.assign(requestConfig.headers, this.authModel.getAuthHeaders());
        }
        return requestConfig;
    }

    _applyPagination(requestConfig) { /*//DOC
        Applies pagination modifications to request config if paginationStrategy is available.
        :param requestConfig: Request config object
        :returns: Modified request config
        */
        if (this.paginationStrategy) {
            return this.paginationStrategy.modifyRequest(requestConfig);
        }
        return requestConfig;
    }

    async _executeFetch(requestConfig) { /*//DOC
        Executes the actual fetch request.
        If a network simulator is set, it will be used to potentially modify the request behavior.
        Implements timeout using AbortController.
        :param requestConfig: Request config object with {url, method, headers, body}
        :returns: Response object
        :throws: AbortError if request times out
        */
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const fetchFn = (signal) => fetch(requestConfig.url, {
            method: requestConfig.method || 'GET',
            headers: requestConfig.headers,
            body: requestConfig.body,
            signal: signal || controller.signal  // Use provided signal or our timeout controller
        });

        try {
            if (this.networkSimulator) {
                return await this.networkSimulator.execute(fetchFn);
            }

            return await fetchFn(controller.signal);
        } catch (error) {
            // Check if this was a timeout
            if (error.name === 'AbortError') {
                throw {
                    message: `Request timed out after ${this.timeout}ms`,
                    status: 408,  // HTTP 408 Request Timeout
                    body: { detail: 'Request timeout' }
                };
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async _handleAuthRetry(requestConfig, response) { /*//DOC
        Handles 401 authentication errors and token refresh retry logic.
        :param requestConfig: Request config object
        :param response: Response object from initial fetch
        :returns: Retry response object if retry succeeded, null otherwise
        */
        if (response.status === 401 && this.authModel) {
            const refreshed = await this.authModel.handleUnauthorized();
            if (refreshed) {
                this._applyAuth(requestConfig); // Re-apply with fresh token
                return await this._executeFetch(requestConfig);
            }
        }
        return null;
    }

    async _parseResponseBody(response) { /*//DOC
        Parses response body based on content-type header.
        :param response: Response object
        :returns: Parsed body (JSON object, text string, or null)
        */
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else if (contentType && (contentType.includes('text/plain') || contentType.includes('text/html'))) {
            return await response.text();
        }
        return null;
    }

    _parsePaginatedResponse(body) { /*//DOC
        Applies pagination parsing to response body if paginationStrategy is available.
        :param body: Response body
        :returns: Parsed body (e.g., extracts 'data' field from paginated response)
        */
        if (this.paginationStrategy) {
            return this.paginationStrategy.parseResponse(body);
        }
        return body;
    }

    // ===== CORE REQUEST METHOD =====

    async _makeRequest(requestConfig) { /*//DOC
        Core method that handles the full request lifecycle with error handling.
        Takes a pre-built requestConfig, applies universal modifications (auth),
        executes fetch, handles retries, and parses response.

        :param requestConfig: Object with {url, method, headers, body}
        :returns: Parsed response body
        :throws: Standardized error object {message, status, body}
        */
        // Apply universal modifications
        requestConfig = this._applyAuth(requestConfig);

        try {
            let response = await this._executeFetch(requestConfig);

            // Handle auth retry
            const retryResponse = await this._handleAuthRetry(requestConfig, response);
            if (retryResponse) {
                response = retryResponse;
            }

            // Handle HTTP errors
            if (!response.ok) {
                const errorData = await this._parseErrorResponse(response);
                throw {
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    status: response.status,
                    body: errorData
                };
            }

            // Parse and return successful response
            return await this._parseResponseBody(response);

        } catch (error) {
            // Standardize network errors
            if (error && error.status !== undefined) {
                throw error; // Already standardized
            }
            throw {
                message: `Network error: ${error.message}`,
                status: null,
                body: error
            };
        }
    }
    

    async makeFormRequest(endpoint, verb, formData) { /*//DOC
        Makes a request with FormData (multipart/form-data).
        Used for file uploads and form submissions.
        Note: Content-Type header is NOT set (browser sets it automatically with boundary).
        :param endpoint: URL path
        :param verb: HTTP method (usually POST or PUT)
        :param formData: FormData instance
        :returns: Parsed response body
        */
        let requestConfig = {
            url: `${this.baseUrl}/${endpoint}`,
            headers: {}, // No Content-Type - browser will set it with boundary
            method: verb,
            body: formData
        };

        // Note: We build config manually here because we don't want Content-Type: application/json
        // Auth is still applied in _makeRequest
        return await this._makeRequest(requestConfig);
    }

    async _parseErrorResponse(response) {
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (e) {
            return null;
        }
    }
    
    _jsonToFormData(datum) { /*//DOC
        Convert JSON object to FormData for multipart/form-data requests
        Helper method for subclasses to send form data
        :param datum: Object to convert
        :returns: FormData instance
        */
        const formData = new FormData();
        
        for (const [key, value] of Object.entries(datum)) {
            if (value === null || value === undefined) {
                continue;
            }
            else if (value instanceof File || value instanceof Blob) {
                formData.append(key, value);
            }
            else if (typeof value === 'object' && !(value instanceof Date)) {
                formData.append(key, JSON.stringify(value));
            }
            else {
                formData.append(key, value.toString());
            }
        }
        
        return formData;
    }
    
    _jsonToURLEncoded(datum) { /*//DOC
        Convert JSON object to URL-encoded string for application/x-www-form-urlencoded requests
        Helper method for subclasses to send URL-encoded data
        :param datum: Object to convert
        :returns: URLSearchParams instance
        */
        const params = new URLSearchParams();
        
        for (const [key, value] of Object.entries(datum)) {
            if (value === null || value === undefined) {
                continue;
            }
            else if (typeof value === 'object' && !(value instanceof Date)) {
                params.append(key, JSON.stringify(value));
            }
            else {
                params.append(key, value.toString());
            }
        }
        
        return params;
    }
    
    // ===== CRUD METHODS =====

    async read() { /*//DOC
        Standard READ operation - GET request to read endpoint with pagination support.
        Subclass to customize endpoint, add query params, etc.
        */
        const ENDPOINT = '/data';
        const VERB = 'GET';

        let requestConfig = this._buildRequestConfig(ENDPOINT, {
            method: VERB
        });

        // Apply pagination before making request
        requestConfig = this._applyPagination(requestConfig);

        const body = await this._makeRequest(requestConfig);

        // Parse paginated response
        return this._parsePaginatedResponse(body);
    }

    async create(datum) { /*//DOC
        Standard CREATE operation - POST request with JSON body.
        Subclass to customize endpoint, use FormData, etc.
        */
        const ENDPOINT = '/data';
        const VERB = 'POST';

        const requestConfig = this._buildRequestConfig(ENDPOINT, {
            method: VERB,
            body: JSON.stringify(datum)
        });

        return await this._makeRequest(requestConfig);
    }

    async update(datum) { /*//DOC
        Standard UPDATE operation - PUT request with ID in URL.
        Subclass to use PATCH, put ID in body, use FormData, etc.
        */
        const ENDPOINT = '/data';
        const VERB = 'PUT';
        const id_key = this.uuid_key;

        const requestConfig = this._buildRequestConfig(`${ENDPOINT}/${datum[id_key]}`, {
            method: VERB,
            body: JSON.stringify(datum)
        });

        return await this._makeRequest(requestConfig);
    }

    async delete(id) { /*//DOC
        Standard DELETE operation - DELETE request with ID in URL.
        Subclass to use POST, put ID in body, etc.
        */
        const ENDPOINT = '/data';
        const VERB = 'DELETE';

        const requestConfig = this._buildRequestConfig(`${ENDPOINT}/${id}`, {
            method: VERB
        });

        return await this._makeRequest(requestConfig);
    }
    
    async postForm(datum) { /*//DOC
        Example method: POST data as multipart/form-data
        Shows how to use _jsonToFormData helper in a custom method
        Subclass and customize endpoint as needed
        :param datum: Object to send as form data
        */
        const ENDPOINT = '/form';
        const VERB = 'POST';
        const formData = this._jsonToFormData(datum);
        return await this.makeFormRequest(`${ENDPOINT}`, VERB, formData);    
    }

    async me() { /*//DOC
        Example method: GET current user info from /me endpoint.
        Uses auth token to identify the user.
        Subclass to customize endpoint.
        */
        const ENDPOINT = '/me';
        const VERB = 'GET';

        const requestConfig = this._buildRequestConfig(ENDPOINT, {
            method: VERB
        });

        return await this._makeRequest(requestConfig);
    }

    async reset(datum) { /*//DOC
        Example method: POST to reset endpoint with email in URL path.
        Shows how to construct URLs with data from datum.
        Subclass to customize endpoint and verb.
        :param datum: Object containing email field
        */
        const ENDPOINT = '/reset';
        const VERB = 'POST';

        const requestConfig = this._buildRequestConfig(`${ENDPOINT}/${datum.email}`, {
            method: VERB,
            body: JSON.stringify(datum)
        });

        return await this._makeRequest(requestConfig);
    }
    
    setPage(paginationInfo) {
        if (this.paginationStrategy) {
            this.paginationStrategy.set(paginationInfo);
        }
    }
    
    setAuth(authInfo) {
        if (this.authModel) {
            this.authModel.set(authInfo);
        }
    }
}

export { HTTPDataSource }