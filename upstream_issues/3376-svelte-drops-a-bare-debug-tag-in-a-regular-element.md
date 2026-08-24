# Svelte's client transform drops a bare `{@debug}` inside a regular element

The official Svelte compiler (v5.56.10) emits nothing at all for a `{@debug}` with no
identifiers when its nearest ancestor is a regular element, while emitting it at the
fragment root, inside `<svelte:element>`, and on the **server** target in every position.
The tag is silently a no-op in exactly the place people put it.

`phases/3-transform/client/visitors/DebugTag.js` pushes the effect onto `context.state.init`,
which inside a regular element is `child_state.init`. `RegularElement.js:465-471` flushes
that array only when the element has declarations or when `node.fragment.metadata.dynamic`
is true; the final `else` pushes `element_state.init` alone and discards `child_state.init`.
`fragment.metadata.dynamic` is set by the `Identifier` visitor, so a `{@debug}` with **no**
identifiers makes the fragment neither declaration-bearing nor dynamic and its own effect is
what gets dropped.

## Reproduction

```svelte
<script>
	let items = $state([1]);
</script>

<div>{@debug}</div>
```

```js
// compile(src, { generate: 'client' })
var div = root();
$.append($$anchor, div);
```

The `console.log`/`debugger` pair is gone. `{@debug}` at the fragment root, or the same tag
with any identifier (`<div>{@debug items}</div>`), emits normally — as does every position
on the server target.

## Measured

17 shapes x 4 targets against `svelte@5.56.10`. Cell is the `console.log` argument or `NO`.

| shape | client | client-dev | server | server-dev |
|---|---|---|---|---|
| `<div>{@debug}</div>` | **NO** | **NO** | `{}` | `{}` |
| `<div>{@debug}<b>x</b></div>` | **NO** | **NO** | `{}` | `{}` |
| `<div><b>x</b>{@debug}</div>` | **NO** | **NO** | `{}` | `{}` |
| `<p>{@debug}</p>` | **NO** | **NO** | `{}` | `{}` |
| `<section>{@debug}</section>` | **NO** | **NO** | `{}` | `{}` |
| `<div id="i">{@debug}</div>` | **NO** | **NO** | `{}` | `{}` |
| `<div>t{@debug}</div>` | **NO** | **NO** | `{}` | `{}` |
| `{#if flag}<div>{@debug}</div>{/if}` | **NO** | **NO** | `{}` | `{}` |
| `{#each items as it}<div>{@debug}</div>{/each}` | **NO** | **NO** | `{}` | `{}` |
| `{@debug}` at the fragment root | `{}` | `{}` | `{}` | `{}` |
| `{@debug}<b>x</b>` | `{}` | `{}` | `{}` | `{}` |
| `<svelte:element this={"div"}>{@debug}</svelte:element>` | `{}` | `{}` | `{}` | `{}` |
| `<div>{@debug str}</div>` | `{ str: … }` | `{ str: … }` | `{ str }` | `{ str }` |

The client and the server disagree with each other on nine of the seventeen, which is the
part that makes it look unintended rather than a deliberate optimisation: a debugging aid
that fires during SSR and not in the browser is worse than one that fires nowhere.

## Status in rsvelte

rsvelte reproduced the emission (its `fragment.metadata.dynamic` reconstruction counted any
`{@debug}` as a dynamism producer) and now reproduces the **drop**, because byte equality
with the official compiler is the goal here. The 17 shapes are byte-identical to official's
client output. See `crates/rsvelte_core/tests/debug_tag_static_fragment_3376.rs`.

If upstream fixes this by making `{@debug}` set `fragment.metadata.dynamic`, rsvelte's
`has_hoisted_init_producers` goes back to accepting every `{@debug}` and that test file is
the thing to re-measure.
