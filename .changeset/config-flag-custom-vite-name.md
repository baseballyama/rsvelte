---
'@rsvelte/svelte-check': patch
---

Read `--config` correctly when it names a Vite config under a non-standard filename. `rsvelte-check --config vite.custom.config.js` classified the file by asking whether its name began with `vite.config`, which is false for exactly the names the flag exists to support, so the `svelte()` plugin's inline `compilerOptions` were never read and a project with `experimental.async` enabled reported `experimental_async` on every top-level `await`. Upstream's `load-config` decides the other way round — a Svelte config is one named `svelte.config.*`, everything else is tried as a Vite config first — which is now the single predicate all three `--config` consumers share. A relative `--config` path is also resolved against the workspace before the loader reads it, instead of only for the existence check.
