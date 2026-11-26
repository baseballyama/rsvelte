---
'@rsvelte/cli': patch
---

`rsvelte typecheck` no longer reads `$ns` of a namespace import `ns` as a store, as svelte-check does. It reports that it cannot find `$ns`, where it reported TS2769 or nothing.
