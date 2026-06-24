---
"@rsvelte/svelte-check": patch
---

svelte-check: find a workspace-hoisted `tsgo` (or `tsc`) in monorepos.
`find_compiler` only looked in `<workspace>/node_modules/.bin`, but pnpm
(and npm/yarn workspaces) hoist the binary to the **repo-root**
`node_modules/.bin`, so a nested package (`apps/foo/frontend/app`) has no
local `.bin/tsgo`. `--tsgo` therefore silently fell back to `tsc`, which is
~3-4x slower — the whole point of `--tsgo` was lost. The lookup now walks
the workspace and every ancestor directory, preferring a hoisted `tsgo`
over a locally-resolvable `tsc`. On a large SvelteKit monorepo this took the
per-package check from ~34s (silent tsc) to ~8s (actual tsgo).
