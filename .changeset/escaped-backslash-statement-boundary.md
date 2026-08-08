---
'@rsvelte/compiler': patch
---

fix(compiler): close a string literal whose last escape is `\\` so the next `export` is still transformed
