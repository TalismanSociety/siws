---
title: Quickstart
description: A complete SIWS sign-in in three steps.
---

A SIWS sign-in is three steps: your backend **issues a nonce**, the user **signs** a structured message containing it with their wallet, and your backend **verifies** the signature. No database required.

## 1. Issue a nonce — backend

The nonce is a random single-use token that ties the signature to one sign-in attempt, so a captured signature can't be replayed. Storing it in an httpOnly cookie means you don't need to persist anything server side — the browser sends it back automatically.

```typescript
// e.g. GET /api/nonce
const nonce = crypto.randomUUID()

// tie the nonce to the user's session — no database needed
/** This is just an example. In production, you should encrypt your cookies. */
setCookie("siws-nonce", nonce, { httpOnly: true, secure: true, sameSite: "strict", path: "/" })

return { nonce }
```

## 2. Sign — client side

```typescript
import { SiwsMessage } from "@talismn/siws"

// get the nonce from your backend
const { nonce } = await fetch("/api/nonce").then(res => res.json())

// connect to the wallet extension — or use your favourite Substrate library,
// such as polkadot-api or polkadot.js
const injected = await window.injectedWeb3["talisman"].enable("My dApp")
const [account] = await injected.accounts.get()

// construct the sign-in message
const siwsMessage = new SiwsMessage({
  domain: "myapp.com", // your site — the backend rejects other domains
  uri: "https://myapp.com/signin",
  address: account.address,
  nonce,
  statement: "Welcome! Sign in to continue.",
  chainName: "Polkadot",
})

// ask the wallet for a signature — a human-readable message is shown to the user.
// works with any wallet exposing `signer.signRaw`
const { message, signature } = await siwsMessage.sign(injected)

// send { message, signature, address } to your backend
await fetch("/api/verify", {
  method: "POST",
  body: JSON.stringify({ message, signature, address: account.address }),
})
```

## 3. Verify — backend

```typescript
// e.g. POST /api/verify — receives { message, signature, address }
import { verifySIWS } from "@talismn/siws"

// throws if the signature doesn't match the message and address
const siwsMessage = await verifySIWS(message, signature, address)

// prevent replay attacks: the signed nonce must be the one you issued in step 1,
// which comes back automatically in the cookie
if (siwsMessage.nonce !== getCookie("siws-nonce")) throw new Error("Invalid nonce!")

// prevent phishing: the user must have signed a message for YOUR site
if (siwsMessage.domain !== "myapp.com") throw new Error("Wrong domain!")

// done — the user has proven they own `address`.
// issue a session or JWT as you would with any other login method.
```

`verifySIWS` runs in any JavaScript runtime — Node.js, edge runtimes like Cloudflare Workers, or even the browser. The `setCookie`/`getCookie` helpers above are placeholders for whatever your backend framework provides.

## Complete example

For a full working integration — React UI, wallet selection, JWT sessions, and a protected API, deployable to Cloudflare Workers — see the [demo app source](https://github.com/TalismanSociety/siws/tree/main/apps/demo) or try it live at [siws.xyz](https://siws.xyz).
