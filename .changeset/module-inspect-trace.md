---
'@rsvelte/compiler': patch
---

Lower `$inspect.trace(…)` in `.svelte.(js|ts)` modules

A module script had no dev-mode lowering for the rune at all, so `$inspect.trace(…)`
reached the client output verbatim and threw `ReferenceError: $inspect is not defined`.
The enclosing function body is now rewritten to `{ return $.trace(label, () => { … }); }`
(awaited, with an `async` thunk, for an `async` function), with the default label taken
from the function's own AST parent and located in the source the user wrote. The
`$effect`-style non-dev removal that every other target still reaches now runs off the
JS-lexical scan, so the same bytes inside a string literal are left alone.
