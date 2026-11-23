---
'@rsvelte/cli': patch
---

`typecheck` now checks JavaScript modules as `tsconfig.json` says, as svelte-check does: `checkJs` checks each one, and `allowJs` checks a module that starts with `// @ts-check`. A JavaScript route, hooks or `params` file of SvelteKit gets its types from a `JSDoc` comment, as svelte2tsx writes them.
