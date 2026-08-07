---
'@rsvelte/compiler': patch
---

fix(esrap): keep a redundant paren pair only for a comment that *leads* the
parenthesized expression. A comment deeper inside is already bracketed by that
expression's own syntax, and keeping the parens for it doubled the pair a parent
adds from precedence — `(await $.track_reactivity_loss(/* c */ load()))()` printed
as `((await $.track_reactivity_loss(/* c */ load())))()`, and an object-literal
arrow body as `() => (({ … }))`. `rsvelte_esrap` is released as 0.10.2 and
`rsvelte_core` pins the new exact requirement.
