export const VALID_ADDRESS = "5DFMVCaWNPcSdPVmK7d6g81ZV58vw5jkKbQk8vR4FSxyhJBD"

export const ALICE = {
  generic: "5Hjayx5oBSeYYKdNgTwEcDDGFhGafAXLPW8HhayxdiGRnA18",
  polkadot: "16ft8HLs3Dv1yrdte6zEkN3R7KGEMU5UTzrmrsyKBoHwxcnP",
  kusama: "JFCeGRfoofUHySpTAkHWAaGQHYpTqLWqsy36FFv7WUvXQFy",
}

export const validParams = {
  domain: "siws.xyz",
  address: VALID_ADDRESS,
  statement: "This is a test statement",
  uri: "https://siws.xyz",
  nonce: "1234567890",
  chainId: "polkadot",
  // expires in 30 seconds
  expirationTime: new Date().getTime() + 30_000,
}
