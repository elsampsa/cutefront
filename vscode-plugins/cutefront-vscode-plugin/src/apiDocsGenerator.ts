import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Generates API documentation using the cute-get-api-tree Python script
 */
export class ApiDocsGenerator {
    /**
     * Check if an HTML file contains window.genDocs declaration
     */
    async hasGenDocs(htmlFile: vscode.Uri): Promise<boolean> {
        try {
            const content = fs.readFileSync(htmlFile.fsPath, 'utf8');
            return /window\.genDocs\s*=\s*\[/.test(content);
        } catch (error) {
            console.error('Error reading HTML file:', error);
            return false;
        }
    }

    /**
     * Generate API documentation from an HTML file
     */
    async generate(htmlFile: vscode.Uri): Promise<void> {
        // Check if file has genDocs
        const hasGenDocs = await this.hasGenDocs(htmlFile);
        if (!hasGenDocs) {
            vscode.window.showWarningMessage(
                'This HTML file does not contain window.genDocs declaration'
            );
            return;
        }

        const config = vscode.workspace.getConfiguration('cutefront');
        const pythonPath = config.get<string>('pythonPath', 'python3');

        // Get directory of HTML file (script must run from there)
        const htmlDir = path.dirname(htmlFile.fsPath);
        const htmlFileName = path.basename(htmlFile.fsPath);

        // Determine search root (parent directory of HTML file's directory)
        const searchRoot = path.dirname(htmlDir);

        // Output file path
        const outputFile = path.join(htmlDir, 'api-docs.yaml');

        // Show progress
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'Generating CuteFront API Documentation',
                cancellable: false
            },
            async (progress) => {
                progress.report({ message: 'Running cute-get-api-tree...' });

                try {
                    // Run the script from the HTML file's directory
                    const command = `cute-get-api-tree "${htmlFileName}" -r .. -o api-docs.yaml`;

                    console.log('Running command:', command);
                    console.log('Working directory:', htmlDir);

                    const { stdout, stderr } = await execAsync(command, {
                        cwd: htmlDir,
                        env: { ...process.env }
                    });

                    // Log output
                    if (stdout) {
                        console.log('stdout:', stdout);
                    }
                    if (stderr) {
                        console.log('stderr:', stderr);
                    }

                    // Check if output file was created
                    if (fs.existsSync(outputFile)) {
                        vscode.window.showInformationMessage(
                            `API documentation generated: ${path.relative(
                                vscode.workspace.workspaceFolders![0].uri.fsPath,
                                outputFile
                            )}`
                        );

                        // Store the path so reload can find it
                        (global as any).lastGeneratedApiDocsPath = outputFile;

                        // Ask if user wants to open the file
                        const openFile = await vscode.window.showQuickPick(['Yes', 'No'], {
                            placeHolder: 'Open api-docs.yaml?'
                        });

                        if (openFile === 'Yes') {
                            const doc = await vscode.workspace.openTextDocument(outputFile);
                            await vscode.window.showTextDocument(doc);
                        }
                    } else {
                        vscode.window.showErrorMessage(
                            'API documentation generation failed - output file not created'
                        );
                    }
                } catch (error: any) {
                    console.error('Error running cute-get-api-tree:', error);

                    // Show detailed error message
                    const message =
                        error.message || 'Unknown error occurred while generating API docs';
                    vscode.window.showErrorMessage(
                        `Failed to generate API docs: ${message}`
                    );

                    // Show output channel with full error
                    const outputChannel = vscode.window.createOutputChannel('CuteFront');
                    outputChannel.appendLine('Error generating API documentation:');
                    outputChannel.appendLine(error.toString());
                    if (error.stdout) {
                        outputChannel.appendLine('\nStdout:');
                        outputChannel.appendLine(error.stdout);
                    }
                    if (error.stderr) {
                        outputChannel.appendLine('\nStderr:');
                        outputChannel.appendLine(error.stderr);
                    }
                    outputChannel.show();
                }
            }
        );
    }
}
