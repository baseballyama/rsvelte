---
"@rsvelte/compiler": patch
---

fix: a comment in a `$derived` declarator no longer hides it from the server

`compileModule(..., { generate: 'server' })` decides which reads become calls
from a set built by scanning the lowered text for `$.derived(` and walking left
to a `let|const|var <name> =` shape. The walk skipped whitespace only, so
`const x = /* c */ $derived(…)` — or a comment before the `=`, after the
keyword, or in a comma-separated declarator — dropped `x` from the set. A name
that is not a derived is treated as state, whose read is the bare identifier, so
the declaration lowered correctly and the template then interpolated the derived
thunk instead of its value.
