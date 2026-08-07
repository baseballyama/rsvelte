# Dual-run known failures

`dual-run-known-failures.json` holds **1 entry**.

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

### `runtime-legacy/samples/store-auto-resubscribe-immediate/main.svelte` — `store_assign_ast:inplace`

The fixture nests a store write inside its own initializer and hangs a trailing
prose comment off each closing bracket:

```js
$value = {
	one: writable(
		$value = {
			two: ({ $value } = { $value: { fred: $value.qux } }) // { fred: 4 }
		} // { two: { $value: { fred: 4 } } }
	) // { one: { two: { $value: { fred: 4 } } } }
};
```

The two implementations emit **the same program** and attach those two outer
comments to different nodes: the text path keeps the source's `})` / `)` split,
the in-place path reprints `}))` and pushes the outer comment onto its own line.

Measured with the repository's own comparator (`rsvelte_ast_equiv::compare_with`)
on the two outputs plus the official compiler's, under both of its policies:

| policy | in-place vs spliced | in-place vs official | spliced vs official |
|---|---|---|---|
| `Ignore` | equivalent | equivalent | equivalent |
| `Meaningful` | equivalent | equivalent | equivalent |

So this is **not held open by a codegen disagreement**: neither side is wrong
about the code, and neither matches official's *bytes* either, because official
drops all three comments at this site while both rsvelte paths keep them.
Closing it means reproducing official's comment-position rule, which is the
comment-preservation work tracked separately (#2336, #2399) — not something
`store_assign_ast` can decide locally. Making the two paths merely agree with
each other would pick one arbitrary attachment that still does not match
official, and would retire the entry while the defect stands.
