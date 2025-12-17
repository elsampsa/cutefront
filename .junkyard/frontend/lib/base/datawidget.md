# Error Object Format

All DataSource errors emit a standardized error object:

```javascript
{
    message: string,      // ALWAYS present - human-readable error description
    status: int | null,   // HTTP status code (401, 404, etc.) OR null for non-HTTP errors
    body: json | string | null  // Server's error response (optional details)
}
```

## Error Scenarios

| Scenario | `message` | `status` | `body` |
|----------|-----------|----------|--------|
| HTTP error with JSON | `"HTTP 404: Not Found"` | `404` | `{detail: "..."}` |
| HTTP error with text | `"HTTP 500: Internal Server Error"` | `500` | `"Error string"` |
| HTTP error, no body | `"HTTP 401: Unauthorized"` | `401` | `null` |
| Network error | `"Network error: Failed to fetch"` | `null` | `null` or error object |
| Mock error | `"Item not found"` | `null` | `null` |

## Body Field Types

The `body` field can contain:

1. **JSON Object** - Most common for REST APIs
   ```javascript
   body: { detail: "Email already registered" }
   body: { detail: [{ type: "...", loc: [...], msg: "..." }] }  // FastAPI validation errors
   ```

2. **String** - Plain text error message
   ```javascript
   body: "Database connection failed"
   ```

3. **null** - No additional error details available
   ```javascript
   body: null
   ```

## Example: Handling Errors in UI Widgets

```javascript
dataSourceWidget.signals.error.connect((error) => {
    // error = {message: str, status: int|null, body: any}

    // Option 1: Simple - just show the message (always available)
    showError(error.message);  // "HTTP 404: Not Found"

    // Option 2: Check status code for specific handling
    if (error.status === 401) {
        redirectToLogin();
    } else if (error.status === 404) {
        showNotFound();
    } else if (error.status === 422) {
        // FastAPI validation error
        handleValidationErrors(error.body.detail);
    }

    // Option 3: Use detailed server error from body
    if (error.body && typeof error.body === 'object' && error.body.detail) {
        showError(error.body.detail);  // Server's detailed message
    } else if (typeof error.body === 'string') {
        showError(error.body);  // Plain text error
    } else {
        showError(error.message);  // Fallback to generic message
    }
});
```

## Key Points

- **`message`**: Always present, always a string. Safe to display directly.
- **`status`**: Use for conditional logic (401 → login, 404 → not found, etc.)
- **`body`**: Optional server details. Check type before using.
- **Consistent format**: HTTPDataSource and MockDataSource both emit the same structure.
