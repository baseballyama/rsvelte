---
"@rsvelte/compiler": patch
---

fix(compiler): recognise `then`/`catch` after a non-ASCII space in `{#await}`

The keyword scan decided word boundaries by casting a raw byte to `char`, which
decodes UTF-8 as Latin-1. A full-width space before `then` presented its last
byte as a control character, so the keyword was swallowed into the awaited
expression and the compiler emitted a call with an empty argument — output that
does not parse — with the pending and `then` branches transposed.
