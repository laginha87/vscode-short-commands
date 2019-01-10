import * as assert from 'assert';
import sinon = require('sinon');
import { Extension } from 'vscode';

import {
  CommandOption,
  Config,
  getCommands,
  newCommandOption,
  newHistoryCommandOption,
  parseExtensionCommands,
  updateHistoryPositions,
  COMMAND_OPTION,
} from '../commands';

function NewExtension(packageJSON: any): Extension<any> {
  return {
    packageJSON,
    id: "1",
    extensionPath: "",
    isActive: true,
    exports: {},
    activate() {
      return new Promise(() => { });
    }
  };
}

suite("Commands", function () {
  suite("parseExtensionCommands()", function () {
    [
      {
        input: [],
        output: []
      },
      {
        input: [NewExtension({})],
        output: []
      },
      {
        input: [NewExtension({ contributes: [] })],
        output: []
      },
      {
        input: [
          NewExtension({
            contributes: { commands: [{ title: "Title", command: "Command" }] }
          })
        ],
        output: [
          {
            label: "[t]",
            description: "Title",
            command: "Command",
            type: COMMAND_OPTION,
            short: "t"
          }
        ]
      },
      {
        input: [
          NewExtension({
            contributes: { commands: [{ title: { original: "Title", value: "Itle" }, command: "Command" }] }
          })
        ],
        output: [
          {
            label: "[i]",
            description: "Itle",
            command: "Command",
            short: "i",
            type: COMMAND_OPTION
          }
        ]
      }
    ].forEach(({ input, output }, i) => {
      test(`test case ${i}`, () => { assert.deepEqual(parseExtensionCommands(input), output); });
    });
  });

  suite("getCommands()", function () {
    let extensionCommand = newCommandOption({ command: "extensionCommand", title: "extensionCommand" }),
      workspaceTask = newCommandOption({ command: "workspaceTask", title: "workspaceTask" });

    interface TestCase {
      input: Config;
      output: CommandOption[];
    }
    let testCases: TestCase[] = [{
      input: {
        includeExtensions: true,
        includeWorkspaceTasks: false
      },
      output: [extensionCommand]
    },
    {
      input: {
        includeExtensions: false,
        includeWorkspaceTasks: true,
      },
      output: [workspaceTask]
    }];

    testCases.forEach((t, i) => {
      test(`test case ${i}`, () => {
        let getExtensions = sinon.mock().returns([extensionCommand]),
          getWorkspaceTasks = sinon.mock().returns([workspaceTask]),
          expected = getCommands(t.input, getExtensions, getWorkspaceTasks);

        assert.deepEqual(t.output, expected);
      });
    });

  });

  suite("HistoryCommand", function () {
    test("constructor()", function () {
      let command = newHistoryCommandOption(newCommandOption({ command: "Command", title: "Title" }));
      assert.equal(command.position, 0);
    });

    test("updatePositions()", function () {
      let command = newCommandOption({ command: "Command", title: "Title" });
      let commands = [newHistoryCommandOption(command), newHistoryCommandOption(command), newHistoryCommandOption(command)];
      let newCommands = updateHistoryPositions(commands);
      assert(commands.every((e) => e.position === 0));

      assert.equal(0, newCommands[0].position);
      assert.equal(1, newCommands[1].position);
      assert.equal(2, newCommands[2].position);
      assert.equal("[0]", newCommands[0].label);
      assert.equal("[1]", newCommands[1].label);
      assert.equal("[2]", newCommands[2].label);
    });
  });
});
