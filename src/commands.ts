import { Extension, QuickPickItem } from "vscode";
import * as vscode from "vscode";

interface I18nString {
  original: string;
  value: string;
}

interface Command {
  category?: string;
  command: string;
  title: string | I18nString;
}

export interface Config {
  includeExtensions: boolean;
  includeWorkspaceTasks: boolean;
}

export class CommandOption implements QuickPickItem {
  label: string;
  description?: string | undefined;
  detail?: string | undefined;
  picked?: boolean | undefined;
  command: Command;
  short: string;

  public constructor(command: Command) {
    this.command = command;
    const { category, title } = command;
    const realTitle: string = (<I18nString>title).value ? (<I18nString>title).value : <string>title;
    this.description = category ? `${category}: ${realTitle}` : realTitle;
    this.short = this.description
      .split(" ")
      .map((e: string) => e[0].toLowerCase())
      .join("")
      .replace(/\W/g, "");
    this.label = `[${this.short}]`;
  }
}

export class HistoryCommandOption extends CommandOption {
  public constructor(command: Command, public position = 0) {
    super(command);
  }

  public static fromCommand(command: CommandOption): HistoryCommandOption {
    return new this(command.command);
  }

  public static updatePositions(commands: HistoryCommandOption[]): HistoryCommandOption[] {
    return commands.map((command, position) => {
      let newCommand = new HistoryCommandOption(command.command, position);
      newCommand.label = `[${position}]`;
      return newCommand;
    });
  }
}

export function parseExtensionCommands(
  extensions: Extension<any>[]
): CommandOption[] {
  let options: CommandOption[] = [];
  extensions.forEach(ext => {
    let {
      packageJSON: { contributes: { commands } = { commands: [] } }
    } = ext;
    if (commands) {
      commands.forEach((c: Command) => {
        options.push(new CommandOption(c));
      });
    }
  });
  return options;
}

export function GetWorkspaceTasks(): CommandOption[] {
  let activeEditor = vscode.window.activeTextEditor

  if (!activeEditor) {
    return [];
  }
  const launch = vscode.workspace.getConfiguration("launch", activeEditor.document.uri);
  return launch.configurations.map((e : any) => {
    return new CommandOption({ title: e.name, category: "Debug",  command: "Launch Extension"});
  });
}

export function getCommands(config: Config,
  getExtensions = parseExtensionCommands,
  getWorkspaceTasks = GetWorkspaceTasks): CommandOption[] {
  let output: CommandOption[] = [];
  if (config.includeExtensions) {
    output = output.concat(getExtensions(vscode.extensions.all));
  }

  if (config.includeWorkspaceTasks) {
    output = output.concat(getWorkspaceTasks());
  }

  return output;
}
