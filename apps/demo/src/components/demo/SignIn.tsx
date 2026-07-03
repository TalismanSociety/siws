import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getInjected, type WalletAccount } from "@/lib/wallet"
import { Address, SiwsMessage } from "@talismn/siws"
import { useToast } from "../ui/use-toast"
import { Account } from "./Account"
import { ToastAction } from "../ui/toast"
import { SIWS_DOMAIN } from "../../lib/constants"

type Props = {
  accounts: WalletAccount[]
  onCancel: () => void
  onSignedIn: (account: WalletAccount, jwtToken: string) => void
}

export const SignIn: React.FC<Props> = ({ accounts, onCancel, onSignedIn }) => {
  const { dismiss, toast } = useToast()

  // auto select if only 1 account is connected
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | undefined>(
    accounts.length === 1 ? accounts[0] : undefined,
  )
  const [signingIn, setSigningIn] = useState(false)

  const handleSignIn = async () => {
    try {
      dismiss()
      if (!selectedAccount) throw new Error("No account selected!")

      const address = Address.fromSs58(selectedAccount.address ?? "")
      if (!address)
        return toast({
          title: "Invalid address",
          description: "Your address is not a valid Substrate address.",
        })

      setSigningIn(true)
      // request nonce from server
      const nonceRes = await fetch("/api/nonce")
      const data = await nonceRes.json()
      const { nonce } = data

      const siwsMessage = new SiwsMessage({
        domain: SIWS_DOMAIN,
        uri: `https://${SIWS_DOMAIN}`,
        // use prefix of chain your dapp is on:
        address: address.toSs58(0),
        nonce,
        statement: "Welcome to SIWS! Sign in to see how it works.",
        chainName: "Polkadot",
        // expires in 2 mins
        expirationTime: Date.now() + 2 * 60 * 1000,
      })

      const injected = await getInjected(selectedAccount.meta.source)
      const signed = await siwsMessage.sign(injected)

      const verifyRes = await fetch("/api/verify", {
        method: "POST",
        body: JSON.stringify({ ...signed, address: address.toSs58(0) }),
      })
      const verified = await verifyRes.json()
      if (verified.error) throw new Error(verified.error)

      // Hooray we're signed in!
      onSignedIn(selectedAccount, verified.jwtToken)
    } catch (e) {
      toast({
        title: "Uh oh! Couldn't sign in.",
        description: e instanceof Error ? e.message : "An error occurred",
        variant: "destructive",
        action: (
          <ToastAction altText="Try Again" onClick={handleSignIn}>
            Try Again
          </ToastAction>
        ),
      })
    } finally {
      setSigningIn(false)
    }
  }

  // dismiss toast when sign in flow is exited
  // biome-ignore lint/correctness/useExhaustiveDependencies: run cleanup only on unmount
  useEffect(() => () => dismiss(), [])

  return (
    <div className="h-full flex flex-1 flex-col">
      <p className="text-white text-lg">Sign In</p>
      <p className="text-stone-500">Select an account to sign in with.</p>
      <div className="my-4 flex flex-col h-full overflow-y-auto gap-3 p-2 rounded-lg border border-stone-800">
        {accounts.length > 0 ? (
          accounts.map(account => (
            <Account
              key={account.address}
              account={account}
              selected={selectedAccount?.address === account.address}
              onSelect={() => {
                dismiss()
                setSelectedAccount(account)
              }}
            />
          ))
        ) : (
          <p className="text-stone-500 text-center mt-4">
            No account connected.
            <br />
            Connect at least 1 account to sign in with.
          </p>
        )}
      </div>
      <div className="grid gap-3">
        <Button disabled={!selectedAccount || signingIn} onClick={handleSignIn}>
          {signingIn ? "Signing In..." : "Sign In"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
