---
'@rsvelte/fmt': patch
'@rsvelte/language-server': patch
---

Stop returning a file unformatted because of the expression wrapper

`rsvelte-fmt` parses a template expression as `(<expr>\n);`, and that `(` makes
OXC speculate an arrow parameter list — so a head it reads as a TypeScript
parameter modifier (`accessor`, `declare`, `readonly`) failed the parse and the
whole component came back verbatim. The wrapper is retried as
`const _rsvelte_x_ = <expr>;`, which is the same expression position with no `(`
at the head, and is accepted only when it yields the one declarator it was
given. Measured against the oxfmt oracle over nine template hosts, this takes
the grid from 53 to 71 matching cells and moves none the other way.
