---
'@rsvelte/cli': patch
---

Report a binary, octal or hex number such as `0b12` after an expression where acorn's parser fails, at the start of the number. acorn reads it as `0b1` and then `2`.
