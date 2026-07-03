import { Inter } from "next/font/google"
import localFont from "next/font/local"

export const unbounded = localFont({
  src: [
    {
      path: "../../../public/fonts/Unbounded-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Unbounded-Medium.woff2",
      weight: "500",
      style: "medium",
    },
    // using Bold for semi-bold because there is no semi-bold font
    {
      path: "../../../public/fonts/Unbounded-Bold.woff2",
      weight: "700",
      style: "semi-bold",
    },
    {
      path: "../../../public/fonts/Unbounded-Black.woff2",
      weight: "800",
      style: "bold",
    },
  ],
  display: "swap",
  variable: "--font-unbounded",
})

export const inter = Inter({ subsets: ["latin"] })
