import * as assert from "assert";
import { Palette } from "../palette";
import { CommandOption } from "../commands";
import * as sinon from "sinon";

function nc(title: string, command = "vscode.Command") {
  return new CommandOption({ title, command });
}

function noop(..._args: any[]) {}

function setUpPalette(): {
  view: any;
  command: CommandOption;
  palette: Palette;
} {
  let view = [
      "show",
      "onDidChangeValue",
      "onDidAccept",
      "hide"
    ].reduce((acc, method) => ({ ...acc, [method]: sinon.spy() }), {}),
    builder = sinon.stub().returns(view),
    command = new CommandOption({ title: "a", command: "command" }),
    palette = new Palette([command], builder);

  return { view, command, palette };
}

suite("Palette", function() {
  // Defines a Mocha unit test
  test("Palette constructor", () => {
    let { palette, command, view } = setUpPalette();

    assert.deepEqual(palette.items, [command]);
    assert(view.onDidChangeValue.calledWith(palette.filter, palette));
    assert(view.onDidAccept.calledWith(palette.execute, palette));
  });

  test("show", () => {
    let { view, palette } = setUpPalette();
    palette.show();
    assert(view.show.called);
    assert.equal(view.value, "");
    assert.deepEqual(view.items, []);

    let test_command = nc("Title","command")
    palette.execute(null, test_command);
    assert.deepEqual(palette.view.items, []);
    palette.show();
    assert.deepEqual(palette.view.items, [test_command]);
  });

  test("execute", () => {
    let { palette, command, view } = setUpPalette();
    let vscodeExecuteCommand = sinon.spy();

    palette.execute(null, command, vscodeExecuteCommand);
    assert(vscodeExecuteCommand.calledOnceWith(command.command.command));

    assert(view.hide.calledOnce);
    assert.deepEqual(palette.history, [command]);
  });

  test("placehold", () => {
    let palette = new Palette([nc("Docker Compose Up")]);
    assert.equal(
      palette.view.placeholder,
      "Example: type dcu to run Docker Compose Up"
    );
  });

  test("filter", () => {
    type beforeCallback = (palette: Palette) => {};
    interface TestCase {
      input: { commands: CommandOption[]; text: string };
      output: CommandOption[];
      before?: beforeCallback;
    }

    (<TestCase[]>[
      {
        input: { commands: [nc("Start Stuff")], text: "" },
        output: []
      },
      {
        input: {
          commands: [
            nc("Start Docker Container"),
            nc("Start"),
            nc("Down Docker Container")
          ],
          text: "sd"
        },
        output: [nc("Start Docker Container")]
      },
      {
        input: {
          commands: [nc("Start Docker Container")],
          text: ""
        },

        output: [nc("Start Docker Container")],
        before(palette : Palette){
            palette.execute(null, nc("Start Docker Container"))
        }
      }
    ]).forEach(({ input: { commands, text }, output, before }) => {
      let palette = new Palette(commands);
      (<beforeCallback>(before || noop))(palette);
      palette.filter(text);
      assert.deepEqual(palette.view.items, output);
    });
  });
});
