---
"@rsvelte/compiler": patch
---

Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle
`import`, `export { … }` / `export const/function …`, `export default`, and
function-declaration statements — the high-impact unlock that lets the converter
fire on real components (which all have imports). Import/export source strings and
the no-specifier (`import 'x'`) distinction mirror the existing codegen exactly.
Still gated OFF behind `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass
identically (runtime 19/19, compiler_fixtures 17/17). Committed behavior unchanged.
