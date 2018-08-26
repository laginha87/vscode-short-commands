import { CommandOption } from "./commands";
import { QuickPick } from "vscode";
import * as vscode from "vscode";

export class Palette {
    public view: QuickPick<CommandOption>;

    constructor(public items: CommandOption[], quickPickBuilder = vscode.window.createQuickPick) {
        let view = quickPickBuilder<CommandOption>();
        view.onDidChangeValue(this.filter, this);
        view.onDidAccept(this.execute, this);
        // TODO: Figure out what to do if items is empty;
        let sample = items[Math.floor(Math.random() * items.length)];
        view.placeholder = `Example: type ${sample.short} to run ${sample.description}`;

        this.view = view;
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