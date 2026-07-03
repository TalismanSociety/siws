import { verifySIWS } from "@talismn/siws"
import { createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie } from "@tanstack/react-start/server"
import { SignJWT, jwtVerify } from "jose"
import { SIWS_DOMAIN } from "@/lib/constants"

const getJwtKey = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not configured")
  return new TextEncoder().encode(secret)
}

/**
 * Issues a nonce and stores it in an httpOnly cookie for replay protection.
 */
export const getNonce = createServerFn({ method: "POST" }).handler(async () => {
  const nonce = crypto.randomUUID()

  /** This is just an example. In production, you should encrypt your cookies. */
  setCookie("siws-nonce", nonce, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  })

  return { nonce }
})

/**
 * Verifies the signed SIWS message and issues a JWT on success.
 */
export const verifySignIn = createServerFn({ method: "POST" })
  .validator((data: { message: string; signature: string; address: string }) => data)
  .handler(async ({ data }) => {
    // make sure the session is valid and has a nonce from previous request
    const nonce = getCookie("siws-nonce")
    if (!nonce) throw new Error("Invalid session! Please try again.")

    // verify that signature is valid
    const siwsMessage = await verifySIWS(data.message, data.signature, data.address)

    // validate that nonce is correct to prevent replay attack
    if (nonce !== siwsMessage.nonce) throw new Error("Invalid nonce! Please try again.")

    // validate that domain is correct to prevent phishing attack
    if (siwsMessage.domain !== SIWS_DOMAIN)
      throw new Error("SIWS Error: Signature was meant for different domain.")

    // now that user has proved their ownership to the signing address
    // we can create a JWT token that allows users to authenticate themselves
    // so they don't have to sign in again
    const jwtToken = await new SignJWT({ address: siwsMessage.address })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .sign(getJwtKey())

    return { jwtToken }
  })

/**
 * A protected service for authenticated users only.
 */
export const getProtectedText = createServerFn({ method: "POST" })
  .validator((data: { jwtToken?: string }) => data)
  .handler(async ({ data }) => {
    if (!data.jwtToken) throw new Error("You are not logged in!")

    try {
      await jwtVerify(data.jwtToken, getJwtKey())
    } catch {
      throw new Error("You are not logged in!")
    }

    const bytes = crypto.getRandomValues(new Uint8Array(8))
    const randomText = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")

    return { randomText }
  })
