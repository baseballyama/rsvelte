# `3027-nullish-ternary-derived.svelte`

**Issue:** [#3027](https://github.com/baseballyama/rsvelte/issues/3027)

A `$derived` ternary whose branches are two DIFFERENT nullish literals. The client fold carried a folded value as `Option<Option<String>>`, in which `null` and `undefined` are the same `Some(None)`, so the two branches compared equal, the derived was judged constant and the attribute was hoisted out of `$.template_effect` — the prop freezes at its first-render value. `void 0` vs `null` was already correct, which is what pointed at the value representation rather than at the ternary
