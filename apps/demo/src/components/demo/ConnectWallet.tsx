import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getAccounts, type WalletAccount } from "@/lib/wallet"

type Props = {
  onAccounts: (accounts: WalletAccount[]) => void
}

export const ConnectWallet: React.FC<Props> = ({ onAccounts }) => {
  const [connecting, setConnecting] = useState(false)

  const handleConnectWallet = async () => {
    setConnecting(true)
    try {
      onAccounts(await getAccounts())
    } catch {
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <p className="text-white text-lg">Try it out</p>
      <p className="text-stone-500 mb-4">Connect your wallet to try out this cloneable demo app.</p>
      <Button onClick={handleConnectWallet} disabled={connecting}>
        {connecting ? "Connecting wallet..." : "Connect Wallet"}
      </Button>
    </div>
  )
}
