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

This is an example full stack Next.JS dApp for implementing Sign-In with Substrate. It can be used as a reference for adding authentication to your dApp using just Substrate wallets, no third party providers needed!

The example dApp has a `/api/protected` route that only authenticated users can access. From the UI, you will see how the sign in process works after connecting your wallet. After that you may use the `/api/protected` to generate random text! In reality, you will issue a JWT token with some custom claims, that will later be used to query data from your database in your protected APIs.

## Running the example dApp

1. Install dependencies

```bash
$ npm run install
```

2. Start the dev server

```bash
$ npm run dev
```

3. Visit the example app at `https://localhost:3000`

## Documentation

Check out our [full guide](https://siws-docs.pages.dev/) on how to implement SIWS into your dapp!

## Support

- [Talisman](https://talisman.xyz)
- [Web3 Foundation](https://grants.web3.foundation/)
