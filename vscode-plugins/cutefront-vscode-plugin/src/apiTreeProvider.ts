import * as vscode from 'vscode';
import * as path from 'path';
import { ApiDocsManager, parseClassRef } from './apiDocsManager';
import { findMethodLineNumber, findSignalLineNumber } from './codeParser';

export class ApiTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: 'widget' | 'slot' | 'signal' | 'about' | 'section' | 'input_field',
        public readonly data?: any,
        public readonly filePath?: string,
        public readonly line?: number
    ) {
        super(label, collapsibleState);

        // Set icon based on type
        switch (type) {
            case 'widget':
                this.iconPath = new vscode.ThemeIcon('symbol-class');
                this.command = this.getOpenCommand();  // Make widgets clickable too!
                break;
            case 'slot':
                this.iconPath = new vscode.ThemeIcon('symbol-method');
                this.command = this.getOpenCommand();
                break;
            case 'signal':
                this.iconPath = new vscode.ThemeIcon('radio-tower');
                this.command = this.getOpenCommand();
                break;
            case 'section':
                this.iconPath = new vscode.ThemeIcon('folder');
                break;
            case 'about':
                this.iconPath = new vscode.ThemeIcon('info');
                break;
            case 'input_field':
                this.iconPath = new vscode.ThemeIcon('symbol-field');
                break;
        }

        // Set description for inherited members (slots/signals only, not widgets)
        if (data && data.class && (type === 'slot' || type === 'signal')) {
            const classRef = parseClassRef(data.class);
            this.description = `← ${classRef.className}`;
        }

        // Set tooltip
        if (type === 'widget' && filePath) {
            // For widgets, show file path in tooltip
            this.tooltip = `${filePath}${line ? ':' + line : ''}${data?.about ? '\n\n' + data.about : ''}`;
        } else if (data && data.about) {
            this.tooltip = data.about;
        }

        // Add context value for menu commands
        this.contextValue = type;
    }

    private getOpenCommand(): vscode.Command | undefined {
        if (this.filePath && this.line) {
            return {
                command: 'cutefront.openDefinition',
                title: 'Open Definition',
                arguments: [{ filePath: this.filePath, line: this.line }]
            };
        }
        return undefined;
    }
}

export class ApiTreeProvider implements vscode.TreeDataProvider<ApiTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ApiTreeItem | undefined | null | void> =
        new vscode.EventEmitter<ApiTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ApiTreeItem | undefined | null | void> =
        this._onDidChangeTreeData.event;

    constructor(private apiDocsManager: ApiDocsManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ApiTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ApiTreeItem): Promise<ApiTreeItem[]> {
        const docs = this.apiDocsManager.getDocs();
        if (!docs) {
            return [];
        }

        // Root level - show all top-level widgets
        if (!element) {
            return this.getTopLevelItems(docs);
        }

        // Expand widget details
        if (element.type === 'widget') {
            return this.getWidgetChildren(element.data);
        }

        // Expand sections (slots, signals, widgets, etc.)
        if (element.type === 'section') {
            // Need parent widget's file path to resolve non-inherited members
            const parentFilePath = element.filePath;
            return this.getSectionChildren(element.data, element.label, parentFilePath);
        }

        return [];
    }

    private getTopLevelItems(docs: any): ApiTreeItem[] {
        const items: ApiTreeItem[] = [];

        for (const [key, value] of Object.entries(docs)) {
            if (value && typeof value === 'object') {
                const classRef = parseClassRef((value as any).class || key);
                const label = `${key} [${classRef.className}]`;

                items.push(
                    new ApiTreeItem(
                        label,
                        vscode.TreeItemCollapsibleState.Collapsed,
                        'widget',
                        value,
                        this.resolveFilePath(classRef.file),
                        classRef.line
                    )
                );
            }
        }

        return items;
    }

    private getWidgetChildren(widgetData: any): ApiTreeItem[] {
        const items: ApiTreeItem[] = [];

        // Get widget's file path for resolving non-inherited members
        let widgetFilePath: string | undefined;
        if (widgetData.class) {
            const classRef = parseClassRef(widgetData.class);
            widgetFilePath = this.resolveFilePath(classRef.file);
        }

        // Add 'about' section if available
        if (widgetData.about) {
            items.push(
                new ApiTreeItem(
                    'About',
                    vscode.TreeItemCollapsibleState.None,
                    'about',
                    { about: widgetData.about }
                )
            );
        }

        // Add slots section
        if (widgetData.slots && Object.keys(widgetData.slots).length > 0) {
            items.push(
                new ApiTreeItem(
                    `Slots (${Object.keys(widgetData.slots).length})`,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'section',
                    widgetData.slots,
                    widgetFilePath  // Pass parent file path
                )
            );
        }

        // Add signals section
        if (widgetData.signals && Object.keys(widgetData.signals).length > 0) {
            items.push(
                new ApiTreeItem(
                    `Signals (${Object.keys(widgetData.signals).length})`,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'section',
                    widgetData.signals,
                    widgetFilePath  // Pass parent file path
                )
            );
        }

        // Add input_fields section
        if (widgetData.input_fields && Object.keys(widgetData.input_fields).length > 0) {
            items.push(
                new ApiTreeItem(
                    `Input Fields (${Object.keys(widgetData.input_fields).length})`,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'section',
                    widgetData.input_fields
                )
            );
        }

        // Add widgets (subwidgets) section
        if (widgetData.widgets && Object.keys(widgetData.widgets).length > 0) {
            items.push(
                new ApiTreeItem(
                    `Widgets (${Object.keys(widgetData.widgets).length})`,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'section',
                    widgetData.widgets
                )
            );
        }

        // Add components section
        if (widgetData.components && Object.keys(widgetData.components).length > 0) {
            items.push(
                new ApiTreeItem(
                    `Components (${Object.keys(widgetData.components).length})`,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    'section',
                    widgetData.components
                )
            );
        }

        return items;
    }

    private getSectionChildren(sectionData: any, sectionLabel: string, parentFilePath?: string): ApiTreeItem[] {
        const items: ApiTreeItem[] = [];

        // Determine section type from label
        let itemType: 'widget' | 'slot' | 'signal' | 'input_field' = 'slot';
        if (sectionLabel.startsWith('Signals')) {
            itemType = 'signal';
        } else if (sectionLabel.startsWith('Widgets') || sectionLabel.startsWith('Components')) {
            itemType = 'widget';
        } else if (sectionLabel.startsWith('Input Fields')) {
            itemType = 'input_field';
        }

        for (const [key, value] of Object.entries(sectionData)) {
            let filePath: string | undefined;
            let line: number | undefined;

            // For widgets/components, they have their own class field
            if (itemType === 'widget' && value && typeof value === 'object') {
                const classRef = parseClassRef((value as any).class || key);
                const label = `${key} [${classRef.className}]`;

                items.push(
                    new ApiTreeItem(
                        label,
                        vscode.TreeItemCollapsibleState.Collapsed,
                        'widget',
                        value,
                        this.resolveFilePath(classRef.file),
                        classRef.line
                    )
                );
            }
            // For slots/signals, check if they have inheritance info
            else if (value && typeof value === 'object' && (value as any).class) {
                const classRef = parseClassRef((value as any).class);
                filePath = this.resolveFilePath(classRef.file);
                line = classRef.line;

                items.push(
                    new ApiTreeItem(
                        key,
                        vscode.TreeItemCollapsibleState.None,
                        itemType,
                        value,
                        filePath,
                        line
                    )
                );
            }
            // Input fields or simple items
            else if (typeof value === 'string') {
                items.push(
                    new ApiTreeItem(
                        `${key}: ${value}`,
                        vscode.TreeItemCollapsibleState.None,
                        itemType
                    )
                );
            }
            // Slots/signals without inheritance info (defined in current class)
            else {
                // Try to find line number in parent widget's file
                if (parentFilePath && (itemType === 'slot' || itemType === 'signal')) {
                    if (itemType === 'slot') {
                        line = findMethodLineNumber(parentFilePath, key);
                    } else if (itemType === 'signal') {
                        line = findSignalLineNumber(parentFilePath, key);
                    }
                }

                items.push(
                    new ApiTreeItem(
                        key,
                        vscode.TreeItemCollapsibleState.None,
                        itemType,
                        value,
                        parentFilePath,
                        line
                    )
                );
            }
        }

        return items;
    }

    private resolveFilePath(relativePath?: string): string | undefined {
        if (!relativePath) {
            return undefined;
        }

        const yamlDir = this.apiDocsManager.getYamlDir();
        if (!yamlDir) {
            // Fall back to workspace root if YAML dir not available
            const workspaceRoot = this.apiDocsManager.getWorkspaceRoot();
            if (!workspaceRoot) {
                return undefined;
            }
            return path.join(workspaceRoot, relativePath);
        }

        // Paths in YAML are now relative to where the YAML file is (cwd when script was run)
        // So we resolve them relative to the YAML directory
        return path.resolve(yamlDir, relativePath);
    }
}
