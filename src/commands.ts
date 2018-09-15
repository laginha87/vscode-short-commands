import { Extension, QuickPickItem } from "vscode";
import * as vscode from "vscode";

interface I18nString {
  original: string;
  value: string;
}


export const COMMAND_OPTION = "COMMAND_OPTION";
export const DEBUG_COMMAND_OPTION = "DEBUG_COMMAND_OPTION";
export const HISTORY_COMMAND_OPTION = "HISTORY_COMMAND_OPTION";

export function newCommandOption(c: Command): CommandOption {
  const { category, title, command } = c;
  const realTitle: string = (<I18nString>title).value ? (<I18nString>title).value : <string>title;
  const description = category ? `${category}: ${realTitle}` : realTitle;
  const short = description
    .split(" ")
    .map((e: string) => e[0].toLowerCase())
    .join("")
    .replace(/\W/g, "");
  const label = `[${short}]`;
  return {
    type: COMMAND_OPTION,
    label,
    short,
    description,
    command
  };
}
interface Command {
  category?: string;
  command: string;
  title: string | I18nString;
}

export interface ShortCommand extends QuickPickItem {
  type: string;
  short: string;
}

export interface CommandOption extends ShortCommand {
  type: typeof COMMAND_OPTION;
  command: string;
}


export interface Config {
  includeExtensions: boolean;
  includeWorkspaceTasks: boolean;
}

export interface HistoryCommandOption extends ShortCommand {
  type: typeof HISTORY_COMMAND_OPTION;
  history: ShortCommand;
  position: number;
}

export function newHistoryCommandOption(command: ShortCommand, position = 0): HistoryCommandOption {
  return {
    type: HISTORY_COMMAND_OPTION,
    history: command,
    position,
    short: position.toString(),
    label: `[${position}]`,
    description: command.description
  };
}

export function updateHistoryPositions(commands: HistoryCommandOption[]): HistoryCommandOption[] {
  return commands.map(({ history }, position) => {
    return newHistoryCommandOption(history, position);
  });
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
        options.push(newCommandOption(c));
      });
    }
  });
  return options;
}

export function GetWorkspaceTasks(): CommandOption[] {
  let activeEditor = vscode.window.activeTextEditor;

  if (!activeEditor) {
    return [];
  }
  const launch = vscode.workspace.getConfiguration("launch", activeEditor.document.uri);
  return launch.configurations.map((e: any) => {
    return [];
    // return new CommandOption({ title: e.name, category: "Debug", command: "Launch Extension" });
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
