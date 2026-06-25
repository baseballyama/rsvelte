---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte": patch
---

docs(readme): publish the correct README for each npm package

`@rsvelte/compiler` shipped the `rsvelte_lint` crate's README (the linter docs)
because `wasm-pack` copies the built crate's README into `pkg/`; `finalize-pkg.mjs`
now overlays the compiler-specific README into `pkg/README.md`. `@rsvelte/vite-plugin-svelte`
was still titled `@sveltejs/vite-plugin-svelte` with broken relative doc links —
rewritten for the rsvelte fork with absolute links.
