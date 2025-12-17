# Device Emulation Feature

## Overview

The browser automation tool now supports complete device emulation for mobile and tablet testing using Playwright's built-in device registry.

## Features Added

### 1. Device Presets (100+ devices)

Use `--device` flag with any Playwright device name:

```bash
cute-browser --device "iPhone 13"
cute-browser --device "Pixel 7"
cute-browser --device "Galaxy S24"
cute-browser --device "iPad Pro"
```

Each preset automatically configures:
- Viewport dimensions
- User agent string
- Device pixel ratio
- Touch event support
- Mobile browser flags

### 2. Custom Configuration

Manual control over individual settings:

```bash
# Custom viewport
cute-browser --viewport 412x915

# Custom user agent
cute-browser --user-agent "Mozilla/5.0 (Linux; Android 13)..."

# Device scale factor (pixel density)
cute-browser --device-scale 2.625

# Combine multiple options
cute-browser --viewport 400x800 --device-scale 3.0
```

### 3. Override Mechanism

Manual flags override device preset settings:

```bash
# Use iPhone 13 but override viewport
cute-browser --device "iPhone 13" --viewport 400x900
```

### 4. Device Discovery

List all available devices:

```bash
cute-browser --list-devices
```

Output is organized by category:
- Mobile Phones (iPhone, Pixel, Galaxy, etc.)
- Tablets (iPad, Galaxy Tab, Kindle, etc.)
- Desktops

## Implementation Details

### Changes Made

**File: controller.py**
- Updated `BrowserController.__init__()` to accept device parameters
- Modified `start()` method to apply device emulation via context options
- Added `list_devices()` async function for device discovery
- Updated argument parser with new flags
- Enhanced INIT response to include device info

**File: README.md**
- Added device emulation section
- Updated usage examples
- Added mobile session example
- Documented what device emulation includes

**File: HELP_TEXT**
- Added device-related options
- Added device emulation section
- Updated examples with mobile usage

## Comparison with Raw Chrome Flags

Your original Chrome flags:
```bash
--headless=new --disable-gpu --window-size=412,915
--device-scale-factor=2.625 --user-agent="..."
--enable-features=... --disable-extensions
```

Playwright equivalent (simpler and cleaner):
```bash
cute-browser --viewport 412x915 --device-scale 2.625 --user-agent "..."
```

**Advantages:**
- Playwright handles `--disable-gpu`, `--headless=new` automatically
- Features like `--enable-features` and `--disable-extensions` not needed
- Works across browser engines (Chromium, Firefox, WebKit)
- 100+ device presets eliminate need to remember dimensions

## Testing Results

All features tested and working:

✅ Device preset emulation (iPhone 13, Pixel 7, Galaxy S24)
✅ Custom viewport configuration
✅ Custom device scale factor
✅ Device + custom override combination
✅ --list-devices functionality
✅ Screenshots reflect correct viewport sizes
✅ All existing commands still work (GOTO, FILL, CLICK, etc.)

## Usage Examples

### Test mobile responsiveness
```bash
echo "GOTO example.com
SCREENSHOT mobile.png
QUIT" | cute-browser --device "iPhone 13"
```

### Custom Android emulation
```bash
echo "GOTO example.com
GET_ELEMENTS
QUIT" | cute-browser --viewport 412x915 --device-scale 2.625 \
  --user-agent "Mozilla/5.0 (Linux; Android 13; Pixel 7)..."
```

### Compare different devices
```bash
for device in "iPhone 13" "Pixel 7" "Galaxy S24"; do
  echo "GOTO example.com
SCREENSHOT ${device// /_}.png
QUIT" | cute-browser --device "$device"
done
```

## Benefits

1. **Quick mobile testing** - One flag gets authentic mobile behavior
2. **No memorization needed** - Device registry handles all settings
3. **Consistent testing** - Same device configs across team
4. **Flexible** - Mix presets with custom settings
5. **Discoverable** - `--list-devices` shows what's available
6. **Visual verification** - Screenshots show actual viewport

## Future Enhancements

Potential additions:
- Geolocation emulation
- Network throttling (3G, 4G, slow connection)
- Offline mode
- Timezone/locale overrides
- Permission settings (camera, notifications, etc.)
