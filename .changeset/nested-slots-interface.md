---
'@rsvelte/cli': patch
---

`rsvelte typecheck` reports nothing for a component that declares its `$$Slots` interface inside a function, as svelte-check does. Before, it reported a `check_unmapped` error.
