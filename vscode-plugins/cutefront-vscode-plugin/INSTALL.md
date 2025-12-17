# Installation & Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd cutefront-vscode-plugin
npm install
```

### 2. Compile TypeScript

```bash
npm run compile
```

### 3. Install the Extension

**Option A: Development Mode (Recommended for testing)**

1. Open this folder in VSCode
2. Press `F5` to launch Extension Development Host
3. A new VSCode window opens with the extension loaded

**Option B: Install Locally**

```bash
# Package the extension
npm install -g @vscode/vsce
vsce package

# Install the .vsix file
code --install-extension cutefront-api-explorer-0.1.0.vsix
```

**Option C: Copy to Extensions Folder**

```bash
# Compile first
npm run compile

# Copy to VSCode extensions directory
cp -r . ~/.vscode/extensions/cutefront-api-explorer-0.1.0/
```

## Configuration

Open VSCode Settings (`Ctrl+,`) and search for "CuteFront":

```json
{
  "cutefront.apiDocsPath": "app/api-docs.yaml",
  "cutefront.pythonPath": "python3",
  "cutefront.showInheritedMembers": true
}
```

## First Use

1. **Open your CuteFront project** in VSCode

2. **Generate API documentation:**
   - Open an HTML file with `window.genDocs = [...]`
   - Right-click the file → "CuteFront: Generate API Documentation"
   - OR: `Ctrl+Shift+P` → "CuteFront: Generate API Documentation"

3. **View the API Tree:**
   - Look in the Explorer sidebar
   - Find the "CuteFront API Tree" panel
   - Expand to browse your widgets!

4. **Navigate:**
   - Click any slot/signal → jumps to definition
   - Right-click in a widget file → "Show Current File in API Tree"

## Troubleshooting

### "cute-get-api-tree command not found"

Make sure the Python script is installed and in your PATH:

```bash
which cute-get-api-tree
# Should show: /home/user/.local/bin/cute-get-api-tree
```

If not found, check your Python package installation or set the full path in settings:

```json
{
  "cutefront.pythonPath": "/usr/bin/python3"
}
```

### "No API tree available"

1. Check that `api-docs.yaml` exists
2. Verify the path in settings matches your file location
3. Try regenerating: `Ctrl+Shift+P` → "CuteFront: Refresh API Tree"

### Extension not loading

1. Check Output panel: View → Output → "CuteFront"
2. Look for errors in the Developer Console: Help → Toggle Developer Tools

## Development Workflow

### Watch Mode

During development, run TypeScript compiler in watch mode:

```bash
npm run watch
```

Then press `F5` to launch the Extension Development Host. When you make changes:
1. Save the file
2. In the Extension Development Host window, press `Ctrl+R` to reload

### Debugging

1. Set breakpoints in `.ts` files
2. Press `F5` to start debugging
3. Breakpoints will hit when you use the extension features

### Testing

```bash
npm run test
```

## Building for Distribution

```bash
# Install vsce if not already installed
npm install -g @vscode/vsce

# Package
vsce package

# This creates: cutefront-api-explorer-0.1.0.vsix
```

Share the `.vsix` file with others or publish to the VSCode Marketplace.

## Publishing to Marketplace (Optional)

1. Create a [publisher](https://aka.ms/vscode-create-publisher)
2. Get a [Personal Access Token](https://aka.ms/vscode-create-pat)
3. Login and publish:

```bash
vsce login your-publisher-name
vsce publish
```

See [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) for details.
