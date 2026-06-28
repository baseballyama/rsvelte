---
"@rsvelte/compiler": patch
---

fix(compiler): read a store dependency via `$name()` in attribute/derived dependency lists

A reactive expression that depends on a store value (`$view`, or a store that is
also written via `$.store_set(view, …)`) must collect that dependency as the
store's subscribed value — `$view()` — not `$.deep_read_state(view)` (which would
deep-read the store object instead of subscribing to its value).

The `$:` reactive-statement dependency builder already handled stores, but the
two attribute/derived dependency builders
(`collect_reactive_references_from_metadata` and the tree-walking fallback
`collect_reactive_references`) classified a store-backed binding as a
prop/import and wrapped it in `$.deep_read_state(name)`. Detect a store
dependency by the presence of the synthesized `$name` `StoreSub` binding and emit
the `$name()` getter instead. Clears
`svelte-form-builder/src/lib/FormBuilder.svelte` (43 → 42).
