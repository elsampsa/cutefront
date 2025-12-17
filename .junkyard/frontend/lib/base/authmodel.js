class AuthModel { /*//DOC
    Base authentication model for injecting auth headers into HTTP requests.
    Stores token in memory (lost on page reload).
    Subclass this to add refresh token logic, localStorage persistence, etc.
    */
    constructor() {
        this.token = null;
    }

    set(authInfo) { /*//DOC
        Set authentication token from auth response.
        :param authInfo: Object with token field, e.g., {token: "jwt-token"} or {access_token: "jwt-token"}
        */
        if (authInfo.token !== undefined) {
            this.token = authInfo.token;
        } else if (authInfo.access_token !== undefined) {
            this.token = authInfo.access_token;
        }
    }

    getAuthHeaders() { /*//DOC
        Returns headers object to inject into HTTP requests.
        :returns: Object with Authorization header, or empty object if no token
        */
        return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    }

    async handleUnauthorized() { /*//DOC
        Called by HTTPDataSource when receiving 401 Unauthorized response.
        Base implementation returns false (no token refresh).
        Override in subclasses to implement token refresh logic.
        :returns: true if token was refreshed successfully, false otherwise
        */
        return false;
    }

    clear() { /*//DOC
        Clear authentication token (e.g., on logout).
        */
        this.token = null;
    }
}

class RefreshTokenAuthModel extends AuthModel { /*//DOC
    Authentication model with refresh token support.
    Stores both access token and refresh token in memory.
    Automatically attempts to refresh access token on 401 errors.
    */
    constructor(refreshEndpoint = '/auth/refresh') {
        super();
        this.refreshToken = null;
        this.refreshEndpoint = refreshEndpoint;
    }

    set(authInfo) { /*//DOC
        Set authentication tokens from auth response.
        :param authInfo: Object with token/access_token and refreshToken/refresh_token fields
        */
        super.set(authInfo);
        if (authInfo.refreshToken !== undefined) {
            this.refreshToken = authInfo.refreshToken;
        } else if (authInfo.refresh_token !== undefined) {
            this.refreshToken = authInfo.refresh_token;
        }
    }

    async handleUnauthorized() { /*//DOC
        Attempts to refresh the access token using the refresh token.
        :returns: true if token was refreshed successfully, false otherwise
        */
        if (!this.refreshToken) {
            return false;
        }

        try {
            const response = await fetch(this.refreshEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.token || data.access_token;
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        return false;
    }

    clear() { /*//DOC
        Clear both access token and refresh token.
        */
        super.clear();
        this.refreshToken = null;
    }
}

class LocalStorageAuthModel extends AuthModel { /*//DOC
    Authentication model that persists token in localStorage.
    Token survives page reloads.
    Simple implementation without refresh token logic.
    */
    constructor(storageKey = 'auth_token') {
        super();
        this.storageKey = storageKey;
        this.loadFromStorage();
    }

    loadFromStorage() { /*//DOC
        Load token from localStorage on initialization.
        */
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.token = data.token || data.access_token || stored;
            } catch (e) {
                // If not JSON, assume it's a plain token string
                this.token = stored;
            }
        }
    }

    set(authInfo) { /*//DOC
        Set authentication token and persist to localStorage.
        :param authInfo: Object with token field or plain token string
        */
        super.set(authInfo);
        if (this.token) {
            localStorage.setItem(this.storageKey, this.token);
        }
    }

    clear() { /*//DOC
        Clear token from memory and localStorage.
        */
        super.clear();
        localStorage.removeItem(this.storageKey);
    }
}

export { AuthModel, RefreshTokenAuthModel, LocalStorageAuthModel }
