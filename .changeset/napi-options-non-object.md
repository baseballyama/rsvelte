---
'@rsvelte/vite-plugin-svelte-native': patch
---

Reject a non-object options argument at the `compile` / `compileModule` native
boundary. Upstream's `object()` validator opens with a shape guard that runs
before its key loop; without it a string, number, boolean, function or array
decoded to all-`None` and the component compiled with silent defaults, so
`compile(src, '{"generate":"server"}')` returned client output and no error.
