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
    test("activatePalette", async function () {
        let promise = vscode.commands.executeCommand('short-commands.activatePalette');
        let res = await promise;
        assert(res);
    });

    test("package.json", function () {
        let extension = vscode.extensions.getExtension("laginha87.short-commands");
        if (extension === undefined) {
            return assert.fail("Could not find extension with id short-commands");
        }
        let { packageJSON: { activationEvents, contributes: { commands } } } = extension;
        assert.deepEqual(["onCommand:short-commands.activatePalette"], activationEvents);

        assert.deepEqual([{
            "command": "short-commands.activatePalette",
            "category": "Short Commands",
            "title": "Activate Palette"
        }], commands);

    });
});