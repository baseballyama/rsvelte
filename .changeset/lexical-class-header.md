---
"@rsvelte/compiler": patch
---

Locate the SSR module class header lexically: a `class ` inside a comment or a string made the following factory function a class body, lowering its locals into `#private` fields in statement position and emitting a module no JS parser accepts.
