// mockserver.js - Unified mock server supporting JSON, FormData, and URL-encoded requests

// ============================================================================
// MOCK SERVER CLASS
// ============================================================================

class MockServer {
    constructor(config = {}) {
        this.data = config.data ? [...config.data] : [];
        this.authToken = null;
        this.networkDelay = config.delay !== undefined ? config.delay : 100;
        this.originalFetch = window.fetch;
        this.errorSimulation = null;
    }
    
    install() {
        window.fetch = this._handleRequest.bind(this);
    }
    
    restore() {
        window.fetch = this.originalFetch;
    }
    
    async _handleRequest(url, options = {}) {
        // Simulate network delay
        if (this.networkDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, this.networkDelay));
        }
        
        // Check for error simulation
        if (this.errorSimulation) {
            const error = this.errorSimulation;
            this.errorSimulation = null; // Clear after one use
            return this._createResponse(error.status, error.data);
        }
        
        const method = options.method || 'GET';
        const headers = options.headers || {};
        
        console.log(`[MOCK] ${method} ${url}`);
        
        // Check auth
        if (!this._checkAuth(headers)) {
            return this._createResponse(401, { error: 'Unauthorized' });
        }
        
        // Parse request body
        const parsedBody = await this._parseRequestBody(options.body, headers);
        console.log('[MOCK] Parsed body:', parsedBody);
        
        // Parse URL
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const searchParams = urlObj.searchParams;
        
        // Route to handler
        if (pathname === '/data' || pathname.startsWith('/data')) {
            return this._handleDataEndpoint(method, pathname, searchParams, parsedBody);
        }
        
        if (pathname === '/me') {
            return this._handleMe();
        }
        
        if (pathname.startsWith('/reset/')) {
            return this._handleReset(pathname, parsedBody);
        }
        
        if (pathname === '/form') {
            return this._handleForm(parsedBody);
        }
        
        if (pathname === '/auth/refresh') {
            return this._handleAuthRefresh(parsedBody);
        }
        
        // Default 404
        return this._createResponse(404, { error: 'Not found' });
    }
    
    _checkAuth(headers) {
        const authHeader = headers.Authorization || headers.authorization;
        if (!authHeader) {
            return true; // No auth required
        }
        
        const token = authHeader.replace('Bearer ', '');
        return token === 'valid-token' || token === this.authToken;
    }
    
    async _parseRequestBody(body, headers) {
        if (!body) return null;
        
        // FormData needs special handling
        if (body instanceof FormData) {
            const result = {};
            for (const [key, value] of body.entries()) {
                result[key] = value;
            }
            return result;
        }
        
        // URL-encoded
        if (typeof body === 'string') {
            const contentType = headers['Content-Type'] || headers['content-type'] || '';
            
            if (contentType.includes('application/x-www-form-urlencoded')) {
                const params = new URLSearchParams(body);
                const result = {};
                for (const [key, value] of params.entries()) {
                    result[key] = value;
                }
                return result;
            }
            
            // JSON (default for string bodies)
            return JSON.parse(body);
        }
        
        return body;
    }
    
    _handleDataEndpoint(method, pathname, searchParams, body) {
        switch (method) {
            case 'GET':
                return this._handleRead(searchParams);
            case 'POST':
                return this._handleCreate(body);
            case 'PUT':
            case 'PATCH':
                return this._handleUpdate(pathname, body);
            case 'DELETE':
                return this._handleDelete(pathname);
            default:
                return this._createResponse(405, { error: 'Method not allowed' });
        }
    }
    
    _handleRead(searchParams) {
        let data = [...this.data];
        let totalItems = data.length;
        
        // Handle pagination via query params
        const page = parseInt(searchParams.get('page'));
        const pageSize = parseInt(searchParams.get('pageSize'));
        
        if (page && pageSize) {
            const start = (page - 1) * pageSize;
            const end = start + pageSize;
            data = data.slice(start, end);
            
            return this._createResponse(200, {
                data: data,
                totalItems: totalItems,
                currentPage: page,
                pageSize: pageSize
            });
        }
        
        // Return all data if no pagination
        return this._createResponse(200, data);
    }
    
    _handleCreate(body) {
        if (!body) {
            return this._createResponse(400, { error: 'Missing body' });
        }
        
        // List-based logic
        const maxId = Math.max(0, ...this.data.map(item => parseInt(item.id) || 0));
        const newItem = {
            ...body,
            id: String(maxId + 1)
        };
        
        this.data.push(newItem);
        return this._createResponse(201, newItem);
    }
    
    _handleUpdate(pathname, body) {
        if (!body) {
            return this._createResponse(400, { error: 'Missing body' });
        }
        
        // List-based logic
        const id = pathname.split('/').pop();
        const index = this.data.findIndex(item => item.id === id);
        
        if (index === -1) {
            return this._createResponse(404, { error: 'Item not found' });
        }
        
        this.data[index] = { ...this.data[index], ...body, id: id };
        return this._createResponse(200, this.data[index]);
    }
    
    _handleDelete(pathname) {
        // List-based logic
        const id = pathname.split('/').pop();
        const index = this.data.findIndex(item => item.id === id);
        
        if (index === -1) {
            return this._createResponse(404, { error: 'Item not found' });
        }
        
        const deleted = this.data.splice(index, 1)[0];
        return this._createResponse(200, deleted);
    }
    
    _handleMe() {
        return this._createResponse(200, {
            id: 'current-user',
            name: 'Current User',
            email: 'current@example.com'
        });
    }
    
    _handleReset(pathname, body) {
        const email = pathname.split('/').pop();
        return this._createResponse(200, {
            message: `Password reset sent to ${email}`,
            email: email
        });
    }
    
    _handleForm(body) {
        return this._createResponse(200, {
            message: 'Form data received',
            received: 'form-data',
            data: body
        });
    }
    
    _handleAuthRefresh(body) {
        if (body && body.refreshToken === 'valid-refresh-token') {
            this.authToken = 'refreshed-token';
            return this._createResponse(200, { token: 'refreshed-token' });
        }
        
        return this._createResponse(401, { error: 'Invalid refresh token' });
    }
    
    _createResponse(status, data) {
        const responseText = JSON.stringify(data);
        
        return Promise.resolve({
            ok: status >= 200 && status < 300,
            status: status,
            statusText: this._getStatusText(status),
            headers: new Headers({
                'content-type': 'application/json'
            }),
            json: () => Promise.resolve(data),
            text: () => Promise.resolve(responseText)
        });
    }
    
    _getStatusText(status) {
        const statusTexts = {
            200: 'OK',
            201: 'Created',
            400: 'Bad Request',
            401: 'Unauthorized',
            404: 'Not Found',
            405: 'Method Not Allowed',
            500: 'Internal Server Error'
        };
        return statusTexts[status] || 'Unknown';
    }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function setupMockServer(config = {}) {
    const server = new MockServer(config);
    server.install();
    
    return {
        restore: () => {
            server.restore();
        },
        setAuthToken: (token) => {
            server.authToken = token;
        },
        setNetworkDelay: (delay) => {
            server.networkDelay = delay;
        },
        resetData: () => {
            server.data = [];
        },
        setData: (data) => {
            server.data =  data;
        },
        getData: () => {
            return server.data;
        },
        simulateError: (errorCode = 500, errorData = { error: 'Simulated error' }) => {
            server.errorSimulation = { status: errorCode, data: errorData };
            // Auto-clear after 1 second as fallback
            setTimeout(() => { server.errorSimulation = null; }, 1000);
        }
    };
}
