---
"@rsvelte/compiler": patch
---

Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle `yield`
expressions, private-field member access (`obj.#x`), and object-literal
method/getter/setter/computed properties (mirroring codegen's `auto_method`
heuristic so non-computed `Init` function-valued props print as method shorthand).
Only `JsExpr::Class` remains bailed at the expression level. Still gated OFF behind
`RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically (runtime 19/19,
compiler_fixtures 17/17). Committed behavior unchanged.
