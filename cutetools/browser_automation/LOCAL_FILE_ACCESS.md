# Local File Access Feature

## Overview

The `--local` flag enables browser flags necessary for testing local HTML files that need to access other local files.

## The Problem

Modern browsers (Chrome, Firefox) block file:// URLs from accessing other local files due to CORS (Cross-Origin Resource Sharing) security policies. This breaks local development/testing scenarios where:

- Your HTML file needs to fetch other local files
- You're using XMLHttpRequest or Fetch API with file:// URLs
- Your JavaScript imports local modules
- Your app loads local assets or data files

## The Solution

Use the `--local` flag when testing local files:

```bash
cute-browser --local
```

## What It Does

When `--local` is enabled, the browser is launched with these arguments:

1. **`--allow-file-access-from-files`**
   - Allows file:// URLs to read other local files
   - Removes the same-origin restriction for local files

2. **`--disable-web-security`**
   - Disables CORS restrictions
   - Required for XMLHttpRequest and Fetch API to work with local files

## Security Warning

⚠️ **IMPORTANT:** Only use `--local` when testing local files on your machine.

**DO NOT** use `--local` when browsing the internet, as it:
- Disables critical security features
- Makes you vulnerable to malicious websites
- Removes CORS protection

## Usage Examples

### Basic Local File Testing

```bash
echo "GOTO file:///path/to/your/app.html
GET_ELEMENTS
SCREENSHOT
QUIT" | cute-browser --local
```

### Mobile Device Testing with Local Files

```bash
echo "GOTO file:///path/to/app.html
SCREENSHOT mobile-view.png
QUIT" | cute-browser --local --device "iPhone 13"
```

### Testing File Access

```bash
# Test if file access works
echo "GOTO file:///tmp/test.html
WAIT 2
QUIT" | cute-browser --local
```

## Test Results

**Without `--local`:**
```
[CONSOLE:ERROR] Access to XMLHttpRequest at 'file:///tmp/data.json'
from origin 'null' has been blocked by CORS policy
```

**With `--local`:**
```
[CONSOLE:LOG] Local file access: WORKING
```

## Implementation Details

The flag is implemented in [controller.py](controller.py:37-53):

```python
# Browser launch arguments
launch_args = []
if self.local_file_mode:
    # Enable local file access for testing local HTML files
    launch_args.extend([
        '--allow-file-access-from-files',
        '--disable-web-security',
    ])

self.browser = await self.playwright.chromium.launch(
    headless=self.headless,
    args=launch_args if launch_args else None
)
```

## When to Use

✅ **Use `--local` for:**
- Testing local HTML/JavaScript applications
- Development of single-page apps loaded from file://
- Testing before deploying to a web server
- Automated testing of local files
- Prototyping with local data files

❌ **DON'T use `--local` for:**
- Browsing the internet
- Testing production websites
- Any scenario involving untrusted content
- Automated testing of remote URLs

## Alternative Approaches

If you don't want to use `--local`, consider these alternatives:

1. **Local Web Server**
   ```bash
   # Python
   python3 -m http.server 8000

   # Node.js
   npx http-server
   ```
   Then use `http://localhost:8000` instead of `file://`

2. **Browser Extensions**
   - Some browsers allow CORS-disabling extensions (not available in headless mode)

3. **Configure CORS Headers**
   - If you control the server, add proper CORS headers

The `--local` flag is the simplest solution for automated testing scenarios where you need to test local files without setting up a web server.

## Related Flags

The tool also supports other flags that can be combined with `--local`:

- `--headed` - Show browser window (useful for debugging)
- `--device "iPhone 13"` - Emulate mobile devices
- `--viewport 800x600` - Custom viewport size
- `--device-scale 2.0` - Set pixel density

Example combination:
```bash
cute-browser --local --headed --device "Pixel 7"
```

This gives you a visible browser, local file access, and Pixel 7 emulation all at once.
