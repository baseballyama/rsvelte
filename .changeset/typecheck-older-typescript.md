---
'@rsvelte/cli': patch
---

`rsvelte typecheck` passes over a TypeScript older than 7.1 instead of stopping at it. When it finds no type checker, it prints the command that installs tsrs with the project's package manager.
