---
title: parseJson
---

`parseJson` is a utility function that parse a JSON formatted message string to the `SiwsMessage` class. Used when you're preparing messages as JSON.

```javascript
// example usage

const jsonFormattedMessage = // ...
try {
  const siwsMessage = parseJson(jsonFormattedMessage)
  console.log(siwsMessage.nonce)
} catch(e) {
  // not a valid SIWS message
}
```
