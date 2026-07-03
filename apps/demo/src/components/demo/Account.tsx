import clsx from "clsx"
import truncateMiddle from "truncate-middle"
import { Identicon } from "@/components/ui/identicon"
import type { WalletAccount } from "@/lib/wallet"

type Props = {
  onSelect: () => void
  account: WalletAccount
  selected: boolean
}

export const Account: React.FC<Props> = ({ account, selected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        "border cursor-pointer px-2 py-1 rounded-lg flex items-center justify-between pr-4 w-full text-left",
        selected ? "border-stone-400" : "border-stone-50/0 hover:bg-stone-800/50",
      )}
    >
      <div className="flex items-center gap-4">
        <Identicon value={account.address} size={32} />
        <div className="flex flex-col">
          <div className="text-white text-base">{account.meta.name}</div>
          <div className="text-stone-500 text-xs">
            {truncateMiddle(account.address, 5, 5, "...")}
          </div>
        </div>
      </div>
      <div className={clsx("h-2 w-2 rounded-full", selected ? "bg-stone-200" : "bg-stone-800")} />
    </button>
  )
}
