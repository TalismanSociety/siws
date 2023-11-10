import { SiwsMessage } from "../src/SiwsMessage"
import { VALID_ADDRESS, validParams } from "./config"

describe("SiwsMessage", () => {
  it("should create an SIWS instance with correct params", () => {
    const siwsMessage = new SiwsMessage(validParams)
    expect(siwsMessage.address).toEqual(VALID_ADDRESS)
  })

  it("should throw error when address is invalid", () => {
    const invalidParams = { ...validParams, address: "invalid" }
    expect(() => new SiwsMessage(invalidParams)).toThrow(
      "SIWS Error: address is not a valid substrate address"
    )
  })

  it("should throw error when message has expired", () => {
    const invalidParams = { ...validParams, expirationTime: new Date().getTime() - 1000 }
    expect(() => new SiwsMessage(invalidParams)).toThrow("SIWS Error: message has expired!")
  })
})
