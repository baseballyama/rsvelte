---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

Align the secondary N-API compile entries with the main compiler boundary: `compileBuffers` and `compileModuleBuffers` now throw structured `CompileError` objects, `compileBuffers` accepts `modernAst`, and `compileWithCssHash` no longer hides an invalid non-function `cssHash` option.
