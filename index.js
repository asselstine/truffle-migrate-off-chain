#!/usr/bin/env node
require('source-map-support/register')

/*

  Taken from Truffle codebase

*/

var Config = require("truffle-config");
var Command = require("truffle-core/lib/command");
var TaskError = require("truffle-core/lib/errors/taskerror");
var TruffleError = require("truffle-error");
var version = require("truffle-core/lib/version");
var OS = require("os");

var command = new Command(require("./lib/commands"));

var options = {
  logger: console
};

command.run(process.argv.slice(2), options, function(err) {
  if (err) {
    if (err instanceof TaskError) {
      command.args
        .usage("Truffle v" + (version.bundle || version.core) + " - a development framework for Ethereum"
        + OS.EOL + OS.EOL
        + 'Usage: truffle-saved-migrations <command> [options]')
        .epilog("See more at http://truffleframework.com/docs")
        .showHelp();
    } else {
      if (err instanceof TruffleError) {
        console.log(err.message);
      } else if (typeof err == "number") {
        // If a number is returned, exit with that number.
        process.exit(err);
      } else {
        // Bubble up all other unexpected errors.
        console.log(err.stack || err.toString());
      }
    }
    process.exit(1);
  }

  // Don't exit if no error; if something is keeping the process open,
  // like `truffle console`, then let it.
});
