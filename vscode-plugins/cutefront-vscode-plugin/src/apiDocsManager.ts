import * as vscode from 'vscode';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Parsed class reference in format: ClassName@path:line
 */
export interface ClassRef {
    className: string;
    file?: string;
    line?: number;
}

/**
 * Parses a class reference string like "LoginWidget@app/landing/login.js:5"
 */
export function parseClassRef(classRef: string): ClassRef {
    const match = classRef.match(/^(\w+)(?:@(.+?):(\d+))?$/);
    if (!match) {
        return { className: classRef };
    }

    return {
        className: match[1],
        file: match[2],
        line: match[3] ? parseInt(match[3], 10) : undefined
    };
}

/**
 * Manages loading and accessing the api-docs.yaml file
 */
export class ApiDocsManager {
    private docs: any = null;
    private workspaceRoot: string | undefined;
    private yamlDir: string | undefined;  // Directory containing the YAML file

    constructor() {
        if (vscode.workspace.workspaceFolders) {
            this.workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
    }

    /**
     * Reload the API documentation from YAML file
     * Simple strategy: Look in the same directory as the active HTML file
     */
    async reload(): Promise<void> {
        if (!this.workspaceRoot) {
            console.error('No workspace root found');
            return;
        }

        let yamlPath: string | undefined;

        // 1. Use the last generated path if available
        if ((global as any).lastGeneratedApiDocsPath) {
            yamlPath = (global as any).lastGeneratedApiDocsPath;
            console.log('Using last generated API docs:', yamlPath);
        }

        // 2. Look next to the active HTML file
        if (!yamlPath) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'html') {
                const htmlDir = path.dirname(editor.document.uri.fsPath);
                const candidatePath = path.join(htmlDir, 'api-docs.yaml');
                if (fs.existsSync(candidatePath)) {
                    yamlPath = candidatePath;
                    console.log('Found API docs next to HTML file:', yamlPath);
                }
            }
        }

        // 3. Fall back to workspace root
        if (!yamlPath) {
            yamlPath = path.join(this.workspaceRoot, 'api-docs.yaml');
        }

        try {
            if (fs.existsSync(yamlPath)) {
                const content = fs.readFileSync(yamlPath, 'utf8');
                this.docs = yaml.load(content);
                this.yamlDir = path.dirname(yamlPath);  // Store YAML directory for path resolution
                console.log('✅ Loaded API docs from:', yamlPath);
                console.log('📁 YAML directory:', this.yamlDir);
            } else {
                console.warn('⚠️ API docs file not found:', yamlPath);
                console.warn('💡 Tip: Open an HTML file with window.genDocs and click "Generate API Documentation"');
                this.docs = null;
                this.yamlDir = undefined;
            }
        } catch (error) {
            console.error('Error loading API docs:', error);
            this.docs = null;
            this.yamlDir = undefined;
        }
    }

    /**
     * Get the full API documentation object
     */
    getDocs(): any {
        return this.docs;
    }

    /**
     * Find a widget/node by its file path
     */
    findNodeByFile(filePath: string): any {
        if (!this.docs) {
            return null;
        }

        // Recursively search for a node with matching file
        const searchNode = (node: any, key: string): any => {
            if (node && typeof node === 'object') {
                // Check if this node has a class field with file info
                if (node.class) {
                    const classRef = parseClassRef(node.class);
                    if (classRef.file === filePath) {
                        return { ...node, label: key };
                    }
                }

                // Search in widgets and components
                if (node.widgets) {
                    for (const [widgetKey, widgetValue] of Object.entries(node.widgets)) {
                        const result = searchNode(widgetValue, widgetKey);
                        if (result) {
                            return result;
                        }
                    }
                }

                if (node.components) {
                    for (const [compKey, compValue] of Object.entries(node.components)) {
                        const result = searchNode(compValue, compKey);
                        if (result) {
                            return result;
                        }
                    }
                }
            }
            return null;
        };

        // Search through top-level objects
        for (const [key, value] of Object.entries(this.docs)) {
            const result = searchNode(value, key);
            if (result) {
                return result;
            }
        }

        return null;
    }

    /**
     * Get workspace root path
     */
    getWorkspaceRoot(): string | undefined {
        return this.workspaceRoot;
    }

    /**
     * Get YAML directory (where api-docs.yaml is located)
     * This is used as the base for resolving relative file paths
     */
    getYamlDir(): string | undefined {
        return this.yamlDir;
    }
}
