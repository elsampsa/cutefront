#!/bin/bash

# CuteFront project initialization script
# This script creates the directory structure for a new CuteFront project

set -e  # Exit on error

REPO_BASE="https://raw.githubusercontent.com/elsampsa/cutefront/main"

echo "Creating CuteFront project structure..."

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

# Clone the cutefront-lib as git submodule
echo "Cloning CuteFront widget library..."
git init .
git submodule add https://github.com/elsampsa/cutefront-lib.git lib

# Create .vscode directory and download config files
echo "Setting up VSCode configuration..."
mkdir -p .vscode
curl -sSL "${REPO_BASE}/vscode-configs/launch.json" -o .vscode/launch.json
curl -sSL "${REPO_BASE}/vscode-configs/tasks.json" -o .vscode/tasks.json

# Create .claude directory structure and download command files
echo "Setting up Claude Code configuration..."
mkdir -p .claude/commands
curl -sSL "${REPO_BASE}/vscode-configs/cute-frontend.md" -o .claude/commands/cute-frontend.md

# Create placeholder for current-project.md
cat > .claude/commands/current-project.md << 'EOF'
---
description: Load project context
---
TODO: Describe your current project here.

This file should include:
- Overview of your app's purpose
- Key features and functionality
- Custom widgets you've created in app/lib/
- Any specific architectural decisions
- Backend integration details (if applicable)
EOF

echo ""
echo "CuteFront project structure created successfully!"
echo ""
echo "Next steps:"
echo "1. Set the current project as your workspace root folder in vscode"
echo "2. Edit .claude/commands/current-project.md to describe your project"
echo "3. Start building your widgets in app/lib/"
echo "4. Use VSCode debugger to test your HTML files"
echo "5. Use /cute-frontend command in Claude Code to get CuteFront context"
echo ""
