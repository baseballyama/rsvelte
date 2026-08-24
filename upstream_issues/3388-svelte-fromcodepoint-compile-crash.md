# Svelte's constant evaluator crashes compile() on an out-of-range `String.fromCodePoint`

The official Svelte compiler (v5.56.10) rejects these components with a raw `RangeError` —
no error code, no position, no frame:

```svelte
{#if true}{@const c = String.fromCodePoint(-1)}{c}{/if}
```

```
RangeError: Invalid code point -1
```

`String.fromCodePoint(1114112)` and `String.fromCodePoint(1.5)` fail the same way, on
`generate: 'client'` and `generate: 'server'` alike, and from an ordinary instance script
(`<script>let x = String.fromCodePoint(-1);</script>{x}`) as well as from `{@const}`.

The cause is compile-time constant evaluation (`phases/scope.js`, `Evaluation`): the
`globals` table stores `'String.fromCodePoint': [STRING, String.fromCodePoint]` and the
evaluator calls `fn(...values.map(e => e.value))` whenever every argument is known
(`scope.js:516`). `String.fromCodePoint` throws a `RangeError` for a non-integer or
out-of-range argument, nothing catches it, and a syntactically valid program whose call
would throw only at RUNTIME instead kills the compile with an unclassified exception.

**Control that this is not the intended behaviour.** Upstream is deliberate about throwing
folds elsewhere in the same table: `BigInt` is one of only two entries stored with *no* fold
function at all, precisely because `BigInt('x')` throws, and `String.fromCharCode` — the
sibling entry, one line above — folds happily for every input because `ToUint16` cannot
throw. So the table's author considered throwing conversions and handled them; the
`fromCodePoint` row is the one that was missed. It is also the same defect class as
[#3054](https://github.com/baseballyama/rsvelte/issues/3054) (a BigInt/number mix makes the
evaluator's own arithmetic throw), which is already filed here.

rsvelte declines to fold these arguments and compiles the component successfully, so this is
an error-presence divergence rather than a byte difference: reproducing it would mean
refusing to compile valid Svelte source, which the drop-in-replacement goal outranks. The
behaviour is pinned by `an_out_of_range_code_point_is_not_folded` in
`crates/rsvelte_core/tests/server_global_fold_fns_3388.rs` so it is not "fixed" later as a
divergence from official.

Local anchor: [#3388](https://github.com/baseballyama/rsvelte/issues/3388).

Desired upstream behaviour: wrap the call in the evaluator so a throwing fold yields
UNKNOWN, or emit a coded compiler diagnostic.
