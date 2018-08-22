import * as assert from "assert";
import { Extension } from "vscode";
import { parseExtensionCommands } from "../commands";

function NewExtension(packageJSON: any): Extension<any> {
  return {
    packageJSON,
    id: "1",
    extensionPath: "",
    isActive: true,
    exports: {},
    activate() {
      return new Promise(() => {});
    }
  };
}

suite("Commmands", function() {
  // Defines a Mocha unit test
  test("parseExtensionCommands", function() {
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
    ].forEach(({ input, output }) => {
      assert.deepEqual(parseExtensionCommands(input), output);
    });
    // assert.equal(-1, [1, 2, 3].indexOf(0));
  });
});
