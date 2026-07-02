import { hexToU8a, isHex, u8aToHex } from "./crypto/bytes.js"
import { decodeSs58Address, encodeSs58Address } from "./crypto/ss58.js"
import { verifySignature } from "./crypto/verify.js"
import { parseMessage } from "./parseMessage.js"

export const isAzeroId = (azeroId: string) => {
  const lowerCased = azeroId.toLowerCase()
  return lowerCased.endsWith(".azero") || lowerCased.endsWith(".tzero")
}
/**
 * A util function that verifies that the `message` is signed by the `address` and matches the `signature`,
 * and returns a parsed SiwsMessage instance if the signature is valid.
 */
export const verifySIWS = async (message: string, signature: string, address: string) => {
  const verification = verifySignature(message, signature, address)

  if (!verification?.isValid) throw new Error("SIWS Error: Invalid signature.")

  return parseMessage(message)
}

/**
 * A util class that represents addresses as bytes except for when we need to display them to the user.
 * Allows us to confidently do stuff like equality checks, don't need to worry about SS58 encoding.
 */
export class Address {
  readonly bytes: Uint8Array

  constructor(bytes: Uint8Array) {
    if (bytes.length === 32 || bytes.length === 20) {
      this.bytes = bytes
      return
    }
    throw new Error("Address must be 32/20 bytes!")
  }

  get isEthereum(): boolean {
    return this.bytes.length === 20
  }

  static fromSs58(addressCandidate: string): Address | false {
    try {
      const bytes = isHex(addressCandidate)
        ? hexToU8a(addressCandidate)
        : decodeSs58Address(addressCandidate)
      return new Address(bytes)
    } catch (error) {
      // invalid address
      return false
    }
  }

  static fromPubKey(pubKey: string): Address | false {
    if (!/^(0x)?([\da-fA-F]{2})+$/.test(pubKey)) return false
    const bytes = hexToU8a(pubKey)
    if (bytes.length !== 32) return false
    return new Address(bytes)
  }

  isEqual(other: Address): boolean {
    return this.bytes.every((byte, index) => byte === other.bytes[index])
  }

  /* to generic address if chain is not provided */
  toSs58(ss58Prefix?: number): string {
    if (this.bytes.length === 20) return u8aToHex(this.bytes)
    return encodeSs58Address(this.bytes, ss58Prefix)
  }

  toPubKey(): string {
    return u8aToHex(this.bytes)
  }
}
