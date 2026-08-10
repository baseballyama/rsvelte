---
'@rsvelte/compiler': patch
---

Reuse Phase 2's typed dependency list when ordering legacy reactive statements, avoiding the duplicate Phase 3 text scan of each `$:` body.
