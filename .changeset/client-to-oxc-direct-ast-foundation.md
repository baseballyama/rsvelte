---
"@rsvelte/compiler": patch
---

Phase-3 Step 1+3 (direct-AST): add the `js_ast::to_oxc` converter that lowers the
client `js_ast` IR (`JsProgram`) into an oxc `Program` for printing by
`rsvelte_esrap` — the foundation for replacing the handwritten `js_ast::codegen`
with structured esrap printing. The converter returns `None` on any `Raw`/unhandled
variant so the caller transparently falls back to the existing codegen (partial
coverage is always safe). It is wired behind the `RSVELTE_CLIENT_TO_OXC` env flag,
**off by default**, so committed behavior is unchanged. With the flag on, the
byte-exact suites pass identically (`runtime` 19/19, `compiler_fixtures` 17/17),
confirming the converter is faithful for every structured client program in the
fixtures. Coverage grows one node kind at a time, gated by those byte-exact tests;
the flag flips to default-on once `Raw` nodes are eliminated and all variants are
handled.
