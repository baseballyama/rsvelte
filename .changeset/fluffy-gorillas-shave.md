---
'@rsvelte/svelte-check': patch
---

Read the whole `compilerOptions` object out of `svelte.config.*` / the inline `svelte()` / `sveltekit()` plugin options instead of a handful of keys, and validate it the way `svelte.compile` does. `accessors` / `customElement` now reach the TSX projection (they decide which `let` bindings are component exports, i.e. the component's public type), and an option key the compiler does not recognise, an illegal value, or an option removed in Svelte 5 is reported as `options_unrecognised` / `options_invalid_value` / `options_removed` on every checked component instead of being silently dropped.
