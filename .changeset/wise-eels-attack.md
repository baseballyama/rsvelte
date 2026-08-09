---
'@rsvelte/svelte-check': patch
---

Read `compilerOptions.namespace` from `svelte.config.*` / the inline `svelte()` / `sveltekit()` plugin options and use it for the TSX projection, which was hardcoded to `html`. `namespace: 'foreign'` now keeps element attribute casing as upstream svelte-check does, and a namespace the Svelte 5 compiler rejects is reported as `options_invalid_value` per checked component instead of being ignored.
