---
'@rsvelte/cli': patch
---

`rsvelte typecheck` now reports an unknown slot name on every child that fills a slot, with or without `let:` and inside blocks, as svelte-check does.
