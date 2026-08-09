---
'@rsvelte/svelte-check': patch
'@rsvelte/svelte2tsx': patch
---

Honour JSDoc types in JavaScript-authored components. A `.svelte` file without `lang="ts"` was shadowed as `.tsx`, where TypeScript ignores JSDoc entirely — so `/** @type {…} */` neither constrained a value nor reported a violation, while the props it left untyped produced implicit-`any` errors the author could not act on. Such a component now gets a `.jsx` shadow (official svelte-check reaches the same place through `ScriptKind.JS`), the overlay adds `allowJs` when one exists, and the Svelte 5 isomorphic component export emits the `export const` + `@typedef` form upstream uses for JSDoc output. `checkJs` is left to the project. A SvelteKit route prop that already carries a JSDoc `@type` also keeps it: `ts.getJSDocType` suppresses the `import('./$types.js')` injection just as a TS annotation does, so `/** @type {any} */ export let form` on a route with no server actions no longer reports a nonexistent `ActionData`
