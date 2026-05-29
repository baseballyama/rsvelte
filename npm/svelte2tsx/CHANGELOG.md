# @rsvelte/svelte2tsx

## 0.1.5

### Patch Changes

- 6ac76c2: Pick up the bundled `@rsvelte/compiler` correctness work and support `expected.error.json` start/end-offset comparison in the svelte2tsx error fixtures.
- Updated dependencies [6ac76c2]
  - @rsvelte/compiler@0.6.0

## 0.1.4

### Patch Changes

- Updated dependencies [a7cdebe]
- Updated dependencies [1e9483a]
- Updated dependencies [f1d65ad]
- Updated dependencies [1cd18da]
- Updated dependencies [b720d08]
- Updated dependencies [3756592]
- Updated dependencies [6c1b11d]
- Updated dependencies [3a1b613]
- Updated dependencies [43d20b1]
- Updated dependencies [752055a]
- Updated dependencies [1088eba]
- Updated dependencies [a4c5334]
- Updated dependencies [c74572c]
- Updated dependencies [356b7f6]
- Updated dependencies [6be628d]
- Updated dependencies [6ea2484]
- Updated dependencies [412eb00]
- Updated dependencies [a110812]
- Updated dependencies [8613663]
- Updated dependencies [a8a5f77]
- Updated dependencies [0ee799d]
- Updated dependencies [b4a23af]
- Updated dependencies [a97d9af]
- Updated dependencies [bed3534]
- Updated dependencies [fbb7d44]
- Updated dependencies [e438591]
  - @rsvelte/compiler@0.5.0

## 0.1.3

### Patch Changes

- Updated dependencies [34a4593]
- Updated dependencies [ccb02b2]
  - @rsvelte/compiler@0.4.0

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

- Updated dependencies [4db15ed]
  - @rsvelte/compiler@0.3.2

## 0.1.1

### Patch Changes

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

- Updated dependencies [1153e43]
  - @rsvelte/compiler@0.3.1
