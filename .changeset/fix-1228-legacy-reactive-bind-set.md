---
"@rsvelte/compiler": patch
---

fix(compiler): lower legacy-reactive component bind writes through `$.set`

A `bind:` on a component whose target is a legacy reactive (`$:`-declared)
variable was lowered to a plain `path = $$value` assignment instead of the
reactive `$.set(path, $$value)`, so writes from the child component no longer
notified subscribers (reactivity loss). The getter still read the variable via
`$.get(path)`, producing an inconsistent get/set pair.

`process_bind_directive`'s `is_state_binding` predicate only covered
`is_state_source || Derived`, so a `LegacyReactive` identifier fell through to
the final plain-assignment branch. `add_state_transformers` registers a `$.set`
assign transform for exactly `is_state_source || Derived || LegacyReactive`, so
`LegacyReactive` is now included here to match.

Fixes #1228 (smelte `_layout.svelte`, svelte-calendar `DayPicker.svelte`).
