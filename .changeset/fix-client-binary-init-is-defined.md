---
"@rsvelte/compiler": patch
---

fix(transform): client text interpolation treats binary/template-literal `let` inits as defined (no `?? ''`)

`is_expression_defined` (the client `?? ''` gate for `{expr}` text
interpolations) only skipped the fallback for a `const` binding whose
`initial_is_defined` flag was set. That flag is not populated for legacy
(non-runes) `let` bindings, so `let key = a.charAt(0) + a.slice(1)` — whose
value is always a string — was emitted as `${key ?? ''}` instead of `${key}`.

Add a binding-type check that mirrors upstream `scope.evaluate`: a Normal
binding that is never reassigned and whose initializer is a `BinaryExpression`
or `TemplateLiteral` is a definite string/number/boolean and therefore
`is_defined`, so no `?? ''` is appended. Reads the recorded init node type
directly (independent of the unpopulated flag). Deliberately excludes
`UpdateExpression` (`x++`), which upstream's `evaluate` has no case for and
thus treats as UNKNOWN — keeping its `?? ''`. Removes
`svelte-table/example/example6/ContactButtonComponent.svelte` from
known-failures.client.json.
