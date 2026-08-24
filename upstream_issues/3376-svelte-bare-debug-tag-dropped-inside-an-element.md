# A bare `{@debug}` inside a regular element is silently dropped on the client

`{@debug}` with no identifiers logs a snapshot of the component's state on every
update. Placed as a child of a regular element it compiles to nothing on the
client, while the same tag at the fragment root — and the same tag on the server
target, in every position — compiles normally.

```svelte
<script>
	let items = $state([1]);
</script>

<div>{@debug}</div>
```

```js
/* generate: 'client' — the debug effect is absent */
var div = root();
$.append($$anchor, div);

/* generate: 'server' — present */
$$renderer.push(`<div>`);
console.log({});

debugger;

$$renderer.push(`</div>`);
```

Moving the same tag out of the element emits it on the client too:

```svelte
{@debug}
<div></div>
```

## Cause

`phases/3-transform/client/visitors/DebugTag.js` pushes the effect onto
`context.state.init`, which inside a regular element is `child_state.init`.
`visitors/RegularElement.js` flushes that array in two of its three exit
branches — when the fragment has declarations, and when
`node.fragment.metadata.dynamic` is true. The third branch pushes
`element_state.init` alone:

```js
} else {
	context.state.init.push(...element_state.init);
	context.state.after_update.push(...element_state.after_update);
}
```

A bare `{@debug}` has no identifiers, so it makes the fragment neither
declaration-bearing nor dynamic, and its effect is discarded there. That also
explains why `{@debug someName}` in the same position survives: one identifier
is enough to mark the fragment dynamic.

## Scope

Measured on 5.56.9 across 17 placements × 4 targets. Dropped for every regular
element tried (`div`, `p`, `section`, with and without attributes, with and
without sibling content, inside `{#if}` and inside `{#each}`), on `client` and
`client-dev` alike. Emitted at the fragment root, under `<svelte:element>`, and
on both server targets.

Also dropped for a nested element (`<div><span>{@debug}</span></div>`), which is
the same mechanism one level down.

Desired upstream behavior: either emit the effect regardless of the fragment's
dynamic/declaration metadata, or reject a `{@debug}` in a position where it
cannot run — the current outcome is a debugging aid that silently does nothing
depending on where it is written.

Tracked in rsvelte issue #3376.
