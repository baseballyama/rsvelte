---
'@rsvelte/cli': patch
---

`rsvelte lint` reads `compilerOptions.experimental.async` from `svelte.config.js`, so `svelte/valid-compile` no longer reports `experimental_async` for top-level `await` when the option is on.
