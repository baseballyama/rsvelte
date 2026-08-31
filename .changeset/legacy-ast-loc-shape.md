---
"@rsvelte/compiler": patch
---

Match upstream's legacy AST `loc` shape: the synthesized `{@const}` assignment carries none, and an attached comment keeps the `{ type, value, start, end }` object `add_comments` produces.
