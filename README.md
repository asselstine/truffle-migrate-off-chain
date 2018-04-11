
# Truffle Saved Migrations

This migration command can replace Truffle's default migration behaviour.

Difference:

- The migration version for a network is stored in the filesystem:
`networks/<network_id>/version`
- Contract addresses and ABIs are separated by network and stored in:
`networks/<network_id>/<ContractName>.json`

# Motivation

## Differences between networks

- Some networks are transient, such as localhost
- Other networks are global, such as Ropsten.  We want these ABIs and addresses to be committed.

## Permanence of contracts

- When a contract is deployed, the previous one does not vanish.  The JSON file loses this information.

## Separation of concerns

- The JSON file includes both the ABI and the deployed contract address.  However, the same ABI can be
deployed to different locations on the same network.  These concepts must be separated.

## Retrieving contracts by name

- We still want to be able to access the 'newest' version of a contract.  Contracts must be looked up by name.

# Proposed Solution

A solution will need to:

- Store the ABI and contract locations separately
- Separate deployments by network

## Directory Structure

```
networks/3/contracts/CryptoTrophies.json
networks/3/version
networks/1234/contracts/CryptoTrophies.json
```

```javascript
// networks/ropsten/deploys/CryptoTrophies.json

{
  contractName: 'CryptoTrophies',
  networks: {
    3: {
      address: '0x38e7fefea8dfa7dfa8ef7a8ef7a8e7fa765d7fae54fad',
    }
  }
  abi: [] /* abi here */
}
```

However, we don't want to commit ABIs that aren't used.  Maybe just have some duplication and stick the ABI directly into the deployments.

## Order of Operations

### Deployment

- When the deployer deploys new contracts, a copy of the above information is stored as per the pattern.
- When the front-end wants to use the contract, it can pull in the correct version.
- What happens when a contract needs a specific contract address?  Then set it in the constructor and the migration will set it on deploy.

Essentially, our new command can run Migrations with two changes:

[ ] 1. Current migration version is determined from the value in the file `network/ropsten/version`
[ ] 2. The artifactor writes to the network folder.
[ ] 3. Truffle migrate --reset will simply delete the version file.

### Front-end

The front-end pulls in a generated JSON file (as now)

### Problems with the current migration

- Developers are developing locally, so the local address changes constantly in the JSON file.  The contract JSON file shouldn't be committed in it's current form.
- The Migration contract stores which migrations on the network have been run, but we still need to know the address of the migration contract for this to be useful.  This implies we need to commit the Migration.json file for the Migration version contract to be useful.
- A contract can be deployed multiple times on the same network.  The JSON file in its current form is simply storing the latest deployed address and version of the given contract.


### Migration Algorithm

1. Migration version is first checked to see what migrations need to run.
2. Migrations are run, when new contracts are deployed they are added to the list of deployed contracts.
3. The latest 'versions' of the contracts are combined into a JSON file.  This file is transient.

### Ideal File Structure

```
/deployments/networks/1234.json
/deployments/networks/3.json
```

Where `1234.json` and `3.json` are files structured like:

```javascript
{
  migrationVersion: '1521830456',
  contracts: [
    {
      contractName: 'CryptoTrophies',
      address: '0xalskdf',
      abi: '/* ... */',
      bytecode: '...',
      deployedBytecode: '...'
    }
  ]
}
```

The same combined contracts would be updated with the latest versions of the CryptoTrophies contracts.

# TODO:

1. [-] Regular JSON files are no longer being generated.  Still call the old artifactor.
2. [-] Old versions of contract abis are still being thrown away







The front-end allows the dev to have the same contract deployed to any network.  The user can select the network, and the contract is able to determine which address the contract lives at.
