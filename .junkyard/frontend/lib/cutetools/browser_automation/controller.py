"""Main browser controller using Playwright."""

import sys
import json
import asyncio
import argparse
from pathlib import Path
from datetime import datetime
from playwright.async_api import async_playwright, Page, Browser, BrowserContext

from .element_detector import get_page_elements


class BrowserController:
    """Controls a Playwright browser instance via stdin/stdout commands."""

    def __init__(self, headless: bool = True, screenshot_dir: str = "/tmp/screenshots",
                 device: str = None, viewport: tuple = None, user_agent: str = None,
                 device_scale: float = None, local_file_mode: bool = False):
        self.headless = headless
        self.screenshot_dir = Path(screenshot_dir)
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)

        # Device emulation settings
        self.device_name = device
        self.viewport = viewport
        self.user_agent = user_agent
        self.device_scale = device_scale
        self.local_file_mode = local_file_mode

        self.playwright = None
        self.browser: Browser = None
        self.context: BrowserContext = None
        self.page: Page = None
        self.screenshot_counter = 0

    async def start(self):
        """Initialize Playwright and launch browser."""
        self.playwright = await async_playwright().start()

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

        # Build context options
        context_options = {}

        # Apply device preset if specified
        if self.device_name:
            if self.device_name in self.playwright.devices:
                device_config = self.playwright.devices[self.device_name]
                context_options.update(device_config)
            else:
                # Print warning but continue
                print(f"[WARNING] Device '{self.device_name}' not found, using defaults",
                      file=sys.stderr, flush=True)

        # Apply manual overrides (these override device preset if both specified)
        if self.viewport:
            context_options['viewport'] = {
                'width': self.viewport[0],
                'height': self.viewport[1]
            }
        if self.user_agent:
            context_options['user_agent'] = self.user_agent
        if self.device_scale:
            context_options['device_scale_factor'] = self.device_scale

        self.context = await self.browser.new_context(**context_options)
        self.page = await self.context.new_page()

        # Set up console logging to stderr
        self.page.on("console", self._handle_console)
        self.page.on("pageerror", self._handle_page_error)

    def _handle_console(self, msg):
        """Forward browser console messages to stderr."""
        console_type = msg.type.upper()
        text = msg.text
        print(f"[CONSOLE:{console_type}] {text}", file=sys.stderr, flush=True)

    def _handle_page_error(self, exc):
        """Forward page errors to stderr."""
        print(f"[CONSOLE:ERROR] {exc}", file=sys.stderr, flush=True)

    async def stop(self):
        """Clean up browser resources."""
        if self.page:
            await self.page.close()
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

    def _response(self, status: str, command: str, data=None, error: str = None):
        """Format a JSON response."""
        response = {
            "status": status,
            "command": command,
            "data": data,
            "error": error
        }
        return json.dumps(response, indent=2)

    async def handle_command(self, line: str):
        """Parse and execute a command from stdin."""
        parts = line.strip().split(maxsplit=1)
        if not parts:
            return

        command = parts[0].upper()
        args = parts[1] if len(parts) > 1 else ""

        try:
            if command == "GOTO":
                result = await self._cmd_goto(args)
            elif command == "SCREENSHOT":
                result = await self._cmd_screenshot(args)
            elif command == "QUIT":
                result = self._response("success", "QUIT", {"message": "Browser closing"})
                print(result, flush=True)
                return False  # Signal to stop the loop
            elif command == "GET_ELEMENTS":
                result = await self._cmd_get_elements()
            elif command == "CLICK":
                result = await self._cmd_click(args)
            elif command == "FILL":
                result = await self._cmd_fill(args)
            elif command == "WAIT":
                result = await self._cmd_wait(args)
            else:
                result = self._response("error", command, error=f"Unknown command: {command}")

            print(result, flush=True)
            return True

        except Exception as e:
            error_response = self._response("error", command, error=str(e))
            print(error_response, flush=True)
            return True

    async def _cmd_goto(self, url: str):
        """Navigate to a URL."""
        if not url:
            return self._response("error", "GOTO", error="URL required")

        # Add https:// if no protocol specified
        if not url.startswith(("http://", "https://", "file://")):
            url = f"https://{url}"

        await self.page.goto(url, wait_until="domcontentloaded")
        title = await self.page.title()

        return self._response("success", "GOTO", {
            "url": self.page.url,
            "title": title
        })

    async def _cmd_screenshot(self, filename: str = ""):
        """Capture a screenshot."""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            self.screenshot_counter += 1
            filename = f"screenshot_{timestamp}_{self.screenshot_counter}.png"

        filepath = self.screenshot_dir / filename
        await self.page.screenshot(path=str(filepath), full_page=True)

        return self._response("success", "SCREENSHOT", {
            "filepath": str(filepath),
            "url": self.page.url
        })

    async def _cmd_get_elements(self):
        """Get all interactive elements on the page."""
        elements = await get_page_elements(self.page)

        return self._response("success", "GET_ELEMENTS", {
            "url": self.page.url,
            "title": await self.page.title(),
            "element_count": len(elements),
            "elements": elements
        })

    async def _cmd_click(self, selector: str):
        """Click an element by ID or selector."""
        if not selector:
            return self._response("error", "CLICK", error="Selector required")

        # Try different selector strategies
        try:
            # First try as ID
            if not selector.startswith('['):
                # Check if it's an auto-generated ID
                if selector.startswith('auto-id-'):
                    selector = f'[data-auto-id="{selector}"]'
                else:
                    # Try regular ID first
                    element = await self.page.query_selector(f'#{selector}')
                    if element:
                        await element.click()
                        return self._response("success", "CLICK", {
                            "selector": f'#{selector}',
                            "clicked": True
                        })
                    # If not found, try as data-auto-id
                    selector = f'[data-auto-id="{selector}"]'

            # Click using the selector
            await self.page.click(selector, timeout=5000)
            return self._response("success", "CLICK", {
                "selector": selector,
                "clicked": True
            })

        except Exception as e:
            return self._response("error", "CLICK",
                                error=f"Failed to click '{selector}': {str(e)}")

    async def _cmd_fill(self, args: str):
        """Fill an input field with text."""
        # Parse args: selector and text (space-separated, with text potentially containing spaces)
        parts = args.split(maxsplit=1)
        if len(parts) < 2:
            return self._response("error", "FILL",
                                error="Usage: FILL <selector> <text>")

        selector, text = parts

        try:
            # Try different selector strategies (same as CLICK)
            if not selector.startswith('['):
                # Check if it's an auto-generated ID
                if selector.startswith('auto-id-'):
                    selector = f'[data-auto-id="{selector}"]'
                else:
                    # Try regular ID first
                    element = await self.page.query_selector(f'#{selector}')
                    if element:
                        await element.fill(text)
                        return self._response("success", "FILL", {
                            "selector": f'#{selector}',
                            "text": text,
                            "filled": True
                        })
                    # If not found, try as data-auto-id
                    selector = f'[data-auto-id="{selector}"]'

            # Fill using the selector
            await self.page.fill(selector, text, timeout=5000)
            return self._response("success", "FILL", {
                "selector": selector,
                "text": text,
                "filled": True
            })

        except Exception as e:
            return self._response("error", "FILL",
                                error=f"Failed to fill '{selector}': {str(e)}")

    async def _cmd_wait(self, seconds: str):
        """Wait for specified seconds."""
        try:
            wait_time = float(seconds)
            await asyncio.sleep(wait_time)
            return self._response("success", "WAIT", {
                "waited": wait_time
            })
        except ValueError:
            return self._response("error", "WAIT",
                                error=f"Invalid wait time: {seconds}")


HELP_TEXT = """
Browser Automation Tool - Control Playwright browser via stdin/stdout

COMMANDS:
  GOTO <url>              Navigate to URL (auto-adds https:// if needed)
  GET_ELEMENTS            List all interactive elements on page
  SCREENSHOT [file]       Capture full-page screenshot (auto-named if omitted)
  CLICK <id>              Click element by ID or selector
  FILL <id> <text>        Fill input field with text
  WAIT <seconds>          Wait for specified time (supports decimals)
  QUIT                    Close browser and exit

COMMUNICATION:
  stdin:  Commands (one per line)
  stdout: JSON responses {"status": "success|error", "command": "...", "data": {...}}
  stderr: Browser console logs [CONSOLE:LOG/WARN/ERROR] message

ELEMENT TYPES DETECTED:
  button, link, input (text/email/password/etc), select, checkbox, radio
  Each includes: type, id, text/label, bbox, selector, disabled state

EXAMPLES:
  echo "GOTO example.com" | cute-browser
  echo "GOTO file:///tmp/page.html\\nGET_ELEMENTS\\nQUIT" | cute-browser --local
  echo "GOTO example.com\\nSCREENSHOT\\nQUIT" | cute-browser --device "iPhone 13"

SCREENSHOTS:
  Saved to /tmp/screenshots/ by default
  Use SCREENSHOT command after page loads or form fills

OPTIONS:
  --headed                 Run browser in headed mode (visible window)
  --local                  Enable local file access (for testing local HTML files)
  --device NAME            Emulate device (e.g., "iPhone 13", "Pixel 7")
  --viewport WxH           Custom viewport size (e.g., 412x915)
  --user-agent TEXT        Custom user agent string
  --device-scale FLOAT     Device pixel ratio (e.g., 2.625)
  --list-devices           List all available device presets and exit
  -h, --help               Show this help message

DEVICE EMULATION:
  Use --device for quick mobile testing with 100+ presets
  Use manual flags (--viewport, --user-agent, --device-scale) for custom setups
  Manual flags override device preset settings if both specified

For full documentation, see the README.md in the package directory.
"""


async def main_async(args):
    """Main async entry point for the browser controller."""
    # Parse viewport if provided
    viewport = None
    if args.viewport:
        try:
            parts = args.viewport.lower().split('x')
            if len(parts) == 2:
                viewport = (int(parts[0]), int(parts[1]))
            else:
                print(f"[WARNING] Invalid viewport format '{args.viewport}', expected WxH (e.g., 412x915)",
                      file=sys.stderr, flush=True)
        except ValueError:
            print(f"[WARNING] Invalid viewport dimensions '{args.viewport}'",
                  file=sys.stderr, flush=True)

    controller = BrowserController(
        headless=not args.headed,
        device=args.device,
        viewport=viewport,
        user_agent=args.user_agent,
        device_scale=args.device_scale,
        local_file_mode=args.local
    )

    try:
        await controller.start()

        # Include device info in INIT response
        init_data = {"message": "Browser ready"}
        if args.device:
            init_data["device"] = args.device
        if viewport:
            init_data["viewport"] = f"{viewport[0]}x{viewport[1]}"

        print(controller._response("success", "INIT", init_data), flush=True)

        # Command loop - read from stdin
        for line in sys.stdin:
            should_continue = await controller.handle_command(line)
            if not should_continue:
                break

    except KeyboardInterrupt:
        print(controller._response("success", "INTERRUPT", {"message": "Interrupted"}), flush=True)
    finally:
        await controller.stop()


async def list_devices():
    """List all available device presets."""
    async with async_playwright() as p:
        devices = p.devices
        print("Available device presets:")
        print("-" * 60)

        # Group devices by type for better readability
        mobile_phones = []
        tablets = []
        desktops = []

        for name in sorted(devices.keys()):
            device = devices[name]
            viewport = device.get('viewport', {})
            width = viewport.get('width', '?')
            height = viewport.get('height', '?')
            has_touch = device.get('has_touch', False)

            entry = f"  {name:30s} {width}x{height}"
            if has_touch and 'Tablet' not in name and 'iPad' not in name:
                mobile_phones.append(entry)
            elif 'Tablet' in name or 'iPad' in name:
                tablets.append(entry)
            else:
                desktops.append(entry)

        if mobile_phones:
            print("\nMobile Phones:")
            for entry in mobile_phones:
                print(entry)

        if tablets:
            print("\nTablets:")
            for entry in tablets:
                print(entry)

        if desktops:
            print("\nDesktops:")
            for entry in desktops:
                print(entry)

        print(f"\nTotal: {len(devices)} devices")
        print("\nUsage: cute-browser --device \"iPhone 13\"")


def main():
    """Main entry point with argument parsing."""
    parser = argparse.ArgumentParser(
        description='Browser automation tool - control Playwright via stdin/stdout',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=HELP_TEXT,
        add_help=False  # We'll handle help ourselves to show custom format
    )
    parser.add_argument('--headed', action='store_true',
                       help='Run browser in headed mode (default: headless)')
    parser.add_argument('--local', action='store_true',
                       help='Enable local file access (for testing local HTML files)')
    parser.add_argument('--device', type=str, default=None,
                       help='Device to emulate (e.g., "iPhone 13", "Pixel 7")')
    parser.add_argument('--viewport', type=str, default=None,
                       help='Viewport size as WxH (e.g., 412x915)')
    parser.add_argument('--user-agent', type=str, default=None,
                       help='Custom user agent string')
    parser.add_argument('--device-scale', type=float, default=None,
                       help='Device scale factor (e.g., 2.625)')
    parser.add_argument('--list-devices', action='store_true',
                       help='List all available device presets and exit')
    parser.add_argument('-h', '--help', action='store_true',
                       help='Show this help message')

    args = parser.parse_args()

    if args.help:
        print(HELP_TEXT.strip())
        sys.exit(0)

    if args.list_devices:
        asyncio.run(list_devices())
        sys.exit(0)

    asyncio.run(main_async(args))


if __name__ == "__main__":
    main()
