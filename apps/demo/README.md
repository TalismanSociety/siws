<br/>

<p align="center">
  <a href="https://siws.xyz">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/TalismanSociety/siws/blob/main/assets/Logo.svg?raw=true">
        <img alt="siws logo" src="https://github.com/TalismanSociety/siws/blob/main/assets/Logo.svg?raw=true" width="auto" height="60">
      </picture>
</a>
</p>
<p align="center">
  Sign-In with Substrate
<p>

<br>

![SIWS Example](https://github.com/TalismanSociety/siws/blob/main/assets/siws-example.png?raw=true "SIWS Example")

# Sign-In with Substrate Example dApp

This is an example full stack [TanStack Start](https://tanstack.com/start) dApp for implementing Sign-In with Substrate, deployable as a Cloudflare Worker. It can be used as a reference for adding authentication to your dApp using just Substrate wallets, no third party providers needed!

It connects to wallets through the standard `window.injectedWeb3` interface directly (see `src/lib/wallet.ts`) — no wallet SDK required. Authentication lives in three server functions (`src/server/auth.ts`): issue a nonce (httpOnly cookie), verify the signed SIWS message and issue a JWT, and a protected call that only authenticated users can access. In reality, you will issue a JWT token with some custom claims, that will later be used to query data from your database in your protected APIs.

## Running the example dApp

1. Install dependencies (from the monorepo root)

```bash
$ pnpm install
```

2. Create `apps/demo/.dev.vars` with a `JWT_SECRET`

```
JWT_SECRET=some-random-secret
```

3. Start the dev server

```bash
$ pnpm --filter siws-demo dev
```

4. Visit the example app at `http://localhost:5173`

## Deploying to Cloudflare Workers

```bash
$ wrangler secret put JWT_SECRET
$ pnpm --filter siws-demo deploy
```

## Documentation

Check out our [full guide](https://siws-docs.pages.dev/) on how to implement SIWS into your dapp!

## Support

- [Talisman](https://talisman.xyz)
- [Web3 Foundation](https://grants.web3.foundation/)
