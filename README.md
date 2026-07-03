<div align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/TalismanSociety/siws/blob/main/assets/Logo-dark.svg">
        <img alt="siws logo" src="https://github.com/TalismanSociety/siws/blob/main/assets/Logo-light.svg" width="auto" height="60">
    </picture>
</div>

# SIWS — Sign-In with Substrate

Monorepo for SIWS.

## Packages

| Path | Description |
| --- | --- |
| [`packages/siws`](packages/siws) | The [`@talismn/siws`](https://www.npmjs.com/package/@talismn/siws) library |
| [`apps/demo`](apps/demo) | Next.js demo dapp showcasing the full sign-in flow |
| [`apps/docs`](apps/docs) | Documentation site (Astro + Starlight) |

## Development

Requires [pnpm](https://pnpm.io) 11+.

```bash
pnpm install

# build everything (lib first, then apps)
pnpm build

# run lib tests
pnpm --filter @talismn/siws test

# lib tsc --watch + demo next dev, in parallel
pnpm dev

# format / lint (biome)
pnpm format
pnpm lint
```

## Releases

`@talismn/siws` is published from `packages/siws` via semantic-release on push to `main`.
Conventional commits drive the version bump; scope demo/docs-only changes as `chore(demo):` / `chore(docs):` (or any type with those scopes) so they don't trigger a library release.
