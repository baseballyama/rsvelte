# Dual-run known failures

`dual-run-known-failures.json` holds **0 entries**.

## What this ratchet gates

Every ported Phase-3 client pass has two implementations — the collect-and-splice
text path it started as, and the in-place `&mut Program` path that replaced it.
`ast_rewrite::dual_run::resolve` picks between them from `RSVELTE_AST_SPLICE`,
which is a process-wide `LazyLock` over the environment. So when the two
implementations disagree, **the compiler's byte output depends on an environment
variable**, and no test that goes through the public entry point can see it: one
process only ever exercises one of the two.

`crates/rsvelte_devtools/tests/dual_run_gate.rs` runs both implementations over
every official `.svelte` fixture, for `client` and `client-dev`, and lists the
`(fixture, pass)` pairs whose two sides survive esrap normalisation still
differing. The list may only shrink; an entry that starts passing fails the gate
too, so the fix and the re-baseline land together.

### What it cannot see

The comparison is `esrap(parse(x))` on each side, so anything that round-trip
cancels is invisible here — most of all **whitespace and line breaks**. It is
also scoped to passes routed through `dual_run::resolve`; a pass with only one
implementation has nothing to compare and is absent from the denominator rather
than passing.

## Entries

None. The last divergence was removed by modelling the location-less arrow body
that upstream synthesizes for a reactive destructuring assignment. That body
exhausts esrap's comment cursor, so both store-assignment implementations now
receive the same official-compatible comment stream instead of attaching the
otherwise-dead comments to different generated nodes.
