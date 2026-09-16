---
"@rsvelte/vite-plugin-svelte": patch
---

vite-plugin-svelte: update `obug` to v3

v3 drops the `main`/`module` fields in favour of `exports`; the plugin's
`createDebug` / `enabled` imports resolve through the `node` condition unchanged.
