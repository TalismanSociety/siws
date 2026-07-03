// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import jwt from "jsonwebtoken"
import crypto from "node:crypto"

type Data = {
  randomText?: string
  error?: string
}

// THIS IS A PROTECTED SERVICE FOR AUTHENTICATED USERS ONLY
export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const authorisationHeader = req.headers.authorisation
  if (typeof authorisationHeader !== "string")
    return res.status(401).json({ error: "You are not logged in!" })

  const jwtToken = authorisationHeader.split(" ")[1]

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) return res.status(500).json({ error: "JWT_SECRET is not configured" })

  try {
    // verify that user's id is correct
    jwt.verify(jwtToken, jwtSecret)

    res.status(200).json({ randomText: crypto.randomBytes(8).toString("hex") })
  } catch {
    res.status(401).json({ error: "You are not logged in!" })
  }
}
