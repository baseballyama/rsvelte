# @rsvelte/svelte-check

## 0.1.6

### Patch Changes

- cf82369: fix(svelte-check): make `--tsgo` see project ambient declarations (`src/app.d.ts`)

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

## 0.1.5

### Patch Changes

- ebab7f2: fix(svelte-check): make `--tsgo` type-check Svelte projects (jsx + embedded shims + merged rootDirs)

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

## 0.1.4

### Patch Changes

- 6ac76c2: - Escape GitHub Actions command property values in `--output machine`/GH-format diagnostics.
  - Apply `warning_filter`, forward module-level warnings, and make machine output line-safe.
  - Rebuild against the bundled `@rsvelte/compiler` correctness work.

## 0.1.3

### Patch Changes

- d95f3bb: fix: port Svelte 5.55.9 follow-ups — `nullish-coallescence-omittance` SSR
  stringify omittance (upstream `a5df6616e`) and `Percentage` keyframe
  double-print (upstream `ca3f35bf7`). Class / style / innerHTML SSR paths
  and the head-element SSR / `css-keyframes-percent` print path are still
  tracked as follow-ups in the per-suite skip lists.

## 0.1.2

### Patch Changes

- 4db15ed: Roll up everything that has landed on `main` since `0.3.1` / `0.1.1`.

  - compiler: track upstream Svelte `5.51.4` → `5.51.5`.
  - vite-plugin-svelte-native: NAPI bindings now disable jemalloc's
    `initial-exec` TLS model so the dylib is safe to `dlopen` from Node on
    glibc hosts.
  - svelte-check / svelte2tsx: republish to pick up the routine dependency
    refresh (`serde_json` 1.0.150, `rustc-hash` 2.1.2).
  - Release workflow now publishes via npm OIDC trusted publishing (no
    `NPM_TOKEN`), Node 22, and `npm publish --provenance` for every
    platform sub-package — every tarball ships with provenance attestation.
  - Docs: README rewritten around the OXC integration goal, with per-task
    benchmark breakdown (parser / svelte2tsx / svelte-check) mirroring
    the live `/benchmark` page.

## 0.1.1

### Patch Changes

- b3322a0: fix(svelte-check): restore execute bit on the platform binary so `pnpm dlx`/`npx` work

  The 0.1.0 platform tarballs ship `svelte-check` without the execute bit
  because `pnpm pack` (used by `pnpm publish` and therefore `changeset
publish` when pnpm is detected) normalises file modes to 0644. Running
  `pnpm dlx @rsvelte/svelte-check` (or `npx`) on a fresh install fails with
  `spawnSync ... EACCES`.

  Three layers, so a single regression can't break this again:

  - `bin/svelte-check.cjs` chmods the binary +x best-effort before
    `spawnSync`, so already-published 0.x tarballs become usable for any
    end user on their next install.
  - Each non-Windows platform package gains a `prepack` hook that runs
    `chmod +x svelte-check` so the source mode is right before pack.
  - A new `scripts/publish-platform-binaries.mjs` step runs `npm publish`
    for the platform packages before `changeset publish`. `npm pack`
    preserves modes, so the tarballs that actually hit the registry ship
    `-rwxr-xr-x`. `changeset publish` then skips those already-published
    versions and continues with the rest of the workspace as before.

  The Windows platform package (`svelte-check.exe`) is unaffected — Windows
  ignores POSIX mode bits.

- 1153e43: test(release): patch-bump every package to validate the GitHub Actions release pipeline end-to-end

  The local one-shot `publish-all-local.sh` is the manual escape hatch; the
  intended steady-state path is `release.yml` (changesets/action + matrix
  binary builds + `pnpm publish`). This changeset bumps each of the four
  top-level packages by `patch` so we can:

  1. Watch changesets/action open the "Version Packages" PR.
  2. Merge it.
  3. Watch the release workflow build the 5-triple matrix for both
     `svelte_check` and the NAPI cdylib, stage them via
     `scripts/stage-svelte-check-binaries.mjs` /
     `scripts/stage-vps-binaries.mjs`, and publish all 14 npm packages.
  4. Confirm every `@rsvelte/*` on the registry shows the new patch version.

  `fixed` groups in `.changeset/config.json` make the 5 svelte-check
  platform packages and the 5 vps-native platform packages follow their
  main package automatically, so this changeset only names the four
  top-level packages.

  The submodule fork (`@rsvelte/vite-plugin-svelte`) lives in a separate
  repo and isn't part of this pipeline — it's published independently.
