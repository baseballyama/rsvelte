---
"@rsvelte/compiler": patch
---

fix(compiler): legacy `invalidate_inner_signals` for `$.mutate()` state member mutations

A legacy `<select bind:value={state.x}>` whose subtree references other scope
variables must invalidate those signals when the bound state is mutated. The prop
path (`prop(prop().x = v, true)`) already wrapped with
`$.invalidate_inner_signals`; the legacy **state** member-mutation path
(`$.mutate(state, …)`) did not. The precomputed invalidate bodies now cover any
binding with `legacy_indirect_bindings` (state as well as props), and
`transform_legacy_state_member_mutate_ast` wraps `$.mutate(state, …)` in
`(<mutation>, $.invalidate_inner_signals(() => { … }))` when applicable.

Clears `powertable/.../PowerTable.svelte`, zero corpus regressions.
