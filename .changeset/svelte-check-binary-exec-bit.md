---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): restore execute bit on the platform binary so `pnpm dlx`/`npx` work

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
