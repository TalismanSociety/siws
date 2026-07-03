import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"

// https://astro.build/config
export default defineConfig({
  // served as static assets under /docs by the demo app's Cloudflare Worker
  base: "/docs",
  integrations: [
    starlight({
      title: "SIWS",
      logo: {
        dark: "./src/assets/Logo-dark.svg",
        light: "./src/assets/Logo-light.svg",
        replacesTitle: true,
      },
      customCss: ["./src/styles/custom.css"],
      social: {
        github: "https://github.com/TalismanSociety/siws",
      },
      sidebar: [
        {
          label: "Sign-In with Substrate",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Overview", link: "/getstarted/overview/" },
            { label: "Installation", link: "/getstarted/installation/" },
            {
              label: "Quickstart Guide",
              items: [
                { label: "Pre-requisites", link: "/getstarted/guide/prerequisites/" },
                { label: "Connect Wallet", link: "/getstarted/guide/connect/" },
                { label: "Sign In", link: "/getstarted/guide/signin/" },
                { label: "The Backend", link: "/getstarted/guide/backend/" },
                { label: "Access", link: "/getstarted/guide/access/" },
              ],
            },
          ],
        },
        {
          label: "API References",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "SiwsMessage", link: "/reference/siws-message/" },
            { label: "Address", link: "/reference/address/" },
            { label: "parseMessage", link: "/reference/parse-message/" },
            { label: "parseJson", link: "/reference/parse-json/" },
            { label: "verifySIWS", link: "/reference/verify-siws/" },
            // { label: "Comparison to SIWE", link: "/general/siwe_comparison/" },
            // { label: "Framework Support", link: "/general/framework_support/" },
            // { label: "How it Works", link: "/general/howitworks/" },
          ],
        },
      ],
    }),
  ],
})
