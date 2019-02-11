//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';

suite("Extension Tests", function () {
    test("activatePalette", function () {
        return vscode.commands.executeCommand('short-commands.activatePalette').then((e) => {
            assert(e);
        });
    });

    test("package.json", function () {
        let extension = vscode.extensions.getExtension("laginha87.short-commands");
        if (extension === undefined) {
            return assert.fail("Could not find extension with id short-commands");
        }
        let { packageJSON: { activationEvents, contributes: { commands, configuration } } } = extension;
        assert.deepEqual(["onCommand:short-commands.activatePalette"], activationEvents);

        assert.deepEqual([{
            "command": "short-commands.activatePalette",
            "category": "Short Commands",
            "title": "Activate Palette"
        }], commands);

        assert.deepEqual({
            "type": "object",
            "title": "Short Commands Configuration",
            "properties": {
                "short-commands.includeWorkspaceTasks": {
                    "type": "boolean",
                    "default": false,
                    "description": "Include workspace tasks in the command suggestions."
                }
            }
        }, configuration);
    });
});