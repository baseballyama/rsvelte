---
"@rsvelte/compiler": patch
---

fix(transform): server declarator `$state()` is a store read when `$state` is a subscription

`let x = $state()` in the instance script was always lowered to the `$state`
rune (→ `let x = void 0`). When a same-named store is subscribed — e.g. a
`state` prop read as `$state` — upstream `get_rune` returns null (the
auto-created `$state` store-subscription binding shadows the rune), so the
declarator is a store read: `let x = $.store_get(($$store_subs ??= {}),
"$state", state)()`. Detect that in `lower_variable_declaration` by looking up
the `$`-prefixed callee name as a `BindingKind::StoreSub` binding that is
lexically visible at (an ancestor-or-self of) the instance scope, gated to the
instance script only. Precise enough to leave ordinary runes alone:
`let props = $props()` (binds `props`, no `$props` subscription),
`let state = $state(0)` (no `$state` read), and a module-script
`const data = $state({…})` next to an unrelated `const state` all stay runes.
