import { Address, isAzeroId } from "./utils.js"
import { SiwsMessage } from "./SiwsMessage.js"

export const parseJson = (json: string): SiwsMessage | undefined => {
  try {
    const {
      domain,
      address,
      azeroId,
      statement,
      uri,
      version,
      nonce,
      chainName,
      chainId,
      expirationTime,
      issuedAt,
      notBefore,
      requestId,
      resources,
    } = JSON.parse(json)

    if (!domain || !address || !uri || !version || !nonce) return undefined

    return new SiwsMessage({
      domain,
      address,
      azeroId,
      statement,
      uri,
      version,
      nonce,
      chainName,
      chainId,
      expirationTime,
      issuedAt,
      notBefore,
      requestId,
      resources,
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
    let version: string | undefined
    let nonce: string | undefined
    let chainName: string | undefined
    let chainId: number | string | undefined
    let expirationTime: number | undefined
    let issuedAt: number | undefined
    let notBefore: number | undefined
    let requestId: string | undefined
    let resources: string[] | undefined

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

    // remove the brackets
    azeroId = headers[2]?.slice(1, -1)
    if (azeroId && !isAzeroId(azeroId)) throw new Error("Invalid Azero ID format")

    // parse statement: statement exists if there are 3 sections
    statement = sections[2] ? sections[1] : undefined
    if (statement !== undefined && statement.length === 0) throw new Error()

    // parse uri, nonce, chain id, issued at, expiration time
    const bodyLines = body.split("\n")
    bodyLines.forEach((line) => {
      const [key, value] = line.split(": ")
      if (key === "URI") uri = value
      if (key === "Version") version = value
      if (key === "Nonce") nonce = value
      if (key === "Chain ID") chainId = value
      if (key === "Issued At") issuedAt = new Date(value).getTime()
      if (key === "Expiration Time") expirationTime = new Date(value).getTime()
      if (key === "Not Before") notBefore = new Date(value).getTime()
      if (key === "Request ID") requestId = value
    })

    // parse additional resources
    const resourcesMatch = /Resources:\s*\n((?:- [^\n]*\n*)+)/g.exec(body)
    if (resourcesMatch?.length) {
      resources = []
      const resourcesList = resourcesMatch[1]
      const resourceMatches = resourcesList.matchAll(/- ([^\n]*)\n?/g)
      for (const resource of resourceMatches) {
        resources.push(resource[1])
      }
    }

    // missing important fields
    if (!domain || !address || !uri || !nonce || !chainName) throw new Error()

    return new SiwsMessage({
      domain,
      address,
      statement,
      uri,
      version,
      azeroId,
      nonce,
      chainName,
      chainId,
      expirationTime,
      issuedAt,
      notBefore,
      requestId,
      resources,
    })
  } catch (e) {
    throw new Error("SIWS Error: Invalid SIWS message.", { cause: e })
  }
}
