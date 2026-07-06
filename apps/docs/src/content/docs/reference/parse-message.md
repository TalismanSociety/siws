---
title: parseMessage
---

`parseMessage` is a utility function that parse a message string to the `SiwsMessage` class. Useful for wallet integration or if you want to build your own signature validation logic.

```javascript
// example usage

const humanReadableMessage = // ...
try {
  const siwsMessage = parseMessage(humanReadableMessage)
  console.log(siwsMessage.nonce)
} catch(e) {
  // not a valid SIWS message
}
```
