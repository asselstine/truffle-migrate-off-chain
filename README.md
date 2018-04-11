# Truffle Saved Migrations

This library acts as a drop-in replacement for Truffle's `migrate` command.  It stores the migration version and deployed contract addresses for each network in the local filesystem.  This means that development networks can added to .gitignore, and production deployments can be committed: allowing easier integration with continuous deployment processes.

# Setup

Install the library in an existing Truffle project:

```
npm install --save-dev truffle-migrate-off-chain
```

The `Migrations.sol` contract can be removed because it is no longer needed.

# Usage

To run your migrations call the command:

```
truffle-migrate-off-chain
```

If you have existing migrations then this command will behave like `migrate --reset`.

# Options

The command currently supports all Truffle options, including `--dry-run` and `--network` selection.

# Migrating from `truffle migrate`

If you're migrating from `truffle migrate` then you can preserve your deployed contracts by manually creating a network config.

For example, to declare an existing set of contracts on the Ropsten network you could create the file `networks/3.json`:

```javascript
// networks/3.json

{
  migrationVersion: 123512351235, // latest migration version
  contracts: [
    {
      contractName: 'CryptoDoggies',
      address: '0x...' // address of contract on network
    }
  ]
}
```

# Behaviour

This library stores the migration version and deployed contract addresses in 'network config' JSON files.  A file is created for every deployed network under the `networks` directory.

For example:

```javascript

// networks/3.json

{
  migrationVersion: 152323422,
  contracts: [
    {
      contractName: 'CryptoDoggies',
      address: '0x...'
    }
  ]
}
```

Whenever `truffle-migrate-off-chain` is called, it will:

1. Run any migrations that are new.
2. Update the network config to the newest migration version and add any new contracts
3. Update the Truffle contract build artifacts to point to the latest deployed contracts on the networks.

The key here is that the Truffle build artifact network addresses are derived from the network configs; this allows you to persist the production config so that your continuous build server will build the front-end with the latest addresses.

# Limitations

- Different networks may have different versions of a contract's bytecode deployed.  However, they will all still be added to the same Truffle artifact.  This means that the address is not strictly tied to an ABI.  It's unlikely to be a problem but it's something to keep in mind.  This is really an existing issue, however.

- Deploying a contract to the same network twice is not currently supported.  Networks are distinguished by their network_id rather than an alias, so you have to scope the 'latest' set of contracts by network.
