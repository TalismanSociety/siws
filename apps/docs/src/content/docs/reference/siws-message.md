---
title: SiwsMessage
---

The `SiwsMessage` class helps you construct a human-readable message, and provides some useful methods.

```javascript
// example usage
const siwsMessage = new SiwsMessage({
  nonce,
  domain: "localhost",
  uri: "https://localhost:3000",
  statement: "Welcome to SIWS! Sign in to see how it works.",
  address: address.toSs58(0),
  chainName: "Polkadot",
})

const humanReadableMessage = siwsMessage.prepareMessage()
```

## `SiwsMessage` Properties

- `domain`: RFC 4501 dns authority that is requesting the signing.
- `address`: Substrate address signing the message.
- `uri`: RFC 3986 URI referring to the resource that is the subject of the signing.
- `nonce`: Randomized token used to prevent replay attacks.
- `statement` (optional): Human-readable ASCII assertion that the user will sign, and it must not contain `\n`.
- `chainName` (Optional): Will appear as _sign in with your {{chainName}} account:_
- `chainId` (Optional): Identifier for chain-specific applications
- `expirationTime` (Optional): Timestamp that indicates when the signed authentication message is no longer valid.
- `issuedAt` (Optional): Timestamp of the current time.

## `SiwsMessage` Methods

### `get` `asJson`

A getter that returns all properties as an object without the methods. This is useful if you need to, for example, store the payload somewhere. Example usage:

```javascript
const processed = processData(siwsMessage.asJson)
```

### `sign(injectedExtension)`

Signs the message in one line and returns both the signature and message. Requires the injector that you can obtain with polkadot api.

```javascript
// import web3FromSource
import { web3FromSource } from "@polkadot/extension-dapp"

// get the injector of your account to create a Signature prompt
const injectedExtension = await web3FromSource(selectedAccount.meta.source)
const { message, signature } = siwsMessage.sign(injectedExtension)
```

### `prepareMessage()`

Prepares a signable message in human-readable format. This is useful if you want to build your own custom signing logics instead of using the `siwsMessage.sign(injector)` method.

```javascript
const message = siwsMessage.prepareMessage()
const signature = injector.signer.signRaw({
  address,
  data: message,
  type: "payload",
})
```

### `prepareJson()`

Sometimes you may want to show the message that users sign as JSON (e.g. if you building a dev focused application). `SiwsMessage` comes with a convenient `prepareJson()` method that prepares the message in a human readable JSON format.

```javascript
const message = siwsMessage.prepareJson()
const signature = injector.signer.signRaw({
  address,
  data: message,
  type: "payload",
})
```
