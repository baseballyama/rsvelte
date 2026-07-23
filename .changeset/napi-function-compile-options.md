---
"@rsvelte/vite-plugin-svelte-native": minor
"@rsvelte/vite-plugin-svelte": minor
---

feat(napi): support function-form compile options (customElement/css/runes/warningFilter) and a constant cssHashOverride

The NAPI shim now resolves the function forms of `customElement`, `css`, and `runes`
(`({ filename }) => value`) once at the binding boundary before handing the plain value
to the compiler, matching Svelte's `parametric()` normalization. `warningFilter` is
applied as a post-filter on the returned `warnings` array — equivalent to Svelte's
emit-time filter since warnings never affect codegen. A new `cssHashOverride` string
option lets callers pass a pre-computed constant CSS scope hash without the callback
bridge; `@rsvelte/vite-plugin-svelte` now uses it for its HMR-stable hash instead of the
previously ignored `cssHash = () => hash` closure.
