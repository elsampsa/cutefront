#!/bin/bash

# CuteFront project initialization script
# This script creates the directory structure for a new CuteFront project
#
# Usage:
#   bash <(curl -sSL https://raw.githubusercontent.com/elsampsa/cutefront/main/new_project.bash) [TARGET_DIR]
#
# TARGET_DIR is created if it doesn't exist (default: current directory).
# It must be empty (or non-existent), so that we never scatter files into an existing directory.

set -e  # Exit on error

REPO_BASE="https://raw.githubusercontent.com/elsampsa/cutefront/main"

TARGET="${1:-.}"

for cmd in git curl; do
    if ! command -v "$cmd" > /dev/null; then
        echo "ERROR: '$cmd' is required but not installed" >&2
        exit 1
    fi
done

if [ -e "$TARGET" ] && [ ! -d "$TARGET" ]; then
    echo "ERROR: '$TARGET' exists and is not a directory" >&2
    exit 1
fi

if [ -d "$TARGET" ] && [ -n "$(ls -A "$TARGET")" ]; then
    echo "ERROR: directory '$TARGET' is not empty, refusing to create a project there" >&2
    exit 1
fi

mkdir -p "$TARGET"
cd "$TARGET"
TARGET_ABS="$(pwd)"

echo "Creating CuteFront project structure into ${TARGET_ABS} ..."

# Create app directory structure
mkdir -p app/lib
mkdir -p app/static

# Create a simple landing.html
cat > app/landing.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My CuteFront App</title>
    <link rel="stylesheet" href="../lib/bootstrap/css/bootstrap.min.css">
</head>
<body>
    <div class="container mt-5">
        <h1>Welcome to CuteFront!</h1>
        <p>Your app is ready to go. Start building your widgets in app/lib/</p>
    </div>
    <script src="../lib/bootstrap/js/bootstrap.bundle.min.js"></script>
</body>
</html>
EOF

# Clone cutefront-lib
echo "Cloning CuteFront widget library..."
git clone https://github.com/elsampsa/cutefront-lib.git ./lib
# remove git stuff:
rm -rf lib/.git

# Create .vscode directory and download config files
echo "Setting up VSCode configuration..."
mkdir -p .vscode
curl -fsSL "${REPO_BASE}/vscode-configs/launch.json" -o .vscode/launch.json
curl -fsSL "${REPO_BASE}/vscode-configs/tasks.json" -o .vscode/tasks.json

# Create .claude directory structure and download command files
echo "Setting up Claude Code configuration..."
mkdir -p .claude/commands
curl -fsSL "${REPO_BASE}/vscode-configs/cute-frontend.md" -o .claude/commands/cute-frontend.md
curl -fsSL "${REPO_BASE}/vscode-configs/cute-example.md" -o .claude/commands/cute-example.md
curl -fsSL "${REPO_BASE}/vscode-configs/cute-project-init.md" -o .claude/commands/cute-project-init.md

# Create .claude/settings.json with CuteFront permissions
cat > .claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": [
      "mcp__browser__*"
    ]
  }
}
EOF

# Create placeholder for current-project.md
cat > .claude/commands/current-project.md << 'EOF'
---
description: Load project context
---
Let's do a project using "CuteFront" the no-framework JS frontend framework.

Please read first file "cute-frontend.md" from this very same directory.

TODO: this is a placeholder for more details on your project
EOF

echo ""
echo "CuteFront project structure created successfully into ${TARGET_ABS}"
echo ""
echo "Next steps:"
echo "1. Open ${TARGET_ABS} as your workspace root folder in VSCode"
echo "   and/or start Claude Code there: cd ${TARGET_ABS} && claude"
echo "2. Use the /cute-frontend command in Claude Code to get CuteFront context"
echo "3. Start building your widgets in app/lib/"
echo "4. Use the VSCode debugger to test your HTML files"
echo "5. Optionally, edit .claude/commands/current-project.md to describe your project"
echo ""
