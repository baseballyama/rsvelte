---
"@rsvelte/compiler": patch
---

fix(transform): SSR elides `$.stringify(...)` for a string-typed `{@const}` declared in multiple scopes

The server template-chunk builder skips `$.stringify(...)` when
`scope.evaluate(expr)` proves the value is a defined string. When the same
`{@const}` name is declared in several branches (e.g. an `{#if}`/`{:else}`
pair, each a string-typed ternary), the server generator — which does not
track lexical scope — saw multiple same-named bindings and returned
`unknown` unless they agreed on a single concrete value, wrongly wrapping
string reads in `$.stringify(...)`:

```js
// {@const translateX = a === 'middle' ? '-50%' : '0%'}  (in {#if} and {:else})
transform: `translate(${translateX}, …)` // was: translate(${$.stringify(translateX)}, …)
```

The multi-binding path now merges the full value set (union) of every
candidate, mirroring upstream's `Evaluation` merge, so `is_string` /
`is_defined` stay true when all branches agree on a string type.
