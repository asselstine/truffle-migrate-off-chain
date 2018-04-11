var path = require('path');

// Taken from Truffle migrate command
function formatNetworkDirectory(options) {
  return path.join(options.working_directory, "networks");
};

var command = {
  command: 'migrate',
  description: 'Run migrations to deploy contracts',
  builder: {
    reset: {
      type: "boolean",
      default: false
    },
    "compile-all": {
      describe: "recompile all contracts",
      type: "boolean",
      default: false
    },
    "dry-run": {
      describe: "Run migrations against an in-memory fork, for testing",
      type: "boolean",
      default: false
    },
    f: {
      describe: "Specify a migration number to run from",
      type: "number"
    }
  },
  run: function (options, done) {
    var OS = require("os");
    var Config = require("truffle-config");
    var Contracts = require("truffle-workflow-compile");
    var Resolver = require("truffle-resolver");
    var Migrate = require("../truffle-migrate");
    var Environment = require("truffle-core/lib/environment");
    var temp = require("temp");
    var copy = require("truffle-core/lib/copy");

    var config = Config.detect(options);

    var originalDone = done;
    done = function (err) {
      if (!err) Migrate.updateLatestContracts(config)
      originalDone(err)
    }

    function setupDryRunEnvironmentThenRunMigrations(callback) {
      Environment.fork(config, function(err) {
        if (err) return callback(err);

        temp.mkdir('migrate-dry-run-', function(err, temporaryDirectory) {
          if (err) return callback(err);

          function cleanup() {
            var args = arguments;
            // Ensure directory cleanup.
            temp.cleanup(function(err) {
              // Ignore cleanup errors.
              callback.apply(null, args);
            });
          };

          copy(config.contracts_build_directory, temporaryDirectory, function(err) {
            if (err) return callback(err);

            config.contracts_build_directory = temporaryDirectory;

            // This is because the contracts_build_directory changed.
            // Ideally we could architect them to be reactive of the config changes.
            config.resolver = new Resolver(config);

            runMigrations(cleanup);
          });
        });
      });
    }

    function runMigrations(callback) {
      if (options.f) {
        Migrate.runFrom(options.f, config, done);
      } else {
        Migrate.needsMigrating(config, function(err, needsMigrating) {
          if (err) return callback(err);

          if (needsMigrating) {
            Migrate.run(config, done);
          } else {
            config.logger.log("Network up to date.")
            callback();
          }
        });
      }
    };

    Contracts.compile(config, function(err) {
      if (err) return done(err);

      Environment.detect(config, function(err) {
        config.networks_directory = formatNetworkDirectory(config)

        if (err) return done(err);

        var dryRun = options.dryRun === true;

        var networkMessage = "Using network '" + config.network + "'";

        if (dryRun) {
          networkMessage += " (dry run)";
        }

        config.logger.log(networkMessage + "." + OS.EOL);

        if (dryRun) {
          setupDryRunEnvironmentThenRunMigrations(done);
        } else {
          runMigrations(done);
        }
      });
    });
  }
}

module.exports = command;
