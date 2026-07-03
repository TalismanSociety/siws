---
title: Quickstart Guide
description: Add Sign-In with Substrate to your app with just a few lines of code.
---

This guide shows you how to implement Sign-In with Substrate (SIWS) in a full stack [TanStack Start](https://tanstack.com/start) application. The same concepts apply to any framework — the only SIWS-specific parts are constructing the message, signing it with the user's wallet, and verifying it on your backend. The goal of this guide is to:

- Let users connect their wallet
- Allow selecting a connected wallet to sign in with
- Initiate a sign in request with the backend
- Validate the sign in request from the backend
- Issue a JWT that allows users to authenticate themselves and use the protected API

To follow along, you need a Substrate Extension Wallet. We recommend [Talisman Wallet](https://www.talisman.xyz/wallet).

The full code for this tutorial can be found in [`apps/demo` of the SIWS monorepo](https://github.com/TalismanSociety/siws/tree/main/apps/demo).
