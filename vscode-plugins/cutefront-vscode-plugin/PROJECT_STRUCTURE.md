# CuteFront VSCode Extension - Project Structure

## Overview

This VSCode extension provides navigation and exploration for CuteFront widget hierarchies with full inheritance analysis.

## Directory Structure

```
cutefront-vscode-plugin/
├── src/                          # TypeScript source files
│   ├── extension.ts              # Main extension entry point
│   ├── apiDocsManager.ts         # YAML loading and management
│   ├── apiTreeProvider.ts        # Tree view provider
│   ├── apiDocsGenerator.ts       # Runs cute-get-api-tree Python script
│   └── codeParser.ts             # Find line numbers for slots/signals
├── out/                          # Compiled JavaScript (generated)
├── package.json                  # Extension manifest
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # User documentation
├── INSTALL.md                    # Installation guide
└── PROJECT_STRUCTURE.md          # This file

```

## File Descriptions

### `src/extension.ts`
**Main extension activation and command registration**

- Activates when JavaScript/HTML files are opened
- Registers commands:
  - `cutefront.showApiTree` - Show tree view
  - `cutefront.refreshTree` - Reload YAML and refresh
  - `cutefront.generateApiDocs` - Run Python script
  - `cutefront.showInApiTree` - Find current file in tree
  - `cutefront.openDefinition` - Jump to slot/signal definition
- Creates tree view provider
- Initializes API docs manager

### `src/apiDocsManager.ts`
**Manages loading and accessing api-docs.yaml**

Classes:
- `ApiDocsManager` - Loads YAML, finds nodes by file path
- `ClassRef` - Parsed class reference (ClassName@path:line)

Functions:
- `parseClassRef(str)` - Parse "ClassName@path:line" syntax
- `reload()` - Reload YAML from disk
- `findNodeByFile(path)` - Find widget by file path

### `src/apiTreeProvider.ts`
**Implements VSCode tree view**

Classes:
- `ApiTreeItem` - Individual tree node
  - Types: widget, slot, signal, about, section, input_field
  - Icons and commands
- `ApiTreeProvider` - Tree data provider
  - `getChildren()` - Build tree hierarchy
  - `getTreeItem()` - Render individual items

Features:
- Parses YAML structure recursively
- Shows inherited members with `← ParentClass`
- Finds line numbers for non-inherited slots/signals
- Clickable items jump to definition

### `src/apiDocsGenerator.ts`
**Runs the Python script to generate API docs**

Class:
- `ApiDocsGenerator`

Functions:
- `hasGenDocs(uri)` - Check if HTML has window.genDocs
- `generate(uri)` - Run cute-get-api-tree

Workflow:
1. User right-clicks HTML file
2. Check for `window.genDocs` declaration
3. Run `cute-get-api-tree` from HTML file's directory
4. Show progress notification
5. Refresh tree view when complete

### `src/codeParser.ts`
**Parse JavaScript files to find line numbers**

Functions:
- `findMethodLineNumber(file, method)` - Find slot definition
- `findSignalLineNumber(file, signal)` - Find signal creation

Used when YAML doesn't have line info (non-inherited members).

## Data Flow

```
HTML File with window.genDocs
         ↓
    User clicks "Generate API Docs"
         ↓
    apiDocsGenerator.ts
         ↓
    Runs: cute-get-api-tree landing.html -r .. -o api-docs.yaml
         ↓
    YAML file created with ClassName@path:line format
         ↓
    apiDocsManager.ts loads YAML
         ↓
    apiTreeProvider.ts builds tree
         ↓
    Tree view displayed in sidebar
         ↓
    User clicks slot → extension.ts opens file at line
```

## Extension Points

### Commands

All commands are prefixed with `cutefront.`:

| Command | Description | When Available |
|---------|-------------|----------------|
| `showApiTree` | Focus tree view | Always |
| `refreshTree` | Reload YAML | In tree view |
| `generateApiDocs` | Run Python script | HTML files |
| `showInApiTree` | Find current file | JavaScript files |
| `openDefinition` | Jump to definition | Internal (tree items) |

### Configuration

Settings under `cutefront.*`:

- `apiDocsPath` - Path to YAML file
- `pythonPath` - Python executable
- `showInheritedMembers` - Show/hide inherited items

### Views

- `cutefrontApiTree` - Tree view in Explorer sidebar

### Menus

- Editor title bar (icon button)
- Explorer context menu (HTML files)
- View title (refresh/generate buttons)

## Key Algorithms

### Parsing Class References

```typescript
// Input: "LoginWidget@app/landing/login.js:5"
// Output: { className: "LoginWidget", file: "app/landing/login.js", line: 5 }
parseClassRef(classRef: string): ClassRef
```

### Finding Line Numbers

For slots/signals without inheritance info:

1. Get parent widget's file path
2. Read file line by line
3. Search for method/signal definition with regex
4. Return 1-indexed line number

### Tree Building

Recursive process:

1. Top level: All widget instances from YAML root
2. Widget level: About, Slots, Signals, Widgets, Components sections
3. Section level: Individual items with click handlers

## TypeScript Compilation

TypeScript → JavaScript compilation settings:

- **Target**: ES2020
- **Module**: CommonJS (required for VSCode extensions)
- **SourceMap**: Yes (for debugging)
- **Strict**: Yes (type safety)

## Dependencies

### Runtime

- `js-yaml` - Parse YAML files

### Development

- `@types/vscode` - VSCode API types
- `@types/node` - Node.js types
- `typescript` - Compiler
- `eslint` - Linting

## Future Enhancements

Potential features to add:

1. **Go-to-references** - Find all usages of a slot
2. **Hover tooltips** - Show slot info on hover in editor
3. **Auto-complete** - Suggest slots when typing `widget.`
4. **Diff view** - Compare API across commits
5. **Export** - Generate HTML/Markdown docs from YAML
6. **Search** - Find widgets/slots by name
7. **Filters** - Hide inherited members, show only signals, etc.

## Testing Strategy

Currently manual testing. Future:

1. Unit tests for parsers (codeParser.ts, apiDocsManager.ts)
2. Integration tests for tree building
3. E2E tests with sample YAML files

## Performance Considerations

- YAML loaded once at activation
- Tree built on-demand (collapsed by default)
- Line number lookups cached (TODO)
- File reads are synchronous (consider async for large files)

## Error Handling

- Missing YAML file → Empty tree + warning
- Python script failure → Error notification + output channel
- Invalid YAML → Caught and logged
- Missing files → Skip gracefully

## Debugging Tips

1. **Console logs**: `console.log()` in TypeScript code
2. **Output channel**: Check View → Output → CuteFront
3. **Developer tools**: Help → Toggle Developer Tools
4. **Breakpoints**: Set in `.ts` files, press F5
5. **Reload extension**: `Ctrl+R` in Extension Development Host
