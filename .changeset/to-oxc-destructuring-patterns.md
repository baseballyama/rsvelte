---
"@rsvelte/compiler": patch
---

Phase-3 Step 1+3 (direct-AST burn-down): extend `js_ast::to_oxc` to handle
destructuring binding patterns — object/array patterns with defaults, rest
elements, holes, computed keys, and nesting — via a shared recursive
`binding_pattern` helper now used by variable declarators, function/arrow params
(incl. rest params), for-of/for bindings, and catch parameters. Still gated OFF
behind `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically (runtime
19/19, compiler_fixtures 17/17). Committed behavior unchanged.
