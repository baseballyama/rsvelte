---
"@rsvelte/compiler": patch
---

Phase-3 Step 1+3 (direct-AST): extend `js_ast::to_oxc` to handle class expressions
(methods of all kinds incl. constructor, instance/static fields, computed keys,
super-class; bails on static blocks/decorators) and assignment-target
destructuring (`[a,b] = x` / `{a} = x` with defaults/rest/holes via oxc
`AssignmentTargetPattern`). The converter is now **variant-complete** — every JS
construct is handled; only opaque `Raw`/`Spanned` IR nodes bail. Still gated OFF
behind `RSVELTE_CLIENT_TO_OXC`; flag-on byte-exact suites pass identically (runtime
19/19, compiler_fixtures 17/17). Committed behavior unchanged.
