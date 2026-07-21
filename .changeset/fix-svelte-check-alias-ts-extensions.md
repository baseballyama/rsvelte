---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): set `allowImportingTsExtensions` in the overlay tsconfig so aliased `.svelte` imports (e.g. SvelteKit's `$lib/...`) no longer require it in the user's tsconfig
