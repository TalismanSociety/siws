import { useCallback, useState } from "react"
import { useToast } from "../components/ui/use-toast"

export const useProtectedService = () => {
  const [randomText, setRandomText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { dismiss, toast } = useToast()

  const generate = useCallback(
    async (jwtToken?: string) => {
      dismiss()
      setLoading(true)
      try {
        const res = await fetch("/api/protected", {
          headers: {
            Authorisation: `Bearer ${jwtToken}`,
          },
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setRandomText(data.randomText)
      } catch (e) {
        setRandomText(null)
        toast({
          title: "Failed to generate random text",
          description: e instanceof Error ? e.message : "An error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [dismiss, toast],
  )

  return { generate, randomText, loading }
}
