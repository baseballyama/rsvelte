---
"@rsvelte/compiler": patch
---

Phase-3 client: replace the `JsExpr::Raw("super")` escape hatch with a structured
`JsExpr::Super` node (printed by the codegen, handled as a terminal leaf in the
await/transform/reference-collection passes). First slice of the Phase-3 Step 1+3
work to shrink the client `js_ast` `Raw(...)` surface ahead of switching client
output to oxc-AST + `rsvelte_esrap` printing (`docs/phase3-ast-refactor-plan.md`).
Output is unchanged (byte-identical; corpus baseline holds at 120).
