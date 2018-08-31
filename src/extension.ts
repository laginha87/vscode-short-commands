'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { parseExtensionCommands } from './commands';
import { Palette } from './palette';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const options = parseExtensionCommands(vscode.extensions.all);
    let palette = new Palette(options);

    let disposable = vscode.commands.registerCommand('short-commands.activatePalette', () => {
        palette.show();
        return true;
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}