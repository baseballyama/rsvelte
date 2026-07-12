---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(esrap/napi): defensive printer fixes and compileModule arena leak

esrap's `Dedent` no longer underflows on unbalanced command streams and template
quasis are indexed defensively. The `compileModule` zero-copy NAPI path now uses
the same leak-safe `BumpGuard` envelope helper as the component path, so a buffer
creation error no longer leaks the bump arena.
