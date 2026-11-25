---
'@rsvelte/cli': patch
---

`rsvelte typecheck` counts the columns of a file's first line from after a byte order mark, as svelte-check does. A finding there was one column to the right.
