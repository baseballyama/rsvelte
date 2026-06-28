---
"@rsvelte/compiler": patch
---

fix(compiler): treat a parenthesized sub-expression as "simple" in prop fallbacks (SSR)

A legacy prop whose default is a simple arithmetic expression containing
parentheses was emitted with a needless lazy thunk:

```svelte
<script>
  export let value = max < min ? min : min + (max - min) / 2;
</script>
```

produced `$.fallback($$props["value"], () => (max < min ? …), true)` instead of
the eager `$.fallback($$props["value"], max < min ? …)`.

Upstream parses with `preserveParens: false`, so `is_simple_expression` never
sees a parenthesized node. OXC preserves `(max - min)` as a
`ParenthesizedExpression`, which `is_simple_default`'s catch-all treated as
non-simple — making the whole default complex → lazy. Unwrap
`ParenthesizedExpression` (recurse on the inner expression) so a parenthesized
simple expression stays simple/eager, matching upstream. Clears
`attractions/.../slider/slider.svelte` (38 → 37).
