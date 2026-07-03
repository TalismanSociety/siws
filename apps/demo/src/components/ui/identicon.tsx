/** Deterministic gradient avatar — dependency-free identicon stand-in. */

const hashHue = (value: string, seed: number) => {
  let hash = seed
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) % 360
  return hash
}

type Props = {
  value: string
  size?: number
}

export const Identicon: React.FC<Props> = ({ value, size = 32 }) => (
  <div
    aria-hidden="true"
    className="rounded-full shrink-0"
    style={{
      width: size,
      height: size,
      background: `linear-gradient(135deg, hsl(${hashHue(value, 7)} 70% 55%), hsl(${hashHue(value, 131)} 75% 40%))`,
    }}
  />
)
