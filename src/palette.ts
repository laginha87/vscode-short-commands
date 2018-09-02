import { CommandOption, HistoryCommandOption } from "./commands";
import { QuickPick } from "vscode";
import * as vscode from "vscode";

export class Palette {
  public view: QuickPick<CommandOption>;
  readonly history = new Array<HistoryCommandOption>();
  constructor(
    public items: CommandOption[],
    quickPickBuilder = vscode.window.createQuickPick
  ) {
    let view = quickPickBuilder<CommandOption>();
    view.onDidChangeValue(this.filter, this);
    view.onDidAccept(this.execute, this);
    // TODO: Figure out what to do if items is empty;
    if (items.length > 0) {
    let sample = items[Math.floor(Math.random() * items.length)];
    view.placeholder = `Example: type ${sample.short} to run ${
      sample.description
      }`;
    }

    this.view = view;
  }

  public show(): void {
    this.view.show();
    this.view.value = "";
    this.view.items = HistoryCommandOption.updatePositions(this.history);
  }

  public execute(
    _e: any,
    commandOption = this.activeCommand(),
    vscodeExecuteCommand = vscode.commands.executeCommand
  ): void {
    // TODO: Figure out what to do on callbacks.
    vscodeExecuteCommand(commandOption.command.command).then(() => {} , function onError(){});
    this.view.hide();
    let historyCommand = HistoryCommandOption.fromCommand(commandOption);
    this.appendToHistory(historyCommand);
  }

  public appendToHistory(historyCommand: HistoryCommandOption) {
    let olderIndex = this.history.findIndex(({command: {command}}) => command === historyCommand.command.command);

    if (olderIndex !== -1) {
      this.history.splice(olderIndex, 1);
    }
    this.history.unshift(historyCommand);
    if(this.history.length > 10) {
      this.history.pop();
    }
  }

  public filter(filterText: string): void {
    if (filterText.length === 0) {
      this.set(HistoryCommandOption.updatePositions(this.history));
    } else if (filterText.match(/^\d+$/)) {
      this.set(HistoryCommandOption.updatePositions(this.history));
    } else {
      this.set(this.items.filter(e => e.short.startsWith(filterText)));
    }
  }

  private set(items: CommandOption[]) {
    this.view.items = items;
  }

  public activeCommand() {
    return this.view.activeItems[0];
  }
}
