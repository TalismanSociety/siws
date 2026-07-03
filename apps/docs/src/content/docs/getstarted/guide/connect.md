---
title: Connect Wallet
---

To sign in, users have to first connect their wallet to your dapp. After that, they need to select an account that they want to sign in with.

## Repo Setup

Let's begin by creating a NextJS app that allows users to connect their wallet.

```bash
npx create-next-app siws-demo --ts && cd siws-demo
npm run dev
```

You should have a next js app running at `http://localhost:3000` now. We have setup the repo with Tailwind CSS but for conciseness, we will skip that part. Let's install siws and polkadot api:

```bash
npm install @talismn/siws @polkadot/api @polkadot/extension-dapp jsonwebtoken && npm install -D @types/jsonwebtoken
```

## Connect wallet

We will then create a connect wallet component so you can connect your wallet to the dApp.

```javascript
// src/components/demo/ConnectWallet.tsx

"use client"

import { useState } from "react"
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types"

type Props = {
  onAccounts: (accounts: InjectedAccountWithMeta[]) => void,
}

export const ConnectWallet: React.FC<Props> = ({ onAccounts }) => {
  const [connecting, setConnecting] = useState(false)

  const handleConnectWallet = async () => {
    setConnecting(true)
    // dynamically imported because @polkadot/extension-dapp does not support getting imported in SSR
    const { web3Enable, web3Accounts } = await import("@polkadot/extension-dapp")
    try {
      const extensions = await web3Enable("Sign-In with Substrate Demo")

      if (extensions.length === 0) {
        onAccounts([])
      } else {
        const accounts = await web3Accounts()
        onAccounts(accounts)
      }
    } catch (e) {
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <p className="text-white text-lg">Try it out</p>
      <p className="text-stone-500 mb-4">Connect your wallet to try out this cloneable demo app.</p>
      <button onClick={handleConnectWallet} disabled={connecting}>
        {connecting ? "Connecting wallet..." : "Connect Wallet"}
      </button>
    </div>
  )
}
```

## Manage connected wallets

Now let's render this component somewhere so we can conditionally show the connect wallet page only if wallet is not connected and keep track of all connected wallets. To see the changes, you need to render the component `<Demo />` in one of the page file at `app/[pagename].tsx` or `page/[pagename].tsx` depending on which NextJS version you're on. We will skip that part for conciseness.

```javascript
// src/components/demo/index.tsx

"use client"

import { useCallback, useEffect, useState } from "react"
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types"
import { ConnectWallet } from "./ConnectWallet"

export const Demo = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[] | undefined>()

  // subscribe to extension changes after first connect
  const subscribeToExtensions = useCallback(async () => {
    if (accounts === undefined) return
    const { web3AccountsSubscribe } = await import("@polkadot/extension-dapp")

    web3AccountsSubscribe((newAccounts) => {
      // dont update if newAccounts is same as accounts
      const newAddresses = newAccounts.map((account) => account.address).join("")
      const oldAddresses = accounts.map((account) => account.address).join("")
      if (newAddresses === oldAddresses) return

      // update accounts list
      setAccounts(newAccounts)
    })
  }, [accounts])

  useEffect(() => {
    subscribeToExtensions()
  }, [subscribeToExtensions])

  return (
    <div className="w-full">
      <div className="border-stone-800 border p-4 rounded-xl w-full min-h-[384px] sm:h-96 flex flex-col flex-1">
        {accounts ? (
          <p>Sign in page</p>
        ) : (
          <ConnectWallet onAccounts={setAccounts} />
        )}
      </div>
    </div>
  )
}
```

Now render the demo app in whichever page you want, for example, `src/app/page.tsx`:

```javascript
import { Demo } from "../components/demo"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Demo />
    </main>
  )
}
```

You should be able to connect your wallet now! We will begin with the sign in flow in the next page.
