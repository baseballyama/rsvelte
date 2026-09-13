---
"@rsvelte/compiler": patch
---

fix(parse): the legacy AST keeps the modern selector shape inside a pseudo-class's `args`

Upstream's legacy `ComplexSelector` visitor rebuilds `children` from the nodes as
they were before the walk rewrote them, so the rewrite of anything below a
converted `ComplexSelector` is computed and discarded. The only way to be below
one is through a `PseudoClassSelector`'s `args`, which therefore keeps
`ComplexSelector` / `RelativeSelector`. rsvelte converted recursively.
