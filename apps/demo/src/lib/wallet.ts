/**
 * Minimal helpers around `window.injectedWeb3` — the standard interface all
 * Substrate wallet extensions inject. No wallet SDK required: the object
 * returned by `enable()` is directly compatible with `SiwsMessage.sign()`.
 */

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
