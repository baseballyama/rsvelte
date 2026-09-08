---
'@rsvelte/compiler': patch
---

`parse()` reports a destructured parameter's default value and a `function`
expression's parameters at the spans the source wrote. A template expression is
parsed inside a `(`-wrapper, and the two ways this file carries that one-byte
shift — pre-subtracted into the converter's base, or subtracted from the span
by `convert_expression` — meet at four places, of which one converted between
them. Every destructured default (`{(({ a = 1 }) => a)({})}`) was reported one
byte early and every `function` expression parameter one byte late.
