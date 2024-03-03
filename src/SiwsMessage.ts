import type { InjectedExtension } from "@polkadot/extension-inject/types"
import { Address } from "./utils"

export const siwsVersions: string[] = ["1.0.0"];
export type SiwsVersion = typeof siwsVersions[number];

export function isSiwsVersion(version?: string): version is SiwsVersion {
  return siwsVersions.indexOf(version as SiwsVersion) !== -1;
}

export namespace Siws {
  export const CURRENT_VERSION: SiwsVersion = "1.0.0";
}
export class SiwsMessage {
  /**RFC 4501 dns authority that is requesting the signing. */
  domain: string
  /**Substrate address signing the message. */
  address: string
  /**Azero ID */
  azeroId?: string
  /**Human-readable ASCII assertion that the user will sign, and it must not contain `\n`. */
  statement?: string
  /**RFC 3986 URI referring to the resource that is the subject of the signing. */
  uri: string
  /**Randomized token used to prevent replay attacks. */
  nonce: string
  /**Will appear as `sign in with your {{chainName}} account:` */
  chainName?: string
  /**Identifier for chain-specific applications */
  chainId?: number | string
  /**timestamp that indicates when the signed authentication message is no longer valid. */
  expirationTime?: number
  /**timestamp of the current time. */
  issuedAt?: number
  /**timestamp that indicates a minimum time before which the signed authentication message is not valid */
  notBefore?: number;
  /**Version of this message */
  version: SiwsVersion;
  /**Application-specific value to be included in the signed payload */
  requestId?: string;
  /**List of information or references to information the user wishes to have resolved as part of the authentication by the relying party; express as RFC 3986 URIs */
  resources?: string[];


  constructor(
    param: Omit<
      SiwsMessage,
      "prepareJson" | "asJson" | "prepareMessage" | "sign" | "signJson" | "verifyAzeroId"
    >
  ) {
    this.domain = param.domain
    this.address = param.address
    this.azeroId = param.azeroId
    this.statement = param.statement
    this.uri = param.uri
    this.nonce = param.nonce
    this.chainId = param.chainId
    this.chainName = param.chainName
    this.expirationTime = param.expirationTime
    this.issuedAt = param.issuedAt
    this.notBefore = param.notBefore;
    this.version = param.version || Siws.CURRENT_VERSION,
    this.requestId = param.requestId;
    this.resources = param.resources?.length ? [...param.resources] : undefined;

    this.validateMessage()
  }

  /**
   * Returns the message as JSON object, useful for when you need to store the payload without any methods.
   */
  get asJson() {
    return {
      domain: this.domain,
      address: this.address,
      azeroId: this.azeroId,
      statement: this.statement,
      uri: this.uri,
      nonce: this.nonce,
      chainId: this.chainId,
      issuedAt: this.issuedAt,
      expirationTime: this.expirationTime,
      notBefore: this.notBefore,
      version: this.version,
      requestId: this.requestId,
      resources: this.resources?.length ? [...this.resources] : undefined,
    }
  }

  /**
   * Prepares the message in stringified JSON format.
   */
  prepareJson(): string {
    this.validateMessage()
    this.issuedAt = this.issuedAt ?? new Date().getTime()
    return JSON.stringify(this.asJson, undefined, 2)
  }

  /**
   * Prepares the message to be signed in human readable format.
   */
  prepareMessage(): string {
    this.validateMessage()

    let message = `${this.domain} wants you to sign in with your ${
      this.chainName ?? "Substrate"
    } account:\n`
    message += `${this.address}\n`
    if (this.azeroId) message += `(${this.azeroId})\n`
    message += "\n"

    if (this.statement) message += `${this.statement}\n\n`

    const uriField = `URI: ${this.uri}`
    const body = [uriField]

    body.push(`Version: ${this.version}`);

    if (this.chainId) body.push(`Chain ID: ${this.chainId}`)

    body.push(`Nonce: ${this.nonce}`)

    this.issuedAt = this.issuedAt ?? new Date().getTime()
    body.push(`Issued At: ${new Date(this.issuedAt).toISOString()}`)

    if (this.expirationTime)
      body.push(`Expiration Time: ${new Date(this.expirationTime).toISOString()}`)

    if (this.notBefore)
      body.push(`Not Before: ${new Date(this.notBefore).toISOString()}`)

    if (this.requestId)
      body.push(`Request ID: ${this.requestId}`)

    if (this.resources?.length) {
      body.push(`Resources:`)
      this.resources.forEach((resource) => body.push(`- ${resource}`))
    }

    message += body.join("\n")

    return message
  }

  /**
   * Utility function that wraps @polkadotjs api.
   * @param source You can get this from `web3FromSource(injectedAccount.meta.source)`
   * */
  async sign(
    injectedExtension: InjectedExtension
  ): Promise<{ signature: string; message: string }> {
    if (!injectedExtension.signer.signRaw)
      throw new Error("Wallet does not support signing message.")

    const message = this.prepareMessage()
    const { signature } = await injectedExtension.signer.signRaw({
      address: this.address,
      data: message,
      type: "payload",
    })

    return { signature, message }
  }

  /**
   * Utility function that wraps @polkadotjs api.
   * @param source You can get this from `web3FromSource(injectedAccount.meta.source)`
   * */
  async signJson(
    injectedExtension: InjectedExtension
  ): Promise<{ signature: string; message: string }> {
    if (!injectedExtension.signer.signRaw)
      throw new Error("Wallet does not support signing message.")

    const message = this.prepareJson()
    const { signature } = await injectedExtension.signer.signRaw({
      address: this.address,
      data: message,
      type: "payload",
    })

    return { signature, message }
  }

  private validateMessage() {
    if (!this.domain || this.domain.length === 0) throw new Error("SIWS Error: domain is required")

    // invalid SS58 address
    if (!Address.fromSs58(this.address))
      throw new Error("SIWS Error: address is not a valid substrate address")

    // uri is required for wallets validation and to help prevent phishing attacks
    if (!this.uri || this.uri.length === 0) throw new Error("SIWS Error: uri is required")

    if (!this?.version) throw new Error("SIWS Error: version is required");
    if (!isSiwsVersion(this?.version)) throw new Error("SIWS Error: version is not a valid version")

    // nonce is required
    if (!this.nonce || this.nonce.length === 0) throw new Error("SIWS Error: nonce is required")

    if (this.issuedAt) {
      const issuedAtDate = new Date(this.issuedAt)
      // invalid timestamp
      if (isNaN(issuedAtDate.getTime())) throw new Error("SIWS Error: issuedAt is not a valid date")
    }

    if (this.expirationTime) {
      const expirationTimeDate = new Date(this.expirationTime)
      // invalid timestamp
      if (isNaN(expirationTimeDate.getTime()))
        throw new Error("SIWS Error: expirationTime is not a valid date")

      // cannot expire before issuedAt
      if (this.issuedAt && expirationTimeDate.getTime() <= new Date(this.issuedAt).getTime())
        throw new Error("SIWS Error: expirationTime must be greater than issuedAt")

      if (this?.notBefore && this.expirationTime <= this.notBefore)
        throw new Error("SIWS Error: expirationTime must be greater than notBefore")

      // token has expired
      if (expirationTimeDate.getTime() <= new Date().getTime())
        throw new Error("SIWS Error: message has expired!")
    }

    if (this.notBefore) {
      const notBeforeTimeDate = new Date(this.notBefore);
      // invalid timestamp
      if (isNaN(notBeforeTimeDate.getTime()))
        throw new Error("SIWS Error: notBefore is not a valid date")
    }

    if (this.requestId && !/^[^\n]*$/g.test(this.requestId))
      throw new Error("SIWS Error: requestId must not contain newlines")

    if (this.resources?.length) {
      this.resources.forEach((resource) => {
        if (!URL.canParse(resource)) throw new Error(`SIWS Error: resources must be valid URLs: ${resource}`)
      })
    }
  }

  async verifyAzeroId() {
    if (!this.azeroId) return true
    try {
      const { resolveDomainToAddress } = await import("@azns/resolver-core")
      const { address } = await resolveDomainToAddress(this.azeroId)

      if (!address) return false
      const parsedAddress = Address.fromSs58(this.address)
      const resolvedAddress = Address.fromSs58(address)
      return !!parsedAddress && !!resolvedAddress && parsedAddress.isEqual(resolvedAddress)
    } catch (e) {
      return false
    }
  }
}
