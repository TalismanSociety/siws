/**
 * Minimal hex/bytes helpers, replacing `@polkadot/util`.
 */

export const isHex = (value: unknown): value is `0x${string}` =>
  typeof value === "string" &&
  value.startsWith("0x") &&
  value.length % 2 === 0 &&
  /^0x[\da-fA-F]*$/.test(value)

/**
 * Decodes a hex string (0x prefix optional) to bytes.
 * Non-throwing on invalid input, mirroring `@polkadot/util` `hexToU8a` leniency:
 * invalid characters decode to garbage bytes rather than throwing.
 */
export const hexToU8a = (hex: string): Uint8Array => {
  const value = hex.startsWith("0x") ? hex.slice(2) : hex
  const bytes = new Uint8Array(Math.ceil(value.length / 2))
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(value.slice(i * 2, i * 2 + 2), 16) || 0
  }
  return bytes
}

export const u8aToHex = (bytes: Uint8Array): `0x${string}` => {
  let hex = ""
  for (const byte of bytes) hex += byte.toString(16).padStart(2, "0")
  return `0x${hex}`
}

export const u8aEq = (a: Uint8Array, b: Uint8Array): boolean =>
  a.length === b.length && a.every((byte, index) => byte === b[index])
