import { ed25519 } from "@noble/curves/ed25519.js"
import { secp256k1 } from "@noble/curves/secp256k1.js"
import { blake2b } from "@noble/hashes/blake2.js"
import { keccak_256 } from "@noble/hashes/sha3.js"
import { concatBytes, utf8ToBytes } from "@noble/hashes/utils.js"
import * as sr25519 from "@scure/sr25519"
import { hexToU8a, isHex, u8aEq } from "./bytes.js"
import { decodeSs58Address } from "./ss58.js"

/**
 * Signature verification replacing `@polkadot/util-crypto` `signatureVerify`,
 * replicating its semantics: multi-signature type prefix handling, scheme
 * detection order (ed25519 -> sr25519 -> ecdsa/blake2 -> ecdsa/keccak) and the
 * `<Bytes>...</Bytes>` wrapping retry used by extension `signRaw` payloads.
 */

export type SignatureCrypto = "ed25519" | "sr25519" | "ecdsa" | "ethereum" | "none"

export interface SignatureVerifyResult {
  crypto: SignatureCrypto
  isValid: boolean
  publicKey: Uint8Array
}

const WRAP_PREFIX = utf8ToBytes("<Bytes>")
const WRAP_POSTFIX = utf8ToBytes("</Bytes>")
const ETHEREUM_PREFIX = utf8ToBytes("\x19Ethereum Signed Message:\n")

const startsWith = (u8a: Uint8Array, prefix: Uint8Array): boolean =>
  u8a.length >= prefix.length && u8aEq(u8a.subarray(0, prefix.length), prefix)

const isWrappedBytes = (message: Uint8Array): boolean =>
  message.length >= WRAP_PREFIX.length + WRAP_POSTFIX.length &&
  startsWith(message, WRAP_PREFIX) &&
  u8aEq(message.subarray(message.length - WRAP_POSTFIX.length), WRAP_POSTFIX)

const toU8a = (value: string | Uint8Array): Uint8Array =>
  typeof value === "string" ? (isHex(value) ? hexToU8a(value) : utf8ToBytes(value)) : value

const decodeAddressOrPublicKey = (addressOrPublicKey: string | Uint8Array): Uint8Array => {
  if (typeof addressOrPublicKey !== "string") return addressOrPublicKey
  if (isHex(addressOrPublicKey)) return hexToU8a(addressOrPublicKey)
  return decodeSs58Address(addressOrPublicKey)
}

const verifyEd25519 = (
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array,
): boolean => {
  try {
    return ed25519.verify(signature, message, publicKey)
  } catch {
    return false
  }
}

const verifySr25519 = (
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array,
): boolean => {
  try {
    return sr25519.verify(message, signature, publicKey)
  } catch {
    return false
  }
}

/**
 * Verifies a 65-byte `r || s || v` ecdsa signature by recovering the public key from the
 * hashed message and matching it (or its hash) against the supplied public key or address.
 */
const verifyEcdsa =
  (hasher: "blake2" | "keccak") =>
  (message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean => {
    if (signature.length !== 65) return false
    try {
      const hashed = hasher === "blake2" ? blake2b(message, { dkLen: 32 }) : keccak_256(message)
      const recovered = secp256k1.Signature.fromBytes(signature.subarray(0, 64), "compact")
        .addRecoveryBit(signature[64])
        .recoverPublicKey(hashed)

      if (hasher === "blake2") {
        const compressed = recovered.toBytes(true)
        return u8aEq(compressed, publicKey) || u8aEq(blake2b(compressed, { dkLen: 32 }), publicKey)
      }

      // 64-byte uncompressed key (0x04 prefix stripped), matched as raw key or as
      // an ethereum address (last 20 bytes of its keccak hash)
      const uncompressed = recovered.toBytes(false).subarray(1)
      return (
        u8aEq(uncompressed, publicKey) ||
        u8aEq(keccak_256(uncompressed).subarray(-20), publicKey.subarray(-20))
      )
    } catch {
      return false
    }
  }

type Verifier = [
  SignatureCrypto,
  (message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array) => boolean,
]

const VERIFIERS: Verifier[] = [
  ["ed25519", verifyEd25519],
  ["sr25519", verifySr25519],
  ["ecdsa", verifyEcdsa("blake2")],
  ["ethereum", verifyEcdsa("keccak")],
]

const MULTISIG_TYPES: SignatureCrypto[] = ["ed25519", "sr25519", "ecdsa"]

const verifySingle = (
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array,
): { crypto: SignatureCrypto; isValid: boolean } => {
  // MultiSignature: type-prefixed signature, e.g. from `pair.sign(data, { withType: true })`
  if ([0, 1, 2].includes(signature[0]) && [65, 66].includes(signature.length)) {
    const type = MULTISIG_TYPES[signature[0]]
    const inner = signature.subarray(1)
    const isValid =
      type === "ed25519"
        ? verifyEd25519(message, inner, publicKey)
        : type === "sr25519"
          ? verifySr25519(message, inner, publicKey)
          : verifyEcdsa("blake2")(message, inner, publicKey) ||
            verifyEcdsa("keccak")(message, inner, publicKey)
    return { crypto: isValid ? type : "none", isValid }
  }

  for (const [crypto, verify] of VERIFIERS) {
    if (verify(message, signature, publicKey)) return { crypto, isValid: true }
  }
  return { crypto: "none", isValid: false }
}

/**
 * Verifies that `signature` over `message` was produced by `addressOrPublicKey`.
 * Supports sr25519, ed25519 and ecdsa signatures (raw or type-prefixed), and retries
 * with the message wrapped in / stripped of `<Bytes>...</Bytes>`, matching how wallet
 * extensions wrap `signRaw` payloads. Payloads over 256 bytes are also retried as
 * their blake2b-256 hash, matching signers that follow the Substrate convention of
 * hashing large payloads before signing (e.g. Ledger Polkadot Generic app).
 */
export function verifySignature(
  message: string | Uint8Array,
  signature: string | Uint8Array,
  addressOrPublicKey: string | Uint8Array,
): SignatureVerifyResult {
  const messageU8a = toU8a(message)
  const signatureU8a = toU8a(signature)
  const publicKey = decodeAddressOrPublicKey(addressOrPublicKey)

  if (![64, 65, 66].includes(signatureU8a.length))
    throw new Error(
      `Invalid signature length, expected [64..66] bytes, found ${signatureU8a.length}`,
    )

  const candidates: Uint8Array[] = [messageU8a]

  // ethereum-prefixed messages are never <Bytes>-wrapped, no retry
  if (!(startsWith(messageU8a, ETHEREUM_PREFIX) && !isWrappedBytes(messageU8a))) {
    const toggled = isWrappedBytes(messageU8a)
      ? messageU8a.subarray(WRAP_PREFIX.length, messageU8a.length - WRAP_POSTFIX.length)
      : concatBytes(WRAP_PREFIX, messageU8a, WRAP_POSTFIX)
    candidates.push(toggled)

    for (const m of [messageU8a, toggled])
      if (m.length > 256) candidates.push(blake2b(m, { dkLen: 32 }))
  }

  for (const candidate of candidates) {
    const result = verifySingle(candidate, signatureU8a, publicKey)
    if (result.isValid) return { ...result, publicKey }
  }
  return { crypto: "none", isValid: false, publicKey }
}
