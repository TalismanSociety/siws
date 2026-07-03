---
title: Access the protected service
---

If you've completed all of the previous steps, you should be able to:

- Connect wallet
- Select an account to sign in with
- Generate and sign a nonce
- Receive a JWT after your signature is verified

Now let's wrap it up and use that JWT to access the protected service.

## Access protected endpoint

First, let's create a UI component that will consume the protected data. In `src/components/demo/Profile.tsx`, access the protected service with the JWT we obtained:

```tsx
// src/components/demo/Profile.tsx

import { useCallback } from "react"
import { getProtectedText } from "../../server/auth"

type Props = {
  jwtToken: string
}

export const Profile: React.FC<Props> = ({ jwtToken }) => {
  const generate = useCallback(async (jwtToken?: string) => {
    try {
      const { randomText } = await getProtectedText({ data: { jwtToken } })
      console.log(randomText)
    } catch (e) {
      // unauthenticated
    }
  }, [])

  return <button onClick={() => generate(jwtToken)}>Generate Random Text</button>
}
```

## Handle JWT

Remember in the `src/components/demo/SignIn.tsx` we called `onSignedIn` after a user has signed in? Let's handle that JWT so we can access the protected service using the `<Profile />` component we just created.

```tsx
// src/components/demo/index.tsx

import { useCallback, useEffect, useState } from "react"
import type { WalletAccount } from "../../lib/wallet"
import { ConnectWallet } from "./ConnectWallet"
import { SignIn } from "./SignIn"
import { Profile } from "./Profile"

export const Demo = () => {
  // ...

  // create states to hold the JWT token and the signed in account
  const [signedInWith, setSignedInWith] = useState<WalletAccount | undefined>()
  const [jwtToken, setJwtToken] = useState<string | undefined>()

  // called when `onSignedIn` is invoked
  const handleSignedIn = (selectedAccount: WalletAccount, jwtToken: string) => {
    setJwtToken(jwtToken)
    setSignedInWith(selectedAccount)
  }

  useEffect(() => {
    subscribeToExtensions()
  }, [subscribeToExtensions])

  return (
    <div className="w-full">
      <div className="border-stone-800 border p-4 rounded-xl w-full min-h-[384px] sm:h-96 flex flex-col flex-1">
        {/* shows a page to access the protected service */}
        {signedInWith && !!jwtToken ? (
          <Profile jwtToken={jwtToken} />
        ) : accounts ? (
          <SignIn
            accounts={accounts}
            onCancel={() => setAccounts(undefined)}
            onSignedIn={handleSignedIn}
          />
        ) : (
          <ConnectWallet onAccounts={setAccounts} />
        )}
      </div>
    </div>
  )
}
```

Now restart your dev server and you should be able to connect wallet, sign in, and generate random text from your backend. Check the random text in your browser console.

That's it! We've built a full stack dApp that authenticates users securely with just their Substrate wallet, no third party providers required!
