# A binding's read expression lands on the left-hand side of a write

Three inputs make the client compiler emit output no JavaScript parser accepts.
Each puts the *read* expression of a binding on the left of an assignment, so
`acorn` rejects the file with `Assigning to rvalue`. Both compile calls succeed —
no error, no warning — so the failure surfaces only when the emitted module is
parsed.

Measured against `svelte@5.56.8`, `generate: 'client'`, `dev: false`. The
`server` target is **correct for all three**.

## 1. A write to an `{#each}` array-rest binding

```svelte
{#each [["A","B"]] as [first, ...v]}<button onclick={() => { v = "W"; }}>b</button>{/each}
```

```js
$.each(node, 0, () => [["A", "B"]], $.index, ($$anchor, $$item) => {
	var $$array = $.derived(() => $.to_array($$item));
	let first = () => $.get($$array)[0];
	let v = () => $.get($$array).slice(1);
	var button = root();

	$.delegated('click', button, () => {
		($$array.slice(1) = "W");        // <- Assigning to rvalue
	});
	…
```

The binding is declared as the getter `() => $.get($$array).slice(1)`. The write
reuses that body as an assignment target, and drops the `$.get` in the process.

## 2. A write to an `{#each}` object-rest binding

```svelte
{#each [{a:1,b:2}] as {a, ...v}}<button onclick={() => { v = "W"; }}>b</button>{/each}
```

```js
let v = () => $.exclude_from_object($$item, ['a']);
…
($.exclude_from_object($$item, ['a']) = "W");   // <- Assigning to rvalue
```

Same shape with the object-rest read helper.

## 3. A write to an outer binding whose name a `{:catch}` parameter reuses

```svelte
<script>let v = "OUTER";</script>
{#await Promise.reject("A")}w{:catch v}{String(v)}{/await}
<button onclick={() => { v = "W"; }}>b</button>
```

```js
let v = $.mutable_source("OUTER");
…
$.delegated('click', button, () => {
	$.get(v) = "W";                      // <- Assigning to rvalue
});
```

The write sits outside the block and targets the outer `let`, which is correct
source. `$.set(v, "W")` is the spelling every other path emits.

### What the `{:catch}` cell needs

Seven variants, one thing changed each time:

| source | client | server |
|---|---|---|
| `{:catch v}` + write to outer `v` | **unparseable** | parses |
| `{:catch v}` + write + an outer read of `v` | **unparseable** | parses |
| `{:catch v}`, parameter never used, + write | **unparseable** | parses |
| `{:catch v}` + write, `let v = $state("OUTER")` (runes) | **unparseable** | parses |
| `{:catch v}` + **no** write to the outer `v` | parses | parses |
| `{:catch e}` (parameter does not shadow) + write | parses | parses |
| `{:then r}` only, no `{:catch}` at all, + write | parses | parses |

So it takes a `{:catch}` parameter whose **name matches** an outer binding, plus
a write to that outer binding. Using the parameter is not required, and the same
thing happens in runes mode.

### Only `{:catch}` does it

Every other construct that introduces a binding of the same name leaves the outer
write alone:

| shadowing construct | client |
|---|---|
| `{:catch v}` | **unparseable** |
| `{#await … then v}` | parses |
| `{#each … as v}` | parses |
| `{#snippet s(v)}` | parses |
| `{@const v = …}` | parses |
| no shadowing at all | parses |

## The common shape

`$$array.slice(1)`, `$.exclude_from_object($$item, ['a'])` and `$.get(v)` are
each what a **read** of that binding compiles to. All three cells reach a write
path that substitutes the read spelling and never converts it to the setter form.

## Control

A plain `{#each ["A"] as v}` item write is byte-identical between the two
compilers (`(["A"][$$index] = "W");` on both), which shows this is the
rest/`{:catch}` path rather than each-writes in general.

## rsvelte's output for the same three inputs

| input | official | rsvelte |
|---|---|---|
| array-rest write | `($$array.slice(1) = "W");` | `v = "W";` |
| object-rest write | `($.exclude_from_object($$item, ['a']) = "W");` | `v = "W";` |
| `{:catch}` shadow write | `$.get(v) = "W";` | `$.set(v, "W");` |

All three of rsvelte's parse.

## Decision taken in rsvelte

**These are listed, not reproduced.** Byte equality with the official compiler is
rsvelte's goal, and the standing precedent (`3_transform/client/dead_comments.rs`)
is that rsvelte reproduces an upstream defect rather than carrying a permanent
ratchet entry. That precedent does not extend here, and the reason is specific
rather than aesthetic: rsvelte's shape-matrix gate scores `output-unparseable`
as a verdict of its own, ratcheted apart from `js-mismatch`, precisely so that
"wrong text" and "text that is not JavaScript" are never suppressed by one
another's key. Reproducing these cells would mean writing permanent entries into
the one ratchet whose entire purpose is that no such entry exists. The comment
loss in #2990 still ran; this output cannot be imported.

`crates/rsvelte_core/tests/upstream_unparseable_3306.rs` pins rsvelte's side, so
a later change that "improves fidelity" by adopting the upstream spelling fails.
