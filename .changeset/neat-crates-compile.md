---
"@rsvelte/compiler": patch
"@rsvelte/svelte-check": patch
"@rsvelte/svelte2tsx": patch
---

Split the embeddable compiler, TypeScript projection, project checker, bindings support, and development tools into ownership-focused Rust crates while preserving the existing JavaScript and CLI behavior. Add the stable `rsvelte` facade, crates.io package gates, and an independently versioned `rsvelte_esrap` 0.8.0 release.
