---
'@rsvelte/cli': patch
---

Without a `command`, `rsvelte typecheck` also starts `tsrs`'s native executable directly instead of through `node`, or the program `TSRS_BINARY` names.
