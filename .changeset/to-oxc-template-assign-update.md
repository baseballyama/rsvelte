---
"@rsvelte/compiler": patch
---

Phase-3 Step 1+3 (direct-AST burn-down): extend the `js_ast::to_oxc` converter to
handle `TemplateLiteral`, `TaggedTemplate`, `Assignment` (identifier / non-optional
member targets), and `Update` expressions, so more client programs lower directly
to oxc + esrap instead of bailing to the string codegen. Still gated OFF behind
`RSVELTE_CLIENT_TO_OXC`; with the flag on, byte-exact suites pass identically
(runtime 19/19, compiler_fixtures 17/17). Committed behavior unchanged.
