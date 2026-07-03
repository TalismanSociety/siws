---
title: The Backend
---

In the previous page where we've implemented the sign in logic, we called two server functions, `getNonce` and `verifySignIn`. We'll implement both to complete the feature.

The general approach from a backend perspective is that:

1. Users will request for a nonce to initiate their sign in process
2. After signing the nonce, user calls `verifySignIn` to verify the signature against the previously requested nonce
3. If the nonce is valid, we create a JWT token for the user
4. User will use the JWT token to authenticate themselves for any protected API

We use TanStack Start [server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions) here, but any backend works — the only SIWS-specific call is `verifySIWS(message, signature, address)`, which runs in any JavaScript runtime (Node.js, Cloudflare Workers, etc.). For JWTs we use [jose](https://github.com/panva/jose), which is built on WebCrypto and works across all runtimes too.

Remember to configure your `JWT_SECRET` environment variable.

## Nonce

The `nonce` is a security measure to make sure that a signature cannot be stolen to perform a replay attack. Without a `nonce`, malicious actors may steal a user's signature and pretend to own the address that is signing in. Let's create our server functions file with the `getNonce` function:

```typescript
// src/server/auth.ts

import { createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie } from "@tanstack/react-start/server"

const getJwtKey = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not configured")
  return new TextEncoder().encode(secret)
}

export const getNonce = createServerFn({ method: "POST" }).handler(async () => {
  // 1. create a random string, you may use other approach if you like
  const nonce = crypto.randomUUID()

  // 2. tie the nonce to user's session as cookie so it can be used for verification later
  /** This is just an example. In production, you should encrypt your cookies. */
  setCookie("siws-nonce", nonce, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  })

  return { nonce }
})
```

## Verify

Almost there! Now let's add the `verifySignIn` server function:

```typescript
// src/server/auth.ts
// ...

import { verifySIWS } from "@talismn/siws"
import { SignJWT } from "jose"

export const verifySignIn = createServerFn({ method: "POST" })
  .validator((data: { message: string; signature: string; address: string }) => data)
  .handler(async ({ data }) => {
    // make sure the session is valid and has a nonce from previous request
    const nonce = getCookie("siws-nonce")
    if (!nonce) throw new Error("Invalid session! Please try again.")

    // verify that signature is valid
    const siwsMessage = await verifySIWS(data.message, data.signature, data.address)

    // validate that nonce is correct to prevent replay attack
    if (nonce !== siwsMessage.nonce) throw new Error("Invalid nonce! Please try again.")

    // only accept SIWS requests where the domain is what you allow to prevent phishing attack!
    if (siwsMessage.domain !== "localhost")
      throw new Error("SIWS Error: Signature was meant for different domain.")

    // ... add additional validation as necessary

    // now that user has proved their ownership to the signing address
    // we can create a JWT token that allows users to authenticate themselves
    // so they don't have to sign in again
    const jwtToken = await new SignJWT({
      address: siwsMessage.address,
      // ... typically you will also query the user's id from your database and encode it in the payload
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .sign(getJwtKey())

    // to securely store the JWT token, you should set it as an httpOnly cookie
    // we're returning this to store client side for demonstration purposes only
    return { jwtToken }
  })
```

## Protected

So we've got all the pieces to complete Sign-In with Substrate! Let's demonstrate how we could protect our data with all the things we've built so far:

```typescript
// src/server/auth.ts
// ...

import { jwtVerify } from "jose"

export const getProtectedText = createServerFn({ method: "POST" })
  .validator((data: { jwtToken?: string }) => data)
  .handler(async ({ data }) => {
    if (!data.jwtToken) throw new Error("You are not logged in!")

    try {
      // verify that JWT is correct
      await jwtVerify(data.jwtToken, getJwtKey())
    } catch {
      throw new Error("You are not logged in!")
    }

    // ... typically you would encode a user's ID in the JWT token
    // then decode the JWT to get the user's ID so you can query data for that user ID

    const bytes = crypto.getRandomValues(new Uint8Array(8))
    const randomText = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")

    return { randomText }
  })
```
