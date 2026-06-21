---
"@rsvelte/compiler": patch
---

Phase-3 Step 1+3 (Raw elimination): replace the 4 load-bearing `JsExpr::Raw(name)`
prop-setter-callee escape hatches (in `shared/declarations.rs` / `program.rs`)
with a structured `JsExpr::OpaqueIdentifier(name)` variant. Like the `Raw` it
replaces, it is skipped by the transform passes (so the setter callee is not
re-read-transformed into `x()(value)`) and codegens the bare name — but it is now
a structured node the `js_ast::to_oxc` direct-AST converter handles (builds a plain
oxc identifier). Byte-identical: corpus 120 no-NEW, flag-off and flag-on byte-exact
both 19/19 + 17/17.
