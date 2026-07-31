---
"@rsvelte/compiler": patch
---

fix(compiler): memoize wrapping measurements in the handwritten client printer so deeply nested elements no longer compile in exponential time in dev mode (a 12-level nesting dropped from ~9.5s to ~80µs), with byte-identical output
