# Introducing Polymath.js v2.0

TODO Update

```
await SecurityTokenRegistry.createSecurityToken(token)
```
This is all you need to create new security token using Polymath.js v2.0. It will:
1. Format data into the blockchain types (e.g. add decimals for token values).
2. Properly estimate gas via Web3 1.0.
3. Make dry run to validate inputs before transaction sending.
4. Notify callbacks with transaction hash and receipt.
5. Check whether the transaction was mined without errors or not.
6. Send necessary requests to the `polymath-api`.

## Key advantages
1. Web3 1.0. It means that we don't need truffle-contract package anymore and we can use async-await, websockets for events (there was bug with disconnection from them, but now it's fixed), proper auto gas estimation.
2. No need to wrap each contract function since v2.0 uses JavaScript Proxy API, which in a simplified manner calls original method if it's not overridden.
```
await PolyToken.symbol()
```
There is no `symbol` entry within the `PolyToken` class, but string above will return you ticker of the Polymath token.
This is how it works.

No excess wrappers means no excess documentation and tests.

## Needs from polymath-core
1. Versioned npm package (with changelog for each new version) with built-in contracts artifacts, which should contain contracts addresses for each network.
2. Complete and up-to-date documentation since Polymath.js will inherit it in many ways.