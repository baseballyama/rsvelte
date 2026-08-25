# Svelte's client transform never rewrites reads of a rune declared in a `for` head

The official Svelte compiler (v5.56.9) lowers a `$state` / `$derived` declared in a `for`
statement's **init** but leaves every read of it bare, so the emitted loop reads a `Source` /
`Derived` object where the source reads a value. The output parses, nothing warns about it,
and the server target compiles the same source correctly — so the two targets disagree at
runtime.

## Reproduction 1 — the loop body never runs on the client

```svelte
<script>
	let log = [];
	for (let i = $state(0); i < 3; i++) { log.push(i); }
</script>
<p>{log.join(',')}</p>
```

| target | output | runtime |
|---|---|---|
| client | `for (let i = $.state(0); i < 3; i++) { log.push(i); }` | `i` is a `Source`; `i < 3` is `false`, so the body **never executes** and `<p></p>` renders |
| server | `for (let i = 0; i < 3; i++) { log.push(i); }` | runs 3 times, `<p>0,1,2</p>` renders |

The same component therefore renders a three-item list on the server and an empty one on the
client. `i++` also writes `NaN` into the local, which is not what a `$state` mutation means.

`$state.raw` behaves the same way. A `for`-head `$state` that is **not** mutated is fine —
the rune is stripped to a plain local, which is correct.

## Reproduction 2 — `$derived` reads the `Derived` object

```svelte
<script>
	let b = $state(1);
	let out = 0;
	for (let d = $derived(b + 1); out < 1; out += 1) { out = d; }
</script>
```

| target | the read |
|---|---|
| client | `out = d;` — `d` is the `Derived` object |
| server | `out = d();` — correct |

Every read position is affected, and the identical declaration one syntactic level out is
handled correctly, which is the positive control that isolates the `for` head:

| where the `$derived` is declared | client output for the read |
|---|---|
| `for (let x = $derived(…); x < 1; )` | `x < 1` |
| `for (let x = $derived(…); t < 1; t += x)` | `t += x` |
| `for (let x = $derived(…); …) { t += x; }` | `t += x` |
| `for (let x = $derived(…); …) { const f = () => x; }` | `() => x` |
| **`{ let x = $derived(…); t += x; }`** | **`t += $.get(x)`** |

`$derived.by` is identical.

## Where it comes from

The client transform's identifier rewriting is driven by the bindings the analysis resolves
for the scope it is visiting. A declaration in a `ForStatement`'s `init` is not a
`Statement`, so it is reached through `ForStatementInit` rather than through the statement
walk that registers the other nested declarations — the declarator itself is still lowered
(hence `$.state(…)` / `$.derived(…)` in the output), but the binding never becomes one whose
reads are rewritten. The server visitor resolves the same binding through the script-level
read wrap, which is why only the client output is affected.

Related shape already reported: `3173-svelte-client-drops-an-eager-declarator.md` records
`for (let x = $effect.pending(); ; ) {}` compiling to `for (;; ; ) {}`, i.e. the same
`ForStatementInit` path missing an arm — there for the declarator, here for its reads.

## Status in rsvelte

rsvelte currently emits `$.get(i) < 3` / `$.update(i)` / `t += $.get(d)`, which is the
correct lowering. **Decision: do not reproduce the official compiler's loss.** Unlike a
comment-placement or formatting divergence, the two outputs do not behave identically:
official compares and mutates the Source object, skips the loop body, and can write `NaN`.
Byte equality serves the drop-in-replacement goal; it does not outrank runtime correctness.

`crates/rsvelte_core/tests/for_head_rune_reads_3300.rs` pins the correct lowering in dev and
production for `$state` and `$derived`, including reads in the loop test, update, body, and a
closure. If upstream fixes its transform, the report remains useful history but the deliberate
divergence disappears naturally because the outputs converge.
