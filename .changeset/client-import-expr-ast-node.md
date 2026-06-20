---
"@rsvelte/compiler": patch
---

Phase-3 client: replace the dynamic-`import()` `Raw` escape hatch with a
structured `JsExpr::ImportExpression { source, options }` node. Previously the
source/options were eagerly stringified via `generate_expr` and spliced into a
`format!("import({})")` `Raw`; now they are held as converted sub-expressions and
emitted lazily by the codegen. The node is treated as a terminal in the analysis
passes (await / transform / reactive-ref collection), exactly mirroring the opaque
`Raw` it replaced, so the sub-expressions are not re-transformed after conversion
— keeping output byte-identical. Continues the Phase-3 Step 1+3 client `js_ast`
`Raw(...)` burn-down (`docs/phase3-ast-refactor-plan.md`). Corpus baseline holds
at 120.
