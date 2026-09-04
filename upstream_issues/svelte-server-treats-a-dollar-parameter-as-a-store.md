# The server transform treats a `$`-prefixed **local binding** as a store subscription, by spelling

Oracle: `submodules/svelte` @ `5.56.10`.

`phases/3-transform/server/visitors/AssignmentExpression.js:75-79` decides that an assignment's
root is a store subscription from the *spelling* of the name plus the existence of a binding one
character shorter:

```js
if (is_store_name(object.name)) {
	const name = object.name.slice(1);

	if (!context.state.scope.get(name)) {
		return null;
	}
	…
	return b.call('$.store_mutate', …);
```

It never asks whether `object.name` itself resolves to a binding in the current scope. So a
callback parameter literally named `$viewport`, in a component that also has a store called
`viewport`, is compiled as if it were `viewport`'s auto-subscription.

## Reproduction

```svelte
<script>
	import { writable } from 'svelte/store';

	const viewport = writable({ distance: 0 });

	function update(fn) {
		fn({ distance: 1 });
	}

	update(($viewport) => {
		$viewport.distance = 42;
	});
</script>

<p>{$viewport.distance}</p>
```

`compile(source, { generate: 'server' })`:

```js
$.store_mutate($$store_subs ??= {}, '$viewport', viewport, $viewport.distance = 42);
```

`compile(source, { generate: 'client' })`:

```js
$viewport.distance = 42;
```

**The compiler's two targets emit different programs for the same source.** The client resolves
`$viewport` through the scope chain and finds the parameter; the server does not look.

## Why this is not only cosmetic

`internal/server/index.js:284`:

```js
export function store_mutate(store_values, store_name, store, expression) {
	store_set(store, store_get(store_values, store_name, store));
	return expression;
}
```

So on the server, mutating the local parameter **subscribes to `viewport` and re-sets it**, and
registers `$viewport` in `$$store_subs` for the component's teardown to unsubscribe — for a store
the source never subscribed to in that scope.

## It occurs in published code

`threlte`, `packages/extras/src/lib/hooks/useViewport.svelte.ts`:

```ts
const viewport = currentWritable<Viewport>({ width: 0, height: 0, factor: 0, distance: 0 })
…
viewport.update(($viewport) => {
	…
	$viewport.distance = distance
})
```

`update`'s callback receives the current value and is expected to return the next one; naming
that parameter `$viewport` is idiomatic and legal JavaScript.

## Suggested fix

Guard the branch on the name not being shadowed, e.g. `if (context.state.scope.get(object.name))
return null;` before the `is_store_name` branch — the client's behaviour is the one to match.

## What rsvelte does

rsvelte resolves the local binding — parameter or nested `let` alike — and emits
`$viewport.distance = 42;` on both targets. This is a
deliberate divergence recorded in `compatibility/GATES.md#deliberate-divergences`; the corpus entries
are listed in `compatibility/known-failures.server.json` and
`compatibility/known-failures.server-dev.json` pending an upstream fix.

## The axis is the spelling, not "a parameter"

This report originally said *function parameter*, and so did the ratchet prose and the pinning
test. That is true of the repro and is not the mechanism. `is_store_name` reads
`object.name[0] === '$'`; nothing in the branch asks what `$viewport` is. A plain `let` in a
nested block produces **byte-identical** server output:

```svelte
<script>
	import { writable } from 'svelte/store';
	const viewport = writable({ distance: 0 });
	function update(fn) { fn(); }
	update(() => { let $viewport = { distance: 1 }; $viewport.distance = 42; });
</script>
<p>{$viewport.distance}</p>
```

```js
$.store_mutate($$store_subs ??= {}, '$viewport', viewport, $viewport.distance = 42);
```

The nesting is a precondition rather than an incidental: a top-level `let $viewport` in the
instance script is rejected by both targets with *The `$` prefix is reserved, and cannot be used
for variables and imports*, so this shape can only be written inside a callback.

`if (!context.state.scope.get(name)) return null` is the only brake. Four cells, oracle
`submodules/svelte` @ `5.56.10`, `dev: false`:

| cell | server | client |
|---|---|---|
| arrow param `$viewport`, real store `viewport` | `$.store_mutate(…)` | `$viewport.distance = 42;` |
| nested `let $viewport`, real store `viewport` | `$.store_mutate(…)` — identical | `$viewport.distance = 42;` |
| arrow param `$viewport`, `const viewport = { … }` (no store) | `$.store_mutate(…)` | `$viewport.distance = 42;` |
| arrow param `$viewport`, **nothing** named `viewport` | `$viewport.distance = 42;` | `$viewport.distance = 42;` |

## A second failure mode: the emitted variable is never declared

The sub-case with no store at all is worse than a wrong subscription. `var $$store_subs;` is
emitted only when phase 2 recorded a store subscription — and with no store there is none — while
the assignment visitor still writes `$$store_subs ??= {}`:

```svelte
<script>
	const viewport = { update(fn) { fn({ distance: 1 }); } };
	viewport.update(($viewport) => { $viewport.distance = 42; });
</script>
<p>ok</p>
```

```js
export default function C($$renderer) {
	const viewport = { update(fn) { fn({ distance: 1 }); } };
	viewport.update(($viewport) => {
		$.store_mutate($$store_subs ??= {}, '$viewport', viewport, $viewport.distance = 42);
	});
	$$renderer.push(`<p>ok</p>`);
}
```

`grep -c 'var \$\$store_subs' → 0`.

## Both shapes, rendered

Runtime pinned to the same tree as the compiler, `node --conditions=development` /
`--conditions=production` set explicitly:

| repro | `store_mutate` | `var $$store_subs` | `svelte/server` `render()` |
|---|---|---|---|
| a real store `viewport` exists (param **or** nested `let`) | emitted | emitted | renders — and calls `subscribe`, **`set`**, `unsubscribe` on it |
| no store: `const viewport = { … }` | emitted | **not emitted** | **throws** `ReferenceError: $$store_subs is not defined`, dev and prod |
| control: nothing named `viewport` | not emitted | not emitted | renders `<!--[--><p>ok</p><!--]-->` |

The control renders, so the throw is a property of the output and not of the harness; and it moves
in both directions — under `--conditions=production` that same control throws for a `dev: true`
build — which is what says the condition flag is doing work.

Row 1's side effect is measured. With a store whose `subscribe`/`set` record their calls, the
server output produces

```
["subscribe", "set {\"distance\":0}", "unsubscribe"]
```

while the client output emits `$viewport.distance = 42;` and contains no `store_mutate`. The server
target writes to a store the source never writes to. For a plain `writable` the value round-trips
unchanged, but `set` notifies every subscriber, and `threlte`'s `currentWritable` — the published
carrier below — is not a plain `writable`.

**What this is not.** Calling `store_mutate` directly with a plain object as the `store` argument
throws `store_invalid_shape` (dev) / `store.subscribe is not a function` (prod). Neither repro
reaches that path: where the object is plain the module dies at the `ReferenceError` first, and
where the call is reached the store is real. A probe that supplies `$$store_subs` itself is
measuring code the compiler never emits.
