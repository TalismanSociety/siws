import { parseMessage } from "../src/parseMessage"
import { SiwsMessage } from "../src/SiwsMessage"
import { VALID_ADDRESS, validParams } from "./config"

const validSiwsMessage = new SiwsMessage(validParams)

const invalidMessages = {
  "empty string": "",
  "random string": "random string",
  number: 1234,
  "missing domain": `wants you to sign in with your Substrate account:\n${VALID_ADDRESS}\n\nURI: https://siws.xyz\nNonce: 1234567890`,
  "missing chainName": `siws.xyz wants you to sign in with your account:\n${VALID_ADDRESS}\n\nURI: https://siws.xyz\nNonce: 1234567890`,
  "missing address": `siws.xyz wants you to sign in with your Substrate account:\n\nURI: https://siws.xyz\nNonce: 1234567890`,
  "missing uri": `siws.xyz wants you to sign in with your Substrate account:\n${VALID_ADDRESS}\n\nNonce: 1234567890`,
  "missing nonce": `siws.xyz wants you to sign in with your Substrate account:\n${VALID_ADDRESS}\n\nURI: https://siws.xyz`,
  "missing body": `siws.xyz wants you to sign in with your Substrate account:\n${VALID_ADDRESS}`,
  "missing body with statement": `siws.xyz wants you to sign in with your Substrate account:\n${VALID_ADDRESS}\n\nThis is a test statement`,
  "missing statement text": `siws.xyz wants you to sign in with your Substrate account:\n${VALID_ADDRESS}\n\n\n\nNonce: 1234567890\nURI: https://siws.xyz`,
  "invalid azero id": `siws.xyz wants you to sign in with your Substrate account:\n${VALID_ADDRESS}\n(siws.azeerrooooo)\n\nThis is a test statement\n\nNonce: 1234567890\nURI: https://siws.xyz`,
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

describe("parseJson", () => {
  const validJsonMessage = validSiwsMessage.prepareJson()

  const invalidJsons = {
    "invalid address": JSON.stringify({ ...validSiwsMessage.asJson, address: "invalid" }),
    "missing domain": JSON.stringify({ ...validSiwsMessage.asJson, domain: undefined }),
    "missing address": JSON.stringify({ ...validSiwsMessage.asJson, address: undefined }),
    "missing uri": JSON.stringify({ ...validSiwsMessage.asJson, uri: undefined }),
    "missing nonce": JSON.stringify({ ...validSiwsMessage.asJson, nonce: undefined }),
  }
  it("should parse a valid json message correctly", () => {
    const parsed = parseMessage(validJsonMessage)
    expect(parsed.asJson).toStrictEqual(validSiwsMessage.asJson)
  })

  it("should throw error if message is not valid json", () => {
    expect(() => parseMessage("")).toThrow("SIWS Error: Invalid SIWS message.")
  })

  Object.entries(invalidJsons).forEach(([key, invalidJson]) => {
    it(`should throw error when json is ${key}`, () => {
      expect(() => parseMessage(invalidJson)).toThrow("SIWS Error: Invalid SIWS message.")
    })
  })
})
