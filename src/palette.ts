import { CommandOption } from "./commands";
import { QuickPick } from "vscode";
import * as vscode from "vscode";

export class Palette {
    public view: QuickPick<CommandOption>;

    constructor(public items: CommandOption[], quickPickBuilder = vscode.window.createQuickPick) {
        this.view = quickPickBuilder();
        this.view.onDidChangeValue(this.filter);
        this.view.onDidAccept(this.execute);
    }

    public show(): void {
        this.view.show();
    }

    public execute(e : any, vscodeExecuteCommand = vscode.commands.executeCommand): void{
        vscodeExecuteCommand(this.activeCommand());
        this.view.hide();
        this.view.dispose();
    }

    public filter(filterText: string): void {
        if (filterText.length === 0) {
            this.set([]);
        } else {
            this.set(this.items.filter((e) => e.short.startsWith(filterText)));
        }
    }

    private set(items : CommandOption[]) {
        this.view.items = items;
    }

    private activeCommand(){
        return this.view.activeItems[0].command.command;
    }
}