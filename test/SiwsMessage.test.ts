import { ed25519 } from "@noble/curves/ed25519.js"
import { secp256k1 } from "@noble/curves/secp256k1.js"
import { blake2b } from "@noble/hashes/blake2.js"
import { concatBytes, utf8ToBytes } from "@noble/hashes/utils.js"
import * as sr25519 from "@scure/sr25519"
import { Siws, SiwsMessage } from "../src/SiwsMessage"
import { parseMessage } from "../src/parseMessage"
import { u8aToHex } from "../src/crypto/bytes"
import { encodeSs58Address } from "../src/crypto/ss58"
import { verifySIWS } from "../src/utils"
import type { SiwsSigner } from "../src/types"
import { VALID_ADDRESS, validParams } from "./config"
import { ED25519_VECTOR, SR25519_VECTOR, ECDSA_VECTOR, SchemeVector } from "./vectors"

const wrapBytes = (message: string) =>
  concatBytes(utf8ToBytes("<Bytes>"), utf8ToBytes(message), utf8ToBytes("</Bytes>"))

const validSiwsMessage = new SiwsMessage(validParams)
const mockedInjectedExtension = {
  signer: {
    signRaw: jest.fn(() => {
      return {
        signature: "mockedSignature",
      }
    }),
  },
}
describe("SiwsMessage", () => {
  describe("constructor", () => {
    it("should create an SIWS instance with correct params", () => {
      expect(validSiwsMessage.address).toEqual(VALID_ADDRESS)
    })

    // TODO: allow ethereum address
    // it("should throw error when address is invalid", () => {
    //   const invalidParams = { ...validParams, address: "invalid" }
    //   expect(() => new SiwsMessage(invalidParams)).toThrow(
    //     "SIWS Error: address is not a valid substrate address"
    //   )
    // })

    it("should throw error if domain is invalid", () => {
      const invalidParams = { ...validParams, domain: "" }
      expect(() => new SiwsMessage(invalidParams)).toThrow("SIWS Error: domain is required")
    })

    it("should throw error if uri is invalid", () => {
      const invalidParams = { ...validParams, uri: "" }
      expect(() => new SiwsMessage(invalidParams)).toThrow("SIWS Error: uri is required")
    })

    it("should throw error if nonce is invalid", () => {
      const invalidParams = { ...validParams, nonce: "" }
      expect(() => new SiwsMessage(invalidParams)).toThrow("SIWS Error: nonce is required")
    })

    it("should throw error if issuedAt is invalid", () => {
      const invalidParams = { ...validParams, issuedAt: "invalidTimestamp" as any }
      expect(() => new SiwsMessage(invalidParams)).toThrow(
        "SIWS Error: issuedAt is not a valid date",
      )
    })

    it("should throw error if expirationTime is invalid", () => {
      const invalidParams = { ...validParams, expirationTime: "invalidTimestamp" as any }
      expect(() => new SiwsMessage(invalidParams)).toThrow(
        "SIWS Error: expirationTime is not a valid date",
      )
    })

    it("should throw error if expirationTime is before issuedAt", () => {
      const invalidParams = {
        ...validParams,
        expirationTime: new Date().getTime(),
        issuedAt: new Date().getTime() + 1000,
      }
      expect(() => new SiwsMessage(invalidParams)).toThrow(
        "SIWS Error: expirationTime must be greater than issuedAt",
      )
    })

    it("should throw error when message has expired", () => {
      const { notBefore, ...invalidParams } = {
        ...validParams,
        expirationTime: new Date().getTime() - 1000,
      }
      expect(() => new SiwsMessage(invalidParams)).toThrow("SIWS Error: message has expired!")
    })

    it("should throw error if notBefore is invalid", () => {
      const invalidParams = { ...validParams, notBefore: "intvalidTimestamp" as any }
      expect(() => new SiwsMessage(invalidParams)).toThrow(
        "SIWS Error: notBefore is not a valid date",
      )
    })

    it("should throw error when if notBefore is at or after expirationTime", () => {
      const now = new Date().getTime()
      const invalidParams = {
        ...validParams,
        issuedAt: now,
        expirationTime: now + 1000,
        notBefore: now + 1000,
      }
      expect(() => new SiwsMessage(invalidParams)).toThrow(
        "SIWS Error: expirationTime must be greater than notBefore",
      )
    })

    it("should throw error if requestId contains newlines", () => {
      const invalidParams = {
        ...validParams,
        requestId: `identifier
on two lines`,
      }
      expect(() => new SiwsMessage(invalidParams)).toThrow(
        "SIWS Error: requestId must not contain newlines",
      )
    })

    it("should throw error if resources are not valid URIs", () => {
      const invalidParams = {
        ...validParams,
        resources: ["invalid#Protocol://some-host:80/path/to/resource"],
      }
      expect(() => new SiwsMessage(invalidParams)).toThrow(
        "SIWS Error: resources must be valid URLs",
      )
    })
  })

  describe("asJson", () => {
    it("should return the same params as json object", () => {
      expect(validSiwsMessage.asJson).toEqual({
        ...validParams,
        chainName: "Substrate",
        issuedAt: validSiwsMessage.asJson.issuedAt,
        version: Siws.CURRENT_VERSION,
      })
    })
  })

  describe("prepareJson", () => {
    it("should return the same params as json string", () => {
      const jsonString = validSiwsMessage.prepareJson()
      const parsedJson = JSON.parse(jsonString) // so we can compare it back to original params

      // issuedAt is generated, so we need to compare it separately
      expect(parsedJson).toEqual({
        ...validParams,
        chainName: "Substrate",
        issuedAt: parsedJson.issuedAt,
        version: Siws.CURRENT_VERSION,
      })
    })
  })

  describe("prepareMessage", () => {
    it("should return the same params as message string", () => {
      const messageString = validSiwsMessage.prepareMessage()
      const message = parseMessage(messageString) // to capture the issued at timestamp which is generated
      const parsedMessage = messageString.split("\n\n")
      expect(parsedMessage).toEqual([
        `${validParams.domain} wants you to sign in with your Substrate account:\n${validParams.address}\n(${validParams.azeroId})`,
        validParams.statement,
        `URI: ${validParams.uri}\nVersion: 1.0.0\nChain ID: ${validParams.chainId}\nNonce: ${
          validParams.nonce
        }\nIssued At: ${new Date(message.issuedAt ?? 0).toISOString()}\nExpiration Time: ${new Date(
          validParams.expirationTime ?? 0,
        ).toISOString()}\nNot Before: ${new Date(
          message.notBefore ?? 0,
        ).toISOString()}\nRequest ID: ${message.requestId}\nResources:\n${message.resources
          ?.map(r => `- ${r}`)
          .join("\n")}`,
      ])
    })
  })

  describe("sign", () => {
    it("should throw error when signRaw method does not exist", async () => {
      const siwsMessage = new SiwsMessage(validParams)
      await expect(
        siwsMessage.sign({
          signer: {},
        } as SiwsSigner),
      ).rejects.toThrow("Wallet does not support signing message.")
    })

    it("should call signRaw with the right parameters", async () => {
      const siwsMessage = new SiwsMessage(validParams)
      const preparedMessage = siwsMessage.prepareMessage()
      const { signature } = await siwsMessage.sign(mockedInjectedExtension as unknown as SiwsSigner)
      expect(mockedInjectedExtension.signer.signRaw).toHaveBeenCalledWith({
        address: validParams.address,
        data: preparedMessage,
        type: "payload",
      })

      expect(signature).toEqual("mockedSignature")
    })
  })

  describe("signJson", () => {
    it("should throw error when signRaw method does not exist", async () => {
      const siwsMessage = new SiwsMessage(validParams)
      await expect(
        siwsMessage.signJson({
          signer: {},
        } as SiwsSigner),
      ).rejects.toThrow("Wallet does not support signing message.")
    })

    it("should call signRaw with the right parameters", async () => {
      const siwsMessage = new SiwsMessage(validParams)
      const jsonMessage = siwsMessage.prepareJson()
      const { signature } = await siwsMessage.signJson(
        mockedInjectedExtension as unknown as SiwsSigner,
      )
      expect(mockedInjectedExtension.signer.signRaw).toHaveBeenCalledWith({
        address: validParams.address,
        data: jsonMessage,
        type: "payload",
      })

      expect(signature).toEqual("mockedSignature")
    })
  })

  describe("verifyAzeroId", () => {
    it("should resolve true (deprecated no-op)", async () => {
      const siwsMessage = new SiwsMessage(validParams)
      await expect(siwsMessage.verifyAzeroId()).resolves.toEqual(true)
    })

    it("should resolve true even for unresolvable azero ids", async () => {
      const siwsMessage = new SiwsMessage({ ...validParams, azeroId: "thisisafake.azero" })
      await expect(siwsMessage.verifyAzeroId()).resolves.toEqual(true)
    })
  })

  describe("verify", () => {
    describe("ed25519", () => {
      const seed = new Uint8Array(32).fill(7)
      const publicKey = ed25519.getPublicKey(seed)
      const address = encodeSs58Address(publicKey)

      it("should return true if signature matches signer and message", async () => {
        const messageString = new SiwsMessage({ ...validParams, address }).prepareMessage()
        const signature = ed25519.sign(utf8ToBytes(messageString), seed)

        const validated = await new SiwsMessage(messageString).verify({
          signature: u8aToHex(signature),
        })
        expect(validated.success).toEqual(true)
      })

      it("should return false if signature does not match signer and message", async () => {
        const messageString = new SiwsMessage({ ...validParams, address }).prepareMessage()
        const signature = ed25519.sign(utf8ToBytes(messageString), seed)

        const validated = await new SiwsMessage(`${messageString}asd`).verify({
          signature: u8aToHex(signature),
        })
        expect(validated.success).toEqual(false)
      })

      it("should return false if address is not the signer", async () => {
        const messageString = new SiwsMessage({
          ...validParams,
          address: VALID_ADDRESS,
        }).prepareMessage()
        const signature = ed25519.sign(utf8ToBytes(messageString), seed)

        const validated = await new SiwsMessage(messageString).verify({
          signature: u8aToHex(signature),
        })
        expect(validated.success).toEqual(false)
      })
    })

    describe("sr25519", () => {
      const secret = sr25519.secretFromSeed(new Uint8Array(32).fill(8))
      const publicKey = sr25519.getPublicKey(secret)
      const address = encodeSs58Address(publicKey)

      it("should return true if signature matches signer and message", async () => {
        const messageString = new SiwsMessage({ ...validParams, address }).prepareMessage()
        const signature = sr25519.sign(secret, utf8ToBytes(messageString))

        const validated = await new SiwsMessage(messageString).verify({
          signature: u8aToHex(signature),
        })
        expect(validated.success).toEqual(true)
      })

      it("should return true if message was signed wrapped in <Bytes> (extension signRaw)", async () => {
        const messageString = new SiwsMessage({ ...validParams, address }).prepareMessage()
        const signature = sr25519.sign(secret, wrapBytes(messageString))

        const validated = await new SiwsMessage(messageString).verify({
          signature: u8aToHex(signature),
        })
        expect(validated.success).toEqual(true)
      })

      it("should return false if signature does not match signer and message", async () => {
        const messageString = new SiwsMessage({ ...validParams, address }).prepareMessage()
        const signature = sr25519.sign(secret, utf8ToBytes(messageString))

        const validated = await new SiwsMessage(`${messageString}asd`).verify({
          signature: u8aToHex(signature),
        })
        expect(validated.success).toEqual(false)
      })
    })

    describe("ecdsa", () => {
      const secret = new Uint8Array(32).fill(9)
      const publicKey = secp256k1.getPublicKey(secret) // compressed, 33 bytes
      const address = encodeSs58Address(blake2b(publicKey, { dkLen: 32 }))

      const signEcdsa = (message: string) => {
        const digest = blake2b(utf8ToBytes(message), { dkLen: 32 })
        // noble "recovered" format is v || r || s, substrate expects r || s || v
        const recovered = secp256k1.sign(digest, secret, { prehash: false, format: "recovered" })
        return concatBytes(recovered.subarray(1), recovered.subarray(0, 1))
      }

      it("should return true if signature matches signer and message", async () => {
        const messageString = new SiwsMessage({ ...validParams, address }).prepareMessage()

        const validated = await new SiwsMessage(messageString).verify({
          signature: u8aToHex(signEcdsa(messageString)),
        })
        expect(validated.success).toEqual(true)
      })

      it("should return false if signature does not match signer and message", async () => {
        const messageString = new SiwsMessage({ ...validParams, address }).prepareMessage()

        const validated = await new SiwsMessage(`${messageString}asd`).verify({
          signature: u8aToHex(signEcdsa(messageString)),
        })
        expect(validated.success).toEqual(false)
      })
    })
  })

  // signatures generated with the real @polkadot/keyring stack, see test/vectors.ts
  describe("polkadot-js cross-compatibility", () => {
    describe.each<[string, SchemeVector]>([
      ["ed25519", ED25519_VECTOR],
      ["sr25519", SR25519_VECTOR],
      ["ecdsa", ECDSA_VECTOR],
    ])("%s", (_type, vector) => {
      it("should verify a raw signature", async () => {
        const validated = await new SiwsMessage(vector.message).verify({
          signature: vector.sigRaw,
        })
        expect(validated.success).toEqual(true)
      })

      it("should verify a signature over the <Bytes>-wrapped message (extension signRaw)", async () => {
        const validated = await new SiwsMessage(vector.message).verify({
          signature: vector.sigWrapped,
        })
        expect(validated.success).toEqual(true)
      })

      it("should verify a type-prefixed signature over the <Bytes>-wrapped message", async () => {
        const validated = await new SiwsMessage(vector.message).verify({
          signature: vector.sigWrappedWithType,
        })
        expect(validated.success).toEqual(true)
      })

      it("should not verify a signature from another pair", async () => {
        const otherSignature =
          vector === ED25519_VECTOR ? SR25519_VECTOR.sigRaw : ED25519_VECTOR.sigRaw
        const validated = await new SiwsMessage(vector.message).verify({
          signature: otherSignature,
        })
        expect(validated.success).toEqual(false)
      })
    })

    describe("verifySIWS", () => {
      it("should return the parsed message when the signature is valid", async () => {
        const siwsMessage = await verifySIWS(
          SR25519_VECTOR.message,
          SR25519_VECTOR.sigWrapped,
          SR25519_VECTOR.address,
        )
        expect(siwsMessage.address).toEqual(SR25519_VECTOR.address)
        expect(siwsMessage.azeroId).toEqual("siws.azero")
      })

      it("should throw when the signature is invalid", async () => {
        await expect(
          verifySIWS(SR25519_VECTOR.message, ED25519_VECTOR.sigRaw, SR25519_VECTOR.address),
        ).rejects.toThrow("SIWS Error: Invalid signature.")
      })
    })
  })
})
