---
"@rsvelte/compiler": patch
---

Phase-3 client: add a structured `JsLiteral::BigInt` variant and use it for
bigint literals (`123n`) instead of `JsExpr::Raw`. Continues the Phase-3 Step 1+3
`js_ast` `Raw(...)` burn-down. Output is unchanged (byte-identical; corpus
baseline holds at 120).
