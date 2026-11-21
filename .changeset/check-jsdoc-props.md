---
'@rsvelte/cli': patch
---

`rsvelte check` types the props of a JavaScript component by the `JSDoc` comment before `$props()`, as svelte2tsx does, so an importer's wrong prop and a default that does not match are reported.
