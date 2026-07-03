---
title: The Backend
---

In the previous page where we've implemented the sign in logic, we called two API endpoints, `/api/nonce` and `/api/verify`. We'll implement both of the APIS to complete the feature.

The general approach from a backend perspective is that:

1. Users will request for a nonce to initiate their sign in process
2. After signing the nonce, user calls `verify` to verify the signature against the previously requested nonce
3. If the nonce is valid, we create a JWT token for the user
4. User will use the JWT token to authenticate themselves for any protected API

## Nonce

The `nonce` is a security measure to make sure that a signature cannot be stolen to perform a replay attack. Without a `nonce`, malicious actors may steal a user's signature and pretend to own the address that is signing in. Let's implement the `/api/nonce` API with NextJS's serverless functions. Create a new file for the API at `src/pages/api/nonce.ts` (We use NextJS pages for our APIs, feel free to use the app router at `src/app/api/...` if you like)

Remember to configure your JWT_SECRET

```javascript
// src/pages/api/nonce.ts

import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"

type Data = {
  nonce: string,
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  // 1. create a random string, you may use other approach if you like
  const nonce = crypto.randomUUID()

  // 2. tie the nonce to user's session as cookie so it can be used for verification later
  /** This is just an example. In production, you should encrypt your cookies. */
  res.setHeader("Set-Cookie", `siws-nonce=${nonce}; Path=/; HttpOnly; Secure; SameSite=Strict`)
  res.status(200).json({ nonce })
}
```

## Verify

Almost there! Now let's create the `verify` API. Create a new file at `src/pages/api/verify.ts`

```javascript
import type { NextApiRequest, NextApiResponse } from "next"
import jwt from "jsonwebtoken"
import { verifySIWS } from "@talismn/siws"

type Data = {
  error?: string
  jwtToken?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    // make sure the session is valid and has a nonce from previous request
    const nonce = req.cookies["siws-nonce"]
    if (!nonce) return res.status(401).json({ error: " Invalid session! Please try again." })

    // get the key params from the request body
    const { signature, message, address } = JSON.parse(req.body)

    // verify that signature is valid
    const siwsMessage = await verifySIWS(message, signature, address)

    // validate that nonce is correct to prevent replay attack
    if (nonce !== siwsMessage.nonce)
      res.status(401).json({ error: "Invalid nonce! Please try again." })

    // only accept SIWS requests where the domain is what you allow to prevent phishing attack!
    // validate that domain is correct to prevent phishing attack
    if (siwsMessage.domain !== 'localhost')
      throw new Error("SIWS Error: Signature was meant for different domain.")

    // ... add additional validation as necessary

    // now that user has proved their ownership to the signing address
    // we can create a JWT token that allows users to authenticate themselves
    // so they don't have to sign in again
    const jwtPayload = {
      address: siwsMessage.address,
      // ... typically you will also query the user's id from your database and encode it in the payload
    }

    // sign the JWT token. Remember to keep your JWT secret securely.
    const jwtToken = jwt.sign(jwtPayload, "JWT_SECRET", {
      algorithm: "HS256",
    })

    // to securely store the JWT token, you should set it as an httpOnly cookie
    // we're returning this to store client side for demonstration purposes only
    res.status(200).json({ jwtToken })
  } catch (e: any) {
    res.status(401).json({ error: e.message ?? "Invalid signature!" })
  }
}
```

## Protected

So we've got all the pieces to complete Sign-In with Substrate! Let's demonstrate how we could protect our data with all the things we've built so far. Let's create `src/pages/api/protected.ts`:

```javascript
import type { NextApiRequest, NextApiResponse } from "next"
import jwt from "jsonwebtoken"
import crypto from "crypto"

type Data = {
  randomText?: string
  error?: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const authorisationHeader = req.headers["authorisation"]
  if (typeof authorisationHeader !== "string")
    return res.status(401).json({ error: "You are not logged in!" })

  const jwtToken = authorisationHeader.split(" ")[1]

  try {
    // verify that JWT is correct
    jwt.verify(jwtToken, "JWT_SECRET")

    // ... typically you would encode a user's ID in the JWT token
    // then decode the JWT to get the user's ID so you can query data for that user ID

    res.status(200).json({ randomText: crypto.randomBytes(8).toString("hex") })
  } catch (e) {
    res.status(401).json({ error: "You are not logged in!" })
  }
}
```
