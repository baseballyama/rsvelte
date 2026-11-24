---
'@rsvelte/cli': patch
---

`rsvelte lint` and `rsvelte format` follow oxlint 1.95 and its oxfmt. `rsvelte format` keeps the parentheses of `(a < b) > c`, which TypeScript would otherwise read as a call of `a<b>`.
