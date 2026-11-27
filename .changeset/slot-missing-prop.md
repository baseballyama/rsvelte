---
'@rsvelte/cli': patch
---

`rsvelte typecheck` reports a `<slot>` that misses a required slot prop at the slot's tag. Before, it reported a `check_unmapped` error at the start of the file.
