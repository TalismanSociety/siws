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

# lib tsc --watch + demo vite dev (http://localhost:5173), in parallel
pnpm dev

# docs dev server with hot reload (http://localhost:4321/docs/)
pnpm dev:docs

# lib + demo + docs dev servers, all in parallel
pnpm dev:all

# build everything (lib first, then apps)
pnpm build

# scoped builds
pnpm build:lib    # library only
pnpm build:demo   # demo app (includes a fresh docs build copied to /docs)
pnpm build:docs   # rebuild docs + copy into the demo's public/docs

# run tests
pnpm test

# format / lint (biome)
pnpm format
pnpm lint

# preview the built demo (app + docs) in the workerd runtime
pnpm preview

# deploy demo + docs to Cloudflare Workers
# ("run" is required — plain `pnpm deploy` triggers pnpm's built-in deploy command)
pnpm run deploy
```

## Releases

`@talismn/siws` is published from `packages/siws` via semantic-release on push to `main`.
Conventional commits drive the version bump; scope demo/docs-only changes as `chore(demo):` / `chore(docs):` (or any type with those scopes) so they don't trigger a library release.
