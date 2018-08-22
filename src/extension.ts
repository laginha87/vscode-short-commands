'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {CommandOption, parseExtensionCommands} from './commands';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const options = parseExtensionCommands(vscode.extensions.all)


    let disposable = vscode.commands.registerCommand('short-commands.activatePalette', () => {
        let list = vscode.window.createQuickPick<CommandOption>();
        list.placeholder = "Hello  type some stuff";
        list.onDidChangeValue((ee) => {
            if (ee.length === 0) {
                list.items = [];
            } else {
                list.items = options.filter((e) => e.short.startsWith(ee))
            }
        });
        list.onDidAccept(() => {
            vscode.commands.executeCommand(list.activeItems[0].command.command)
            list.hide();
            list.dispose();
        })
        list.show();

    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}