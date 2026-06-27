---
"@rsvelte/compiler": patch
---

fix(compiler/csr): lower a component `bind:` write to a legacy `$:` variable via `$.set`

A `bind:` on a component whose target is a legacy `$:` reactive declaration was
lowered to a plain assignment in the generated setter (`path = $$value`), dropping
reactivity so subscribers were never notified. The `is_state_binding` predicate
that selects the `$.get`/`$.set` accessor form omitted the `LegacyReactive`
binding kind; adding it restores parity with upstream (whose `transform.assign`
runs for state, `derived`, and `legacy_reactive` bindings) and with the
element-bind path. Fixes #1228.
