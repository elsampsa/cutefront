import * as vscode from 'vscode';
import { ApiTreeProvider } from './apiTreeProvider';
import { ApiDocsManager } from './apiDocsManager';
import { ApiDocsGenerator } from './apiDocsGenerator';

let apiTreeProvider: ApiTreeProvider;
let apiDocsManager: ApiDocsManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('CuteFront API Explorer is now active!');

    // Initialize managers
    apiDocsManager = new ApiDocsManager();
    apiTreeProvider = new ApiTreeProvider(apiDocsManager);

    // Register tree view
    const treeView = vscode.window.createTreeView('cutefrontApiTree', {
        treeDataProvider: apiTreeProvider,
        showCollapseAll: true
    });

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('cutefront.showApiTree', () => {
            vscode.window.showInformationMessage('CuteFront API Tree is now visible!');
            // Focus the tree view
            vscode.commands.executeCommand('cutefrontApiTree.focus');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('cutefront.refreshTree', async () => {
            await apiDocsManager.reload();
            apiTreeProvider.refresh();
            vscode.window.showInformationMessage('CuteFront API Tree refreshed!');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('cutefront.showInApiTree', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor');
                return;
            }

            const filePath = vscode.workspace.asRelativePath(editor.document.uri);
            const node = apiDocsManager.findNodeByFile(filePath);

            if (node) {
                vscode.window.showInformationMessage(`Found: ${node.label} in API tree`);
                // TODO: Reveal and select the node in tree view
                // treeView.reveal(node, { focus: true, select: true });
            } else {
                vscode.window.showWarningMessage(`File ${filePath} not found in API tree`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('cutefront.generateApiDocs', async (uri: vscode.Uri) => {
            const generator = new ApiDocsGenerator();

            let htmlFile: vscode.Uri | undefined = uri;

            // If no URI provided (e.g., clicked from toolbar), try current editor
            if (!htmlFile) {
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document.languageId === 'html') {
                    htmlFile = editor.document.uri;
                }
            }

            // Still no file? Ask user to select one
            if (!htmlFile) {
                const files = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    filters: {
                        'HTML Files': ['html']
                    },
                    title: 'Select HTML file with window.genDocs'
                });

                if (files && files.length > 0) {
                    htmlFile = files[0];
                }
            }

            if (htmlFile) {
                await generator.generate(htmlFile);
                // Refresh tree after generation
                await apiDocsManager.reload();
                apiTreeProvider.refresh();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('cutefront.openDefinition', (item: any) => {
            if (item.filePath && item.line) {
                const uri = vscode.Uri.file(item.filePath);
                vscode.window.showTextDocument(uri, {
                    selection: new vscode.Range(
                        new vscode.Position(item.line - 1, 0),
                        new vscode.Position(item.line - 1, 0)
                    )
                });
            }
        })
    );

    context.subscriptions.push(treeView);

    // Load API docs on activation
    apiDocsManager.reload().then(() => {
        apiTreeProvider.refresh();
    });
}

export function deactivate() {
    // Cleanup if needed
}
