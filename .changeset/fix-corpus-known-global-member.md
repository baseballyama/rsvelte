---
"@rsvelte/compiler": patch
---

fix(compiler): treat `Math`/`Number` constant members as compile-time known

A `$derived` whose initializer is constant arithmetic over a global constant —

```svelte
const circumference = $derived(2 * Math.PI * 42.5);
```

— was treated as reactive, so an attribute that only reads it (e.g.
`style="stroke-dasharray: {circumference} {circumference};"`) was emitted inside a
`$.template_effect(...)` instead of as a one-time `$.set_style(...)`. The
reactive-state evaluator's `is_expression_known_json` returned `false` for every
`MemberExpression`, so `Math.PI` made the whole derived "unknown → reactive".

Treat a non-computed member of a pure global namespace (`Math.*`, `Number.*`,
when not locally shadowed) as a known compile-time constant — mirroring the
globals table in upstream `scope.evaluate`. `Math.random()` etc. stay reactive
(they're `CallExpression`s, handled separately). Clears
`shadcn-svelte/.../circular-gauge.svelte` (45 → 44).
