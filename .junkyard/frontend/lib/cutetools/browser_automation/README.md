# Browser Automation Tool

A Python-based browser automation tool for Claude Code that uses Playwright to control a web browser through a stdin/stdout interface.

## Features

- **Persistent browser session** - Browser stays open between commands
- **JSON-based communication** - Structured responses for easy parsing
- **Console logging** - Browser console messages forwarded to stderr
- **Screenshot capture** - Visual inspection of pages
- **Element detection** - Automatic discovery of interactive elements
- **Smart element selection** - Works with IDs, auto-generated IDs, or CSS selectors

## Installation

From the cutetools directory:

```bash
pip install -e .
```

This will install the `cute-browser` command-line tool.

## Usage

Get quick help:

```bash
cute-browser --help
cute-browser -h
```

Start the browser automation tool:

```bash
cute-browser                          # Headless mode (default)
cute-browser --headed                 # Visible browser window
cute-browser --local                  # Enable local file access (for testing)
cute-browser --device "iPhone 13"     # Emulate iPhone 13
cute-browser --viewport 412x915       # Custom viewport size
cute-browser --list-devices           # List all available devices
```

### Device Emulation

The tool supports device emulation for mobile testing:

**Quick device presets (100+ devices):**
```bash
cute-browser --device "iPhone 13"
cute-browser --device "Pixel 7"
cute-browser --device "Galaxy S24"
```

**Custom configuration:**
```bash
cute-browser --viewport 412x915 --device-scale 2.625 --user-agent "Mozilla/5.0..."
```

**Mix preset with overrides:**
```bash
cute-browser --device "iPhone 13" --viewport 400x800  # Override viewport only
```

**List available devices:**
```bash
cute-browser --list-devices
```

### Local File Testing

When testing local HTML files that need to access other local files (e.g., fetching resources, XMLHttpRequest), use the `--local` flag:

```bash
cute-browser --local
```

This enables:
- `--allow-file-access-from-files` - Allows file:// URLs to read other local files
- `--disable-web-security` - Disables CORS for local file testing

**Security Note:** Only use `--local` when testing local files. Do NOT use it when browsing the internet, as it disables important security features.

**Example:**
```bash
echo "GOTO file:///path/to/your/app.html
GET_ELEMENTS
SCREENSHOT
QUIT" | cute-browser --local
```

The tool runs in an interactive mode, reading commands from stdin and writing JSON responses to stdout.

### Commands

#### GOTO <url>
Navigate to a URL (https:// is added automatically if no protocol specified).

```
GOTO example.com
```

Response:
```json
{
  "status": "success",
  "command": "GOTO",
  "data": {
    "url": "https://example.com",
    "title": "Example Domain"
  }
}
```

#### SCREENSHOT [filename]
Capture a full-page screenshot. If no filename is provided, an auto-generated name is used.

```
SCREENSHOT
SCREENSHOT my-page.png
```

Response:
```json
{
  "status": "success",
  "command": "SCREENSHOT",
  "data": {
    "filepath": "/tmp/screenshots/screenshot_20250125_143022_1.png",
    "url": "https://example.com"
  }
}
```

#### GET_ELEMENTS
Get all interactive elements on the current page.

```
GET_ELEMENTS
```

Response:
```json
{
  "status": "success",
  "command": "GET_ELEMENTS",
  "data": {
    "url": "https://example.com",
    "title": "Example Domain",
    "element_count": 15,
    "elements": [
      {
        "type": "button",
        "id": "submit-btn",
        "text": "Submit",
        "tag": "button",
        "disabled": false,
        "bbox": {"x": 100, "y": 200, "width": 80, "height": 40},
        "selector": "[data-auto-id=\"auto-id-0\"]"
      },
      {
        "type": "input",
        "id": "email",
        "input_type": "email",
        "placeholder": "Enter your email",
        "value": "",
        "label": "Email Address",
        "disabled": false,
        "bbox": {"x": 100, "y": 150, "width": 200, "height": 30},
        "selector": "[data-auto-id=\"auto-id-1\"]"
      }
    ]
  }
}
```

Element types detected:
- **button** - Buttons and submit inputs
- **link** - Anchor tags with href
- **input** - Text inputs, email, password, textarea, etc.
- **select** - Dropdown menus
- **checkbox** - Checkboxes
- **radio** - Radio buttons

#### CLICK <selector>
Click an element by ID or selector.

```
CLICK submit-btn
CLICK auto-id-0
CLICK [data-auto-id="auto-id-0"]
```

Response:
```json
{
  "status": "success",
  "command": "CLICK",
  "data": {
    "selector": "#submit-btn",
    "clicked": true
  }
}
```

#### FILL <selector> <text>
Fill an input field with text.

```
FILL email test@example.com
FILL password MySecretPassword123
```

Response:
```json
{
  "status": "success",
  "command": "FILL",
  "data": {
    "selector": "#email",
    "text": "test@example.com",
    "filled": true
  }
}
```

#### WAIT <seconds>
Wait for a specified number of seconds.

```
WAIT 2.5
```

Response:
```json
{
  "status": "success",
  "command": "WAIT",
  "data": {
    "waited": 2.5
  }
}
```

#### QUIT
Close the browser and exit.

```
QUIT
```

## Device Emulation Details

When using `--device`, Playwright automatically configures:

- **Viewport size** - Screen dimensions specific to the device
- **User agent** - Accurate user agent string for the device
- **Device scale factor** - Pixel density (e.g., Retina displays)
- **Touch support** - Enables touch events for mobile devices
- **Mobile flag** - Indicates mobile browser behavior

Manual flags (`--viewport`, `--user-agent`, `--device-scale`) override these settings when specified.

### Available Devices

Run `cute-browser --list-devices` to see all 100+ available devices, including:

**Mobile Phones:** iPhone 11/12/13/14/15, Pixel 2-7, Galaxy S series, various Android devices

**Tablets:** iPad, iPad Pro, iPad Mini, Galaxy Tab, Kindle Fire

**Desktops:** Various desktop configurations

## Console Logging

Browser console messages are forwarded to stderr with prefixes:

```
[CONSOLE:LOG] User logged in successfully
[CONSOLE:WARN] Deprecated API usage
[CONSOLE:ERROR] TypeError: Cannot read property 'foo' of undefined
```

## Example Sessions

### Basic Session

```bash
$ cute-browser
{"status": "success", "command": "INIT", "data": {"message": "Browser ready"}}

GOTO github.com
{"status": "success", "command": "GOTO", "data": {"url": "https://github.com", "title": "GitHub"}}

GET_ELEMENTS
{"status": "success", "command": "GET_ELEMENTS", "data": {...}}

SCREENSHOT github-homepage.png
{"status": "success", "command": "SCREENSHOT", "data": {"filepath": "/tmp/screenshots/github-homepage.png", ...}}

QUIT
{"status": "success", "command": "QUIT", "data": {"message": "Browser closing"}}
```

### Mobile Device Emulation

```bash
$ cute-browser --device "iPhone 13"
{"status": "success", "command": "INIT", "data": {"message": "Browser ready", "device": "iPhone 13"}}

GOTO example.com
{"status": "success", "command": "GOTO", "data": {"url": "https://example.com", "title": "Example"}}

SCREENSHOT mobile-view.png
{"status": "success", "command": "SCREENSHOT", "data": {"filepath": "/tmp/screenshots/mobile-view.png", ...}}

QUIT
{"status": "success", "command": "QUIT", "data": {"message": "Browser closing"}}
```

## Error Handling

Errors are returned in the same JSON format:

```json
{
  "status": "error",
  "command": "CLICK",
  "data": null,
  "error": "Failed to click '#nonexistent': Timeout 5000ms exceeded"
}
```

## Architecture

- **controller.py** - Main browser controller and command handler
- **element_detector.py** - JavaScript injection for element detection
- **__main__.py** - Entry point for the command-line tool

## Future Enhancements

- Additional selector strategies (XPath, text content)
- More commands (EXECUTE_JS, GET_TEXT, SCROLL, WAIT_FOR)
- Cookie and localStorage management
- Multiple tab/window support
- Configurable timeouts
- MCP server integration
