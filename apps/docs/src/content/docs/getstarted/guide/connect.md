---
title: Connect Wallet
---

To sign in, users have to first connect their wallet to your dapp. After that, they need to select an account that they want to sign in with.

## Repo Setup

Let's begin with a [TanStack Start](https://tanstack.com/start/latest/docs/framework/react/quick-start) app — though any React setup works. Install siws and jose (for JWTs):

```bash
npm install @talismn/siws jose
```

That's it — no wallet SDK required. Substrate wallet extensions all inject the same standard interface at `window.injectedWeb3`, and our examples talk to it directly so they stay framework agnostic. For a real application, we recommend using a JavaScript framework for Substrate to handle wallet connections, such as [polkadot-api](https://papi.how) or the legacy [polkadot.js](https://polkadot.js.org/docs/) libraries.

## Connect wallet

Connecting a wallet is two calls: `enable()` the extension, then read its accounts.

```typescript
// src/lib/wallet.ts

export type InjectedAccount = { address: string; name?: string }

// the object returned by enable() — its `signer` can sign SIWS messages directly
export type Injected = {
  accounts: {
    get: () => Promise<InjectedAccount[]>
  }
  signer: {
    signRaw?: (payload: {
      address: string
      data: string
      type: "payload" | "bytes"
    }) => Promise<{ signature: string }>
  }
}

export const connectWallet = async (source = "talisman"): Promise<Injected> => {
  const provider = (window as any).injectedWeb3?.[source]
  if (!provider) throw new Error(`Wallet extension not found: ${source}`)
  return provider.enable("SIWS Demo")
}
```

Now a small component to trigger the connection:

```tsx
// src/components/demo/ConnectWallet.tsx

import { connectWallet, type Injected, type InjectedAccount } from "../../lib/wallet"

type Props = {
  onConnect: (injected: Injected, accounts: InjectedAccount[]) => void
}

export const ConnectWallet: React.FC<Props> = ({ onConnect }) => {
  const handleConnectWallet = async () => {
    const injected = await connectWallet()
    onConnect(injected, await injected.accounts.get())
  }

  return <button onClick={handleConnectWallet}>Connect Wallet</button>
}
```

## Manage the connection

Keep the connection and its accounts in state so we can show the sign in page once connected:

```tsx
// src/components/demo/index.tsx

import { useState } from "react"
import type { Injected, InjectedAccount } from "../../lib/wallet"
import { ConnectWallet } from "./ConnectWallet"

export const Demo = () => {
  const [injected, setInjected] = useState<Injected>()
  const [accounts, setAccounts] = useState<InjectedAccount[]>()

  return (
    <div className="w-full">
      {accounts ? (
        <p>Sign in page</p>
      ) : (
        <ConnectWallet
          onConnect={(injected, accounts) => {
            setInjected(injected)
            setAccounts(accounts)
          }}
        />
      )}
    </div>
  )
}
```

You should be able to connect your wallet now! We will begin with the sign in flow in the next page.

:::tip
A production dapp usually supports multiple wallet extensions and reacts to account changes. See the demo app's [`wallet.ts`](https://github.com/TalismanSociety/siws/blob/main/apps/demo/src/lib/wallet.ts) for a complete implementation with multi-wallet aggregation and account subscriptions.
:::
