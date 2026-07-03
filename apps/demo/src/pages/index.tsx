import { Demo } from "@/components/demo"
import { Button } from "@/components/ui/button"
import { W3FLogo } from "@/components/assets/W3FLogo"
import { MadeByTalisman } from "@/components/assets/MadeByTalisman"
import { TalismanLogo } from "@/components/assets/TalismanLogo"

export default function Home() {
  return (
    <main className={`flex min-h-screen flex-col items-center justify-between py-24 px-4 lg:px-24`}>
      <div className="w-full max-w-4xl flex gap-8 flex-col lg:flex-row items-center lg:items-start">
        <div className="w-full p-4 flex flex-col items-center lg:items-start gap-2 text-center lg:text-left h-full lg:min-h-[384px]">
          <h1 className="text-white text-5xl font-medium font-unbounded">SIWS</h1>
          <p className="text-white text-lg max-w-md">
            Sign-in with Substrate, an authentication standard for signing-in with a Substrate
            account.
          </p>
          <p className="text-stone-500">By the Signet team at Talisman</p>
          <div className="flex items-center gap-4 mt-4">
            <a href="https://docs.siws.xyz/" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg">
                Docs
              </Button>
            </a>
            <a href="https://github.com/TalismanSociety/siws" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg">
                Github
              </Button>
            </a>
            <a href="https://matrix.to/#/#siws-general:matrix.org" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg">
                Contact
              </Button>
            </a>
          </div>
          <div className="text-white mt-8 lg:mt-auto grid grid-cols-2 items-center gap-8 max-w-[320px] px-4">
            <W3FLogo />
            <TalismanLogo />
          </div>
        </div>
        <div className="w-full max-w-[380px] select-none">
          <Demo />
        </div>
      </div>
      <div className="mt-12 px-4 flex justify-center lg:justify-end w-full max-w-4xl">
        <MadeByTalisman />
      </div>
    </main>
  )
}
