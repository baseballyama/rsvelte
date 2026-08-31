# A `$state` declared bare in a `case` clause keeps `$.state(...)` but loses its reference transforms

A `let` declared **directly in a `case` clause** — legal JavaScript, no block braces — is
lowered to `$.state(...)` by the official compiler while its *references* are left
untransformed. The result is valid JavaScript that computes the wrong answer at runtime.

```svelte
<!-- input.svelte -->
<script>
	let a = $state(0);
	function f(k) {
		switch (k) {
			case 1:
				let s = $state(1);
				s++;
				return s;
		}
	}
</script>

<button onclick={() => a++}>{a}{f(1)}</button>
```

`compile(source, { generate: 'client' })`:

```js
	function f(k) {
		switch (k) {
			case 1:
				let s = $.state(1);
				s++;
				return s;
		}
	}
```

`$.state(1)` returns a `Source` object, so `s++` evaluates `{…} + 1` → `NaN` and `return s`
hands back `NaN`. The component renders `NaN`.

The two halves of that output contradict each other, which is what makes this a defect
rather than a design choice: if `s` were meant to stay a plain value, `$state(1)` would
have been folded away instead of being turned into `$.state(1)`.

## The control that rules out intent

Add braces to the same case clause. Nothing else changes — same declaration, same
reassignment, same scope depth:

```svelte
			case 1: {
				let s = $state(1);
				s++;
				return s;
			}
```

```js
			case 1:
				{
					let s = $.state(1);

					$.update(s);

					return $.get(s);
				}
```

So the switch turns on **whether the case clause introduces a `BlockStatement`**, not on
`switch`, not on the declaration, and not on where the declaration sits. That is the
evidence that upstream is not deliberately treating switch-local state as non-reactive —
if it were, the braced form would behave the same way.

## The axis, measured (Svelte 5.56.10, `generate: 'client'`, dev on and off)

| shape | verdict |
|---|---|
| `case 1: { let s = $state(1); s++; return s }` | agrees with rsvelte |
| `case 1: let s = $state(1); s++; return s` | **diverges, both dev and non-dev** |
| `outer: { let s = $state(1); s++; return s }` (labeled block) | agrees |
| `case 1: { let s = $state(1); let d = $derived(s * 2) }` | agrees |
| `case 1: { let s = /* c */ $state(1) }` | agrees |
| `outer: { let s = /* c */ $state(1) }` | agrees |

**`$derived` is the same defect, and the title's `$state` understates the class.** Measured
the same way, on 5.56.10:

| shape | official's client output | verdict |
|---|---|---|
| `case 1: let d = $derived(1); return d` | `let d = $.derived(() => 1); return d` | **diverges** |
| `case 1: let d = $derived.by(() => 1); return d` | `let d = $.derived(() => 1); return d` | **diverges** |
| `case 1: { let d = $derived(1); return d }` | `return $.get(d)` | agrees |
| `outer: { let d = $derived(1); return d }` | `return $.get(d)` | agrees |

`$.derived(…)` returns a `Derived` object, so the brace-less form hands the object back
instead of `1` — the same "the declarator is lowered and its references are not"
contradiction as the `$state` rows, with the same braced control ruling out intent. It was
found by widening a matrix probe's declaration axis while measuring something else; the
family's `SERVER_ONLY` exclusion covered `state-let × switch-case-bare` only, so the
`$derived` half had no cell at all until the axis was added.

The labeled-block row is the second control: it is the other statement kind that can host
a declaration without a function boundary, and it is handled correctly. So the defect is
specific to `SwitchCase`, not to "a declaration somewhere unusual".

## Cause — not attributed

Two upstream sites are certainly involved, but the attribution is **not finished** and is
deliberately left open rather than filled with a plausible guess:

* `phases/scope.js:1173` registers `SwitchStatement: create_block_scope`, so the
  declaration is bound on the **`SwitchStatement`**, not per `SwitchCase`.
* `3-transform/client/transform-client.js:67-70` (`set_scope`) rebuilds `state.transform`
  through `get_transform` on every node that owns a scope, and
  `3-transform/client/utils.js:187-199` is the only place an entry is *deleted*.

What is unexplained is that the declarator still sees `is_state_source` as true — it emits
`$.state(...)`, which that predicate gates — while the reference has no transform. Those
two readings cannot both be taken against the same `transform` map. Anyone continuing this
should start by printing `binding.kind` and `binding.reassigned` for `s` in the braced and
brace-less shapes, since the control above says that pair is where they part.

## What rsvelte does about it, and why

**Decision: do not reproduce. rsvelte keeps emitting the correct output** —
`$.update(s)` / `$.get(s)` — and `crates/rsvelte_core/tests/case_clause_state_3420.rs`
pins that against the day someone reads the divergence as an rsvelte bug and "fixes" it
toward official.

The rule this follows: **reproduce an upstream defect only when both outputs behave
identically and only the bytes differ; do not reproduce when the upstream output computes
a different answer at runtime.**

That is why this lands differently from
[2990](2990-svelte-class-accessor-drops-later-comments.md) and
[3070](3070-svelte-template-comment-leaks-into-generated-code.md), which rsvelte does
reproduce. A comment's position does not change what the program does, so for those rows
byte equality is the whole of the disagreement and matching upstream costs nothing. Here
the user's component renders `NaN`. Byte equality is a means to the drop-in-replacement
goal, not a goal above it, so it does not get to require shipping a broken component.

Consequence to keep in mind: this is a permanent byte divergence. If a corpus file ever
uses the shape, the resulting ratchet entry must be justified as *upstream computes the
wrong value at runtime and rsvelte deliberately emits the correct output* — not as an
unexplained mismatch. And if upstream fixes it, this file and the pinning test are what
have to go.

Tracked in rsvelte issue #3420.
