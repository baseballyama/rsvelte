---
"@rsvelte/compiler": patch
---

fix(transform): don't proxy a `$bindable()` default that is a binary/unary expression or a constant identifier

`should_proxy` (upstream `utils.js`) returns `false` for `UnaryExpression` and
`BinaryExpression`, and for an `Identifier` it recurses into the binding's
initializer. rsvelte's `should_proxy_prop_default` never checked for binary
expressions and always proxied a bare identifier, so a bindable default like
`$bindable(devicePixelRatio > 1)` was wrongly wrapped in `$.proxy(...)` — which
then also flipped it to a lazy `PROPS_IS_LAZY_INITIAL` thunk
(`31, () => $.proxy(...)` instead of `15, devicePixelRatio > 1`), and
`$bindable(DEFAULT_ALPHA)` (a `const DEFAULT_ALPHA = 1`) proxied its literal
initial. Now a top-level `Binary`/`Unary` default is not proxied (AST-classified),
`Logical`/`Conditional`/object/array defaults still are, and an identifier
default resolves its (non-reassigned, non-function, non-import) binding's initial
once — matching the official compiler. Clears layerchart GeoTileControls.svelte
and ForceSimulation.svelte.
