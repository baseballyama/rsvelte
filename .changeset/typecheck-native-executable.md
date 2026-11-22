---
'@rsvelte/cli': patch
---

Without a `command`, `rsvelte typecheck` starts the native executable of `tsrs`, `@typescript/native-preview` or `typescript` directly instead of through `node`, which saves a Node start each time the checker starts.
