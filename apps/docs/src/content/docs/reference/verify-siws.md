---
title: verifySIWS(message, signature, address)
---

`verifySIWS` is an async function that verifies a signature against a message and the signer's address, and returns the parsed `SiwsMessage` if the signature is valid. It supports `sr25519`, `ed25519` and `ecdsa` signatures, and is built on pure JavaScript cryptography ([@noble](https://paulmillr.com/noble/) / [@scure](https://github.com/paulmillr/scure-base)) — no `@polkadot/*` dependency, no WASM initialization, and it runs in any JavaScript runtime (Node.js, browsers, edge runtimes like Cloudflare Workers).

```javascript
// example usage

try {
  const siwsMessage = await verifySIWS(message, signature, address)
  console.log(siwsMessage.nonce)
} catch (e) {
  // either not a valid SIWS message or signature mismatched
}
```

## Parameters

- `message`: The full message that was signed, in either human-readable or JSON format.
- `signature`: The signature produced by the wallet — hex string or `Uint8Array`, raw or `<Bytes>`-wrapped.
- `address`: The address that claims to have signed the message.

## Lower level: `verifySignature`

If you need to verify a raw signature without parsing a SIWS message, the underlying `verifySignature(message, signature, address)` is also exported. It returns a `{ isValid, crypto, publicKey }` result instead of throwing, where `crypto` is the detected signature scheme.
