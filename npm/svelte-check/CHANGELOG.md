# @rsvelte/svelte-check

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
