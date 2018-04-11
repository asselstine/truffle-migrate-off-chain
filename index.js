#!/usr/bin/env node
require('source-map-support/register')

var Migrate = require('./lib/commands/migrate');
var TaskError = require("truffle-core/lib/errors/taskerror");
var TruffleError = require("truffle-error");
var Command = require("truffle-core/lib/command");

var options = {
  logger: console
};

var command = new Command(require("./lib/commands"));

command.run(['migrate'].concat(process.argv.slice(1)), options, function (err) {
  if (err) {
    if (err instanceof TaskError) {
      command.args
        .usage('Usage: truffle-migrate-off-chain [options]')
        .epilog("See more at https://github.com/asselstine/truffle-migrate-off-chain")
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
});
