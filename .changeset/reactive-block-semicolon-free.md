---
'@rsvelte/compiler': patch
---

fix(compiler): a semicolon-free `$: { … }` block reads its state through `$.get`

`transform_state_reads_ast` told an object literal from a statement block by
scanning for a top-level `;`. Source written without semicolons (`standard`
style) has none, so `$: { void w }` was wrapped in `(`…`)` to force the
expression goal, the parse failed, and the state-read pass was skipped
entirely — the dependency thunk still read `$.get(w)` while the body read the
bare variable, so the effect re-ran without seeing the new value. The parse
verdict now decides in both directions.
