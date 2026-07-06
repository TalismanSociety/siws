---
title: SiwsMessage
---

The `SiwsMessage` class helps you construct a human-readable message, and provides some useful methods.

```javascript
// example usage
const siwsMessage = new SiwsMessage({
  nonce,
  domain: "localhost",
  uri: "https://localhost:5173",
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
- `version` (Optional): SIWS message version. Defaults to the current version (`1.0.0`).
- `expirationTime` (Optional): Timestamp that indicates when the signed authentication message is no longer valid.
- `issuedAt` (Optional): Timestamp of the current time.
- `notBefore` (Optional): Timestamp before which the signed authentication message is not yet valid.
- `requestId` (Optional): System-specific identifier that may be used to uniquely refer to the sign-in request. Must not contain newlines.
- `resources` (Optional): List of URI references the user is authorizing as part of the sign-in.

## `SiwsMessage` Methods

### `get` `asJson`

A getter that returns all properties as an object without the methods. This is useful if you need to, for example, store the payload somewhere. Example usage:

```javascript
const processed = processData(siwsMessage.asJson)
```

### `prepareMessage()`

Prepares the signable message in human-readable format. This exact string is what the user signs — with whatever signing interface your stack provides — and what your backend passes to `verifySIWS`.

```javascript
const message = siwsMessage.prepareMessage()
```

### `prepareJson()`

Sometimes you may want to show the message that users sign as JSON (e.g. if you are building a dev focused application). `SiwsMessage` comes with a convenient `prepareJson()` method that prepares the message in a human readable JSON format. It can be signed and verified exactly like the human-readable format.

```javascript
const message = siwsMessage.prepareJson()
```

## Signing the message

SIWS is unopinionated about signing: sign the `prepareMessage()` output with whatever your stack provides. `verifySIWS` accepts the resulting signature however it was produced — raw or `<Bytes>`-wrapped, hex string or `Uint8Array`, sr25519/ed25519/ecdsa.

**Wallet extension directly (`window.injectedWeb3`):**

```javascript
const injected = await window.injectedWeb3["talisman"].enable("My dApp")

const { signature } = await injected.signer.signRaw({
  address,
  data: message,
  type: "payload",
})
```

**polkadot.js / dedot** — both use the same pjs-compatible `Signer`:

```javascript
// pjs: const injector = await web3FromSource(account.meta.source)
// dedot: const injected = await window.injectedWeb3["talisman"].enable("My dApp")
const { signature } = await injector.signer.signRaw({
  address,
  data: message,
  type: "payload",
})
```

**polkadot-api** — sign the message bytes with the account's `polkadotSigner`:

```javascript
import { u8aToHex } from "@talismn/siws"

const sigBytes = await account.polkadotSigner.signBytes(new TextEncoder().encode(message))
const signature = u8aToHex(sigBytes) // or send the raw bytes — verifySIWS accepts both
```
