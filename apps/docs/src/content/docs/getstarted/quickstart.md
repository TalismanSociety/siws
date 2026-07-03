---
title: Quickstart
description: A complete SIWS sign-in in two steps.
---

A SIWS sign-in is two steps: the user **signs** a structured message with their wallet, and your backend **verifies** the signature. That's it.

## 1. Sign — client side

```typescript
import { SiwsMessage } from "@talismn/siws"

// connect to the wallet extension — or use your favourite Substrate library,
// such as polkadot-api or polkadot.js
const injected = await window.injectedWeb3["talisman"].enable("My dApp")
const [account] = await injected.accounts.get()

// construct the sign-in message
const siwsMessage = new SiwsMessage({
  domain: "myapp.com", // your site — the backend rejects other domains
  uri: "https://myapp.com/signin",
  address: account.address,
  nonce, // a random single-use token issued by your backend
  statement: "Welcome! Sign in to continue.",
  chainName: "Polkadot",
})

// ask the wallet for a signature — a human-readable message is shown to the user.
// works with any wallet exposing `signer.signRaw`
const { message, signature } = await siwsMessage.sign(injected)

// send { message, signature, address } to your backend
```

## 2. Verify — backend

```typescript
import { verifySIWS } from "@talismn/siws"

// throws if the signature doesn't match the message and address
const siwsMessage = await verifySIWS(message, signature, address)

// prevent replay attacks: the nonce must be the one you issued for this session
if (siwsMessage.nonce !== expectedNonce) throw new Error("Invalid nonce!")

// prevent phishing: the user must have signed a message for YOUR site
if (siwsMessage.domain !== "myapp.com") throw new Error("Wrong domain!")

// done — the user has proven they own `address`.
// issue a session or JWT as you would with any other login method.
```

`verifySIWS` runs in any JavaScript runtime — Node.js, edge runtimes like Cloudflare Workers, or even the browser.

## Notes

- **Nonce**: issue a random single-use token from your backend before signing (e.g. `crypto.randomUUID()` stored in an httpOnly cookie), and check it during verification. Without it, a captured signature could be replayed.
- **Domain**: always check `siwsMessage.domain` against your own domain, so a signature obtained by a phishing site can't be used against yours.

## Complete example

For a full working integration — React UI, wallet selection, JWT sessions, and a protected API, deployable to Cloudflare Workers — see the [demo app source](https://github.com/TalismanSociety/siws/tree/main/apps/demo) or try it live at [siws.xyz](https://siws.xyz).
