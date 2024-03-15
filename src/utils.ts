import {
  cryptoWaitReady,
  decodeAddress,
  encodeAddress,
  signatureVerify,
} from "@polkadot/util-crypto"
import { hexToU8a, isHex, u8aToHex } from "@polkadot/util"
import { parseMessage } from "./parseMessage.js"

export const isAzeroId = (azeroId: string) => {
  const lowerCased = azeroId.toLowerCase()
  return lowerCased.endsWith(".azero") || lowerCased.endsWith(".tzero")
}
/**
 * A util function that verifies that the `message` is signed by the `address` and matches the `signature`,
 * and returns a parsed SiwsMessage instance if the signature is valid.
 * It also wraps `await cryptoWaitReady` so you don't have to.
 */
export const verifySIWS = async (message: string, signature: string, address: string) => {
  await cryptoWaitReady()
  const verification = signatureVerify(message, signature, address)

  if (!verification) throw new Error("SIWS Error: Invalid signature.")

  const siwsMessage = parseMessage(message)
  const validAzeroId = await siwsMessage.verifyAzeroId()
  if (!validAzeroId) throw new Error("SIWS Error: Invalid Azero ID.")

  return siwsMessage
}

/**
 * A util class that represents addresses as bytes except for when we need to display them to the user.
 * Allows us to confidently do stuff like equality checks, don't need to worry about SS58 encoding.
 */
export class Address {
  readonly bytes: Uint8Array

  constructor(bytes: Uint8Array) {
    if (bytes.length !== 32) throw new Error("Address must be 32 bytes!")
    this.bytes = bytes
  }

  static fromSs58(addressCandidate: string): Address | false {
    try {
      const bytes = isHex(addressCandidate)
        ? (hexToU8a(addressCandidate) as Uint8Array)
        : decodeAddress(addressCandidate, false)
      return new Address(bytes)
    } catch (error) {
      // invalid address
      return false
    }
  }

  static fromPubKey(pubKey: string): Address | false {
    const bytes = new Uint8Array(hexToU8a(pubKey))
    if (bytes.length !== 32) return false
    return new Address(bytes)
  }

  isEqual(other: Address): boolean {
    return this.bytes.every((byte, index) => byte === other.bytes[index])
  }

  /* to generic address if chain is not provided */
  toSs58(ss58Prefix?: number): string {
    return encodeAddress(this.bytes, ss58Prefix)
  }

  toPubKey(): string {
    return u8aToHex(this.bytes)
  }
}
