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

# Sign-In with Substrate

`@talismn/siws` is a package that lets you easily allow users to authenticate themselves with your off chain services by signing in with their Substrate accounts.

## Problem & Motivation

When building Signet, an enterprise tool for companies to manage their on-chain organisations in the Substrate ecosystem, we needed a way for users to prove that they own an address before they can request for resources relevant to that address. There was no solution yet that offered good user experience, where users could easily understand what they are signing with their wallet. Inspired by [Sign-in with Ethereum](https://github.com/spruceid/siwe), we decided to build the right tool for the Substrate ecosystem.

## Features

- Construct human readable sign in message
- Construct message in stringified JSON format
- Decode and parse string message of both format into JS object
- Basic validations (e.g. expiration)
- Utility `Address` to help with dealing with address string
- Utility `verifySIWS` to help verify that a signature is valid
- Full Typescript support

## Installation

```bash
$ npm install @talismn/siws
```

## Usage

### Frontend

```typescript
// 1. import necessary modules
import { web3FromSource } from "@polkadot/extension-dapp"
import { SiwsMessage } from "@talismn/siws"

// 2. handle sign in after `account` is selected
const handleSignIn = async () => {
  const siws = new SiwsMessage({
    domain: "localhost",
    uri: "http://localhost:3000/sign-in",
    address: account.address,
    nonce, // a challenge generated from backend
    statement: "Welcome to my dapp!",
  })

  // get the injector so we can sign the message
  const injectedExtension = await web3FromSource(account.meta.source)
  const signed = await siws.sign(injectedExtension)

  // api to sign in with backend
  await signIn(signed)
}
```

### Backend

```typescript
// 1. import siws
import { verifySIWS } from "@talismn/siws"

// 2. backend handler to handle sign in request
const handleSignInRequest = ({ signature, message, address }) => {
  // verify that signature is valid
  const siwsMessage = await verifySIWS(message, signature, address)

  // ... user has proven ownership of address and hence authenticated!
}
```

## Documentation

Check out our [full guide](https://docs.siws.xyz/) on how to implement SIWS into your dapp!

## Support

- [Talisman](https://talisman.xyz)
- [Web3 Foundation](https://grants.web3.foundation/)
