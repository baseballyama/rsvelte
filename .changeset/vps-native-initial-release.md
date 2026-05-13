---
'@rsvelte/vite-plugin-svelte-native': minor
---

Initial public release of `@rsvelte/vite-plugin-svelte-native` and its prebuilt-binary platform packages (`darwin-arm64`, `darwin-x64`, `linux-x64-gnu`, `linux-arm64-gnu`, `win32-x64-msvc`).

Wave 3 (v0.3) of the rsvelte ecosystem port: NAPI bindings for the rsvelte compiler exposing `compile`, `compileModule`, `svelte2tsx`, `hmrDiff`, `resolveId`, and `preprocess` (which bridges JS preprocessor groups through `ThreadsafeFunction` and resolves the returned `Promise<Processed>`). Intended to back a future `vite-plugin-svelte` shim.
