---
title: Sign In
---

Now that your wallet is connected, lets select an account to sign in with! We'll create a page that lets you select which account you want to sign in with:

## Select an account to sign in with

```javascript
// src/components/demo/SignIn.tsx
"use client"

import { useState } from "react"
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types"

type Props = {
  accounts: InjectedAccountWithMeta[]
  onCancel: () => void
}

export const SignIn: React.FC<Props> = ({ accounts, onCancel }) => {
  // auto select if only 1 account is connected
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | undefined>(
    accounts.length === 1 ? accounts[0] : undefined
  )

  return (
    <div className="h-full flex flex-1 flex-col">
      <p className="text-white text-lg">Sign In</p>
      <p className="text-stone-500">Select an account to sign in with.</p>
      <div className="my-4 flex flex-col h-full overflow-y-auto gap-3 p-2 rounded-lg border border-stone-800">
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <div
              key={account.address}
              onClick={() => setSelectedAccount(account)}
              className={`cursor-pointer p-4 border border-solid rounded-lg ${
                selectedAccount?.address === account.address
                  ? "text-white border-white"
                  : "text-gray-400 border-transparent"
              }`}
            >
              <p>{account.meta.name ?? account.address}</p>
            </div>
          ))
        ) : (
          <p className="text-stone-500 text-center mt-4">
            No account connected.
            <br />
            Connect at least 1 account to sign in with.
          </p>
        )}
      </div>
      <div className="grid gap-3">
        <button disabled={!selectedAccount}>
          Sign In
        </button>
        <button onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
```

Let's add this back into `src/components/demo/index.tsx` to display it after your wallet is connected:

```javascript
// ...

<div className="w-full">
  <div className="border-stone-800 border p-4 rounded-xl w-full min-h-[384px] sm:h-96 flex flex-col flex-1">
    {accounts ? (
      <SignIn accounts={accounts} onCancel={() => setAccounts(undefined)} />
    ) : (
      <ConnectWallet onAccounts={setAccounts} />
    )}
  </div>
</div>

// ...
```

## Handle sign in

You should now be able to select an account from your connected wallets to sign in with. Lets add that logic in so we can start signing in with our backend. Add this to the `SignIn` component:

```javascript
// src/components/demo/SignIn.tsx
// ...

import { Address, SiwsMessage } from "@talismn/siws"

// ...

type Props = {
  // ...
  onSignedIn: (account: InjectedAccountWithMeta, jwtToken: string) => void
}

export const SignIn: React.FC<Props> = ({ accounts, onCancel, onSignedIn }) => {

  // ...

  const handleSignIn = async () => {
    try {
      if(!selectedAccount) return

      const address = Address.fromSs58(selectedAccount.address ?? "")

      // invalid address
      if(!address) return

      // request nonce from server, we will implement this API in the next page
      const nonceRes = await fetch("/api/nonce")
      const data = await nonceRes.json()
      const { nonce } = data

      // you need to sign a message consisting the nonce so the backend can
      // validate your sign in request.
      // authentication will fail if you do not sign the nonce back.
      // SIWS helps you construct the message with the nonce in a way that
      // is user friendly and human readable
      const siwsMessage = new SiwsMessage({
        nonce,
        domain: 'localhost',
        uri: 'https://localhost:3000',
        statement: "Welcome to SIWS! Sign in to see how it works.",
        // use prefix of chain your dapp is on:
        address: address.toSs58(0),
        chainName: "Polkadot",
      })

      // get the injector of your account to create a Signature prompt
      const { web3FromSource } = await import("@polkadot/extension-dapp")
      const injectedExtension = await web3FromSource(selectedAccount.meta.source)

      // sign the SIWS message
      const signed = await siwsMessage.sign(injectedExtension)

      // send the signature and signed message to backend for verification
      const verifyRes = await fetch("/api/verify", {
        method: "POST",
        body: JSON.stringify({ ...signed, address: address.toSs58(0) }),
      })
      const verified = await verifyRes.json()
      if (verified.error) throw new Error(verified.error)

      // Hooray we're signed in! The backend should return a JWT so you can authenticate yourself for any future request
      onSignedIn(selectedAccount, verified.jwtToken)
    } catch (e: any) {
      // ... invalid signature
    }
  }

  // ...

  // and call this when "Sign In" button is clicked
  <button disabled={!selectedAccount} onClick={handleSignIn}>
    Sign In
  </button>
}
```

Clicking the `Sign In` button now should give you an error as we haven't implement the backend yet, but we're almost there! In the next page, we will implement the `nonce` and `verify` APIs along with a `protected` API that only signed in accounts can access.
