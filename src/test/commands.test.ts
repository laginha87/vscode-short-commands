import * as assert from "assert";
import { Extension } from "vscode";
import { parseExtensionCommands, HistoryCommandOption } from "../commands";

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
            command: { command: "Command", title: "Title" },
            short: "t"
          }
        ]
      }
    ].forEach(({ input, output }, i) => {
      test(`test case ${i}`, () => { assert.deepEqual(parseExtensionCommands(input), output);});
    });
  });

  suite("HistoryCommand", function () {
    test("constructor()", function () {
      let command = new HistoryCommandOption({ command: "Command", title: "Title" });
      assert.equal(command.position, 0);
    });

    test("updatePositions()", function () {
      let command = { command: "Command", title: "Title" };
      let commands = [new HistoryCommandOption(command), new HistoryCommandOption(command), new HistoryCommandOption(command)];
      let newCommands = HistoryCommandOption.updatePositions(commands);
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
