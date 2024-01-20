import { Address } from "./utils"
import { SiwsMessage } from "./SiwsMessage"

export const parseJson = (json: string): SiwsMessage | undefined => {
  try {
    const { domain, address, azeroId, statement, uri, nonce, chainName, chainId, expirationTime, issuedAt } =
      JSON.parse(json)

    if (!domain || !address || !uri || !nonce) return undefined

    return new SiwsMessage({
      domain,
      address,
      azeroId,
      statement,
      uri,
      nonce,
      chainName,
      chainId,
      expirationTime,
      issuedAt,
    })
  } catch (e) {
    throw new Error("SIWS Error: Invalid SIWS json message.")
  }
}

export const parseMessage = (message: string): SiwsMessage => {
  // In case a valid JSON message is passed
  try {
    const jsonSiwsMessage = parseJson(message)
    if (jsonSiwsMessage) return jsonSiwsMessage
  } catch (e) {}

  try {
    let domain: string | undefined
    let address: string | undefined
    let azeroId: string | undefined
    let statement: string | undefined
    let uri: string | undefined
    let nonce: string | undefined
    let chainName: string | undefined
    let chainId: number | string | undefined
    let expirationTime: number | undefined
    let issuedAt: number | undefined

    const sections = message.split("\n\n")
    const firstSection = sections[0]
    const body = sections[2] ?? sections[1]

    const headers = firstSection.split("\n")

    // parse domain and chain name
    const introLine = headers[0]
    const introLineParts = introLine.split(" wants you to sign in with your ")
    if (introLineParts.length !== 2) throw new Error()
    domain = introLineParts[0]

    if (introLineParts[1].length === 8) throw new Error()
    chainName = introLineParts[1].replace(" account:", "")

    // parse address
    address = headers[1]
    if (!address || !Address.fromSs58(address)) throw new Error()

    // parse statement: statement exists if there are 3 sections
    statement = sections[2] ? sections[1] : undefined
    if (statement !== undefined && statement.length === 0) throw new Error()

    // parse uri, nonce, chain id, issued at, expiration time
    const bodyLines = body.split("\n")
    bodyLines.forEach((line) => {
      const [key, value] = line.split(": ")
      if (key === "URI") uri = value
      if (key === "Azero ID") azeroId = value
      if (key === "Nonce") nonce = value
      if (key === "Chain ID") chainId = value
      if (key === "Issued At") issuedAt = new Date(value).getTime()
      if (key === "Expiration Time") expirationTime = new Date(value).getTime()
    })

    // missing important fields
    if (!domain || !address || !uri || !nonce || !chainName) throw new Error()

    return new SiwsMessage({
      domain,
      address,
      statement,
      uri,
      azeroId,
      nonce,
      chainName,
      chainId,
      expirationTime,
      issuedAt,
    })
  } catch (e) {
    throw new Error("SIWS Error: Invalid SIWS message.")
  }
}
