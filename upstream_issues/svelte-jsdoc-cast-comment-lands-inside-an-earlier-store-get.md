# A JSDoc cast comment is reparented by a synthesized, loc-less wrapper

Compiling a `.svelte.js` module for the client moves a `/** @type {T} */` cast
comment out of the argument it annotates and into an unrelated `$.get(…)` call
earlier in the same expression, dropping the cast's parentheses with it.

```js
// m.svelte.js
export class Q {
	#raw = $state(null);
	#overrides = $state([]);
	#current = $derived.by(() => {
		return this.#overrides.reduce((v, r) => r(v), /** @type {T} */ (this.#raw));
	});
}
```

`compileModule(source, { generate: 'client' })` (Svelte 5.57.1) emits

```js
return $.get(this.#overrides /** @type {T} */).reduce((v, r) => r(v), $.get(this.#raw));
```

The comment now annotates `this.#overrides`, which is not what it was written
against, and `/** @type {T} */ (…)` has lost the parentheses that give it cast
semantics — so a `checkJs` build of the output reads a different program from the
one the author wrote. The expected output keeps it on its own operand:

```js
return $.get(this.#overrides).reduce((v, r) => r(v), $.get(/** @type {T} */ (this.#raw)));
```

## Why

`phases/3-transform/client/visitors/…` rewrites each private-state read into a
builder-made `$.get(<read>)` call. The wrapper carries no `loc`; only the inner
`this.#overrides` does.

esrap's `flush_trailing_comments` bounds a node's trailing comments at the
following node's `loc.start`, and an unlocated following node bounds nothing —
`next` is `null`. So after printing `this.#overrides` the printer is free to take
any comment that starts on the same line, and the cast comment, which sits two
arguments later in the source, is the next pending one. It is written there,
inside the synthesized call.

The cast parentheses are lost for the same reason. esrap re-adds them in
`flush_comments_until` (`jsdoc_type_casts`, sveltejs/esrap#164); a comment claimed
by `flush_trailing_comments` never reaches that code path, so no ` (` is opened
and none is closed.

Both halves are the same root: a synthesized wrapper with no `loc` leaves the
comment cursor unbounded for the rest of the line.

## The same root, second shape: the cast closes around the getter, not its value

On the **server** target a `$derived` class field is read through a getter call,
and the same loc-less wrapper puts the closing parenthesis in the wrong place:

```js
// m.svelte.js
export class C {
	#derived = $derived.by(() => 1);
	a() {
		const v = /** @type {string} */ (this.#derived);
		return v;
	}
}
```

`compileModule(source, { generate: 'server' })` emits

```js
const v = /** @type {string} */ (this.#derived)();
```

which casts the **getter** to `string` and then calls it — under `checkJs` that is
"This expression is not callable", and it is not what the author wrote. The cast
belongs around the value:

```js
const v = /** @type {string} */ (this.#derived());
```

The cause is the one above: `b.call(<read>)` carries no `loc`, so the `_` wildcard
does not flush at the call and the callee's own flush opens the parenthesis, which
then closes as soon as the callee is printed. Svelte 5.57.0 emitted
`/** @type {string} */ this.#derived();` for this input, so both shapes arrived
with esrap 2.3.x.

## Reproduction

Svelte 5.57.1 (`submodules/svelte` at `636eaaaa6`), esrap 2.3.6. The real-world
carrier is SvelteKit's
`packages/kit/src/runtime/client/remote-functions/query/instance.svelte.js:39`.
