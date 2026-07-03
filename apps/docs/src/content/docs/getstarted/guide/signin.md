---
title: Sign In
---

Now that your wallet is connected, lets select an account to sign in with! We'll create a page that lets you select which account you want to sign in with:

## Select an account to sign in with

```tsx
// src/components/demo/SignIn.tsx

import { useState } from "react"
import type { Injected, InjectedAccount } from "../../lib/wallet"

type Props = {
  injected: Injected
  accounts: InjectedAccount[]
  onCancel: () => void
}

export const SignIn: React.FC<Props> = ({ injected, accounts, onCancel }) => {
  // auto select if only 1 account is connected
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccount | undefined>(
    accounts.length === 1 ? accounts[0] : undefined,
  )

  return (
    <div className="h-full flex flex-1 flex-col">
      <p>Select an account to sign in with.</p>
      <div className="my-4 flex flex-col gap-3">
        {accounts.map(account => (
          <button
            type="button"
            key={account.address}
            onClick={() => setSelectedAccount(account)}
            className={selectedAccount?.address === account.address ? "text-white" : "text-gray-400"}
          >
            {account.name ?? account.address}
          </button>
        ))}
      </div>
      <button disabled={!selectedAccount}>Sign In</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}
```

Let's add this back into `src/components/demo/index.tsx` to display it after your wallet is connected:

```tsx
// ...

{injected && accounts ? (
  <SignIn injected={injected} accounts={accounts} onCancel={() => setAccounts(undefined)} />
) : (
  <ConnectWallet
    onConnect={(injected, accounts) => {
      setInjected(injected)
      setAccounts(accounts)
    }}
  />
)}

// ...
```

## Handle sign in

You should now be able to select an account from your connected wallets to sign in with. Lets add that logic in so we can start signing in with our backend. Add this to the `SignIn` component:

```tsx
// src/components/demo/SignIn.tsx
// ...

import { Address, SiwsMessage } from "@talismn/siws"
import { getNonce, verifySignIn } from "../../server/auth"

// ...

type Props = {
  // ...
  onSignedIn: (account: InjectedAccount, jwtToken: string) => void
}

export const SignIn: React.FC<Props> = ({ injected, accounts, onCancel, onSignedIn }) => {

  // ...

  const handleSignIn = async () => {
    try {
      if (!selectedAccount) return

      const address = Address.fromSs58(selectedAccount.address ?? "")

      // invalid address
      if (!address) return

      // request nonce from server, we will implement this server function in the next page
      const { nonce } = await getNonce()

      // you need to sign a message consisting the nonce so the backend can
      // validate your sign in request.
      // authentication will fail if you do not sign the nonce back.
      // SIWS helps you construct the message with the nonce in a way that
      // is user friendly and human readable
      const siwsMessage = new SiwsMessage({
        nonce,
        domain: "localhost",
        uri: "https://localhost:5173",
        statement: "Welcome to SIWS! Sign in to see how it works.",
        // use prefix of chain your dapp is on:
        address: address.toSs58(0),
        chainName: "Polkadot",
      })

      // sign the SIWS message with the connected wallet.
      // `sign()` accepts any object exposing `signer.signRaw` — the `injected`
      // object we got from the extension's `enable()` works directly
      const signed = await siwsMessage.sign(injected)

      // send the signature and signed message to backend for verification
      const { jwtToken } = await verifySignIn({
        data: { ...signed, address: address.toSs58(0) },
      })

      // Hooray we're signed in! The backend should return a JWT so you can authenticate yourself for any future request
      onSignedIn(selectedAccount, jwtToken)
    } catch (e) {
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

Clicking the `Sign In` button now should give you an error as we haven't implemented the backend yet, but we're almost there! In the next page, we will implement the `getNonce` and `verifySignIn` server functions along with a protected one that only signed in accounts can access.
