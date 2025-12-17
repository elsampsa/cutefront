# CuteTools

A collection of utilities for working with JavaScript widget documentation.

## Installation

Install in development mode:

```bash
pip install -e .
```

After installation, make sure to install Playwright browsers:

```bash
playwright install chromium
```

## Tools

### cute-get-api-tree

Extracts API documentation tree from HTML files containing JavaScript widgets.

**Usage:**

```bash
cute-get-api-tree <html_file> [-o OUTPUT]
```

**Arguments:**
- `html_file`: Path to the HTML file to analyze
- `-o, --output`: Output YAML file path (default: api-docs.yaml)

**Example:**

```bash
cute-get-api-tree index.html -o my-api-docs.yaml
```

The tool looks for a `window.genDocs` declaration in your HTML file:

```javascript
window.genDocs = ["widget1", "widget2", "widget3"];
```

It then automatically injects code to extract the API tree from each widget's `getAPITree()` method and saves it to a YAML file.

## Requirements

- Python 3.8+
- Playwright
- PyYAML

## Development

More tools will be added to this package in the future.
