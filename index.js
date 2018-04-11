#!/usr/bin/env node
require('source-map-support/register')

var Migrate = require('./lib/commands/migrate');
var TaskError = require("truffle-core/lib/errors/taskerror");
var TruffleError = require("truffle-error");

var options = {
  logger: console
};

Migrate.run(options, function (err) {
  if (err) {
    if (err instanceof TaskError) {
      command.args
        .usage('Usage: truffle-saved-migrations [options]')
        .epilog("See more at https://github.com/asselstine/truffle-saved-migrations")
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
