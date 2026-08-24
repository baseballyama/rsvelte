---
'@rsvelte/compiler': patch
---

Fix the compiler-option axis: `customElement: true` is honoured as a compile option, a missing
`filename` defaults to `(unknown)` (so the component is named `_unknown_` and dev output keeps its
`[$.FILENAME]` assignment), `accessors` / `immutable` report their deprecation once per process
instead of on every compile, a function-valued `runes` / `warningFilter` is rejected at the NAPI
boundary instead of being silently ignored, and `fragments: 'tree'` emits an array hole for each
anchor comment instead of dropping it. Adds a `compiler-option` family to the generated shape
matrix, the first gate in the repo that varies `compilerOptions`.
