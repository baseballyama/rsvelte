---
"@rsvelte/compiler": minor
"@rsvelte/svelte2tsx": patch
"@rsvelte/oxlint-plugin": patch
"@rsvelte/language-server": patch
---

Ship a compiler-only browser wasm as the default @rsvelte/compiler entry, retain the stable /wasm subpath, and add compileModule for JavaScript rune modules. Move lint and svelte2tsx to the separately loaded /playground and /playground/wasm exports, and update their consumers.
