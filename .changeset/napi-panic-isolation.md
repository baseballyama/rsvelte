---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

Isolate a panic during `compile()` (or any other NAPI export) as a thrown JS error instead of aborting the whole Node process. Every `#[napi]` export now sets `catch_unwind`, and the shipped `.node` builds with a new `dist-napi` profile (`panic = "unwind"`) instead of the shared `dist` profile's `panic = "abort"` — mirroring the isolation `@rsvelte/lint` and the language server already have. Measured overhead from the unwind tables + wrapper is small: roughly +2-4% per `compile()` call (~33.6-34.5us -> ~35.0-35.3us), a worthwhile tradeoff for not losing the whole process to one bad input.
