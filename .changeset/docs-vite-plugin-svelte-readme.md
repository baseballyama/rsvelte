---
"@rsvelte/vite-plugin-svelte": patch
---

docs(readme): document both plain-Vite and SvelteKit setups

The README only covered direct `svelte()` import in a plain Vite config, with no
guidance for SvelteKit — where the Svelte plugin is loaded from inside
`@sveltejs/kit` and must be swapped via a package-manager override
(`npm:@rsvelte/vite-plugin-svelte`) rather than added to `vite.config`. Reworked
into an (A) plain Vite / (B) SvelteKit split with pnpm/npm/yarn override examples
and a "don't do this" note against registering two Svelte plugins.
