import { parseMessage } from "../src/parseMessage"
import { SiwsMessage } from "../src/SiwsMessage"
import { VALID_ADDRESS, validParams } from "./config"

const validSiwsMessage = new SiwsMessage(validParams)

const invalidMessages = {
  "empty string": "",
  "random string": "random string",
  number: 1234,
  "missing domain": `wants you to sign in with your Substrate account:\n${VALID_ADDRESS}\n\nURI: https://siws.xyz\nNonce: 1234567890`,
  "missing address": `siws.xyz wants you to sign in with your Substrate account:\n\nURI: https://siws.xyz\nNonce: 1234567890`,
  "missing uri": `siws.xyz wants you to sign in with your Substrate account:\n${VALID_ADDRESS}\n\nNonce: 1234567890`,
  "missing nonce": `siws.xyz wants you to sign in with your Substrate account:\n${VALID_ADDRESS}\n\nURI: https://siws.xyz`,
  "missing body": `siws.xyz wants you to sign in with your Substrate account:\n${VALID_ADDRESS}`,
  "missing body with statement": `siws.xyz wants you to sign in with your Substrate account:\n${VALID_ADDRESS}\n\nThis is a test statement`,
}

describe("parseMessage", () => {
  it("should parse a valid message correctly", () => {
    const parsed = parseMessage(validSiwsMessage.prepareMessage())
    expect(parsed.asJson).toStrictEqual(validSiwsMessage.asJson)
  })

  it("should parse a valid json message correctly", () => {
    const parsed = parseMessage(validSiwsMessage.prepareJson())
    expect(parsed.asJson).toStrictEqual(validSiwsMessage.asJson)
  })

  it("should throw an error if address is invalid", () => {
    const invalidParams = { ...validParams, address: "invalid" }
    expect(() => parseMessage(new SiwsMessage(invalidParams).prepareMessage())).toThrow(
      "SIWS Error: address is not a valid substrate address"
    )
  })

  Object.entries(invalidMessages).forEach(([key, invalidMessage]) => {
    it(`should throw error when message is ${key}`, () => {
      expect(() => parseMessage(invalidMessage.toString())).toThrow(
        "SIWS Error: Invalid SIWS message."
      )
    })
  })
})
