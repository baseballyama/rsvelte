---
'@rsvelte/compiler': patch
---

A TypeScript-only statement form no longer fails the server compile with a code-less error.

`import x = require(…)`, `export = a` and `export as namespace N` are TypeScript module
syntax, not type annotations, so upstream's eraser leaves them alone and copies each one
verbatim into the generated JavaScript. rsvelte's server ran its classification parse in
plain-JS mode, rejected the erased text, and returned `TransformError::CodeGen` — an error
whose `code` is `null`, which is the one shape the error ratchets cannot classify, since
`error-message` / `error-position` / `error-end` / `error-frame` are all chained behind it.

The classification parse and the statement re-home now retry in TypeScript mode, so those
three statements are classified and emitted rather than failing the compile. Measured
against `submodules/svelte`, the server output is byte-identical to upstream's on all three
— including the fact that neither output parses, which is upstream's half and is filed
separately. A rejection by both parsers is still a compile failure, so the retry widens the
accepted set by exactly the population that used to throw.
