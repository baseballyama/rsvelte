---
'@rsvelte/cli': patch
---

`typecheck` now types the untyped `$props()` of a JavaScript route component, such as `+page.svelte`, from the route's `./$types` in `JSDoc`, as svelte2tsx does. Where `./$types` is missing, it reports the import, as svelte-check does.
