---
"@rsvelte/compiler": patch
---

`parse()` now returns a `TSIndexSignature`'s `parameters`, `typeAnnotation` and
`readonly` instead of a bare span-bearing envelope. Compiled output is unchanged.
