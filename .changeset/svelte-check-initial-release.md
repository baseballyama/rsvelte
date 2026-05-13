---
'@rsvelte/svelte-check': minor
---

Initial public release of `@rsvelte/svelte-check` and its prebuilt-binary platform packages (`darwin-arm64`, `darwin-x64`, `linux-x64-gnu`, `linux-arm64-gnu`, `win32-x64-msvc`).

Wave 2 (v0.10) of the rsvelte ecosystem port: a Rust-powered `svelte-check` CLI with walker + overlay + tsgo backend, an incremental cache (including the per-file `warnings.json`), watch mode, parallel compile, hi-res `svelte2tsx` source maps, and SvelteKit kit-file `addedCode` augmentation for both `.ts` and `.js` files. `svelte.config.js` `kit.files` overrides are statically parsed and applied.
