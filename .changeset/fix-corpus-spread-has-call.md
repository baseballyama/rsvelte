---
"@rsvelte/compiler": patch
---

fix(compiler): a spread element marks an expression as having a call (legacy reactivity)

A legacy component/element attribute value containing a spread —

```svelte
<Comp scrollIntoView={{ condition: a === b, onlyIfNeeded: c, ...rest }} />
```

— was emitted without the `(deps, $.untrack(...))` dependency sequence, so its
reactive dependencies (`c`, `rest`, …) weren't tracked. Upstream's
`2-analyze/visitors/SpreadElement.js` sets `has_call = true` (and `has_state =
true`) for any spread ("treat `[...x]` like `[...x.values()]`"), which makes
`build_expression` wrap the value. rsvelte's metadata walks omitted spreads, so
`has_call`/`has_member`/`has_assignment` were all false → the value was emitted
bare.

Both metadata walks now flag a `SpreadElement` as a call: the Phase-2
`walk_js_expression` (`has_call` + `has_state`) and the Phase-3
`walk_metadata_flags` used by `build_attribute_value` (`has_call`).

Clears `svelte-ux/.../SelectField.svelte`, zero corpus regressions.
