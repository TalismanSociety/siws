/**
 * Minimal structural signer types. Any wallet object exposing `signer.signRaw`
 * works — including `InjectedExtension` / `Injected` from polkadot extensions.
 */

export interface SignRawPayload {
  address: string
  data: string
  type: "payload"
}

export interface SignRawResult {
  signature: string
}

export interface SiwsSigner {
  signer: {
    signRaw?: (payload: SignRawPayload) => Promise<SignRawResult>
  }
}
