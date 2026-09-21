---
"@rsvelte/compiler": patch
---

fix(client): keep a multi-line block comment's continuation lines with their opener. A comment opening on the instance script's first line kept the source indentation on top of the output's, so `let q = 1 /* c` … `more */` emitted the continuation line three tabs deep where the official compiler emits one.
