/**
 * Cross-compatibility vectors generated once with the real polkadot-js stack
 * (@polkadot/keyring + @polkadot/util-crypto), so signatures produced by
 * polkadot wallets are proven to verify against this package's implementation
 * without keeping any @polkadot/* dependency around.
 *
 * All pairs derive from the test-only mnemonic:
 * "master style couple pulse viable fire mistake used unfold height oak romance"
 * DO NOT USE THIS MNEMONIC IN PRODUCTION.
 *
 * - sigRaw: pair.sign(message)
 * - sigWrapped: pair.sign(u8aWrapBytes(message)) — how extensions sign `signRaw` payloads
 * - sigWrappedWithType: pair.sign(u8aWrapBytes(message), { withType: true }) — 65-byte
 *   type-prefixed MultiSignature, byte-for-byte what polkadot-js extension / Talisman emit
 */

export interface SchemeVector {
  address: string
  publicKey: string
  message: string
  sigRaw: string
  sigWrapped: string
  sigWrappedWithType: string
}

const buildMessage = (address: string) =>
  [
    `siws.xyz wants you to sign in with your Substrate account:`,
    `${address}`,
    `(siws.azero)`,
    ``,
    `This is a test statement`,
    ``,
    `URI: https://siws.xyz`,
    `Version: 1.0.0`,
    `Chain ID: polkadot`,
    `Nonce: 1234567890`,
    `Issued At: 2026-07-02T00:00:00.000Z`,
    `Request ID: client-specific request ID`,
    `Resources:`,
    `- http://some-domain/path/to/resource`,
    `- wss://frequency-rpc.dwellir.com`,
  ].join("\n")

export const ED25519_VECTOR: SchemeVector = {
  address: "5CyuYMPYdpjVEZaWWJ2ebBy4Am6kVZ1zWDAL4RBhmue1MBuW",
  publicKey: "0x289356c5b3ae788acb730b508830de4a297a3d4ac4519f6859c899b49673c67c",
  message: buildMessage("5CyuYMPYdpjVEZaWWJ2ebBy4Am6kVZ1zWDAL4RBhmue1MBuW"),
  sigRaw:
    "0x7a0ddd4980be494cd1b6a5425b5983318d6df461409cb0a2fb98c6bebef5624ca19804a20a8a7bb9d763356da3d759b524d1b5d4ed2fba13f2203ab42e786e03",
  sigWrapped:
    "0x88e8b45c29c3adfc76f2ffed216cda5eddd08a3553fa24e136ab6598afdcaf0322caea972e1c2f6290c3c505ffc200a423bda7e4c25fc24aa6e9281e26164604",
  sigWrappedWithType:
    "0x0088e8b45c29c3adfc76f2ffed216cda5eddd08a3553fa24e136ab6598afdcaf0322caea972e1c2f6290c3c505ffc200a423bda7e4c25fc24aa6e9281e26164604",
}

export const SR25519_VECTOR: SchemeVector = {
  address: "5H8pPt19q3ErLgZFg5YuzfU7u5pskUiKSjk7QK77LYHDbpXw",
  publicKey: "0xe050287ead0dfaf65a9bd75b2a453b12621aaf28b62c59b9127c7bb23e896200",
  message: buildMessage("5H8pPt19q3ErLgZFg5YuzfU7u5pskUiKSjk7QK77LYHDbpXw"),
  sigRaw:
    "0x66f6edc54e06330da0b8e7c91d456b242e7117bf041c82431e0237508bb2342126983e6fe4051c9e502d004b792ea0ac5340e979222cd6d606f7e25c6c6fa684",
  sigWrapped:
    "0x5ca3321dbaac392fa5d7c52c1615d16545de718ec8d507e19d38209af1f97f4fd39088a0d1e020fbb29f29a2b80c2f5ce2209a8eec68987c5f567bfa77b27e8e",
  sigWrappedWithType:
    "0x01c8d7087d9adcb8332072514f7c7d655d97be0dc5bfbd202b69f5a00bae08cb7c0efb40082e7948f4d737e9e580cbc2a0cc05a66a37346372be59390cee67668c",
}

export const ECDSA_VECTOR: SchemeVector = {
  address: "5FurPszDQ9ajA3jxbfmWfzfYVhddSRAUyMZg7KVgj6FBJXpX",
  publicKey: "0x03549f38bfc1fe062317e4c19ec63f28ebc94feed7c699de1b782d9aa29027782a",
  message: buildMessage("5FurPszDQ9ajA3jxbfmWfzfYVhddSRAUyMZg7KVgj6FBJXpX"),
  sigRaw:
    "0xa5f03dc0274bb866c12fd2850503b2a2c708c6c5b6795e714eb054792ffe948156556be178f6f46e1a5713b322bb246fd1792487ad8d384d80de1e720c5a688e01",
  sigWrapped:
    "0x55d39eedbecaea93f4abc7ac337d05f76e985c7a443e738c50d8eb28436d38bf095d01a5ea0f821981120d29f70fe306660b56d8de0c9872f9e47da47984af0b00",
  sigWrappedWithType:
    "0x0255d39eedbecaea93f4abc7ac337d05f76e985c7a443e738c50d8eb28436d38bf095d01a5ea0f821981120d29f70fe306660b56d8de0c9872f9e47da47984af0b00",
}

/**
 * Captured from a real Ledger device (Polkadot Generic app) signing a Talisman
 * `signRaw` request. The app follows the Substrate convention for payloads over
 * 256 bytes: it signs blake2b-256(<Bytes>message</Bytes>), not the raw bytes.
 * ed25519, signature is over the 32-byte hash of the 328-byte wrapped message.
 */
export const LEDGER_ED25519_HASHED_VECTOR = {
  address: "13TtFyPPgw2ZU4TmH8bmR27Q1qTiT6XPTAprUbkgsJEWEjJx",
  message: [
    `siws.xyz wants you to sign in with your Polkadot account:`,
    `13TtFyPPgw2ZU4TmH8bmR27Q1qTiT6XPTAprUbkgsJEWEjJx`,
    ``,
    `Welcome to SIWS! Sign in to see how it works.`,
    ``,
    `URI: https://siws.xyz`,
    `Version: 1.0.0`,
    `Nonce: 6fdc70db-e2b8-4c54-880b-91908df961e5`,
    `Issued At: 2026-07-06T07:48:58.645Z`,
    `Expiration Time: 2026-07-06T07:50:58.645Z`,
  ].join("\n"),
  signature:
    "0x1d883bbf527b8483959e5a61effbee330ff85d820901ca0081a4d4876b9adbef9f27b90d5e01d1d96222d037fa9fa591b88f6eb3faac3186f53023a674ed6b0e",
}

/** encodeAddress(publicKey, prefix) outputs, covering 1-byte and 2-byte ss58 prefixes */
export const SS58_VECTOR = {
  publicKey: "0x289356c5b3ae788acb730b508830de4a297a3d4ac4519f6859c899b49673c67c",
  encodings: {
    0: "1vCggecVbzxg6b2Tw5ejLoD2P6QBra8ahtpDiB4KzfXXiNx",
    2: "DVXCfjRGBkQzDPxGzqhV9L4KMNzJDqAxb15T5TfFhrW6Qjx",
    42: "5CyuYMPYdpjVEZaWWJ2ebBy4Am6kVZ1zWDAL4RBhmue1MBuW",
    64: "cEWVQSmDhW5pTLFmXqfk66dPuBmkYDE5qjuZnBqKJx2MoGx3J",
    255: "yGDeiA7i9WYwEXnz9VqSRx8LKX9o17X6MZdWknxqntWvMWN6X",
    16383: "yNWFGScpYit32NVUNZNrvju66EioXa4m9StR2Z2Mm4PP5Eomb",
  } as Record<number, string>,
}
