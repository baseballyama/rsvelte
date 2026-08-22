# Svelte's client transform drops a declarator initialized by `$effect.pending()` or `$state.eager()`

The official Svelte compiler (v5.56.9) silently deletes the whole declarator, and in two
shapes the deletion leaves text no JavaScript parser accepts.

`phases/3-transform/client/visitors/VariableDeclaration.js` handles the runes branch with a
chain of `if (rune === …) { …; continue; }` arms preceded by a skip list. `$effect.pending`
and `$state.eager` are in neither: they are not skipped, and they match none of the `$props`
/ `$state` / `$state.raw` / `$derived` / `$derived.by` arms, so the loop iteration ends
having pushed nothing into `declarations`. The server visitor has the same shape but ends
with a fall-through that pushes `b.declarator(declarator.id, value)`, which is why only the
client output is affected.

## Reproduction

```js
// a.svelte.js
let o = 1;
let x = $effect.pending();
```

```js
// compileModule(src, { generate: 'client' })
let o = 1;
```

`x` is gone. Any later reference to it is a `ReferenceError`, and nothing warns.
`let x = $state.eager(o)` behaves identically.

Two more shapes produce output that does not parse:

| source | client output |
|---|---|
| `export const x = $effect.pending();` | `export ;` |
| `for (let x = $effect.pending(); ; ) {}` | `for (;; ; ) {}` |

Both are `SyntaxError` for every JS parser, so a build using this output fails at bundle
time rather than at run time.

The server side is well-formed and gives the shape the client arm is missing:

```js
// compileModule(src, { generate: 'server' })
let o = 1;
let x = void 0;
```

## Why rsvelte does not reproduce it

rsvelte keeps the declarator and lowers the initializer — `$.eager($.pending)` for
`$effect.pending()`, `$.eager(() => o)` for `$state.eager(o)` — which is what the same runes
produce in every non-declarator position. Byte equality with upstream is this project's
goal, but reproducing a divergence whose output no parser accepts is not, so these cells are
recorded as an accepted divergence rather than matched.

Local anchor: [#3173](https://github.com/baseballyama/rsvelte/issues/3173).

Desired upstream behavior: give the runes branch the same fall-through the server visitor
has — `declarations.push(b.declarator(declarator.id, value))` — so a declarator initialized
by a rune with no dedicated arm keeps its binding.
