---
"@rsvelte/compiler": patch
---

Phase-3 client: replace the `format!`-based `JsExpr::Raw("import.meta")` escape
hatch with a structured `JsExpr::MetaProperty(meta, property)` node (printed as
`meta.property`, handled as a terminal leaf in the await/transform/reference
passes). Continues the Phase-3 Step 1+3 burn-down of the client `js_ast`
`Raw(...)` surface (`docs/phase3-ast-refactor-plan.md`). Output is unchanged
(byte-identical; corpus baseline holds at 120).
