---
title: verifySIWS(message, signature, address)
---

`verifySIWS` is a function that helps verify a signature, message, and the signer's address using polkadot api. It wraps the `cryptoWairReady` so simplify your implementation.

```javascript
// example usage

try {
  const siwsMessage = verifyMessage(message, signature, address)
  console.log(siwsMessage.nonce)
} catch (e) {
  // either not a valid SIWS message or signature mismatched
}
```
