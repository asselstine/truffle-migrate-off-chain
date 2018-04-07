var expect = require("truffle-expect");
var fs = require("fs-extra");
var path = require("path");
var async = require("async");
var _ = require("lodash");
var debug = require("debug")("artifactor");

function Artifactor(destination, options) {
  this.destination = destination;
  this.options = options;
};

Artifactor.prototype.save = function(object) {
  var self = this;

  return new Promise(function(accept, reject) {
    if (object.contractName == null) {
      return reject(new Error("You must specify a contract name."));
    }

    var networkId = self.options.network_id;

    var address = object.networks[networkId].address;

    // Create new path off of destination.
    output_path = path.join(self.destination, object.contractName);
    output_path = path.resolve(output_path);
    output_path = output_path + ".json";

    fs.readFile(output_path, {encoding: "utf8"}, function(err, json) {
      // No need to handle the error. If the file doesn't exist then we'll start afresh
      // with a new object.

      var finalObject = object;

      if (!err) {
        var existingObjDirty;
        try {
          if (json) {
            existingObjDirty = JSON.parse(json);
          }
        } catch (e) {
          reject(e);
        }

        // normalize existing and merge into final
        finalObject = existingObjDirty || {};

        // merge networks
        var finalNetworks = {};
        finalNetworks[networkId] = object.networks[networkId];

        // update existing with new
        _.assign(finalObject, object);
        finalObject.networks = finalNetworks;
      }

      finalObject = _.pick(finalObject, ['networks', 'abi', 'contractName'])
      finalObject.networks = _.pick(finalObject.networks, [networkId])

      // output object
      fs.outputFile(output_path, JSON.stringify(finalObject, null, 2), "utf8", function(err) {
        if (err) return reject(err);
        accept();
      });
    });
  });
};

Artifactor.prototype.saveAll = function(objects) {
  var self = this;

  if (Array.isArray(objects)) {
    var array = objects;
    objects = {};

    array.forEach(function(item) {
      objects[item.contract_name] = item;
    })
  }

  return new Promise(function(accept, reject) {
    fs.stat(self.destination, function(err, stat) {
      if (err) {
        return reject(new Error("Destination " + self.destination + " doesn't exist!"));
      }
      accept();
    });
  }).then(function() {
    var promises = [];

    Object.keys(objects).forEach(function(contractName) {
      var object = objects[contractName];
      object.contractName = contractName;
      promises.push(self.save(object));
    });

    return Promise.all(promises);
  });
};

module.exports = Artifactor;
