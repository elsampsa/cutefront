# CuteFront API Explorer - VSCode Extension

Navigate your CuteFront widget hierarchy with full inheritance information!

## Features

### 🌲 API Tree View
- Browse widget hierarchy in the Explorer sidebar
- See all slots, signals, and input fields
- Inherited members clearly marked with source class
- Click any slot/signal to jump to its definition

### 🔄 Generate API Documentation
- Right-click any HTML file with `window.genDocs` → "CuteFront: Generate API Documentation"
- Runs `cute-get-api-tree` automatically
- Creates `api-docs.yaml` with full inheritance analysis

### 🎯 Navigate Code
- Click slots/signals in tree → jumps to exact line in source file
- "Show Current File in API Tree" - find where you are in the widget hierarchy

## Requirements

- Python 3 with `cute-get-api-tree` command installed
- CuteFront project with widget classes

## Installation

1. Link (or copy) this folder to `~/.vscode/extensions/cutefront-api-explorer-0.1.0/` or install from VSIX
2. Install dependencies:
   ```bash
   cd cutefront-vscode-plugin
   npm install
   npm run compile
   ```

## Usage

### Generating API Documentation

1. Open an HTML file that contains `window.genDocs = ["widget1", "widget2"]`
2. Right-click the file in Explorer
3. Select "CuteFront: Generate API Documentation"
4. The extension will run `cute-get-api-tree` and create `api-docs.yaml`

**OR** use the command palette:
- `Ctrl+Shift+P` → "CuteFront: Generate API Documentation"

### Browsing the API Tree

1. Open the Explorer sidebar
2. Find the "CuteFront API Tree" section
3. Expand widgets to see:
   - **About**: Widget description
   - **Slots**: Methods ending with `_slot`
   - **Signals**: Events emitted by the widget
   - **Input Fields**: Form fields (if applicable)
   - **Widgets**: Sub-widgets

**Inherited members** show `← ParentClass` in the description.

**Click any slot/signal** to jump to its definition!

### Finding Your Place

When editing a widget file:
- `Ctrl+Shift+P` → "CuteFront: Show Current File in API Tree"
- The extension will highlight your widget in the tree

## Configuration

Open Settings → Extensions → CuteFront:

- **apiDocsPath**: Path to api-docs.yaml (default: `api-docs.yaml`)
- **pythonPath**: Path to Python executable (default: `python3`)
- **showInheritedMembers**: Show inherited slots/signals (default: `true`)

## Tree View Icons

- 📦 Widget class
- 🔌 Slot (method)
- 📡 Signal (event)
- 📁 Section/folder
- ℹ️  About/info
- 🔧 Input field

## Example

Given this YAML:
```yaml
LoginWidget:
  class: LoginWidget@app/landing/login.js:5
  slots:
    login_slot:
      about: "Trigger login"
      # Defined in LoginWidget
    activate_debug_slot:
      about: "Debug mode"
      class: Widget@lib/base/widget.js:364
      # ↑ Inherited from Widget
```

The tree shows:
```
LoginWidget [LoginWidget]
  ├─ About
  ├─ Slots (2)
  │   ├─ login_slot
  │   └─ activate_debug_slot ← Widget
```

Clicking `activate_debug_slot` opens `lib/base/widget.js` at line 364!

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run in Extension Development Host
# Press F5 in VSCode
```

## Troubleshooting

**"No API tree available"**
- Make sure `api-docs.yaml` exists in your workspace
- Check the `apiDocsPath` setting
- Try regenerating with "Generate API Documentation"

**"cute-get-api-tree command not found"**
- Install the Python package: `pip install cutefront-tools` (or your package name)
- Or set `pythonPath` to your Python environment

**"File not found in API tree"**
- The file might not be part of any widget class
- Regenerate API docs to include recent changes
