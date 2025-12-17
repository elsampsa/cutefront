import * as fs from 'fs';

/**
 * Utility functions for parsing JavaScript/TypeScript code
 */

/**
 * Find the line number where a method is defined in a file
 * @param filePath Absolute path to the file
 * @param methodName Name of the method to find (e.g., 'clear_slot')
 * @returns Line number (1-indexed) or undefined if not found
 */
export function findMethodLineNumber(filePath: string, methodName: string): number | undefined {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Match: methodName( or methodName () or methodName  (
            // This catches: clear_slot() { or clear_slot(param) { or clear_slot (
            const regex = new RegExp(`\\b${escapeRegex(methodName)}\\s*\\(`);
            if (regex.test(line)) {
                return i + 1; // Return 1-indexed line number
            }
        }
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
    }

    return undefined;
}

/**
 * Find the line number where a signal is created/assigned in createSignals() method
 * @param filePath Absolute path to the file
 * @param signalName Name of the signal (e.g., 'login')
 * @returns Line number (1-indexed) or undefined if not found
 */
export function findSignalLineNumber(filePath: string, signalName: string): number | undefined {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        // Look for: this.signals.signalName = ...
        // This catches:
        // - this.signals.login = new Signal(...)
        // - this.signals.login = this.widgets.sub.signal
        // - this.signals.login = someOtherSignal
        const signalRegex = new RegExp(
            `this\\.signals\\.${escapeRegex(signalName)}\\s*=`
        );

        for (let i = 0; i < lines.length; i++) {
            if (signalRegex.test(lines[i])) {
                return i + 1;
            }
        }
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
    }

    return undefined;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
