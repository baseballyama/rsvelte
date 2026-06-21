---
"@rsvelte/compiler": patch
---

Phase-3 Step 1+3 (Raw elimination): replace the three `JsExpr::Raw` escape hatches
used for literal source-spelling preservation (double-quoted strings,
non-canonical number formats like `1_000_000`) with structured
`JsLiteral::RawString { value, raw }` / `RawNumber { value, raw }` variants. The
codegen emits the `raw` verbatim (byte-identical to the old `Raw`), and the
`js_ast::to_oxc` converter builds an oxc literal with `raw` set so esrap reproduces
it. First slice of eliminating the client `Raw(...)` constructions so real programs
become Raw-free and convert direct-AST. Byte-identical: corpus 120 no-NEW,
flag-off and flag-on byte-exact suites both 19/19 + 17/17.
