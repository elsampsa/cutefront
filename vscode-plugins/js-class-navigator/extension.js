// extension.js
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function activate(context) {
    console.log('JS Class Navigator is now active');

    // Register definition provider for JavaScript AND HTML files
    const jsProvider = vscode.languages.registerDefinitionProvider(
        { scheme: 'file', language: 'javascript' },
        new JSClassDefinitionProvider()
    );
    
    const htmlProvider = vscode.languages.registerDefinitionProvider(
        { scheme: 'file', language: 'html' },
        new JSClassDefinitionProvider()
    );

    context.subscriptions.push(jsProvider, htmlProvider);
}

class JSClassDefinitionProvider {
    provideDefinition(document, position, token) {
        try {
            console.log('🔍 Clicked at position:', position.line, position.character);
            console.log('📄 Document language:', document.languageId);
            
            const line = document.lineAt(position);
            const lineText = line.text;
            console.log('📝 Line text:', lineText);

            // Check if we're on an import line
            const importMatch = lineText.match(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]/);
            if (!importMatch) return null;

            const importedNames = importMatch[1].split(',').map(s => s.trim());
            const filePath = importMatch[2];

            // Get the word at cursor position
            const wordRange = document.getWordRangeAtPosition(position);
            if (!wordRange) return null;
            
            const word = document.getText(wordRange);

            // Check if the word under cursor is one of the imported names
            if (!importedNames.includes(word)) return null;

            // Resolve the file path
            const currentDir = path.dirname(document.uri.fsPath);
            const targetPath = path.resolve(currentDir, filePath);

            // Check if file exists
            if (!fs.existsSync(targetPath)) {
                console.log(`File not found: ${targetPath}`);
                return null;
            }

            // Find the class definition in the target file
            return this.findClassInFile(targetPath, word);

        } catch (error) {
            console.error('Error in provideDefinition:', error);
            return null;
        }
    }

    findClassInFile(filePath, className) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // Look for class definition patterns:
                // class ClassName
                // export class ClassName
                const classPattern = new RegExp(`(export\\s+)?class\\s+${className}\\b`);
                
                if (classPattern.test(line)) {
                    const position = new vscode.Position(i, line.indexOf(className));
                    const location = new vscode.Location(
                        vscode.Uri.file(filePath),
                        position
                    );
                    return location;
                }
            }

            // If no class found, just go to the top of the file
            return new vscode.Location(
                vscode.Uri.file(filePath),
                new vscode.Position(0, 0)
            );

        } catch (error) {
            console.error('Error reading file:', error);
            return null;
        }
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
