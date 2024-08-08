import { Address } from "../src/utils"
import { VALID_ADDRESS, ALICE } from "./config"

const validAddress = Address.fromSs58(VALID_ADDRESS) as Address

describe("Address", () => {
  // all chains should give the same pubkeys, which is what we will test later
  const pubkeysByChain = Object.entries(ALICE).reduce(
    (acc, [chain, address]) => {
      acc[chain] = (Address.fromSs58(address) as Address).toPubKey()
      return acc
    },
    {} as Record<string, string>,
  )

  describe("construction", () => {
    describe("fromSs58", () => {
      it("should return false if the address is invalid", () => {
        expect(Address.fromSs58("invalid")).toBe(false)
      })

      Object.entries(ALICE).forEach(([chain, address]) => {
        it(`should return an Address if ${chain} address is valid`, () => {
          expect(Address.fromSs58(address)).toBeInstanceOf(Address)
        })
      })
    })

    describe("fromPubKey", () => {
      it("should return false if the address is invalid", () => {
        expect(Address.fromPubKey("invalid")).toBe(false)
      })
      Object.entries(pubkeysByChain).forEach(([chain, pubkey]) => {
        it(`should return an Address if ${chain} pubkey is valid`, () => {
          expect(Address.fromPubKey(pubkey)).toBeInstanceOf(Address)
        })
      })
    })
  })

  describe("methods", () => {
    const [genericAddress, polkadotAddress, kusamaAddress] = Object.values(ALICE).map(
      address => Address.fromSs58(address) as Address,
    )
    describe("isEqual", () => {
      // make sure we can check equality between addresses across different chains
      it("should return true if addresses are equal", () => {
        expect(genericAddress.isEqual(genericAddress)).toBe(true)
        expect(genericAddress.isEqual(polkadotAddress)).toBe(true)
        expect(genericAddress.isEqual(kusamaAddress)).toBe(true)
        expect(polkadotAddress.isEqual(kusamaAddress)).toBe(true)
        expect(validAddress.isEqual(validAddress)).toBe(true)
      })

      it("should return false if addresses are not equal", () => {
        const otherAddress = Address.fromSs58(ALICE.polkadot) as Address
        expect(validAddress.isEqual(otherAddress)).toBe(false)
      })
    })

    describe("toSs58", () => {
      it("should return the correct ss58 address according to prefix", () => {
        expect(genericAddress.toSs58(42)).toBe(ALICE.generic)
        expect(genericAddress.toSs58(0)).toBe(ALICE.polkadot)
        expect(genericAddress.toSs58(2)).toBe(ALICE.kusama)
      })
    })

    describe("toPubKey", () => {
      it("should return the correct pubkey", () => {
        expect(genericAddress.toPubKey()).toBe(pubkeysByChain.generic)
      })
    })
  })
})
