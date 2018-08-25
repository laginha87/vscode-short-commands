import * as assert from "assert";
import { Palette } from "../palette";
import { CommandOption } from "../commands";
import * as sinon from "sinon";
// import {QuickPick} from 'vscode';


function nc(title: string, command = "vscode.Command") {
    return new CommandOption({ title, command });
}

function setUpPalette(): { view: any, command: any, palette: any } {

    let view = ["show", "onDidChangeValue", "onDidAccept", "dispose", "hide"].reduce((acc, method) => ({ ...acc, [method]: sinon.spy() }), {}),
        builder = sinon.stub().returns(view),
        command = new CommandOption({ title: "a", command: "command" }),
        palette = new Palette([command], builder);

    return { view, command, palette };
}


suite("Palette", function () {
    // Defines a Mocha unit test
    test("Palette constructor", () => {
        let { palette, command, view } = setUpPalette();

        assert.deepEqual(palette.items, [command]);
        assert(view.onDidChangeValue.calledWith(palette.filter));
        assert(view.onDidAccept.calledWith(palette.execute));
    });

    test("show", () => {
        let { view, palette } = setUpPalette();
        palette.show();

        assert(view.show.called);
    });

    test("execute", () => {
        let { palette, command, view } = setUpPalette();
        let vscodeExecuteCommand = sinon.spy();

        // HACK
        palette.activeCommand = () => command.command;

        palette.execute(null, vscodeExecuteCommand);
        assert(vscodeExecuteCommand.calledOnceWith(command.command));
        assert(view.dispose.calledOnce);
        assert(view.hide.calledOnce);
    });

    test("filter", () => {
        [{
            input:
                { commands: [], text: "" },
            output: []
        },
        {
            input:
            {
                commands: [
                    nc("Start Docker Container"),
                    nc("Start"),
                    nc("Down Docker Container")
                ], text: "sd"
            },
            output: [nc("Start Docker Container")]
        },
        ].forEach(({ input: { commands, text }, output }) => {
            let palette = new Palette(commands);
            palette.filter(text)
            assert.deepEqual(palette.view.items, output);
        });
    });


});
