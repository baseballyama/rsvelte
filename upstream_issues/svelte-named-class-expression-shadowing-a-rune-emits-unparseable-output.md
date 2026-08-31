# Svelte emits unparseable output for a class expression whose name shadows a rune

The official Svelte compiler (v5.56.10) compiles this component successfully and emits
JavaScript no parser accepts, on **both** the client and the server target:

```svelte
<script>
	let base = $state(1);
	let v = $derived(base);
	const C = class v { m() { return v; } };
</script>
<button onclick={() => console.log(new C().m())}></button>
{v}
```

client:

```js
	const C = class $.get(v) {
```

server:

```js
		const C = class v() {
```

acorn rejects both (`Unexpected token`).

A named class expression binds its own name inside the class body, exactly as a named
function expression does — `v` in `m()` resolves to the class, not to the component's
`$derived`. Upstream's `Identifier` visitor reaches the class expression's `id` (it is an
`Identifier` node in ESTree, not a `BindingIdentifier` acorn marks as a declaration) and
applies `build_getter` to it, so the *name* of the class is rewritten to the read wrapper.
The same source with a named **function** expression (`const f = function v() { … }`) is
handled correctly, which is what isolates the class case.

rsvelte emits `const C = class v {` — the class name untouched and the body read left bare —
which is what the source means. Byte equality is the goal here, so the divergence is
recorded rather than reproduced: `compatibility/pattern-corpus` carries no file for this
shape until upstream is fixed, and the shadow probe that found it lives in the
`two-ports-inventory.md` row 17 discussion instead.

Reported against Svelte v5.56.10.
