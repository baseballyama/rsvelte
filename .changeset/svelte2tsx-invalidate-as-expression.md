---
"@rsvelte/svelte2tsx": patch
"@rsvelte/compiler": patch
"@rsvelte/svelte-check": patch
---

`$: x = y as T` parenthesises its `__sveltets_2_invalidate` arrow body

Upstream wraps that body in parentheses under a three-way condition — an object
literal, an expression whose text starts with one, or an `as` expression. rsvelte
answered the whole condition with `rhs.starts_with('{')`, which covers the first
two and cannot express the third, so a reactive declaration whose right-hand side
is a TypeScript assertion lost the parentheses.
