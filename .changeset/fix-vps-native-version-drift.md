---
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(vite-plugin-svelte-native): correct stale VERSION constant and guard against future drift

`index.cjs` hardcoded `VERSION = '5.51.3'` with a comment claiming it was "synced
manually against `submodules/svelte/packages/svelte/package.json`" — the submodule
had since moved on to `5.56.3` with nothing catching the mismatch. `VERSION` feeds
downstream `gte(VERSION, …)` feature-detection in the `@rsvelte/vite-plugin-svelte`
fork, so a stale value would silently misfire once a feature gate crosses a
version the two disagree on.

Updates `VERSION` to `5.56.3` and adds `scripts/dev/check-vps-version.mjs`
(`pnpm run check:vps-version`), which compares the exported constant against the
submodule's `package.json` and fails loudly on drift. It no-ops when the submodule
isn't checked out. A new `vps-version-check` CI job runs it on every PR/push.
