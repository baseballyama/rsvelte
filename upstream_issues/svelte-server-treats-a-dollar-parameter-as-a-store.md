# The server transform treats a `$`-prefixed **function parameter** as a store subscription

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

rsvelte resolves the parameter and emits `$viewport.distance = 42;` on both targets. This is a
deliberate divergence recorded in `compatibility/GATES.md#deliberate-divergences`; the corpus entries
are listed in `compatibility/known-failures.server.json` and
`compatibility/known-failures.server-dev.json` pending an upstream fix.
