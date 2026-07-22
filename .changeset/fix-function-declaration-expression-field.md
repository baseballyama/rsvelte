---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(parse): emit `FunctionDeclaration.expression` (always `false`) to match acorn's key order (`id`, `expression`, `generator`, `async`, `params`, `body`)

The binary NAPI raw-parse envelope (`napi_raw_parse.rs`'s writer, consumed only
by `@rsvelte/vite-plugin-svelte-native`'s `parse-envelope.js` decoder) carries
the same field, so both packages need this release. The envelope's `VERSION`
is bumped to 2 alongside the wire-format change (one extra bool byte on
`FunctionDeclaration` payloads).
