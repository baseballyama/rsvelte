---
'@rsvelte/cli': patch
---

Report the error acorn raises while it reads a token before the place the parser fails. Such tokens include a legacy octal number or escape in strict code, an `@`, and a `#` with no name after it.
