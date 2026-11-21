---
'@rsvelte/cli': patch
---

`rsvelte check` types a JavaScript component's props by the `JSDoc` comment before `$props()`, as svelte2tsx does. It now reports a wrong prop from an importer and a default of the wrong type.
