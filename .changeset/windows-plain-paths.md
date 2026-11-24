---
'@rsvelte/cli': patch
---

`typecheck` runs on Windows again. rsvelte now gives TypeScript, the content mapper and its output each real path as `C:\…`, where it gave the `\\?\C:\…` form that TypeScript 7 refuses as a network path. `lint` and `format` read real paths the same way.
