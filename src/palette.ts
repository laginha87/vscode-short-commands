import { CommandOption, HistoryCommandOption, updateHistoryPositions, ShortCommand, COMMAND_OPTION, newHistoryCommandOption, HISTORY_COMMAND_OPTION, DEBUG_COMMAND_OPTION } from "./commands";
import { QuickPick } from "vscode";
import * as vscode from "vscode";
import deepEqual = require("deep-equal");

export class Palette {
  public view: QuickPick<ShortCommand>;
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
    this.view.items = updateHistoryPositions(this.history);
  }

  public execute(
    _e: any,
    commandOption = this.activeCommand(),
    vscodeExecuteCommand = vscode.commands.executeCommand
  ): void {
    let saveInHistory = true;
    // TODO: Figure out what to do on callbacks.
    switch (commandOption.type) {
      case COMMAND_OPTION:
        vscodeExecuteCommand((commandOption).command).then(() => { }, function onError() { });
        break;
      case HISTORY_COMMAND_OPTION:
        this.execute(undefined, (commandOption).history);
        saveInHistory = false;
        break;
      case DEBUG_COMMAND_OPTION:
        vscode.tasks.executeTask(commandOption.task);
        break;
      default:
        break;
    }

    this.view.hide();
    if(saveInHistory){
      this.appendToHistory(newHistoryCommandOption(commandOption));
    }
  }

  public appendToHistory(historyCommand: HistoryCommandOption) {
    let olderIndex = this.history.findIndex(({ history }) => deepEqual(history, historyCommand.history));

    if (olderIndex !== -1) {
      this.history.splice(olderIndex, 1);
    }
    this.history.unshift(historyCommand);
    if (this.history.length > 10) {
      this.history.pop();
    }
  }

  public filter(filterText: string): void {
    const isEmpty=filterText.length === 0;
    const isNumber=filterText.match(/^\d+$/);
    if (isEmpty || isNumber ) {
      this.set(updateHistoryPositions(this.history));
    } else {
      this.set(this.items.filter(e => e.short.startsWith(filterText)));
    }
  }

  private set(items: ShortCommand[]) {
    this.view.items = items;
  }

  public activeCommand() {
    return this.view.activeItems[0];
  }
}
