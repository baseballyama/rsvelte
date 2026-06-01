---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): make `--tsgo` type-check Svelte projects (jsx + embedded shims + merged rootDirs)

`svelte-check --tsgo` reported a flood of spurious errors on a clean SvelteKit
project (154 on the portfolio that surfaced this) where the non-tsgo checker
reported none. Three gaps in the overlay tsconfig:

- **No `jsx`.** The `.tsx` shadows svelte2tsx emits need a JSX backend, so every
  `.svelte` → `.tsx` import failed with TS6142 "'--jsx' is not set". The overlay
  now sets `jsx: "preserve"`.
- **Shims never resolved.** The svelte2tsx shim `.d.ts` files (declaring
  `svelteHTML` / `__sveltets_2_*`) were looked up from
  `node_modules/svelte2tsx`, which a standalone rsvelte install doesn't ship —
  so every ambient reference errored. The shims are now vendored into the
  binary and materialised into the cache dir, referenced via `files`.
- **`rootDirs` clobbered.** The overlay hardcoded `rootDirs: [".", "./svelte"]`,
  replacing the project's own — so SvelteKit's generated `$types` (mapped via
  its `rootDirs`) stopped resolving (TS2307). The overlay now resolves the
  base tsconfig's `rootDirs` through the `extends` chain and merges them with
  the overlay's `./svelte`.

`svelte-check --tsgo` now matches the non-tsgo checker (0 errors on a clean
SvelteKit project).
