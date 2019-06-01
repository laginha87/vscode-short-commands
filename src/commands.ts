import { Extension, QuickPickItem } from "vscode";
import * as vscode from "vscode";

interface I18nString {
  original: string;
  value: string;
}


export const COMMAND_OPTION = "COMMAND_OPTION";
export const DEBUG_COMMAND_OPTION = "DEBUG_COMMAND_OPTION";
export const HISTORY_COMMAND_OPTION = "HISTORY_COMMAND_OPTION";

function initials(text: string) {
  return text.split(" ")
    .map((e: string) => e[0] && e[0].toLowerCase())
    .join("")
    .replace(/\W/g, "");
}

export function newCommandOption(c: Command): CommandOption {
  const { category, title, command } = c;
  const realTitle: string = (<I18nString>title).value ? (<I18nString>title).value : <string>title;
  const description = category ? `${category}: ${realTitle}` : realTitle;
  const short = initials(description);
  const label = `[${short}]`;
  return {
    type: COMMAND_OPTION,
    label,
    description,
    command,
    short
  };
}
interface Command {
  category?: string;
  command: string;
  title: string | I18nString;
}

export type ShortCommand = CommandOption | HistoryCommandOption | DebugCommandOption;

export interface CommandOption extends QuickPickItem {
  type: typeof COMMAND_OPTION;
  command: string;
  short: string;
}


export interface Config {
  includeExtensions: boolean;
  includeWorkspaceTasks: boolean;
}

export interface HistoryCommandOption extends QuickPickItem {
  type: typeof HISTORY_COMMAND_OPTION;
  history: ShortCommand;
  position: number;
  short: string;
}

export function newHistoryCommandOption(command: ShortCommand, position = 0): HistoryCommandOption {
  return {
    type: HISTORY_COMMAND_OPTION,
    history: command,
    position,
    label: `[${position}]`,
    description: command.description,
    short: `${position}`
  };
}

export function updateHistoryPositions(commands: HistoryCommandOption[]): HistoryCommandOption[] {
  return commands.map(({ history }, position) => {
    return newHistoryCommandOption(history, position);
  });
}


export interface DebugCommandOption extends QuickPickItem {
  type: typeof DEBUG_COMMAND_OPTION;
  task: vscode.Task;
  short: string;
}

export function newDebugCommandOption(task: vscode.Task): DebugCommandOption {
  const description = `Debug: ${task.name}`;
  const short = initials(description);
  return {
    type: DEBUG_COMMAND_OPTION,
    task,
    label: `[${short}]`,
    description,
    short
  };
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
  let launch;
  if (!activeEditor) {
    launch = vscode.workspace.getConfiguration("launch");
  } else {
    launch = vscode.workspace.getConfiguration("launch", activeEditor.document.uri);
  }
  return launch.configurations.map(newDebugCommandOption);
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
