---
'@rsvelte/cli': patch
---

`rsvelte check` now reports an event key that svelte2tsx cannot name, as svelte-check does. A
key in brackets names an event only through a top-level variable that holds a string. Any other
key in `$$Events` or in a typed `createEventDispatcher` gets that report.
