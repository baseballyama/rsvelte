---
'@rsvelte/cli': patch
---

Without a `command`, `rsvelte typecheck` starts the native executable of `typescript` or `@typescript/native-preview` directly instead of through `node`. It saves about 100 ms on each run.
