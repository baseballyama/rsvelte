---
'@rsvelte/cli': patch
---

The suggestion of `svelte/no-add-event-listener` now finds the arguments after a `//` comment that a carriage return or U+2028 ends, and after U+FEFF, as ESLint does.
