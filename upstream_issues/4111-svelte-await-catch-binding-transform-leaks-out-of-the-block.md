# A `{:catch}` binding's read transform leaks out of its block

The `{#await}` visitor scopes a `then` binding's read override and does not scope a `catch`
binding's, so every later read of that name in the component is rewritten too. The rewritten
read refers to an identifier that is not in scope at that point, so the generated component
throws `ReferenceError` when it renders.

## Reproduction

`Comp.svelte`:

```svelte
<script>
	let { code } = $props();
	const p = Promise.reject(new Error('boom'));
</script>

{#await p catch code}{code}{/await}
{code}
```

`compile(source, { generate: 'client' })` (Svelte 5.56.10, source entry point
`packages/svelte/src/compiler/index.js`) emits:

```js
export default function Comp($$anchor, $$props) {
	$.push($$props, true);

	const p = Promise.reject(new Error('boom'));
	var fragment = root();
	var node = $.first_child(fragment);

	$.await(node, () => p, null, void 0, ($$anchor, code) => {
		var text = $.text();

		$.template_effect(() => $.set_text(text, $.get(code)));
		$.append($$anchor, text);
	});

	var text_1 = $.sibling(node);

	$.template_effect(() => $.set_text(text_1, ` ${$.get(code) ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}
```

`code` is bound only as the second parameter of the `$.await` catch callback. The
`text_1` effect sits **outside** that callback and reads `$.get(code)`, where `code` is a
free identifier — the prop is not a source, so it has no declaration in the component body.
Mounting the component therefore throws:

```
ReferenceError: code is not defined
```

Measured by running the compiled module under jsdom against
`packages/svelte/src/internal/client/render.js` (`mount(Comp, { target, props: { code: 'HELLO' } })`),
with three neighbouring inputs as controls — each renders, so the exception is attributable
to the leak and not to the harness:

| input | result |
|---|---|
| `{#await p catch code}{code}{/await}` then `{code}` | **`ReferenceError: code is not defined`** |
| `{#await p then code}{code}{/await}` then `{code}` | renders `"OK HELLO"` |
| `{#await p catch err}{err}{/await}` then `{code}` | renders `"Error: boom HELLO"` |
| `{code}` with no block | renders `"HELLO"` |

## Cause

`phases/3-transform/client/visitors/AwaitBlock.js` builds two contexts:

```js
const then_context = {
	...context,
	state: { ...context.state, transform: { ...context.state.transform } }
};
…
const catch_context = { ...context, state: { ...context.state } };
```

The `then` branch copies `transform`; the `catch` branch spreads `state` only, so
`state.transform` stays the **same object** as the parent's. `create_derived_block_argument`
then writes into it:

```js
function create_derived_block_argument(node, context) {
	if (node.type === 'Identifier') {
		context.state.transform[node.name] = { read: get_value };
		return { id: node, declarations: null };
	}
	…
	for (const id of identifiers) {
		context.state.transform[id.name] = { read: get_value };
		…
	}
}
```

so a catch binding's override outlives its block, while the identical write in the then
branch is discarded with the copy. Both arms call the same function; the only difference is
which object it writes into.

## The axis, measured

| shape | second read |
|---|---|
| `{#await p then code}{code}{/await}{code}` | `$$props.code` — scoped |
| `{#await p catch code}{code}{/await}{code}` | `$.get(code)` — **leaked** |
| `{#await p then { code }}{code}{/await}{code}` | `$$props.code` — scoped |
| `{#await p catch { code }}{code}{/await}{code}` | `$.get(code)` — **leaked** |
| `{code}` with no block | `$$props.code` |

Both the identifier and the destructured form leak, which follows from the mechanism: the two
arms of `create_derived_block_argument` write to the same object either way.

Suggested fix: give `catch_context` the same `transform` copy `then_context` has.

## Reachability, and why rsvelte matches it anyway

rsvelte scoped both arms and therefore emitted `$$props.code` for the second read — output
that renders where official's throws. It now reproduces the leak, because byte equality with
the official compiler is this project's goal (`AGENTS.md` goals #1 and #3) and the documented
exception is only for output no JS parser accepts; this output parses.

The reachability of the defect in published code was measured over the 34,813-entry corpus:
84 files contain a named `{:catch x}`, and **0** of them destructure `x` from `$props()`.
A looser textual predicate — `x` appearing anywhere outside its own await block — matches 36
occurrences across 21 files, which is an upper bound rather than a count of affected files.
The authoritative figure is the compiled-output diff: conforming changes **0** of the 104,439
(entry, target) outputs in the corpus. That zero is a measurement rather than an absence of one
— the same instrument, on the same corpus and the same day, reported exactly 4 changed outputs
for the neighbouring fix, and the two bindings it compared here are distinct binaries that
demonstrably differ on the reproduction above.

Deviating in rsvelte's favour would have created the opposite hazard: code that renders under
rsvelte and throws under the official compiler once it is handed to anyone using it. That
population — people who start on rsvelte — is not one any collected corpus can measure.

`crates/rsvelte_core/tests/await_catch_transform_conformance_4111.rs` pins the conformance so the
match is deliberate rather than accidental, and it turns red if this is fixed upstream.

Conforming leaves one divergence in this area untouched, filed separately as rsvelte #4135: a
name bound by an `{#await}` arm makes a later, unrelated read of that name reactive, so the read
is wrapped in `$.template_effect` where official emits a static `nodeValue` assignment. That is a
`has_state` judgement rather than a transform, it reproduces without any of the changes here, and
its expression text already matches.

## What is deliberately NOT conformed: the write half

`create_derived_block_argument` writes `state.transform[node.name] = { read: get_value }`, so the
entry it leaves behind carries no `assign`, `mutate` or `update`. What outlives a `{:catch}` block
is therefore not only the read override but the **absence of the setter**, and upstream then puts
the read expression on the left of a later write to the outer binding:

```svelte
<script>let v = "OUTER";</script>
{#await Promise.reject("A")}w{:catch v}{String(v)}{/await}
<button onclick={() => { v = "W"; }}>b</button>
```

```js
// official
$.delegated('click', button, () => {
	$.get(v) = "W";        // acorn: Assigning to rvalue
});
```

That is the class `upstream_issues/3306-svelte-a-bindings-read-expression-lands-on-the-lhs-of-a-write.md`
records and `crates/rsvelte_core/tests/upstream_unparseable_3306.rs` pins, and it is the one
documented exception to byte equality: output no JS parser accepts. rsvelte therefore restores
`assign` / `mutate` / `update` from the outer entry when leaving the block, and leaks only the read.

The join of the two decisions is measured rather than argued. Over a 360-cell grid crossing the
tail after the block (`read` / `write` / `read-write`) with arm, binding form, ten hosts and three
targets, the cells whose output the write-half restore changes number **56**, and acorn rejects
official's output in **56 of 56** — the count of cells where the two disagree while official's
output parses is **0**. Those 56 stay non-matching by construction: byte equality with text that
is not JavaScript is unobtainable, so they are not a backlog.

The read-only version of that grid could not see this. It reached the catch-arm leak on every run
and had no cell in which the setter mattered, which is why the first version of the conformance
shipped green here and red on the pin.

Tracked in rsvelte issue #4111.
