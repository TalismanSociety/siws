---
title: Connect Wallet
---

To sign in, users have to first connect their wallet to your dapp. After that, they need to select an account that they want to sign in with.

## Repo Setup

Let's begin with a TanStack Start app. You can scaffold one following the [TanStack Start quickstart](https://tanstack.com/start/latest/docs/framework/react/quick-start), or clone the [SIWS demo app](https://github.com/TalismanSociety/siws/tree/main/apps/demo). Then install siws and jose (for JWTs):

```bash
npm install @talismn/siws jose
```

That's it — no wallet SDK required. Substrate wallet extensions all inject the same standard interface at `window.injectedWeb3`, and we'll talk to it directly.

## Wallet helpers

Let's create a small set of typed helpers around `window.injectedWeb3`:

```typescript
// src/lib/wallet.ts

export type WalletAccount = {
  address: string
  meta: { name?: string; source: string }
}

type InjectedAccount = { address: string; name?: string; type?: string }

export type Injected = {
  accounts: {
    get: () => Promise<InjectedAccount[]>
    subscribe: (cb: (accounts: InjectedAccount[]) => void) => () => void
  }
  signer: {
    signRaw?: (payload: {
      address: string
      data: string
      type: "payload" | "bytes"
    }) => Promise<{ signature: string }>
  }
}

type InjectedWindowProvider = {
  enable: (originName: string) => Promise<Injected>
  version?: string
}

declare global {
  interface Window {
    injectedWeb3?: Record<string, InjectedWindowProvider>
  }
}

export const APP_NAME = "Sign-In with Substrate Demo"

const enabled = new Map<string, Promise<Injected>>()

export const getWalletSources = (): string[] => Object.keys(window.injectedWeb3 ?? {})

export const getInjected = (source: string): Promise<Injected> => {
  const provider = window.injectedWeb3?.[source]
  if (!provider) throw new Error(`Wallet extension not found: ${source}`)
  let injected = enabled.get(source)
  if (!injected) {
    injected = provider.enable(APP_NAME)
    enabled.set(source, injected)
  }
  return injected
}

const withSource = (accounts: InjectedAccount[], source: string): WalletAccount[] =>
  accounts.map(({ address, name }) => ({ address, meta: { name, source } }))

export const getAccounts = async (): Promise<WalletAccount[]> => {
  const all = await Promise.all(
    getWalletSources().map(async source => {
      try {
        const injected = await getInjected(source)
        return withSource(await injected.accounts.get(), source)
      } catch {
        // user rejected access or extension misbehaved — skip it
        return []
      }
    }),
  )
  return all.flat()
}

export const subscribeAccounts = async (
  cb: (accounts: WalletAccount[]) => void,
): Promise<() => void> => {
  const latest = new Map<string, WalletAccount[]>()
  const unsubs = await Promise.all(
    getWalletSources().map(async source => {
      try {
        const injected = await getInjected(source)
        return injected.accounts.subscribe(accounts => {
          latest.set(source, withSource(accounts, source))
          cb(Array.from(latest.values()).flat())
        })
      } catch {
        return () => {}
      }
    }),
  )
  return () => {
    for (const unsub of unsubs) unsub()
  }
}
```

## Connect wallet

We will then create a connect wallet component so you can connect your wallet to the dApp.

```tsx
// src/components/demo/ConnectWallet.tsx

import { useState } from "react"
import { getAccounts, type WalletAccount } from "../../lib/wallet"

type Props = {
  onAccounts: (accounts: WalletAccount[]) => void
}

export const ConnectWallet: React.FC<Props> = ({ onAccounts }) => {
  const [connecting, setConnecting] = useState(false)

  const handleConnectWallet = async () => {
    setConnecting(true)
    try {
      onAccounts(await getAccounts())
    } catch {
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

Now let's render this component somewhere so we can conditionally show the connect wallet page only if wallet is not connected and keep track of all connected wallets.

```tsx
// src/components/demo/index.tsx

import { useCallback, useEffect, useState } from "react"
import { subscribeAccounts, type WalletAccount } from "../../lib/wallet"
import { ConnectWallet } from "./ConnectWallet"

export const Demo = () => {
  const [accounts, setAccounts] = useState<WalletAccount[] | undefined>()
  const [subscribed, setSubscribed] = useState(false)

  // subscribe to extension changes after first connect
  const subscribeToExtensions = useCallback(async () => {
    if (accounts === undefined || subscribed) return

    setSubscribed(true)
    subscribeAccounts(newAccounts => {
      // dont update if newAccounts is same as accounts
      const newAddresses = newAccounts.map(account => account.address).join("")
      const oldAddresses = accounts.map(account => account.address).join("")
      if (newAddresses === oldAddresses) return

      // update accounts list
      setAccounts(newAccounts)
    })
  }, [accounts, subscribed])

  useEffect(() => {
    subscribeToExtensions()
  }, [subscribeToExtensions])

  return (
    <div className="w-full">
      <div className="border-stone-800 border p-4 rounded-xl w-full min-h-[384px] sm:h-96 flex flex-col flex-1">
        {accounts ? <p>Sign in page</p> : <ConnectWallet onAccounts={setAccounts} />}
      </div>
    </div>
  )
}
```

Now render the demo app in whichever route you want, for example, `src/routes/index.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router"
import { Demo } from "../components/demo"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Demo />
    </main>
  )
}
```

You should be able to connect your wallet now! We will begin with the sign in flow in the next page.
