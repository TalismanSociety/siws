import { ed25519 } from "@noble/curves/ed25519.js"
import { blake2b } from "@noble/hashes/blake2.js"
import { concatBytes, utf8ToBytes } from "@noble/hashes/utils.js"
import { u8aToHex } from "../src/crypto/bytes"
import { verifySignature } from "../src/crypto/verify"
import { LEDGER_ED25519_HASHED_VECTOR } from "./vectors"

const wrapBytes = (message: string) =>
  concatBytes(utf8ToBytes("<Bytes>"), utf8ToBytes(message), utf8ToBytes("</Bytes>"))

describe("verifySignature", () => {
  describe("blake2b-hashed payloads (Ledger Polkadot Generic app)", () => {
    it("should verify a real Ledger signature over blake2b-256 of the wrapped message", () => {
      const { message, signature, address } = LEDGER_ED25519_HASHED_VECTOR
      const result = verifySignature(message, signature, address)
      expect(result.isValid).toEqual(true)
      expect(result.crypto).toEqual("ed25519")
    })

    it("should not verify the Ledger signature against a tampered message", () => {
      const { message, signature, address } = LEDGER_ED25519_HASHED_VECTOR
      const result = verifySignature(`${message} `, signature, address)
      expect(result.isValid).toEqual(false)
    })

    it("should verify a hashed signature only when the payload exceeds 256 bytes", () => {
      const privateKey = ed25519.utils.randomSecretKey()
      const publicKey = ed25519.getPublicKey(privateKey)

      // wrapped length > 256: signers may hash before signing, must verify
      const longMessage = "a".repeat(300)
      const longSignature = ed25519.sign(blake2b(wrapBytes(longMessage), { dkLen: 32 }), privateKey)
      expect(verifySignature(longMessage, longSignature, publicKey).isValid).toEqual(true)

      // wrapped length <= 256: hashing convention does not apply, must not verify
      const shortMessage = "a".repeat(100)
      const shortSignature = ed25519.sign(
        blake2b(wrapBytes(shortMessage), { dkLen: 32 }),
        privateKey,
      )
      expect(verifySignature(shortMessage, shortSignature, publicKey).isValid).toEqual(false)
    })

    it("should still verify unhashed signatures over long messages", () => {
      const privateKey = ed25519.utils.randomSecretKey()
      const publicKey = ed25519.getPublicKey(privateKey)

      const longMessage = "a".repeat(300)
      const signature = ed25519.sign(wrapBytes(longMessage), privateKey)
      const result = verifySignature(longMessage, u8aToHex(signature), publicKey)
      expect(result.isValid).toEqual(true)
      expect(result.crypto).toEqual("ed25519")
    })
  })
})
