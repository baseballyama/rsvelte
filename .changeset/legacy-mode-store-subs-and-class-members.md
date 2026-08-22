---
'@rsvelte/compiler': patch
---

Stop rejecting a `$`-prefixed class member name, and turn every rune-named `$` reference into a store subscription under an explicit legacy mode

`class P { $abc() {} }` was rejected with `global_reference_invalid`: the `$`-reference
scan in `2_analyze/store_subscriptions.rs` excluded object keys, member properties, string
literals and comments, but not a class body — and a `$inspect` member name additionally
flipped the component into runes mode, because runes auto-detection walked a non-computed
`MethodDefinition` / `PropertyDefinition` key. Upstream reads `module.scope.references`,
which never holds a declaration slot.

Under `runes: false` — from the compile option or from `<svelte:options runes={false} />`,
which upstream merges into the options before analysing — upstream opens its
store-subscription condition with `runes_option === false ||`, so `let a = $state(1)`
compiles to a store read. rsvelte raised `rune_invalid_usage` instead. The merged value is
now what reaches the store loop, the synthetic binding is declared whether or not the
unprefixed name resolves, rune binding kinds are no longer assigned in explicit legacy
mode, and the server's and client's `$effect` / `$inspect` / `$inspect.trace` removals no
longer fire on a name that resolves to a store subscription.
