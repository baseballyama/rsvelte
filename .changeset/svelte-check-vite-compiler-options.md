---
"@rsvelte/svelte-check": patch
---

`svelte-check` now reads the diagnostic-relevant Svelte `compilerOptions`
(`experimental.async`, `runes`) from project config instead of always
compiling with defaults. The options are statically parsed (oxc) from both
`svelte.config.{js,cjs,mjs,ts,mts}` and the `vite.config.{js,ts,…}`
Svelte-plugin call (`svelte({ compilerOptions })`), merged with vite-plugin
precedence (`defaults → svelte.config → inline`) to mirror
vite-plugin-svelte's own order. This fixes spurious `experimental_async`
errors on components using top-level / derived `await` when async is enabled
via the vite plugin — the placement SvelteKit increasingly uses (#1034). The
`--incremental` warnings cache carries a config fingerprint and invalidates
when the resolved options change.
