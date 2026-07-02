import { blake2b } from "@noble/hashes/blake2.js"
import { concatBytes, utf8ToBytes } from "@noble/hashes/utils.js"
import { base58 } from "@scure/base"
import { u8aEq } from "./bytes.js"

/**
 * SS58 address codec, replacing `@polkadot/util-crypto` `decodeAddress`/`encodeAddress`.
 * Only 32-byte public key payloads are supported (short account-index forms are not).
 */

const SS58_PREFIX = utf8ToBytes("SS58PRE")
const CHECKSUM_LENGTH = 2

const sshash = (data: Uint8Array): Uint8Array =>
  blake2b(concatBytes(SS58_PREFIX, data), { dkLen: 64 })

/** Decodes an SS58 address to its 32-byte public key, verifying the checksum. Throws on invalid input. */
export function decodeSs58Address(address: string): Uint8Array {
  const decoded = base58.decode(address)

  // 46 & 47 are reserved, first bit of a 2-byte prefix must not leak into payload
  if (decoded[0] & 0b1000_0000) throw new Error(`Invalid ss58 address: ${address}`)
  const prefixLength = decoded[0] & 0b0100_0000 ? 2 : 1
  const prefix =
    prefixLength === 1
      ? decoded[0]
      : ((decoded[0] & 0b0011_1111) << 2) | (decoded[1] >> 6) | ((decoded[1] & 0b0011_1111) << 8)
  if (prefix === 46 || prefix === 47) throw new Error(`Invalid ss58 address: ${address}`)

  if (decoded.length !== prefixLength + 32 + CHECKSUM_LENGTH)
    throw new Error(`Invalid ss58 address length: ${address}`)

  const payloadEnd = decoded.length - CHECKSUM_LENGTH
  const checksum = sshash(decoded.subarray(0, payloadEnd)).subarray(0, CHECKSUM_LENGTH)
  if (!u8aEq(checksum, decoded.subarray(payloadEnd)))
    throw new Error(`Invalid ss58 checksum: ${address}`)

  return decoded.slice(prefixLength, payloadEnd)
}

/** Encodes a 32-byte public key as an SS58 address. Defaults to the generic substrate prefix (42). */
export function encodeSs58Address(pubKey: Uint8Array, ss58Format = 42): string {
  if (pubKey.length !== 32) throw new Error("Public key must be 32 bytes!")
  if (ss58Format < 0 || ss58Format > 16383 || ss58Format === 46 || ss58Format === 47)
    throw new Error(`Invalid ss58 format: ${ss58Format}`)

  const prefix =
    ss58Format < 64
      ? Uint8Array.of(ss58Format)
      : Uint8Array.of(
          ((ss58Format & 0b1111_1100) >> 2) | 0b0100_0000,
          (ss58Format >> 8) | ((ss58Format & 0b0000_0011) << 6),
        )

  const payload = concatBytes(prefix, pubKey)
  return base58.encode(concatBytes(payload, sshash(payload).subarray(0, CHECKSUM_LENGTH)))
}
