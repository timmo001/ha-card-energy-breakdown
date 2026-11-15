# Agent guide

The Energy Breakdown Card: a Home Assistant Lovelace card that shows current energy use by area and entity. It's a Lit and TypeScript web component, bundled with rolldown into `dist/energy-breakdown-card.js`, and installed through HACS as a dashboard.

## Layout

- `src/`: the card's source.
- `vendor/home-assistant-frontend/`: a shallow submodule of Home Assistant's frontend, kept for reference. Don't edit it, and exclude it from lint and format changes.
- `docs/`: screenshots for the README.
- `dist/`: build output, gitignored. Release CI builds it.

## Stack

- pnpm, pinned in `package.json`'s `packageManager`. Keep pnpm; don't convert to Bun or npm.
- Node, pnpm, hk, pkl and the linters are pinned in `mise.toml` and locked in `mise.lock`. Run `mise install` before the first task in a checkout.
- Oxlint with the shared `@timmo001/oxlint-rules` preset, type-aware and type-checked (`oxlint.config.ts`).
- Prettier for formatting; `.prettierignore` skips lockfiles and vendored code.
- `hk.pkl` runs `mise run lint` on pre-push, plus the shared Markdown, YAML, Actions and shell lints from `timmo001/workflows`.

## Checks

- `mise run check`: lint, format check and build. Run it before pushing.
- `mise run lint`, `mise run format`, `mise run build` for one at a time.
- CI runs `Lint` (Oxlint) and `Build`, and `HACS Validate`. The `Build` and `oxlint` checks are required on `main`.

## Changes

- Commit to `main` for small, self-contained changes, and use a branch and pull request for larger work.
- One logical change per commit, with a short imperative subject and no Conventional Commit prefix.
- Don't commit `dist/`, `.mise/` or local agent settings.
- Publishing a GitHub release runs the `Release` workflow.
