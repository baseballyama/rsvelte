---
"@rsvelte/compiler": patch
---

Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle the
control-flow statements — `for`, `for…of` / `for…in` / `for await…of`, `while`,
`do…while`, `switch`, labeled statements, and `try/catch/finally` — plus a shared
`variable_declaration_node` helper reused by var-decl/export/for-init. Still gated
OFF behind `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically
(runtime 19/19, compiler_fixtures 17/17). Committed behavior unchanged.
