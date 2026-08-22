---
'@rsvelte/compiler': patch
---

Server: carry a comment written inside a template expression's `{ … }`. It is
flushed before the next located node the printer reaches — including when the
expression it was written in constant-folds away and the flush lands on the
following one.
