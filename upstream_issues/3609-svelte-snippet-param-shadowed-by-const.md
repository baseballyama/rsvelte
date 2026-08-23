# A `{@const}` that shadows a snippet parameter compiles to JS no parser accepts

Oracle: `submodules/svelte` @ `5.56.9`.

```svelte
{#snippet outer(value)}
	{@const value = "c"}
	<b>{value}</b>
{/snippet}

{@render outer(1)}
```

Both targets compile without an error and emit a redeclaration:

```js
// client
const outer = ($$anchor, value = $.noop) => {
	const value = $.derived_safe_equal(() => "c");
	…
};

// server
function outer($$renderer, value) {
	const value = "c";
	…
}
```

`acorn` (and every other JS parser) rejects both: *Identifier 'value' has already been
declared*. The component compiles, the bundle does not.

## Why the neighbouring cases are fine

The rule that should fire is `declaration_duplicate`, and it already does for the two closest
shapes:

| input | verdict |
|---|---|
| `{#each rows as value}{@const value = "c"}` | `declaration_duplicate` ✅ |
| `{#snippet s(value)}{@const value = "c"}{@const value = "d"}` | `declaration_duplicate` ✅ |
| `{#snippet s(value)}{@const value = "c"}` | **compiles, output unparseable** ❌ |
| `{#snippet s(value)}{#if q}{@const value = "c"}{/if}` | compiles, output fine ✅ |

The difference is one scope level, in `phases/scope.js`:

- `EachBlock` (line 1234) declares the item into `state.scope.child()` and then visits **the
  body's children** with that same scope — `for (const child of node.body.nodes) visit(child,
  { scope })` — so a `{@const}` lands in the scope that already holds the item and collides.
- `SnippetBlock` (line 1331) declares the parameters into `child_scope` and then calls
  `context.next({ scope: child_scope })`. What that visits is `node.body`, a **Fragment**, and
  the `Fragment` visitor (line 1349) opens *another* child scope. The `{@const}` therefore
  lands one level below the parameters, shadows them legally as far as the analyser is
  concerned, and nothing reports a duplicate.

The generated code has no such second level: parameters and body declarations share one
JavaScript function scope, so a shadow that is legal in the template is a redeclaration in the
output. The `{#if}` row above is the control — there the `{@const}` is emitted inside the
branch's own arrow, which really is a nested function scope, and the output is valid.

The same three inputs behave identically with a `{const value = "c"}` declaration tag and with
a destructured parameter (`{#snippet s({ value })}`).

## What rsvelte does

rsvelte raises `declaration_duplicate` for the snippet case, matching what it already does for
`{#each}`. That is a deliberate divergence from official output: reproducing upstream here
means emitting a module that cannot be parsed. The grid that found it is recorded on #3609.
