---
'@rsvelte/svelte2tsx': patch
'@rsvelte/compiler': patch
'@rsvelte/svelte-check': patch
---

A `+error.svelte`'s `error` prop is now typed `App.Error`. Upstream's `ExportedNames`
answers "which props does SvelteKit type here" with two arms — `isKitRouteFile`
(data / form / params) and an `else if (isKitErrorFile(...))` arm that types `error`
alone — and rsvelte had only the first, so an error page's props fell through to
ordinary inference. `isKitErrorFile` strips only the extension, so `+error@foo.svelte`
is not one.