---
'@rsvelte/cli': patch
---

`rsvelte typecheck` no longer reports every file as outside `rootDir` (TS6059) in a project that sets `outDir` but not `rootDir`.
