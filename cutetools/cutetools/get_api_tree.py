# grab_docs.py - Add Chrome args to bypass CORS
from playwright.sync_api import sync_playwright
import yaml
import sys
import re
import argparse
import os
from pathlib import Path


# Add custom representer BEFORE any yaml operations
def represent_str(dumper, data):
    if '\n' in data:
        # Use literal block style for multiline strings
        return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')
    return dumper.represent_scalar('tag:yaml.org,2002:str', data)

# Register the custom representer
yaml.add_representer(str, represent_str)

# Add a custom representer for the 'None' type
def represent_none(dumper, data):
    # This tells the dumper to represent the data as a scalar node with an empty string
    return dumper.represent_scalar('tag:yaml.org,2002:null', '')

# Register the custom representer for the None type
yaml.add_representer(type(None), represent_none)


def parse_gen_docs_declaration(html_content):
    """Find window.genDocs = ["alex", "bob", "billboard"] declaration"""

    pattern = r'window\.genDocs\s*=\s*\[(.*?)\]'
    match = re.search(pattern, html_content, re.DOTALL)

    if not match:
        return []

    # Extract widget names from the array
    array_content = match.group(1)
    widget_names = re.findall(r'["\']([^"\']+)["\']', array_content)

    print(f"🔍 Found genDocs declaration: {widget_names}", file=sys.stderr)
    return widget_names


def inject_doc_generation(html_in, html_out, widget_names):
    """Inject window.doc generation for specified widgets"""
    
    doc_entries = [f'"{name}": {name}.getAPITree()' for name in widget_names]
    """global_assignments = [f'    window.{name} = {name};' for name in widget_names]
        // Auto-generated from window.genDocs declaration
{chr(10).join(global_assignments)}
    """
    
    injection_code = f'''    
window.doc = {{
{',{}'.format(chr(10)).join(doc_entries)}
}};
    
console.log("📋 Generated docs for:", Object.keys(window.doc));
    '''
    
    # Inject before last </script>
    
    html_path_in = Path(html_in)
    html_path_out = Path(html_out)
    content = html_path_in.read_text()
    
    # Check if already injected
    if 'window.doc = {' in content:
        print("✅ window.doc generation already present", file=sys.stderr)
        return True

    last_script_tag_index = content.rfind('</script>')

    if last_script_tag_index != -1:
        new_content = (
            content[:last_script_tag_index] +
            injection_code +
            content[last_script_tag_index:]
        )
    else:
        # Handle the case where no </script> tag is found
        # You might append the content at the end of the file or handle it as an error.
        print("No </script> tag found.", file=sys.stderr)
        return False
    
    # Write back
    html_path_out.write_text(new_content)
    # print(f"✅ Injected docs generation for {len(widgets)} widgets")
    return True


def make_path_relative_to_cwd(file_path, search_root):
    """
    Convert a path that's relative to search_root to be relative to current working directory.

    :param file_path: Path relative to search_root
    :param search_root: The search root directory
    :return: Path relative to current working directory
    """
    # Get absolute path by joining search_root and file_path
    abs_path = Path(search_root) / file_path
    # Make it relative to current working directory
    try:
        return str(abs_path.relative_to(Path.cwd()))
    except ValueError:
        # If path is not relative to cwd, return absolute path
        return str(abs_path)


def find_class_file(class_name, search_root):
    """
    Find the .js file containing the class definition.
    Uses CuteFront naming convention: SomeWidget class -> some.js or somewidget.js
    Falls back to searching all .js files if naming convention doesn't match.

    :param class_name: Name of the class (e.g., "LoginWidget")
    :param search_root: Root directory to search from
    :return: Relative path to the file, or None if not found
    """
    search_path = Path(search_root)

    # Generate possible filenames based on naming convention
    # LoginWidget -> login.js, loginwidget.js
    # SomeWidget -> some.js, somewidget.js
    possible_names = []

    # Convert camelCase to lowercase, remove "Widget" suffix if present
    name_lower = class_name.lower()
    if name_lower.endswith('widget'):
        base_name = name_lower[:-6]  # Remove 'widget'
        possible_names.append(f"{base_name}.js")
        possible_names.append(f"{base_name}widget.js")
    possible_names.append(f"{name_lower}.js")

    # First pass: Try naming convention
    for js_file in search_path.rglob("*.js"):
        if js_file.name in possible_names:
            # Check if file actually contains the class definition
            try:
                content = js_file.read_text()
                # Look for "class ClassName" in the file
                if f"class {class_name}" in content:
                    # Return path relative to search_root
                    return str(js_file.relative_to(search_path))
            except Exception as e:
                print(f"⚠️ Error reading {js_file}: {e}", file=sys.stderr)
                continue

    # Second pass: If naming convention failed, search all .js files
    # This handles cases like AuthUserDataSourceWidget in datawidget.js
    print(f"🔍 Naming convention search failed for {class_name}, searching all .js files...", file=sys.stderr)
    for js_file in search_path.rglob("*.js"):
        try:
            content = js_file.read_text()
            if f"class {class_name}" in content:
                # Return path relative to search_root
                return str(js_file.relative_to(search_path))
        except Exception as e:
            # Silently skip files we can't read
            continue

    return None


def find_class_line_number(file_path, class_name):
    """
    Find the line number where a class is defined.

    :param file_path: Path to the .js file
    :param class_name: Name of the class to find
    :return: Line number (1-indexed) or None
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                # Match: class ClassName
                if re.search(rf'\bclass\s+{re.escape(class_name)}\b', line):
                    return line_num
    except Exception as e:
        print(f"⚠️ Error reading {file_path} for class line: {e}", file=sys.stderr)
    return None


def find_method_line_number(file_path, method_name):
    """
    Find the line number where a method/slot is defined.

    :param file_path: Path to the .js file
    :param method_name: Name of the method (e.g., 'clear_slot', 'createSignals')
    :return: Line number (1-indexed) or None
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                # Match: method_name( or method_name () or method_name  (
                # This catches: clear_slot() { or clear_slot(param) { or clear_slot (
                if re.search(rf'\b{re.escape(method_name)}\s*\(', line):
                    return line_num
    except Exception as e:
        print(f"⚠️ Error reading {file_path} for method line: {e}", file=sys.stderr)
    return None


def find_signal_assignment_line(file_path, signal_name):
    """
    Find the line number where a signal is assigned.

    :param file_path: Path to the .js file
    :param signal_name: Name of the signal (e.g., 'login')
    :return: Line number (1-indexed) or None

    Matches:
    - this.signals.login = new Signal(...)
    - this.signals.login = this.widgets.sub.signal
    - this.signals.login = someOtherSignal
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                # Match: this.signals.signal_name =
                if re.search(rf'this\.signals\.{re.escape(signal_name)}\s*=', line):
                    return line_num
    except Exception as e:
        print(f"⚠️ Error reading {file_path} for signal line: {e}", file=sys.stderr)
    return None


def parse_class_inheritance(file_path):
    """
    Parse a JS file to find class inheritance information.

    :param file_path: Path to the .js file
    :return: Dict with 'class_name', 'parent_class', 'parent_import_path' or None
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find: class SomeWidget extends ParentWidget
        class_match = re.search(r'class\s+(\w+)\s+extends\s+(\w+)', content)
        if not class_match:
            return None

        class_name = class_match.group(1)
        parent_class = class_match.group(2)

        # Find import for parent class
        # Match: import { ParentWidget } from '../../path/to/parent.js'
        import_pattern = rf'import\s*\{{[^}}]*\b{re.escape(parent_class)}\b[^}}]*\}}\s*from\s*[\'"](.+?)[\'"]'
        import_match = re.search(import_pattern, content)
        parent_import = import_match.group(1) if import_match else None

        return {
            'class_name': class_name,
            'parent_class': parent_class,
            'parent_import': parent_import
        }
    except Exception as e:
        print(f"⚠️ Error parsing inheritance from {file_path}: {e}", file=sys.stderr)
    return None


def resolve_relative_import(from_file, import_path, search_root):
    """
    Resolve a relative import path to an absolute path within search_root.

    :param from_file: The file containing the import (relative to search_root)
    :param import_path: The import path (e.g., '../../lib/base/widget.js')
    :param search_root: Root directory for resolution
    :return: Resolved path relative to search_root, or None
    """
    try:
        search_path = Path(search_root)
        from_path = search_path / from_file
        from_dir = from_path.parent

        # Resolve the relative import
        resolved = (from_dir / import_path).resolve()

        # Make it relative to search_root
        relative = resolved.relative_to(search_path.resolve())
        return str(relative)
    except Exception as e:
        print(f"⚠️ Error resolving import '{import_path}' from '{from_file}': {e}", file=sys.stderr)
    return None


def build_inheritance_chain(class_name, class_file, search_root):
    """
    Build the complete inheritance chain for a class.

    :param class_name: Name of the class (e.g., 'LoginWidget')
    :param class_file: File path of the class (relative to search_root)
    :param search_root: Root directory to search
    :return: List of (class_name, file_path) tuples from child to parent
    """
    chain = [(class_name, class_file)]
    current_file = class_file

    max_depth = 10  # Prevent infinite loops
    for _ in range(max_depth):
        full_path = Path(search_root) / current_file
        inheritance_info = parse_class_inheritance(full_path)

        if not inheritance_info or not inheritance_info['parent_class']:
            break

        parent_class = inheritance_info['parent_class']
        parent_import = inheritance_info['parent_import']

        if not parent_import:
            # Can't continue without import path
            break

        # Resolve the parent file path
        parent_file = resolve_relative_import(current_file, parent_import, search_root)
        if not parent_file:
            break

        chain.append((parent_class, parent_file))
        current_file = parent_file

        # Stop at Widget base class
        if parent_class == 'Widget':
            break

    return chain


def find_slot_defining_class(slot_name, inheritance_chain, search_root):
    """
    Find which class in the inheritance chain defines a slot.

    :param slot_name: Name of the slot (e.g., 'clear_slot')
    :param inheritance_chain: List of (class_name, file_path) tuples
    :param search_root: Root directory
    :return: (class_name, file_path, line_number) or None
    """
    for class_name, file_path in inheritance_chain:
        full_path = Path(search_root) / file_path
        line_num = find_method_line_number(full_path, slot_name)
        if line_num:
            return (class_name, file_path, line_num)
    return None


def enrich_with_inheritance_info(docs, search_root):
    """
    Recursively traverse the docs structure and enrich with inheritance information.

    Changes 'class' field from 'ClassName' to 'ClassName@path:line'
    Adds 'class: ParentClass@path:line' to slots/signals defined in parent classes.

    :param docs: The documentation dict from window.doc
    :param search_root: Root directory to search for .js files
    :return: Enriched docs dict with inheritance info added
    """
    if not isinstance(docs, dict):
        return docs

    for key, value in docs.items():
        if isinstance(value, dict):
            # Check if this is a widget definition (has 'class' property)
            if 'class' in value:
                class_name = value['class']
                file_path = find_class_file(class_name, search_root)

                if file_path:
                    full_path = Path(search_root) / file_path
                    class_line = find_class_line_number(full_path, class_name)

                    # Convert path to be relative to current working directory
                    cwd_relative_path = make_path_relative_to_cwd(file_path, search_root)

                    # Update class field with ClassName@path:line format
                    if class_line:
                        value['class'] = f"{class_name}@{cwd_relative_path}:{class_line}"
                        print(f"📁 {class_name} -> {cwd_relative_path}:{class_line}", file=sys.stderr)
                    else:
                        value['class'] = f"{class_name}@{cwd_relative_path}"
                        print(f"📁 {class_name} -> {cwd_relative_path} (line not found)", file=sys.stderr)

                    # Build inheritance chain for this class
                    inheritance_chain = build_inheritance_chain(class_name, file_path, search_root)
                    print(f"🔗 Inheritance chain for {class_name}: {' -> '.join([c for c, _ in inheritance_chain])}", file=sys.stderr)

                    # Process slots - find which class defines each slot
                    if 'slots' in value and isinstance(value['slots'], dict):
                        for slot_name, slot_info in value['slots'].items():
                            if slot_info is None:
                                continue
                            if not isinstance(slot_info, dict):
                                # Convert to dict if it's not already
                                value['slots'][slot_name] = {}
                                slot_info = value['slots'][slot_name]

                            # Find where this slot is actually defined
                            defining_info = find_slot_defining_class(slot_name, inheritance_chain, search_root)
                            if defining_info:
                                defining_class, defining_file, line_num = defining_info
                                # Only add 'class' field if defined in a parent class
                                if defining_class != class_name:
                                    # Convert path to be relative to cwd
                                    cwd_slot_path = make_path_relative_to_cwd(defining_file, search_root)
                                    slot_info['class'] = f"{defining_class}@{cwd_slot_path}:{line_num}"
                                    print(f"  🔌 {slot_name} inherited from {defining_class}@{cwd_slot_path}:{line_num}", file=sys.stderr)

                    # Process signals - try to find where they are created
                    if 'signals' in value and isinstance(value['signals'], dict):
                        for signal_name, signal_info in value['signals'].items():
                            if signal_info is None:
                                continue
                            if not isinstance(signal_info, dict):
                                value['signals'][signal_name] = {}
                                signal_info = value['signals'][signal_name]

                            # Look for signal assignment in inheritance chain
                            # Signals can be created with "new Signal" or linked to other signals
                            for idx, (check_class, check_file) in enumerate(inheritance_chain):
                                if idx == 0:
                                    # Skip the current class - assume signal is defined here unless we find it in parent
                                    continue
                                full_check_path = Path(search_root) / check_file
                                # Find the exact line where this signal is assigned
                                signal_line = find_signal_assignment_line(full_check_path, signal_name)
                                if signal_line:
                                    # Convert path to be relative to cwd
                                    cwd_signal_path = make_path_relative_to_cwd(check_file, search_root)
                                    signal_info['class'] = f"{check_class}@{cwd_signal_path}:{signal_line}"
                                    print(f"  📡 {signal_name} inherited from {check_class}@{cwd_signal_path}:{signal_line}", file=sys.stderr)
                                    break
                else:
                    print(f"⚠️ Could not find file for {class_name}", file=sys.stderr)

            # Recurse only into widgets and components (not slots/signals)
            # Slots and signals are leaf nodes that we've already processed above
            if 'widgets' in value:
                enrich_with_inheritance_info(value['widgets'], search_root)
            if 'components' in value:
                enrich_with_inheritance_info(value['components'], search_root)

    return docs


def grab_docs(html_file, output_file=None, search_root=None):
    with sync_playwright() as p:
        # Launch Chrome with CORS disabled
        browser = p.chromium.launch(
            headless=True,
            args=[
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--allow-file-access-from-files',
                '--disable-dev-shm-usage',
                '--no-sandbox'
            ]
        )

        context = browser.new_context()
        page = context.new_page()

        # Capture console messages
        page.on("console", lambda msg: print(f"🖥️ {msg.text}", file=sys.stderr))
        page.on("pageerror", lambda exc: print(f"🚨 {exc}", file=sys.stderr))
        
        try:
            print(f"🔄 Loading {html_file}...", file=sys.stderr)
            page.goto(f"{html_file}")

            # Wait for window.doc to be created
            print("⏳ Waiting for modules and window.doc...", file=sys.stderr)

            try:
                page.wait_for_function(
                    "() => window.doc && Object.keys(window.doc).length > 0",
                    timeout=15000
                )
                print("✅ window.doc detected!", file=sys.stderr)

                docs = page.evaluate("() => window.doc")
                #print(">>>", file=sys.stderr)
                #print(docs, file=sys.stderr)
                #print("<<<", file=sys.stderr)

                if docs:
                    print(f"✅ Found {len(docs)} objects: {list(docs.keys())}", file=sys.stderr)

                    # Enrich docs with inheritance info if search_root provided
                    if search_root:
                        print(f"🔍 Searching for class files and analyzing inheritance in: {search_root}", file=sys.stderr)
                        enrich_with_inheritance_info(docs, search_root)
                    else:
                        print(f"⚠️ No search root specified, skipping inheritance analysis", file=sys.stderr)

                    # Write to stdout or file depending on output_file parameter
                    output = sys.stdout if output_file is None else open(output_file, 'w')
                    try:
                        yaml.dump(docs, output,
                                default_flow_style=False,
                                indent=2,
                                sort_keys=False,
                                allow_unicode=True,
                                width=float('inf')  # Prevent line wrapping
                        )
                    finally:
                        if output_file is not None:
                            output.close()

                    if output_file:
                        print(f"✅ Saved to {output_file}", file=sys.stderr)
                    return True
                else:
                    print("❌ window.doc is empty", file=sys.stderr)
                    return False

            except Exception as timeout_error:
                print(f"⚠️ Timeout waiting for window.doc: {timeout_error}", file=sys.stderr)

                # Try to get what we can
                fallback = page.evaluate("""
                    () => ({
                        hasDoc: typeof window.doc !== 'undefined',
                        hasAlex: typeof window.alex !== 'undefined',
                        hasBob: typeof window.bob !== 'undefined',
                        errors: window.jsErrors || []
                    })
                """)
                print(f"Fallback status: {fallback}", file=sys.stderr)
                return False

        except Exception as e:
            print(f"❌ Error: {e}", file=sys.stderr)
            return False
        finally:
            browser.close()

def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Extract API documentation tree from HTML files with JavaScript widgets'
    )
    parser.add_argument(
        'html_file',
        help='Path to the HTML file to analyze'
    )
    parser.add_argument(
        '-o', '--output',
        default=None,
        help='Output YAML file path (default: stdout)'
    )
    parser.add_argument(
        '-r', '--root',
        default=None,
        help='Root directory to search for .js class files (enables file path enrichment)'
    )

    args = parser.parse_args()

    html_path = Path(args.html_file)
    if not html_path.exists():
        print(f"❌ File not found: {args.html_file}", file=sys.stderr)
        sys.exit(2)

    # Validate search root if provided
    search_root = None
    if args.root:
        search_root = Path(args.root)
        if not search_root.exists() or not search_root.is_dir():
            print(f"❌ Search root not found or not a directory: {args.root}", file=sys.stderr)
            sys.exit(2)

    # 1. Parse the HTML to find widget declarations
    print("🔍 Parsing HTML for widget declarations...", file=sys.stderr)
    content = html_path.read_text()
    widgets = parse_gen_docs_declaration(content)

    if not widgets:
        print("❌ No widget declarations found", file=sys.stderr)
        print("💡 Expected format: window.genDocs = [\"widget1\", \"widget2\"];", file=sys.stderr)
        sys.exit(2)

    print(f"✅ Found {len(widgets)} widget declarations", file=sys.stderr)

    fname = "./tmp.html"
    inject_doc_generation(args.html_file, fname, widgets)
    success = grab_docs(f"file://{Path(fname).absolute()}", args.output, search_root)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

