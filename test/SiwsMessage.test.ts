import { Keyring } from "@polkadot/api"
import { SiwsMessage } from "../src/SiwsMessage"
import { parseMessage } from "../src/parseMessage"
import { VALID_ADDRESS, validParams } from "./config"
import type { InjectedExtension } from "@polkadot/extension-inject/types"
import { u8aToHex } from "@polkadot/util"

jest.mock("@azns/resolver-core", () => ({
  resolveDomainToAddress: jest.fn((a0id: string) => {
    const validAzeroIDs = {
      "siws.azero": "5DFMVCaWNPcSdPVmK7d6g81ZV58vw5jkKbQk8vR4FSxyhJBD",
    }

    return { address: validAzeroIDs[a0id] }
  }),
}))

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
        "SIWS Error: issuedAt is not a valid date"
      )
    })

    it("should throw error if expirationTime is invalid", () => {
      const invalidParams = { ...validParams, expirationTime: "invalidTimestamp" as any }
      expect(() => new SiwsMessage(invalidParams)).toThrow(
        "SIWS Error: expirationTime is not a valid date"
      )
    })

    it("should throw error if expirationTime is before issuedAt", () => {
      const invalidParams = {
        ...validParams,
        expirationTime: new Date().getTime(),
        issuedAt: new Date().getTime() + 1000,
      }
      expect(() => new SiwsMessage(invalidParams)).toThrow(
        "SIWS Error: expirationTime must be greater than issuedAt"
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
        "SIWS Error: notBefore is not a valid date"
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
        "SIWS Error: expirationTime must be greater than notBefore"
      )
    })

    it("should throw error if requestId contains newlines", () => {
      const invalidParams = {
        ...validParams,
        requestId: `identifier
on two lines`,
      }
      expect(() => new SiwsMessage(invalidParams)).toThrow(
        "SIWS Error: requestId must not contain newlines"
      )
    })

    it("should throw error if resources are not valid URIs", () => {
      const invalidParams = {
        ...validParams,
        resources: ["invalid#Protocol://some-host:80/path/to/resource"],
      }
      expect(() => new SiwsMessage(invalidParams)).toThrow(
        "SIWS Error: resources must be valid URLs"
      )
    })
  })

  describe("asJson", () => {
    it("should return the same params as json object", () => {
      expect(validSiwsMessage.asJson).toEqual(validParams)
    })
  })

  describe("prepareJson", () => {
    it("should return the same params as json string", () => {
      const jsonString = validSiwsMessage.prepareJson()
      const parsedJson = JSON.parse(jsonString) // so we can compare it back to original params

      // issuedAt is generated, so we need to compare it separately
      expect(parsedJson).toEqual({ ...validParams, issuedAt: parsedJson.issuedAt })
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
          validParams.expirationTime ?? 0
        ).toISOString()}\nNot Before: ${new Date(
          message.notBefore ?? 0
        ).toISOString()}\nRequest ID: ${message.requestId}\nResources:\n${message.resources
          ?.map((r) => `- ${r}`)
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
        } as unknown as InjectedExtension)
      ).rejects.toThrow("Wallet does not support signing message.")
    })

    it("should call signRaw with the right parameters", async () => {
      const siwsMessage = new SiwsMessage(validParams)
      const preparedMessage = siwsMessage.prepareMessage()
      const { signature } = await siwsMessage.sign(
        mockedInjectedExtension as unknown as InjectedExtension
      )
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
        } as unknown as InjectedExtension)
      ).rejects.toThrow("Wallet does not support signing message.")
    })

    it("should call signRaw with the right parameters", async () => {
      const siwsMessage = new SiwsMessage(validParams)
      const jsonMessage = siwsMessage.prepareJson()
      const { signature } = await siwsMessage.signJson(
        mockedInjectedExtension as unknown as InjectedExtension
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
    it("should return true if azero id is valid", async () => {
      const siwsMessage = new SiwsMessage(validParams)
      const validAzeroId = await siwsMessage.verifyAzeroId()
      expect(validAzeroId).toEqual(true)
    })

    it("should return false if azero id is invalid", async () => {
      const siwsMessage = new SiwsMessage({ ...validParams, azeroId: "thisisafake.azero" })
      const validAzeroId = await siwsMessage.verifyAzeroId()
      expect(validAzeroId).toEqual(false)
    })
  })

  describe("verify", () => {
    const keyring = new Keyring()
    // DO NOT USE THIS MNEMONIC IN PRODUCTION
    const testPair = keyring.addFromMnemonic(
      "master style couple pulse viable fire mistake used unfold height oak romance"
    )
    it("should return true if signature matches signer and message", async () => {
      const siwsMessage = new SiwsMessage({ ...validParams, address: testPair.address })
      const messageString = siwsMessage.prepareMessage()

      // mimic verification flow
      const message = parseMessage(messageString)
      const signature = testPair.sign(messageString)
      const validated = await message.verify({
        signature: u8aToHex(signature),
      })
      expect(validated.success).toEqual(true)
    })

    it("should return false if signature does not match signer and message", async () => {
      const siwsMessage = new SiwsMessage({ ...validParams, address: testPair.address })
      const messageString = siwsMessage.prepareMessage()

      // mimic verification flow
      const message = parseMessage(`${messageString}abcd`)
      const signature = testPair.sign(messageString)
      const validated = await message.verify({
        signature: u8aToHex(signature),
      })
      expect(validated.success).toEqual(false)
    })
  })
})
