---
"@rsvelte/svelte-check": patch
---

feat(svelte-check): read Svelte `compilerOptions` from an inline `sveltekit()` plugin call in `vite.config`

SvelteKit 2.62.0 lets you pass the Svelte config (`compilerOptions`,
`preprocess`, …) inline to the `sveltekit()` plugin in `vite.config.{js,ts}`
instead of a separate `svelte.config.js`, and ignores `svelte.config.js`
entirely when you do (see https://svelte.dev/docs/kit/configuration).

`svelte-check`'s static config reader previously only recognised a
`svelte()` plugin call. It now also recognises `sveltekit({ compilerOptions })`
and, matching SvelteKit's behaviour, suppresses `svelte.config.js` when the
`sveltekit()` plugin is given inline config (the plain `svelte()` plugin keeps
its merge semantics). `--watch` now reruns on `vite.config.{mjs,cjs}` and the
`svelte.config.{mjs,cjs}` variants as well.
