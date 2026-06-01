---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): put svelte2tsx shims in `include` so `--tsgo` resolves ambients

The overlay tsconfig listed the svelte2tsx shim `.d.ts` files (which declare the
ambient `svelteHTML` / `__sveltets_2_*` symbols the generated `.tsx` shadows
rely on) only in `files`. `tsc` applies their `declare global` augmentations
from there, but `tsgo` only does so when the shims are part of `include` —
so `--tsgo` regressed every `.svelte` file with spurious "Cannot find name
'svelteHTML' / '__sveltets_2_*'" errors. The shims now go in `include`, which
both backends honour, so `svelte-check --tsgo` reports 0 errors on a clean
SvelteKit project again.
