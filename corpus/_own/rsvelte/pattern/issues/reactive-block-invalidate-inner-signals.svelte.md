# `reactive-block-invalidate-inner-signals.svelte`

**Issue:** corpus residue

A `<select bind:value>` whose subtree reads another binding makes every mutation of the bound root wrap in `(mutation, $.invalidate_inner_signals(...))`. Upstream decides this once in `AssignmentExpression.js`; rsvelte has four ports of that branch, and the two reached from a `$:` body — the simple-assignment `format!` and the `state_member_mutate_ast` twin used inside `$: if (...)` — emitted the bare mutation. The `outside()` function body is the control: it reaches a port that already wrapped.
