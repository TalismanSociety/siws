// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "node:crypto"

type Data = {
  nonce: string
}

export default function handler(_req: NextApiRequest, res: NextApiResponse<Data>) {
  const nonce = crypto.randomUUID()

  /** This is just an example. In production, you should encrypt your cookies. */
  res.setHeader("Set-Cookie", `siws-nonce=${nonce}; Path=/; HttpOnly; Secure; SameSite=Strict`)
  res.status(200).json({ nonce })
}
