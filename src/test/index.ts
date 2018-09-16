//
// PLEASE DO NOT MODIFY / DELETE UNLESS YOU KNOW WHAT YOU ARE DOING
//
// This file is providing the test runner to use when running extension tests.
// By default the test runner in use is Mocha based.
//
// You can provide your own test runner if you want to override it by exporting
// a function run(testRoot: string, clb: (error:Error) => void) that the extension
// host can call to run the tests. The test runner is expected to use console.log
// to report the results back to the caller. When the tests are finished, return
// a possible error to the callback or null if none.

// import * as testRunner from 'vscode/lib/testrunner';

// // You can directly control Mocha options by uncommenting the following lines
// // See https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically#set-options for more info
// testRunner.configure(<any>{
//     ui: 'tdd', 		// the TDD UI is being used in extension.test.ts (suite, test, etc.)
//     useColors: true // colored output from test results
// });
module.exports.mocha = undefined;



// module.exports = testRunner;

import { run } from "jest-cli";

const options = {
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    reporters: [
        "default"
    ],
    globals: {
        "ts-jest": {
            tsConfigFile: "tsconfig.json"
        }
    },
};
module.exports = {
    async run(testRoot: string, clb: (error: Error) => void) {
        let configLocation = `${__dirname}/../../jest.config.js`
        console.log(configLocation);
        await run(["--config", "/Users/filipecorreia/Documents/code/short-commands/jest.config.js", "--showConfig"],"/Users/filipecorreia/Documents/code/short-commands")
            .catch((e: any) => {
                clb(e);
            }).then((e: any) => {
                clb(null as any as Error);
            });
    }
}
