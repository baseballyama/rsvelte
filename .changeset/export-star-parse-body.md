---
"@rsvelte/compiler": patch
---

`parse()` now returns `export * from '…'` as an `ExportAllDeclaration` instead of
dropping the statement from the program body. Compiled output is unchanged.
