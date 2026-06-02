---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): make `--tsgo` see project ambient declarations (`src/app.d.ts`)

`svelte-check --tsgo` did not load a project's ambient declaration files —
most notably the default SvelteKit `src/app.d.ts` — so its `declare global` /
`namespace App` augmentations (`App.Locals`, `App.PageData`, …) were invisible
and any code relying on them reported spurious `TS2304` / `TS2307`. The
non-tsgo checker was unaffected.

Two causes in the overlay tsconfig builder
(`crates/rsvelte_core/src/svelte_check/overlay.rs`):

- **`include` not resolved through `extends`.** A SvelteKit project keeps its
  `include` in the generated `./.svelte-kit/tsconfig.json`, not the root
  tsconfig. `read_tsconfig_specs` only read the directly-passed config, so it
  forwarded nothing and the overlay's `include` stayed `["./svelte/**/*"]` —
  which pulls in the `.tsx` shadows and their imports, but never the
  non-imported ambient `.d.ts` files. It now walks the `extends` chain
  (per-key, nearest-defining-config wins, mirroring TypeScript), the same way
  `rootDirs` was already resolved.

- **Glob specs mis-rebased.** Rebasing an `include` glob with
  `path_relative(cache_dir, base.join(spec))` fed `**` into path resolution as
  if it were a real directory, yielding garbage like
  `../../../../src/**/*.ts`. Rebasing now splits off the leading non-glob
  directory prefix, anchors it on the CWD, diffs it lexically against the
  overlay dir, and re-appends the glob tail verbatim.

Forwarding the project's resolved `include` puts `src/app.d.ts` (and SvelteKit's
generated `ambient.d.ts`) back in the `--tsgo` program, matching the non-tsgo
checker. Verified end-to-end on a SvelteKit portfolio: an `App.Locals` /
ambient-global `app.d.ts` that errored under the published build now reports 0
errors.
